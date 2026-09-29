-- Reference schema for MySQL 8.0+ (Sequelize's sync() generates this
-- automatically from the models in src/models/, but this file documents the
-- design explicitly, as requested: "justify database choice and design").
--
-- Note on UUIDs: Sequelize generates UUIDv4 values in application code
-- (see DataTypes.UUIDV4 in the models), so we store them as CHAR(36) rather
-- than relying on a MySQL-side UUID() default - this keeps the ID visible
-- and consistent before the row is even inserted.

CREATE TABLE bases (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  location VARCHAR(191),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(191) NOT NULL,
  role ENUM('admin', 'base_commander', 'logistics_officer') NOT NULL DEFAULT 'logistics_officer',
  base_id CHAR(36),                        -- required for base_commander, NULL otherwise
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (base_id) REFERENCES bases(id)
);

CREATE TABLE equipment_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  category ENUM('vehicle', 'weapon', 'ammunition') NOT NULL,
  unit VARCHAR(50) DEFAULT 'unit',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ledger tables. We never store a mutable "current balance" column: every
-- movement is an immutable, timestamped row, and balances are DERIVED by
-- aggregation. This is what makes the system auditable - nothing can be
-- silently overwritten, and Opening/Closing/Net Movement are always
-- reproducible from history for any date range.

CREATE TABLE purchases (
  id CHAR(36) PRIMARY KEY,
  base_id CHAR(36) NOT NULL,
  equipment_type_id CHAR(36) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  purchase_date DATE NOT NULL,
  supplier VARCHAR(191),
  unit_cost DECIMAL(12,2),
  created_by CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (base_id) REFERENCES bases(id),
  FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_purchases_base_date (base_id, purchase_date),
  INDEX idx_purchases_equip_date (equipment_type_id, purchase_date)
);

CREATE TABLE transfers (
  id CHAR(36) PRIMARY KEY,
  equipment_type_id CHAR(36) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  from_base_id CHAR(36) NOT NULL,
  to_base_id CHAR(36) NOT NULL,
  transfer_date DATE NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
  notes VARCHAR(255),
  created_by CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
  FOREIGN KEY (from_base_id) REFERENCES bases(id),
  FOREIGN KEY (to_base_id) REFERENCES bases(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  CHECK (from_base_id <> to_base_id),
  INDEX idx_transfers_from_date (from_base_id, transfer_date),
  INDEX idx_transfers_to_date (to_base_id, transfer_date)
);

CREATE TABLE assignments (
  id CHAR(36) PRIMARY KEY,
  base_id CHAR(36) NOT NULL,
  equipment_type_id CHAR(36) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  assigned_to_name VARCHAR(191) NOT NULL,
  assigned_date DATE NOT NULL,
  status ENUM('assigned', 'returned') DEFAULT 'assigned',
  returned_date DATE,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (base_id) REFERENCES bases(id),
  FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_assignments_base_date (base_id, assigned_date)
);

CREATE TABLE expenditures (
  id CHAR(36) PRIMARY KEY,
  base_id CHAR(36) NOT NULL,
  equipment_type_id CHAR(36) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  expended_date DATE NOT NULL,
  reason VARCHAR(255),
  created_by CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (base_id) REFERENCES bases(id),
  FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_expenditures_base_date (base_id, expended_date)
);

CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  user_email VARCHAR(191),
  action VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  status_code INT,
  request_body JSON,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_audit_logs_user (user_id),
  INDEX idx_audit_logs_created (created_at)
);
