CREATE TABLE `magic_link` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_reset_code` (
	`token_hash` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`is_active` integer DEFAULT true NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`password_hash` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`permissions` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_verification_code` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`uploaded_by` text,
	`name` text NOT NULL,
	`data` blob NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `product_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`image_id` integer,
	`retail_price` integer NOT NULL,
	`wholesale_price` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sku`) REFERENCES `estoque`(`sku`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`category_id` integer,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `product_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bugReport` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`created_by` text DEFAULT '',
	`status` text NOT NULL,
	`name` text NOT NULL,
	`metadata` text,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`type` text NOT NULL,
	`pathname` text,
	`created_by` text DEFAULT '',
	`text` text NOT NULL,
	`routeName` text,
	`metadata` text,
	`error` text,
	`currency` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `estoque` (
	`sku` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`image_id` integer,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transacao_estoque` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`sku` text NOT NULL,
	`quantity` integer NOT NULL,
	`type` text NOT NULL,
	`supplier_id` integer,
	`order_id` integer,
	`cost_price` integer,
	`meta_data` text NOT NULL,
	`total_log` integer NOT NULL,
	FOREIGN KEY (`sku`) REFERENCES `estoque`(`sku`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `fornecedor`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `pedidos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fornecedor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`razao_social` text,
	`cnpj_cpf` text,
	`ie_rg` text,
	`telephone_1` text,
	`telephone_2` text,
	`cep` text
);
--> statement-breakpoint
CREATE TABLE `notification_channel` (
	`channel_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `notification_channel_users` (
	`channel_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `push_notification_device` (
	`device_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`subscription` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `push_notification_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer,
	`channel_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`payload` text NOT NULL,
	`http_status` integer NOT NULL,
	`success` integer NOT NULL,
	`err_message` text,
	FOREIGN KEY (`device_id`) REFERENCES `push_notification_device`(`device_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`channel_id`) REFERENCES `notification_channel`(`channel_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `endereco` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`customer_id` integer NOT NULL,
	`cep` text NOT NULL,
	`street` text NOT NULL,
	`number` text NOT NULL,
	`complement` text NOT NULL,
	`neighborhood` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`country` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`is_fiado` integer NOT NULL,
	`customer_id` integer,
	`address_id` integer,
	`created_by` text,
	`cachier_id` integer,
	`motoboy_id` text,
	`observation` text,
	`amount_paid` integer NOT NULL,
	`total` integer NOT NULL,
	`taxa_entrega` integer,
	`status` text NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`address_id`) REFERENCES `endereco`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cachier_id`) REFERENCES `caixas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`motoboy_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cliente` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_retail` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`name` text NOT NULL,
	`email` text,
	`birth_date` text,
	`cellphone` text,
	`phone` text,
	`cpf_cnpj` text,
	`rg_ie` text,
	`max_credit` integer DEFAULT 50000 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item_pedido` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `pedidos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `product_item`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pagamentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`amount_paid` integer NOT NULL,
	`troco` integer,
	`payment_method` text NOT NULL,
	`order_id` integer NOT NULL,
	`status` text NOT NULL,
	`observation` text,
	`cachier_id` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `pedidos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cachier_id`) REFERENCES `caixas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `caixas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`name` text NOT NULL,
	`status` text DEFAULT 'Fechado' NOT NULL,
	`currency` integer DEFAULT 0 NOT NULL,
	`taxa_por_km` integer
);
--> statement-breakpoint
CREATE TABLE `transacao_caixa_dinheiro` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`created_by` text,
	`cashier_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`observation` text,
	`type` text NOT NULL,
	`order_id` integer,
	`meta_data` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cashier_id`) REFERENCES `caixas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `pedidos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `delivery_fee` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taxa_por_km` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_channel_channel_id_unique` ON `notification_channel` (`channel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `push_notification_device_subscription_unique` ON `push_notification_device` (`subscription`);--> statement-breakpoint
CREATE INDEX `paid_index` ON `pedidos` (`amount_paid`) WHERE "pedidos"."amount_paid" >= "pedidos"."total";--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_email_unique` ON `cliente` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_cellphone_unique` ON `cliente` (`cellphone`);--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_phone_unique` ON `cliente` (`phone`);