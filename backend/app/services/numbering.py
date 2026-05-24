from datetime import date
from app.tables.NumberingSchemes import NumberingSchemes
from app.classes.apiresponse import APIResponse
from app.classes.appexception import AppException
from app.services.ctx import get_tenant, get_company


def _format(prefix: str, separator: str, padding: int, include_year: bool, include_month: bool, seq: int) -> str:
    today = date.today()
    parts = []
    if prefix:
        parts.append(prefix)
    if include_year:
        parts.append(str(today.year))
    if include_month:
        parts.append(f"{today.month:02d}")
    parts.append(str(seq).zfill(padding))
    return separator.join(parts)


def _fmt(s: NumberingSchemes) -> dict:
    return {
        "id": s.id,
        "document_type": s.document_type,
        "prefix": s.prefix,
        "separator": s.separator,
        "padding": s.padding,
        "include_year": s.include_year,
        "include_month": s.include_month,
        "next_value": s.next_value,
        "is_active": s.is_active,
    }


async def get_next_number(document_type: str, conn) -> str | None:
    """
    Atomically consume the next sequence number for a document type.
    Must be called within an open transaction (conn is the transaction connection).
    Returns None if no active scheme exists.
    """
    sql = """
        UPDATE numbering_schemes
        SET next_value = next_value + 1
        WHERE tenant_id = $1 AND company_id = $2 AND document_type = $3 AND is_active = TRUE
        RETURNING next_value - 1 AS seq, prefix, separator, padding, include_year, include_month
    """
    row = await conn.fetchrow(sql, get_tenant(), get_company(), document_type)

    if row is None:
        return None

    return _format(row["prefix"], row["separator"], row["padding"], row["include_year"], row["include_month"], row["seq"])


async def preview_next(document_type: str) -> str | None:
    """
    Return what the next number would look like without consuming it.
    """
    scheme = await NumberingSchemes.findByDocumentType(document_type)
    if scheme is None:
        return None
    return _format(
        scheme.prefix or "",
        scheme.separator or "-",
        scheme.padding or 4,
        scheme.include_year or False,
        scheme.include_month or False,
        scheme.next_value or 1,
    )


async def list_schemes():
    schemes = await NumberingSchemes.findByCompany()
    return APIResponse.ok("Schemes fetched", [_fmt(s) for s in schemes])


async def create_scheme(data):
    existing = await NumberingSchemes.findByDocumentType(data.document_type)
    if existing:
        return APIResponse.bad_request(f"A scheme for '{data.document_type}' already exists")

    scheme = NumberingSchemes(
        document_type=data.document_type,
        prefix=data.prefix,
        separator=data.separator,
        padding=data.padding,
        include_year=data.include_year,
        include_month=data.include_month,
        next_value=data.next_value,
    )
    scheme = await scheme.insert()

    return APIResponse.created("Scheme created", _fmt(scheme))


async def update_scheme(scheme_id: int, data):
    scheme = await NumberingSchemes.find(scheme_id)
    if not scheme:
        return APIResponse.not_found("Scheme not found")

    if data.prefix is not None:
        scheme.prefix = data.prefix
    if data.separator is not None:
        scheme.separator = data.separator
    if data.padding is not None:
        scheme.padding = data.padding
    if data.include_year is not None:
        scheme.include_year = data.include_year
    if data.include_month is not None:
        scheme.include_month = data.include_month
    if data.next_value is not None:
        scheme.next_value = data.next_value
    if data.is_active is not None:
        scheme.is_active = data.is_active

    scheme = await scheme.update()

    return APIResponse.ok("Scheme updated", _fmt(scheme))


async def get_preview(document_type: str):
    preview = await preview_next(document_type)
    if preview is None:
        return APIResponse.not_found("No active scheme for this document type")
    return APIResponse.ok("Preview fetched", {"next": preview})
