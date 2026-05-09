from datetime import date as Date
from app.classes.apiresponse import APIResponse
from app.views.TrialBalanceView import TrialBalanceView


async def get_trial_balance(as_of: Date):

    rows = await TrialBalanceView.find(as_of)

    result = []
    total_debit = 0.0
    total_credit = 0.0

    for row in rows:
        net = float(row.total_debit or 0) - float(row.total_credit or 0)
        debit_bal  = round(net, 2)      if net > 0 else 0.0
        credit_bal = round(abs(net), 2) if net < 0 else 0.0

        total_debit  += debit_bal
        total_credit += credit_bal

        result.append({
            "account_number": row.account_number,
            "name":           row.name,
            "account_type":   row.account_type,
            "debit":          debit_bal,
            "credit":         credit_bal,
        })

    return APIResponse.ok("Trial balance fetched", {
        "as_of":        as_of.isoformat(),
        "rows":         result,
        "total_debit":  round(total_debit, 2),
        "total_credit": round(total_credit, 2),
    })