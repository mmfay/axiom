from app.tables import GLAccountDimensionRules, GLAccountDimensionRuleValues


async def validate(account_id: int, provided: dict[int, int]) -> list[str]:
	"""
	Validate dimension values supplied on a transaction line against the
	account's configured rules.

	provided: {dimension_id: value_id}

	Returns a list of error strings. Empty list means the line is valid.
	"""
	rules = await GLAccountDimensionRules.findByAccount(account_id)
	if not rules:
		return []

	rule_ids = [r.id for r in rules]
	all_rule_values = await GLAccountDimensionRuleValues.findByRules(rule_ids)

	# rule_id -> set of allowed value_ids  (empty set = all values allowed)
	allowed_by_rule: dict[int, set[int]] = {r.id: set() for r in rules}
	for rv in all_rule_values:
		allowed_by_rule[rv.rule_id].add(rv.value_id)

	# parent_value_id (None = top-level) -> list of rules
	rules_by_parent: dict[int | None, list[GLAccountDimensionRules]] = {}
	for rule in rules:
		rules_by_parent.setdefault(rule.parent_value_id, []).append(rule)

	errors: list[str] = []

	def check(applicable_rules: list[GLAccountDimensionRules]) -> None:
		for rule in applicable_rules:
			provided_value = provided.get(rule.dimension_id)
			allowed = allowed_by_rule[rule.id]

			if rule.is_required and provided_value is None:
				errors.append(f"Dimension {rule.dimension_id} is required for this account")
				continue

			if provided_value is not None and allowed and provided_value not in allowed:
				errors.append(
					f"Value {provided_value} is not permitted for dimension "
					f"{rule.dimension_id} on this account"
				)

	# Evaluate unconditional rules
	check(rules_by_parent.get(None, []))

	# Evaluate rules conditioned on each provided value
	for value_id in provided.values():
		check(rules_by_parent.get(value_id, []))

	return errors
