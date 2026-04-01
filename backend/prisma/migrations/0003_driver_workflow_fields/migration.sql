ALTER TABLE `orders`
  ADD COLUMN `accepted_at` DATETIME(3) NULL,
  ADD COLUMN `rejected_at` DATETIME(3) NULL;
