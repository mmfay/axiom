from app.tables import GLAccounts, GLDimensions, GLAccountDimensionRules, GLAccountDimensionRuleValues
from app.classes.apiresponse import APIResponse


def _fmt(rule: GLAccountDimensionRules, allowed_value_ids: list[int]) -> dict:
	return {
		"id": rule.id,
		"dimension_id": rule.dimension_id,
		"is_required": rule.is_required,
		"parent_value_id": rule.parent_value_id,
		"allowed_value_ids": allowed_value_ids,
	}


async def _load_rules_with_values(account_id: int) -> tuple[list[GLAccountDimensionRules], dict[int, list[int]]]:
	rules = await GLAccountDimensionRules.findByAccount(account_id)
	if not rules:
		return rules, {}
	rule_ids = [r.id for r in rules]
	all_rule_values = await GLAccountDimensionRuleValues.findByRules(rule_ids)
	values_by_rule: dict[int, list[int]] = {}
	for rv in all_rule_values:
		values_by_rule.setdefault(rv.rule_id, []).append(rv.value_id)
	return rules, values_by_rule


async def get_rules(account_id: int):
	account = await GLAccounts.find(account_id)
	if not account:
		return APIResponse.not_found("Account not found")

	rules, values_by_rule = await _load_rules_with_values(account_id)

	return APIResponse.ok("Rules fetched", {
		"account_id": account_id,
		"rules": [_fmt(r, values_by_rule.get(r.id, [])) for r in rules],
	})


async def create_rule(account_id: int, data):
	account = await GLAccounts.find(account_id)
	if not account:
		return APIResponse.not_found("Account not found")

	dim = await GLDimensions.find(data.dimension_id)
	if not dim or not dim.is_active:
		return APIResponse.bad_request("Dimension is not active")

	rule = GLAccountDimensionRules(
		account_id=account_id,
		dimension_id=data.dimension_id,
		is_required=data.is_required,
		parent_value_id=data.parent_value_id,
	)

	try:
		rule = await rule.insert()
	except Exception:
		return APIResponse.bad_request("A rule for this dimension already exists at this level")

	allowed_value_ids: list[int] = []
	for value_id in data.allowed_value_ids:
		rv = GLAccountDimensionRuleValues(rule_id=rule.id, value_id=value_id)
		await rv.insert()
		allowed_value_ids.append(value_id)

	return APIResponse.created("Rule created", _fmt(rule, allowed_value_ids))


async def update_rule(account_id: int, rule_id: int, data):
	rule = await GLAccountDimensionRules.find(rule_id)
	if not rule or rule.account_id != account_id:
		return APIResponse.not_found("Rule not found")

	rule.is_required = data.is_required
	rule = await rule.update()

	values = await GLAccountDimensionRuleValues.findByRule(rule_id)
	return APIResponse.ok("Rule updated", _fmt(rule, [v.value_id for v in values]))


async def delete_rule(account_id: int, rule_id: int):
	rule = await GLAccountDimensionRules.find(rule_id)
	if not rule or rule.account_id != account_id:
		return APIResponse.not_found("Rule not found")

	await rule.delete()

	return APIResponse.ok("Rule deleted")


async def set_rule_values(account_id: int, rule_id: int, data):
	rule = await GLAccountDimensionRules.find(rule_id)
	if not rule or rule.account_id != account_id:
		return APIResponse.not_found("Rule not found")

	await GLAccountDimensionRuleValues.deleteByRule(rule_id)

	for value_id in data.value_ids:
		rv = GLAccountDimensionRuleValues(rule_id=rule_id, value_id=value_id)
		await rv.insert()

	return APIResponse.ok("Rule values updated", _fmt(rule, list(data.value_ids)))
