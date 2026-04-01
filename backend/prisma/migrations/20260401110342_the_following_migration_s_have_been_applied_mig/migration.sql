-- DropForeignKey
ALTER TABLE `driver_locations` DROP FOREIGN KEY `fk_driver_locations_driver`;

-- DropForeignKey
ALTER TABLE `driver_locations` DROP FOREIGN KEY `fk_driver_locations_order`;

-- DropForeignKey
ALTER TABLE `drivers` DROP FOREIGN KEY `fk_drivers_user`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `fk_notifications_order`;

-- DropForeignKey
ALTER TABLE `order_events` DROP FOREIGN KEY `fk_order_events_actor`;

-- DropForeignKey
ALTER TABLE `order_events` DROP FOREIGN KEY `fk_order_events_order`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_orders_customer`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `fk_orders_driver`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `fk_payments_customer`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `fk_payments_order`;

-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `fk_refresh_tokens_user`;

-- DropIndex
DROP INDEX `fk_driver_locations_order` ON `driver_locations`;

-- DropIndex
DROP INDEX `fk_notifications_order` ON `notifications`;

-- DropIndex
DROP INDEX `fk_order_events_actor` ON `order_events`;

-- DropIndex
DROP INDEX `fk_refresh_tokens_user` ON `refresh_tokens`;

-- AlterTable
ALTER TABLE `driver_locations` MODIFY `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `drivers` MODIFY `last_seen_at` DATETIME(3) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `order_events` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `orders` MODIFY `assigned_at` DATETIME(3) NULL,
    MODIFY `picked_up_at` DATETIME(3) NULL,
    MODIFY `delivered_at` DATETIME(3) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL,
    ALTER COLUMN `sender_name` DROP DEFAULT,
    ALTER COLUMN `sender_phone` DROP DEFAULT,
    ALTER COLUMN `pickup_contact_name` DROP DEFAULT,
    ALTER COLUMN `pickup_contact_phone` DROP DEFAULT,
    ALTER COLUMN `receiver_name` DROP DEFAULT,
    ALTER COLUMN `receiver_phone` DROP DEFAULT,
    ALTER COLUMN `package_weight` DROP DEFAULT,
    ALTER COLUMN `delivery_fee` DROP DEFAULT;

-- AlterTable
ALTER TABLE `payments` MODIFY `paid_at` DATETIME(3) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expires_at` DATETIME(3) NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `revoked_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_events` ADD CONSTRAINT `order_events_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_events` ADD CONSTRAINT `order_events_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver_locations` ADD CONSTRAINT `driver_locations_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver_locations` ADD CONSTRAINT `driver_locations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `drivers` RENAME INDEX `user_id` TO `drivers_user_id_key`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `email` TO `users_email_key`;
