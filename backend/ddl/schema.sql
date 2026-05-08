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
	rule_id INTEGER NOT NULL REFERENCES gl_account_dimension_rules(id) ON DELETE CASCADE,
	value_id INTEGER NOT NULL REFERENCES gl_dimension_values(id) ON DELETE CASCADE,
	PRIMARY KEY (rule_id, value_id)
);