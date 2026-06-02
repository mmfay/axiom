-- users: email and user_id are covered by UNIQUE constraints; index tenant lookups
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);

-- sessions: primary access patterns are by user and by expiry
CREATE INDEX IF NOT EXISTS idx_sessions_user_id   ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions (user_id, is_active);

-- tenants: lookup by email and filter by active status
CREATE INDEX IF NOT EXISTS idx_tenants_email     ON tenants (email);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants (is_active);

-- entities: almost always filtered by tenant; composite covers active-entity queries
CREATE INDEX IF NOT EXISTS idx_entities_tenant_id     ON entities (tenant_id);
CREATE INDEX IF NOT EXISTS idx_entities_tenant_active ON entities (tenant_id, is_active);

-- role_permissions: tenant partitioning
CREATE INDEX IF NOT EXISTS idx_role_permissions_tenant_id ON role_permissions (tenant_id);

-- tokens: FK column is not auto-indexed in PostgreSQL; token_hash is used for lookups
CREATE INDEX IF NOT EXISTS idx_tokens_user_id    ON tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token_hash ON tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens (expires_at);

-- gl_accounts: tenant+company is the primary lookup partition; account_number searched directly
CREATE INDEX IF NOT EXISTS idx_gl_accounts_tenant_company    ON gl_accounts (tenant_id, company_id);
CREATE INDEX IF NOT EXISTS idx_gl_accounts_account_type      ON gl_accounts (tenant_id, company_id, account_type);
CREATE INDEX IF NOT EXISTS idx_gl_accounts_is_active         ON gl_accounts (tenant_id, company_id, is_active);

-- One top-level rule per account+dimension
CREATE UNIQUE INDEX IF NOT EXISTS uq_acct_dim_rule_top
	ON gl_account_dimension_rules (account_id, dimension_id)
	WHERE parent_value_id IS NULL;

-- One conditional rule per account+dimension+parent_value
CREATE UNIQUE INDEX IF NOT EXISTS uq_acct_dim_rule_cond
	ON gl_account_dimension_rules (account_id, dimension_id, parent_value_id)
	WHERE parent_value_id IS NOT NULL;

-- Fast lookup by account (used on every transaction line)
CREATE INDEX IF NOT EXISTS idx_acct_dim_rules_account
	ON gl_account_dimension_rules (account_id);

-- sl_transactions: primary listing query is by company + date;
CREATE INDEX IF NOT EXISTS idx_sl_transactions_company_date
	ON sl_transactions (tenant_id, company_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_sl_transactions_type_status
	ON sl_transactions (tenant_id, company_id, type);

-- gl_transactions: account balance by date; entry grouping; subledger reverse-lookup
CREATE INDEX IF NOT EXISTS idx_gl_transactions_account_date
	ON gl_transactions (tenant_id, company_id, account_id, transaction_date);


CREATE INDEX IF NOT EXISTS idx_gl_transactions_source
	ON gl_transactions (source_id);