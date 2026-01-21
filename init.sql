-- Insert default roles if they don't exist
INSERT INTO roles (id, name) VALUES 
  (1, 'ADMIN'),
  (2, 'MANAGER'),
  (3, 'USER')
ON CONFLICT (id) DO NOTHING;

-- Update sequence to start from 4
SELECT setval('roles_id_seq', 3, true);
