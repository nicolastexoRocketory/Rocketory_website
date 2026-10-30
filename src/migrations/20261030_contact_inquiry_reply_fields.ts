import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_recipient_email\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_recipient_name\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_subject\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_website\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_ai_assessment\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_labeling_assessment\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_report_body\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_next_step\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_sent_at\` text;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` ADD COLUMN \`reply_sent_to\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_sent_to\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_sent_at\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_next_step\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_report_body\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_labeling_assessment\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_ai_assessment\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_website\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_subject\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_recipient_name\`;`)
  await db.run(sql`ALTER TABLE \`contact_inquiries\` DROP COLUMN \`reply_recipient_email\`;`)
}
