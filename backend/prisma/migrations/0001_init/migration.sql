CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','driver','manager','admin') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE drivers (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  current_lat DECIMAL(10,7) NULL,
  current_lng DECIMAL(10,7) NULL,
  last_seen_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_drivers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY,
  customer_id CHAR(36) NOT NULL,
  driver_id CHAR(36) NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,7) NOT NULL,
  pickup_lng DECIMAL(10,7) NOT NULL,
  dropoff_lat DECIMAL(10,7) NOT NULL,
  dropoff_lng DECIMAL(10,7) NOT NULL,
  status ENUM('Pending','Assigned','Picked Up','On The Way','Delivered') NOT NULL DEFAULT 'Pending',
  payment_status ENUM('Pending','Paid','Failed','Refunded','CashOnDelivery') NOT NULL DEFAULT 'Pending',
  payment_method ENUM('Card','CashOnDelivery','Manual') NULL,
  estimated_minutes INT NULL,
  assigned_at DATETIME NULL,
  picked_up_at DATETIME NULL,
  delivered_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE order_events (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload_json JSON NOT NULL,
  actor_user_id CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_events_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_events_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE driver_locations (
  id CHAR(36) PRIMARY KEY,
  driver_id CHAR(36) NOT NULL,
  order_id CHAR(36) NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_driver_locations_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_locations_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  channel VARCHAR(40) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL,
  provider_message_id VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  provider VARCHAR(80) NULL,
  payment_method ENUM('Card','CashOnDelivery','Manual') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'MNT',
  status ENUM('Pending','Paid','Failed','Refunded','CashOnDelivery') NOT NULL DEFAULT 'Pending',
  transaction_reference VARCHAR(255) NULL,
  provider_response JSON NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_drivers_is_available ON drivers(is_available);
CREATE INDEX idx_drivers_current_lat ON drivers(current_lat);
CREATE INDEX idx_drivers_current_lng ON drivers(current_lng);
CREATE INDEX idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_events_order_id_created_at ON order_events(order_id, created_at);
CREATE INDEX idx_driver_locations_driver_id_recorded_at ON driver_locations(driver_id, recorded_at);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
