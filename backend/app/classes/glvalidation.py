from app.tables import GLAccounts, GLDimensions, GLDimensionValues, GLAccountDimensionRules, GLAccountDimensionRuleValues
from app.classes.appexception import AppException
from app.classes.apiresponse import APIResponse
from typing import Optional


class GLValidation:

	def __init__(
		self,
		account_id: int,
		dim_1: Optional[int] = None,
		dim_2: Optional[int] = None,
		dim_3: Optional[int] = None,
		dim_4: Optional[int] = None,
		dim_5: Optional[int] = None,
	):
		self.account_id = account_id
		self.dim_1 = dim_1
		self.dim_2 = dim_2
		self.dim_3 = dim_3
		self.dim_4 = dim_4
		self.dim_5 = dim_5

	async def validate(self):
        
		await self.validate_account()
		await self.validate_dimensions()

	async def validate_account(self):

		account = await GLAccounts.find(self.account_id)
		
		if not account:
			APIResponse.bad_request(f"Posting Failed: Account {self.account_id} does not exist")
               
		if not account.is_active:
			APIResponse.bad_request(f"Posting Failed: Account {account.account_number} is inactive")

	async def validate_dimensions(self):

		rules = await GLAccountDimensionRules.findByAccount(self.account_id)

		if not rules:
			return

		# Build slot → (dimension_id, is_required) from account-dimension rules
		slot_map: dict[int, tuple[int, bool]] = {}
		for r in rules:
			dimension = await GLDimensions.find(r.dimension_id)
			if dimension and dimension.slot:
				slot_map[dimension.slot] = (r.dimension_id, bool(r.is_required))

		provided = {
			1: self.dim_1,
			2: self.dim_2,
			3: self.dim_3,
			4: self.dim_4,
			5: self.dim_5,
		}

		# Load allowed values for each rule upfront
		rule_ids = [r.id for r in rules]
		all_rule_values = await GLAccountDimensionRuleValues.findByRules(rule_ids) if rule_ids else []

		rule_values_by_rule: dict[int, set[int]] = {}
		for rv in all_rule_values:
			rule_values_by_rule.setdefault(rv.rule_id, set()).add(rv.value_id)

		all_provided = {v for v in provided.values() if v}

		for slot, (dimension_id, is_required) in slot_map.items():
			value_id = provided.get(slot)

			if is_required and not value_id:
				raise AppException(400, f"Posting Failed: Dimension in slot {slot} is required for account {self.account_id}")

			if not value_id:
				continue

			# Validate value exists, is active, and belongs to the right dimension
			value = await GLDimensionValues.find(value_id)

			if not value:
				raise AppException(400, f"Posting Failed: Dimension value {value_id} does not exist")

			if not value.is_active:
				raise AppException(400, f"Posting Failed: Dimension value {value_id} is inactive")

			if value.dimension_id != dimension_id:
				raise AppException(400, f"Posting Failed: Dimension value {value_id} does not belong to dimension in slot {slot}")

			# Check allowed values — rules with no parent_value_id apply unconditionally,
			# rules with a parent_value_id only apply when that value is present on the line
			dim_rules = [r for r in rules if r.dimension_id == dimension_id]

			if not dim_rules:
				continue

			applicable_rules = [
				r for r in dim_rules
				if r.parent_value_id is None or r.parent_value_id in all_provided
			]

			if not applicable_rules:
				continue

			allowed: set[int] = set()
			for rule in applicable_rules:
				allowed |= rule_values_by_rule.get(rule.id, set())

			# Empty allowed set means the rule exists but permits all values
			if allowed and value_id not in allowed:
				raise AppException(400, f"Posting Failed: Dimension value {value_id} is not permitted for account {self.account_id} in slot {slot}")
