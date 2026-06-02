CREATE TABLE `revoked_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(1024) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `revoked_tokens_id` PRIMARY KEY(`id`)
);
