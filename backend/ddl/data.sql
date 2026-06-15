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

-- ── Numbering schemes ─────────────────────────────────────────────────────────

INSERT INTO numbering_schemes (tenant_id, company_id, document_type, prefix, separator, padding, include_year, include_month, next_value, is_active)
VALUES
    (1, 1, 'gl_journal', 'JE', '-', 4, TRUE,  FALSE, 11, TRUE),
    (1, 1, 'voucher',    'V',  '',  4, FALSE, FALSE,  8, TRUE)
ON CONFLICT DO NOTHING;

-- ── Subledger transactions ────────────────────────────────────────────────────

INSERT INTO sl_transactions (tenant_id, company_id, type, transaction_date, reference, voucher, description, amount)
VALUES
    (1, 1, 'ap_invoice',  '2026-04-01', 'INV-2001', 'V0001', 'April office rent',       3500.00 ),
    (1, 1, 'ap_invoice',  '2026-04-05', 'INV-2002', 'V0002', 'Office supplies',         2400.00 ),
    (1, 1, 'ar_invoice',  '2026-04-10', 'INV-1001', 'V0003', 'Consulting services Q1',  5000.00 ),
    (1, 1, 'ap_payment',  '2026-04-15', 'PAY-2001', 'V0004', 'Payment for INV-2001',    3500.00 ),
    (1, 1, 'ap_payment',  '2026-04-18', 'PAY-2002', 'V0005', 'Payment for INV-2002',    2400.00 ),
    (1, 1, 'ar_payment',  '2026-04-22', 'PAY-1001', 'V0006', 'Payment for INV-1001',    5000.00 ),
    (1, 1, 'ap_invoice',  '2026-04-28', 'INV-2003', 'V0007', 'Legal retainer April',    1500.00 )
ON CONFLICT DO NOTHING;

-- ── GL transactions ───────────────────────────────────────────────────────────

-- INV-2001 · WeWork rent — DR Rent Expense / CR AP
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-01',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='6100'),
    'INV-2001 WeWork', 3500.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ'),
    'V0001');
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-01',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'INV-2001 WeWork', 0.00, 3500.00, NULL, NULL,
    'V0001');

-- INV-2002 · Acme Corp supplies — DR Misc Expense / CR AP
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-05',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='6900'),
    'INV-2002 Acme Corp', 2400.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ'),
    'V0002');
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-05',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'INV-2002 Acme Corp', 0.00, 2400.00, NULL, NULL,
    'V0002');

-- INV-1001 · TechCorp consulting — DR AR / CR Service Revenue
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-10',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1200'),
    'INV-1001 TechCorp Inc', 5000.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    'V0003');
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-10',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='4100'),
    'INV-1001 TechCorp Inc', 0.00, 5000.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    'V0003');

-- PAY-2001 · WeWork payment — DR AP / CR Cash
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-15',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'PAY-2001 WeWork', 3500.00, 0.00, NULL, NULL,
    'V0004');
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-15',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1000'),
    'PAY-2001 WeWork', 0.00, 3500.00, NULL, NULL,
    'V0004');

-- PAY-2002 · Acme Corp payment — DR AP / CR Cash
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-18',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='2000'),
    'PAY-2002 Acme Corp', 2400.00, 0.00, NULL, NULL,
    'V0005');
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-18',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1000'),
    'PAY-2002 Acme Corp', 0.00, 2400.00, NULL, NULL,
    'V0005');

-- PAY-1001 · TechCorp payment — DR Cash / CR AR
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-22',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1000'),
    'PAY-1001 TechCorp Inc', 5000.00, 0.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    'V0006');
INSERT INTO gl_transactions (tenant_id, company_id, transaction_date, account_id, description, debit, credit, dim1_value_id, dim2_value_id, voucher)
VALUES (1, 1, '2026-04-22',
    (SELECT id FROM gl_accounts        WHERE tenant_id=1 AND company_id=1 AND account_number='1200'),
    'PAY-1001 TechCorp Inc', 0.00, 5000.00,
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'),
    (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'),
    'V0006');

-- ── GL Journals ───────────────────────────────────────────────────────────────

-- 1. May salary accrual (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-01', 'JE-2026-0001', 'May salary accrual', 'posted', NULL, '2026-05-01 09:00:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6000'), 'Engineering salaries',  8000.00,     0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='ENG'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6000'), 'Sales salaries',         4500.00,     0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='2100'), 'Salaries payable',           0.00, 12500.00, NULL, NULL);

-- 2. May rent payment (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-01', 'JE-2026-0002', 'May office rent — WeWork', 'posted', NULL, '2026-05-01 09:15:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6100'), 'May rent', 3500.00,    0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1000'), 'May rent',    0.00, 3500.00, NULL, NULL);
							
-- 3. Annual insurance prepayment (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-02', 'JE-2026-0003', 'Annual business insurance premium', 'posted', NULL, '2026-05-02 10:00:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1500'), 'Prepaid insurance 12 months', 6000.00,    0.00, NULL, NULL),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1000'), 'Insurance premium payment',     0.00, 6000.00, NULL, NULL);

-- 4. Capital injection (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-10', 'JE-2026-0004', 'Founder capital contribution', 'posted', NULL, '2026-05-10 08:30:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1000'), 'Capital wire received', 50000.00,     0.00, NULL, NULL),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='3000'), 'Common stock issued',      0.00, 50000.00, NULL, NULL);

-- 5. Deferred revenue recognition (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-15', 'JE-2026-0005', 'Recognize deferred revenue — TechCorp retainer', 'posted', NULL, '2026-05-15 11:00:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='2500'), 'TechCorp retainer earned', 2500.00,    0.00, NULL, NULL),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='4100'), 'TechCorp retainer earned',    0.00, 2500.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='SLS'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='RMT'));

-- 6. Legal fees accrual (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-20', 'JE-2026-0006', 'Legal fees accrual — Lawson & Co', 'posted', NULL, '2026-05-20 14:00:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6500'), 'Legal retainer May', 4000.00,    0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='2100'), 'Lawson & Co payable',  0.00, 4000.00, NULL, NULL);

-- 7. Monthly depreciation (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-31', 'JE-2026-0007', 'May depreciation — fixed assets', 'posted', NULL, '2026-05-31 17:00:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6300'), 'May depreciation', 1200.00,    0.00, NULL, NULL),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1810'), 'May depreciation',    0.00, 1200.00, NULL, NULL);

-- 8. Insurance amortization (posted)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-31', 'JE-2026-0008', 'May insurance amortization', 'posted', NULL, '2026-05-31 17:05:00+00');
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6400'), 'Insurance expense May', 500.00,   0.00, NULL, NULL),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1500'), 'Prepaid insurance',       0.00, 500.00, NULL, NULL);

-- 9. Utilities accrual (draft)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-25', 'JE-2026-0009', 'May utilities accrual', 'draft', NULL, NULL);
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6200'), 'Estimated utilities May', 850.00,   0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='2100'), 'Utilities payable',         0.00, 850.00, NULL, NULL);

-- ── Workflow: GL Journal ──────────────────────────────────────────────────────

INSERT INTO workflow_definitions (tenant_id, document_type, is_active)
VALUES (1, 'gl_journal', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO workflow_nodes (id, workflow_id, tenant_id, node_type, label, approver_type, approver_id, position_x, position_y)
VALUES
    ('wf-gl-start',      (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'start',    'Start',              NULL,   NULL,                                                                           100, 200),
    ('wf-gl-approval-1', (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'approval', 'Admin Approval',     'user', (SELECT id FROM users WHERE email='admin@softwarerror.com'),          300, 200),
    ('wf-gl-approval-2', (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'approval', 'Controller Approval','user', (SELECT id FROM users WHERE email='matthew.fay@softwarerror.com'),    500, 200),
    ('wf-gl-end',        (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'end',      'End',                NULL,   NULL,                                                                           700, 200)
ON CONFLICT DO NOTHING;

INSERT INTO workflow_edges (id, workflow_id, tenant_id, source_node_id, target_node_id)
VALUES
    ('wf-gl-edge-1', (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'wf-gl-start',      'wf-gl-approval-1'),
    ('wf-gl-edge-2', (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'wf-gl-approval-1', 'wf-gl-approval-2'),
    ('wf-gl-edge-3', (SELECT id FROM workflow_definitions WHERE tenant_id=1 AND document_type='gl_journal'), 1, 'wf-gl-approval-2', 'wf-gl-end')
ON CONFLICT DO NOTHING;

-- 10. Petty cash replenishment (draft)
INSERT INTO gl_journals (tenant_id, company_id, journal_date, reference, memo, status, workflow_status, posted_at)
VALUES (1, 1, '2026-05-25', 'JE-2026-0010', 'Petty cash replenishment', 'draft', NULL, NULL);
INSERT INTO gl_journal_lines (journal_id, tenant_id, company_id, account_id, description, debit, credit, dim1_value_id, dim2_value_id)
VALUES
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6900'), 'Office supplies misc', 185.00,   0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='OPS'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='6900'), 'Team lunch',           135.00,   0.00, (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='ENG'), (SELECT id FROM gl_dimension_values WHERE tenant_id=1 AND company_id=1 AND code='HQ')),
    (currval('gl_journals_id_seq'), 1, 1, (SELECT id FROM gl_accounts WHERE tenant_id=1 AND company_id=1 AND account_number='1010'), 'Petty cash fund',        0.00, 320.00, NULL, NULL);
