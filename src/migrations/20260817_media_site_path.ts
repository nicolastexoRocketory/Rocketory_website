import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD COLUMN \`site_path\` text;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`media_site_path_idx\` ON \`media\` (\`site_path\`) WHERE \`site_path\` IS NOT NULL;`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`media_site_path_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`site_path\`;`)
}
