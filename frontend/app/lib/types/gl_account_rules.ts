export interface AccountRule {
	id: number;
	dimension_id: number;
	is_required: boolean;
	parent_value_id: number | null;
	allowed_value_ids: number[];
}

export interface AccountRulesData {
	account_id: number;
	rules: AccountRule[];
}

export interface CreateAccountRuleRequest {
	dimension_id: number;
	is_required: boolean;
	parent_value_id: number | null;
	allowed_value_ids: number[];
}

export interface UpdateAccountRuleRequest {
	is_required: boolean;
}

export interface SetRuleValuesRequest {
	value_ids: number[];
}
