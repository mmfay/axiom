DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    version_id INTEGER NOT NULL DEFAULT 1,
	is_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO users (email, user_id, password, is_enabled)
VALUES
    ('admin@axiom.com', 'admin', 'hashed_password_1', TRUE),
    ('john.doe@axiom.com', 'jdoe', 'hashed_password_2', FALSE),
    ('jane.smith@axiom.com', 'jsmith', 'hashed_password_3', TRUE),
    ('michael.brown@axiom.com', 'mbrown', 'hashed_password_4', TRUE),
    ('sarah.wilson@axiom.com', 'swilson', 'hashed_password_5', TRUE);