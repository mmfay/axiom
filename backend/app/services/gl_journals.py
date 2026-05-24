from decimal import Decimal
from app.tables import GLJournals, GLJournalLines
from app.classes.apiresponse import APIResponse
from app.classes.appexception import AppException
from app.services.ctx import get_tenant, get_company
from app.services.db import db
from app.services.numbering import get_next_number


def _fmt_line(l: GLJournalLines) -> dict:
    return {
        "id": l.id,
        "account_id": l.account_id,
        "description": l.description,
        "debit": float(l.debit or 0),
        "credit": float(l.credit or 0),
        "dim1_value_id": l.dim1_value_id,
        "dim2_value_id": l.dim2_value_id,
        "dim3_value_id": l.dim3_value_id,
        "dim4_value_id": l.dim4_value_id,
        "dim5_value_id": l.dim5_value_id,
    }


def _fmt(j: GLJournals, lines: list[GLJournalLines] | None = None) -> dict:
    data = {
        "id": j.id,
        "journal_date": str(j.journal_date) if j.journal_date else None,
        "reference": j.reference,
        "memo": j.memo,
        "status": j.status,
        "created_at": str(j.created_at) if j.created_at else None,
        "posted_at": str(j.posted_at) if j.posted_at else None,
    }
    if lines is not None:
        data["lines"] = [_fmt_line(l) for l in lines]
    return data


def _validate(lines) -> tuple[Decimal, Decimal]:
    if len(lines) < 2:
        raise AppException(400, "A journal must have at least two lines")

    total_debit = sum(Decimal(str(l.debit)) for l in lines)
    total_credit = sum(Decimal(str(l.credit)) for l in lines)

    if abs(total_debit - total_credit) >= Decimal("0.01"):
        raise AppException(400, f"Journal is not balanced: debits {total_debit} ≠ credits {total_credit}")

    if total_debit == 0:
        raise AppException(400, "Journal has no amounts")

    return total_debit, total_credit


async def list_journals():
    journals = await GLJournals.findByCompany()

    result = []
    for j in journals:
        lines = await GLJournalLines.findByJournal(j.id)
        total = sum(float(l.debit or 0) for l in lines)
        data = _fmt(j)
        data["total_debit"] = total
        result.append(data)

    return APIResponse.ok("Journals fetched", result)


async def create_journal(data):
    _validate(data.lines)

    async with db.transaction() as conn:
        reference = await get_next_number("gl_journal", conn)
        if not reference:
            raise AppException(400, "No numbering scheme configured for gl_journal")

        journal = GLJournals(
            journal_date=data.journal_date,
            reference=reference,
            memo=data.memo,
            connection=conn,
        )
        journal = await journal.insert()

        lines = []
        for l in data.lines:
            line = GLJournalLines(
                journal_id=journal.id,
                account_id=l.account_id,
                description=l.description,
                debit=float(l.debit),
                credit=float(l.credit),
                dim1_value_id=l.dim1_value_id,
                dim2_value_id=l.dim2_value_id,
                dim3_value_id=l.dim3_value_id,
                dim4_value_id=l.dim4_value_id,
                dim5_value_id=l.dim5_value_id,
                connection=conn,
            )
            lines.append(await line.insert())

    return APIResponse.created("Journal created", _fmt(journal, lines))


async def get_journal(journal_id: int):
    journal = await GLJournals.find(journal_id)
    if not journal:
        return APIResponse.not_found("Journal not found")

    lines = await GLJournalLines.findByJournal(journal_id)
    return APIResponse.ok("Journal fetched", _fmt(journal, lines))


async def update_journal(journal_id: int, data):
    journal = await GLJournals.find(journal_id)
    if not journal:
        return APIResponse.not_found("Journal not found")
    if journal.status != "draft":
        return APIResponse.bad_request("Only draft journals can be edited")

    if data.journal_date is not None:
        journal.journal_date = data.journal_date
    if data.reference is not None:
        journal.reference = data.reference
    if data.memo is not None:
        journal.memo = data.memo

    if data.lines is not None:
        _validate(data.lines)
        async with db.transaction() as conn:
            journal.connection = conn
            await journal.update()
            await GLJournalLines.deleteByJournal(journal_id, conn)
            lines = []
            for l in data.lines:
                line = GLJournalLines(
                    journal_id=journal_id,
                    account_id=l.account_id,
                    description=l.description,
                    debit=float(l.debit),
                    credit=float(l.credit),
                    dim1_value_id=l.dim1_value_id,
                    dim2_value_id=l.dim2_value_id,
                    dim3_value_id=l.dim3_value_id,
                    dim4_value_id=l.dim4_value_id,
                    dim5_value_id=l.dim5_value_id,
                    connection=conn,
                )
                lines.append(await line.insert())
    else:
        await journal.update()
        lines = await GLJournalLines.findByJournal(journal_id)

    return APIResponse.ok("Journal updated", _fmt(journal, lines))


async def post_journal(journal_id: int):
    journal = await GLJournals.find(journal_id)
    if not journal:
        return APIResponse.not_found("Journal not found")
    if journal.status != "draft":
        return APIResponse.bad_request("Only draft journals can be posted")

    lines = await GLJournalLines.findByJournal(journal_id)
    total_debit, _ = _validate(lines)

    async with db.transaction() as conn:
        sl_sql = """
            INSERT INTO sl_transactions
                (tenant_id, company_id, type, transaction_date, reference, description, amount, status, posted_at)
            VALUES ($1, $2, 'gl_journal', $3, $4, $5, $6, 'posted', NOW())
            RETURNING id
        """
        sl_id = await conn.fetchval(
            sl_sql,
            get_tenant(),
            get_company(),
            journal.journal_date,
            journal.reference,
            journal.memo,
            float(total_debit),
        )

        gl_sql = """
            INSERT INTO gl_transactions
                (tenant_id, company_id, transaction_date, account_id, description,
                 debit, credit, dim1_value_id, dim2_value_id, dim3_value_id,
                 dim4_value_id, dim5_value_id, source_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        """
        for l in lines:
            await conn.execute(
                gl_sql,
                get_tenant(), get_company(),
                journal.journal_date,
                l.account_id, l.description,
                float(l.debit or 0), float(l.credit or 0),
                l.dim1_value_id, l.dim2_value_id, l.dim3_value_id,
                l.dim4_value_id, l.dim5_value_id,
                sl_id,
            )

        await journal.set_posted(conn)

    return APIResponse.ok("Journal posted", _fmt(journal, lines))
