export const FILTER_FIELDS_USER = [
	{ id: "email",      label: "Email",   type: "text"    as const },
	{ id: "user_id",    label: "User ID", type: "text"    as const },
	{ id: "is_enabled", label: "Enabled", type: "boolean" as const },
];

export const FILTER_FIELDS_GL_ACCOUNTS = [
	{ id: "account_number", label: "Account Number", type: "text"    as const },
	{ id: "name",           label: "Name",           type: "text"    as const },
	{ id: "account_type",   label: "Account Type",   type: "text"    as const },
	{ id: "is_active",      label: "Active",         type: "boolean" as const },
];