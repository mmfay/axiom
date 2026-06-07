ALTER TABLE gl_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gl_transactions_tenant_company ON gl_transactions;
CREATE POLICY gl_transactions_tenant_company ON gl_transactions
    FOR SELECT
    USING (
        tenant_id  = current_setting('app.tenant_id',  true)::integer
        AND company_id = current_setting('app.company_id', true)::integer
    );

ALTER TABLE sl_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sl_transactions_tenant_company ON sl_transactions;
CREATE POLICY sl_transactions_tenant_company ON sl_transactions
    FOR SELECT
    USING (
        tenant_id  = current_setting('app.tenant_id',  true)::integer
        AND company_id = current_setting('app.company_id', true)::integer
    );

ALTER TABLE gl_journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gl_journals_tenant_company ON gl_journals;
CREATE POLICY gl_journals_tenant_company ON gl_journals
    FOR SELECT
    USING (
        tenant_id  = current_setting('app.tenant_id',  true)::integer
        AND company_id = current_setting('app.company_id', true)::integer
    );

ALTER TABLE gl_journal_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gl_journal_lines_tenant_company ON gl_journal_lines;
CREATE POLICY gl_journal_lines_tenant_company ON gl_journal_lines
    FOR SELECT
    USING (
        tenant_id  = current_setting('app.tenant_id',  true)::integer
        AND company_id = current_setting('app.company_id', true)::integer
    );