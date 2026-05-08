import { getJSON, patchJSON, postJSON, deleteJSON } from "./submissions";
import { APIResult } from "../types/data";
import { AccountRule, AccountRulesData, CreateAccountRuleRequest, UpdateAccountRuleRequest, SetRuleValuesRequest } from "../types/gl_account_rules";

export async function getAccountRules(accountId: number): Promise<APIResult<AccountRulesData>> {
	return getJSON(`/gl/accounts/${accountId}/rules`);
}

export async function createAccountRule(accountId: number, body: CreateAccountRuleRequest): Promise<APIResult<AccountRule>> {
	return postJSON(`/gl/accounts/${accountId}/rules`, body);
}

export async function updateAccountRule(accountId: number, ruleId: number, body: UpdateAccountRuleRequest): Promise<APIResult<AccountRule>> {
	return patchJSON(`/gl/accounts/${accountId}/rules/${ruleId}`, body);
}

export async function deleteAccountRule(accountId: number, ruleId: number): Promise<APIResult<void>> {
	return deleteJSON(`/gl/accounts/${accountId}/rules/${ruleId}`);
}

export async function setAccountRuleValues(accountId: number, ruleId: number, body: SetRuleValuesRequest): Promise<APIResult<AccountRule>> {
	return patchJSON(`/gl/accounts/${accountId}/rules/${ruleId}/values`, body);
}
