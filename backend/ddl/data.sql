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
    ('General_ledger.Write', 'Create and edit general ledger entries')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id, tenant_id)
SELECT r.id, p.id, 1
FROM roles r, permissions p
WHERE r.name = 'Controller'
  AND r.tenant_id = 1
  AND p.name = 'General_ledger.Write'
ON CONFLICT DO NOTHING;

INSERT INTO user_role_assignments (user_id, role_id, tenant_id)
SELECT u.id, r.id, 1
FROM users u, roles r
WHERE u.email = 'matthew.fay@softwarerror.com'
  AND r.name = 'sysadmin'
  AND r.tenant_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO user_role_assignments (user_id, role_id, tenant_id)
SELECT u.id, r.id, 1
FROM users u, roles r
WHERE u.email = 'matthew.fay@softwarerror.com'
  AND r.name = 'Controller'
  AND r.tenant_id = 1
ON CONFLICT DO NOTHING;
