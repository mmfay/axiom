INSERT INTO tenants (name, email, is_active)
VALUES
    ('Softwarerror', 'matthew.fay@softwarerror.com', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO entities (tenant_id, name, is_active)
VALUES
    (1, 'Softwarerror LLC', TRUE),
	(1, 'Softwarerror Group', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO users (email, user_id, password, is_enabled, tenant_id, default_company_id)
VALUES
    ('admin@softwarerror.com',          'admin',   '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE,  1, 1),
    ('john.doe@softwarerror.com',        'jdoe',    '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', FALSE, 1, 1),
    ('jane.smith@softwarerror.com',      'jsmith',  '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE,  1, 1),
    ('michael.brown@softwarerror.com',   'mbrown',  '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE,  1, 1),
    ('matthew.fay@softwarerror.com',     'mfay',    '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE,  1, 1),
    ('sarah.wilson@softwarerror.com',    'swilson', '$2b$12$jUzsxGMk3ES8VBpRWKvW.uYwZgEbKJHUo0/0G3Fi4AsGy.GhaxW2u', TRUE,  1, 1)
ON CONFLICT DO NOTHING;

INSERT INTO roles (tenant_id, name, description)
VALUES
    (1, 'sysadmin',    'Full system access'),
    (1, 'Controller',  'Accounting and general ledger access')
ON CONFLICT DO NOTHING;

INSERT INTO permissions (name, description)
VALUES
    ('General_ledger.Write', 'Create and edit general ledger entries'),
    ('General_ledger.Read',  'View general ledger entries')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id, tenant_id)
SELECT r.id, p.id, 1
FROM roles r, permissions p
WHERE r.name = 'Controller'
  AND r.tenant_id = 1
  AND p.name IN ('General_ledger.Write', 'General_ledger.Read')
ON CONFLICT DO NOTHING;

INSERT INTO user_role_assignments (user_id, role_id, tenant_id)
SELECT u.id, r.id, 1
FROM users u, roles r
WHERE u.email = 'matthew.fay@softwarerror.com'
  AND r.name = 'sysadmin'
  AND r.tenant_id = 1
ON CONFLICT DO NOTHING;

UPDATE users
SET default_role_id = (SELECT id FROM roles WHERE name = 'sysadmin' AND tenant_id = 1)
WHERE email = 'matthew.fay@softwarerror.com';

INSERT INTO user_role_assignments (user_id, role_id, tenant_id)
SELECT u.id, r.id, 1
FROM users u, roles r
WHERE u.email = 'matthew.fay@softwarerror.com'
  AND r.name = 'Controller'
  AND r.tenant_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO gl_accounts (tenant_id, company_id, account_number, name, account_type, normal_balance, description, is_active)
VALUES
    (1, 1, '1000', 'Cash',                          'Asset',     'debit',  'Operating cash accounts',              TRUE),
    (1, 1, '1010', 'Petty Cash',                    'Asset',     'debit',  'Petty cash fund',                      TRUE),
    (1, 1, '1200', 'Accounts Receivable',           'Asset',     'debit',  'Amounts owed by customers',            TRUE),
    (1, 1, '1300', 'Inventory',                     'Asset',     'debit',  'Goods held for sale',                  TRUE),
    (1, 1, '1500', 'Prepaid Expenses',              'Asset',     'debit',  'Expenses paid in advance',             TRUE),
    (1, 1, '1800', 'Fixed Assets',                  'Asset',     'debit',  'Property, plant and equipment',        TRUE),
    (1, 1, '1810', 'Accumulated Depreciation',      'Asset',     'credit', 'Contra account for fixed assets',      TRUE),
    (1, 1, '2000', 'Accounts Payable',              'Liability', 'credit', 'Amounts owed to vendors',              TRUE),
    (1, 1, '2100', 'Accrued Liabilities',           'Liability', 'credit', 'Accrued but unpaid expenses',          TRUE),
    (1, 1, '2200', 'Short-Term Debt',               'Liability', 'credit', 'Loans due within one year',            TRUE),
    (1, 1, '2500', 'Deferred Revenue',              'Liability', 'credit', 'Revenue received but not yet earned',  TRUE),
    (1, 1, '2800', 'Long-Term Debt',                'Liability', 'credit', 'Loans due after one year',             TRUE),
    (1, 1, '3000', 'Common Stock',                  'Equity',    'credit', 'Issued share capital',                 TRUE),
    (1, 1, '3100', 'Retained Earnings',             'Equity',    'credit', 'Cumulative undistributed earnings',    TRUE),
    (1, 1, '3200', 'Additional Paid-In Capital',    'Equity',    'credit', 'Capital above par value',              TRUE),
    (1, 1, '4000', 'Revenue',                       'Revenue',   'credit', 'Primary operating revenue',            TRUE),
    (1, 1, '4100', 'Service Revenue',               'Revenue',   'credit', 'Revenue from services rendered',       TRUE),
    (1, 1, '4900', 'Other Income',                  'Revenue',   'credit', 'Non-operating income',                 TRUE),
    (1, 1, '5000', 'Cost of Goods Sold',            'Expense',   'debit',  'Direct costs of goods sold',           TRUE),
    (1, 1, '6000', 'Salaries Expense',              'Expense',   'debit',  'Employee compensation',                TRUE),
    (1, 1, '6100', 'Rent Expense',                  'Expense',   'debit',  'Office and facility rent',             TRUE),
    (1, 1, '6200', 'Utilities Expense',             'Expense',   'debit',  'Electricity, water, internet',         TRUE),
    (1, 1, '6300', 'Depreciation Expense',          'Expense',   'debit',  'Periodic depreciation charge',         TRUE),
    (1, 1, '6400', 'Insurance Expense',             'Expense',   'debit',  'Business insurance premiums',          TRUE),
    (1, 1, '6500', 'Professional Fees',             'Expense',   'debit',  'Legal, audit, and consulting fees',    TRUE),
    (1, 1, '6900', 'Miscellaneous Expense',         'Expense',   'debit',  'Other operating expenses',             TRUE)
ON CONFLICT DO NOTHING;

-- ── GL Dimensions ─────────────────────────────────────────────────────────────

INSERT INTO gl_dimensions (tenant_id, company_id, slot, name, is_active)
VALUES
    (1, 1, 1, 'Department', TRUE),
    (1, 1, 2, 'Location',   TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO gl_dimension_values (dimension_id, tenant_id, company_id, code, name)
VALUES
    ((SELECT id FROM gl_dimensions WHERE tenant_id = 1 AND company_id = 1 AND slot = 1), 1, 1, 'MKT', 'Marketing'),
    ((SELECT id FROM gl_dimensions WHERE tenant_id = 1 AND company_id = 1 AND slot = 1), 1, 1, 'SLS', 'Sales'),
    ((SELECT id FROM gl_dimensions WHERE tenant_id = 1 AND company_id = 1 AND slot = 1), 1, 1, 'ENG', 'Engineering'),
    ((SELECT id FROM gl_dimensions WHERE tenant_id = 1 AND company_id = 1 AND slot = 1), 1, 1, 'OPS', 'Operations'),
    ((SELECT id FROM gl_dimensions WHERE tenant_id = 1 AND company_id = 1 AND slot = 2), 1, 1, 'HQ',  'Headquarters'),
    ((SELECT id FROM gl_dimensions WHERE tenant_id = 1 AND company_id = 1 AND slot = 2), 1, 1, 'RMT', 'Remote')
ON CONFLICT DO NOTHING;

-- ── Subledger transactions ────────────────────────────────────────────────────

INSERT INTO sl_transactions (tenant_id, company_id, type, transaction_date, reference, description, counterparty_name, amount, status, posted_at)
VALUES
    (1, 1, 'ap_invoice',  '2026-04-01', 'INV-2001', 'April office rent',        'WeWork',       3500.00, 'posted', '2026-04-01 08:00:00+00'),
    (1, 1, 'ap_invoice',  '2026-04-05', 'INV-2002', 'Office supplies',          'Acme Corp',    2400.00, 'posted', '2026-04-05 09:00:00+00'),
    (1, 1, 'ar_invoice',  '2026-04-10', 'INV-1001', 'Consulting services Q1',   'TechCorp Inc', 5000.00, 'posted', '2026-04-10 10:00:00+00'),
    (1, 1, 'ap_payment',  '2026-04-15', 'PAY-2001', 'Payment for INV-2001',     'WeWork',       3500.00, 'posted', '2026-04-15 11:00:00+00'),
    (1, 1, 'ap_payment',  '2026-04-18', 'PAY-2002', 'Payment for INV-2002',     'Acme Corp',    2400.00, 'posted', '2026-04-18 09:30:00+00'),
    (1, 1, 'ar_payment',  '2026-04-22', 'PAY-1001', 'Payment for INV-1001',     'TechCorp Inc', 5000.00, 'posted', '2026-04-22 14:00:00+00'),
    (1, 1, 'ap_invoice',  '2026-04-28', 'INV-2003', 'Legal retainer April',     'Lawson & Co',  1500.00, 'draft',  NULL)
ON CONFLICT DO NOTHING;

-- ── GL transactions ───────────────────────────────────────────────────────────

-- INV-2001 · WeWork rent — DR Rent Expense / CR AP
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-01',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='6100'),
    'INV-2001 WeWork', 3500.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ'),
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='INV-2001'));
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-01',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'INV-2001 WeWork', 0.00, 3500.00, NULL, NULL,
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='INV-2001'));

-- INV-2002 · Acme Corp supplies — DR Misc Expense / CR AP
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-05',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='6900'),
    'INV-2002 Acme Corp', 2400.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ'),
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='INV-2002'));
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-05',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'INV-2002 Acme Corp', 0.00, 2400.00, NULL, NULL,
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='INV-2002'));

-- INV-1001 · TechCorp consulting — DR AR / CR Service Revenue
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-10',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1200'),
    'INV-1001 TechCorp Inc', 5000.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='INV-1001'));
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-10',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='4100'),
    'INV-1001 TechCorp Inc', 0.00, 5000.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='INV-1001'));

-- PAY-2001 · WeWork payment — DR AP / CR Cash
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-15',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'PAY-2001 WeWork', 3500.00, 0.00, NULL, NULL,
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='PAY-2001'));
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-15',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1000'),
    'PAY-2001 WeWork', 0.00, 3500.00, NULL, NULL,
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='PAY-2001'));

-- PAY-2002 · Acme Corp payment — DR AP / CR Cash
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-18',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'PAY-2002 Acme Corp', 2400.00, 0.00, NULL, NULL,
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='PAY-2002'));
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-18',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1000'),
    'PAY-2002 Acme Corp', 0.00, 2400.00, NULL, NULL,
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='PAY-2002'));

-- PAY-1001 · TechCorp payment — DR Cash / CR AR
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-22',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1000'),
    'PAY-1001 TechCorp Inc', 5000.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='PAY-1001'));
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, source_id)
VALUES (1, 1, '2026-04-22',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1200'),
    'PAY-1001 TechCorp Inc', 0.00, 5000.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    (SELECT id FROM sl_transactions     WHERE tenant_id=1 AND company_id=1 AND reference='PAY-1001'));
