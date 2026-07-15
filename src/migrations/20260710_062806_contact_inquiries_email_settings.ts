import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`contact_inquiries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`display_title\` text,
  	\`status\` text DEFAULT 'new',
  	\`source\` text DEFAULT 'website',
  	\`intent\` text,
  	\`intent_label\` text,
  	\`detail_summary\` text,
  	\`message\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`company\` text,
  	\`email\` text NOT NULL,
  	\`phone\` text,
  	\`referral\` text,
  	\`project_brief\` text,
  	\`project_pages\` text,
  	\`project_timeline\` text,
  	\`festpreis_paket\` text,
  	\`festpreis_tech\` text,
  	\`seo_laufzeit\` text,
  	\`redesign_typ\` text,
  	\`ip_address\` text,
  	\`user_agent\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_inquiries_updated_at_idx\` ON \`contact_inquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contact_inquiries_created_at_idx\` ON \`contact_inquiries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`email_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`smtp_enabled\` integer DEFAULT false,
  	\`smtp_host\` text,
  	\`smtp_port\` numeric DEFAULT 587,
  	\`smtp_secure\` text DEFAULT 'starttls',
  	\`smtp_user\` text,
  	\`smtp_password\` text,
  	\`from_name\` text DEFAULT 'Rocketory Website',
  	\`from_email\` text DEFAULT 'kontakt@rocketory.de',
  	\`reply_to_email\` text,
  	\`notification_email\` text DEFAULT 'kontakt@rocketory.de',
  	\`notification_subject_prefix\` text DEFAULT 'Kontaktanfrage',
  	\`send_customer_confirmation\` integer DEFAULT true,
  	\`customer_confirmation_subject\` text DEFAULT 'Deine Anfrage bei Rocketory',
  	\`google_maps_embed_url\` text DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25135.8!2d8.5864!3d52.1984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47ba74da50b9f0e9%3A0x422e0d927eb334fc!2s32257%20B%C3%BCnde!5e0!3m2!1sde!2sde!4v1710000000000!5m2!1sde!2sde',
  	\`google_maps_link_url\` text DEFAULT 'https://www.google.com/maps/search/?api=1&query=52.1984,8.5864',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`contact_inquiries_id\` integer REFERENCES contact_inquiries(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_inquiries_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`contact_inquiries\`;`)
  await db.run(sql`DROP TABLE \`email_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`categories_id\` integer,
  	\`posts_id\` integer,
  	\`project_categories_id\` integer,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`project_categories_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "categories_id", "posts_id", "project_categories_id", "projects_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "categories_id", "posts_id", "project_categories_id", "projects_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_project_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`project_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
}
