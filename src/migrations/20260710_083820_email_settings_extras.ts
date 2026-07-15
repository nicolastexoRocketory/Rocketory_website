import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`notification_cc\` text;`)
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`notification_bcc\` text;`)
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`admin_email_footer\` text;`)
  await db.run(sql`ALTER TABLE \`email_settings\` ADD COLUMN \`customer_confirmation_body\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`customer_confirmation_body\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`admin_email_footer\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`notification_bcc\`;`)
  await db.run(sql`ALTER TABLE \`email_settings\` DROP COLUMN \`notification_cc\`;`)
}
