import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`posts\` ADD COLUMN \`content_intro\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD COLUMN \`content_intro\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`content_intro\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`content_intro\`;`)
}
