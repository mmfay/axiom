DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    version_id INTEGER NOT NULL DEFAULT 1,
	tenant_id INTEGER NOT NULL,
	default_company_id INTEGER NULL,
	is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
	email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

DROP TABLE IF EXISTS sessions;

CREATE TABLE IF NOT EXISTS sessions (
	id SERIAL PRIMARY KEY,
	user_id TEXT NOT NULL,
	email TEXT NOT NULL,
	tenant_id INTEGER NOT NULL,
	company_id INTEGER NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	expires_at TIMESTAMPTZ NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE
);

DROP TABLE IF EXISTS tenants;

CREATE TABLE IF NOT EXISTS tenants (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	is_active BOOLEAN NOT NULL DEFAULT FALSE
);

DROP TABLE IF EXISTS entities;

CREATE TABLE IF NOT EXISTS entities (
	id SERIAL PRIMARY KEY,
	tenant_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	is_active BOOLEAN NOT NULL DEFAULT FALSE
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

INSERT INTO users (email, user_id, password, is_enabled, tenant_id)
VALUES
    ('admin@softwarerror.com', 'admin', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE, 1),
    ('john.doe@softwarerror.com', 'jdoe', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', FALSE, 1),
    ('jane.smith@softwarerror.com', 'jsmith', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE, 1),
    ('michael.brown@softwarerror.com', 'mbrown', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE, 1),
	('matthew.fay@softwarerror.com', 'mfay', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE, 1),
    ('sarah.wilson@softwarerror.com', 'swilson', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE, 1);