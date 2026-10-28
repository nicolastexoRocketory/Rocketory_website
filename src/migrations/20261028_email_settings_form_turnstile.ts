import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`kontakt_notification_email\` text;`)
  await db.run(
    sql`ALTER TABLE \`email_settings\` ADD COLUMN \`kontakt_turnstile_enabled\` integer DEFAULT 1;`,
  )
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`kontakt_turnstile_site_key\` text;`)
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`kontakt_turnstile_secret_key\` text;`)
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`ki_check_notification_email\` text;`)
  await db.run(
    sql`ALTER TABLE \`email_settings\` ADD COLUMN \`ki_check_turnstile_enabled\` integer DEFAULT 1;`,
  )
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`ki_check_turnstile_site_key\` text;`)
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`ki_check_turnstile_secret_key\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`ki_check_turnstile_secret_key\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`ki_check_turnstile_site_key\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`ki_check_turnstile_enabled\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`ki_check_notification_email\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`kontakt_turnstile_secret_key\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`kontakt_turnstile_site_key\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`kontakt_turnstile_enabled\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`kontakt_notification_email\`;`)
}
