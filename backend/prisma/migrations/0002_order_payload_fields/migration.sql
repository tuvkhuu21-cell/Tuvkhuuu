ALTER TABLE orders
  ADD COLUMN sender_name VARCHAR(140) NOT NULL DEFAULT '',
  ADD COLUMN sender_phone VARCHAR(40) NOT NULL DEFAULT '',
  ADD COLUMN pickup_contact_name VARCHAR(140) NOT NULL DEFAULT '',
  ADD COLUMN pickup_contact_phone VARCHAR(40) NOT NULL DEFAULT '',
  ADD COLUMN receiver_name VARCHAR(140) NOT NULL DEFAULT '',
  ADD COLUMN receiver_phone VARCHAR(40) NOT NULL DEFAULT '',
  ADD COLUMN package_weight DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN package_description TEXT NULL,
  ADD COLUMN notes TEXT NULL,
  ADD COLUMN delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE orders
SET package_description = ''
WHERE package_description IS NULL;

ALTER TABLE orders
  MODIFY package_description TEXT NOT NULL;
