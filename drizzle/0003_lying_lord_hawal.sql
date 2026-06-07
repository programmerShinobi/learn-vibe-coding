ALTER TABLE `revoked_tokens` ADD `token_hash` varchar(64);--> statement-breakpoint
UPDATE `revoked_tokens` SET `token_hash` = SHA2(`token`, 256) WHERE `token_hash` IS NULL;--> statement-breakpoint
ALTER TABLE `revoked_tokens` DROP COLUMN `token`;--> statement-breakpoint
ALTER TABLE `revoked_tokens` MODIFY COLUMN `token_hash` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `revoked_tokens` ADD CONSTRAINT `revoked_tokens_token_hash_unique` UNIQUE(`token_hash`);
