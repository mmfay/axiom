DROP VIEW IF EXISTS vw_trial_balance;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS workflow_approvals;
DROP TABLE IF EXISTS workflow_edges;
DROP TABLE IF EXISTS workflow_nodes;
DROP TABLE IF EXISTS workflow_definitions;
DROP TABLE IF EXISTS numbering_schemes;
DROP TABLE IF EXISTS gl_journal_lines;
DROP TABLE IF EXISTS gl_journals;
DROP TABLE IF EXISTS gl_transactions;
DROP TABLE IF EXISTS sl_transactions;
DROP TABLE IF EXISTS gl_account_dimension_rule_values;
DROP TABLE IF EXISTS gl_account_dimension_rules;
DROP TABLE IF EXISTS gl_dimension_values;
DROP TABLE IF EXISTS gl_dimensions;
DROP TABLE IF EXISTS user_role_assignments;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS gl_accounts;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS entities;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    version_id INTEGER NOT NULL DEFAULT 1,
	tenant_id INTEGER NOT NULL,
	default_company_id INTEGER NULL,
	default_role_id INTEGER NULL,
	is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
	email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sessions (
	id SERIAL PRIMARY KEY,
	user_id TEXT NOT NULL,
	email TEXT NOT NULL,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NULL,
	active_role_id INTEGER NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	expires_at TIMESTAMPTZ NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tenants (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS entities (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS permissions (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS role_permissions (
	role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
	permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS tokens (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token_hash TEXT NOT NULL,
	type SMALLINT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	used_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gl_accounts (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
	account_number TEXT NOT NULL,
	name TEXT NOT NULL,
	account_type TEXT NOT NULL,
	normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
	description TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (tenant_id, company_id, account_number)
);

CREATE TABLE IF NOT EXISTS gl_dimensions (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
	slot SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 5),
	name TEXT NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (tenant_id, company_id, slot)
);

CREATE TABLE IF NOT EXISTS gl_dimension_values (
	id SERIAL PRIMARY KEY,
	dimension_id INTEGER NOT NULL REFERENCES gl_dimensions(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
	code TEXT NOT NULL,
	name TEXT NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (dimension_id, code)
);

CREATE TABLE IF NOT EXISTS gl_account_dimension_rules (
	id SERIAL PRIMARY KEY,
	account_id INTEGER NOT NULL REFERENCES gl_accounts(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
	dimension_id INTEGER NOT NULL REFERENCES gl_dimensions(id) ON DELETE CASCADE,
	is_required BOOLEAN NOT NULL DEFAULT FALSE,
	parent_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gl_account_dimension_rule_values (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
	rule_id INTEGER NOT NULL REFERENCES gl_account_dimension_rules(id) ON DELETE CASCADE,
	value_id INTEGER NOT NULL REFERENCES gl_dimension_values(id) ON DELETE CASCADE
);

-- ── Subledger transactions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sl_transactions (
	id BIGSERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
	type TEXT NOT NULL CHECK (type IN ('ap_invoice', 'ap_credit_memo', 'ap_payment', 'ar_invoice', 'ar_credit_memo', 'ar_payment', 'gl_journal')),
	transaction_date DATE NOT NULL,
	reference TEXT NOT NULL,
	voucher TEXT NOT NULL,
	description TEXT,
	amount NUMERIC(18, 2) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── General ledger transactions ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gl_transactions (
	id BIGSERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
	transaction_date DATE NOT NULL,
	account_id INTEGER NOT NULL REFERENCES gl_accounts(id) ON DELETE RESTRICT,
	description TEXT,
	debit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
	credit NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
	dim1_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim2_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim3_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim4_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim5_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	voucher TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Numbering schemes ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS numbering_schemes (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
	document_type TEXT NOT NULL,
	prefix TEXT NOT NULL DEFAULT '',
	separator TEXT NOT NULL DEFAULT '-',
	padding INTEGER NOT NULL DEFAULT 4 CHECK (padding BETWEEN 1 AND 10),
	include_year BOOLEAN NOT NULL DEFAULT FALSE,
	include_month BOOLEAN NOT NULL DEFAULT FALSE,
	next_value INTEGER NOT NULL DEFAULT 1,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (tenant_id, company_id, document_type)
);

-- ── General journals ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gl_journals (
	id BIGSERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
	journal_date DATE NOT NULL,
	reference TEXT NOT NULL,
	memo TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'voided')),
	workflow_status TEXT NULL CHECK (workflow_status IN ('pending', 'approved', 'rejected')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS gl_journal_lines (
	id BIGSERIAL PRIMARY KEY,
	journal_id BIGINT NOT NULL REFERENCES gl_journals(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
	account_id INTEGER NOT NULL REFERENCES gl_accounts(id) ON DELETE RESTRICT,
	description TEXT,
	debit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
	credit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
	dim1_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim2_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim3_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim4_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT,
	dim5_value_id INTEGER REFERENCES gl_dimension_values(id) ON DELETE RESTRICT
);

-- ── Workflows ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workflow_definitions (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	document_type TEXT NOT NULL CHECK (document_type IN ('gl_journal')),
	is_active BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (tenant_id, document_type)
);

CREATE TABLE IF NOT EXISTS workflow_nodes (
	id TEXT NOT NULL,
	workflow_id INTEGER NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	node_type TEXT NOT NULL CHECK (node_type IN ('start', 'end', 'approval')),
	label TEXT NOT NULL,
	approver_type TEXT CHECK (approver_type IN ('role', 'user')),
	approver_id INTEGER,
	position_x NUMERIC NOT NULL DEFAULT 0,
	position_y NUMERIC NOT NULL DEFAULT 0,
	PRIMARY KEY (id, workflow_id)
);

CREATE TABLE IF NOT EXISTS workflow_edges (
	id TEXT NOT NULL,
	workflow_id INTEGER NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
	tenant_id INTEGER NOT NULL,
	source_node_id TEXT NOT NULL,
	target_node_id TEXT NOT NULL,
	PRIMARY KEY (id, workflow_id)
);

CREATE TABLE IF NOT EXISTS notifications (
	id BIGSERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type TEXT NOT NULL,
	message TEXT NOT NULL,
	document_type TEXT,
	record_id BIGINT,
	is_read BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_approvals (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	workflow_node_id TEXT NOT NULL,
	document_type TEXT NOT NULL,
	record_id BIGINT NOT NULL,
	approved_by INTEGER NOT NULL REFERENCES users(id),
	status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Views ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW vw_trial_balance AS
SELECT
    a.tenant_id,
    a.company_id,
    a.account_number,
    a.name,
    a.account_type,
    a.is_active,
    t.transaction_date,
    t.debit,
    t.credit
FROM gl_accounts a
LEFT JOIN gl_transactions t
    ON  t.account_id  = a.id
    AND t.tenant_id   = a.tenant_id
    AND t.company_id  = a.company_id;