import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_content_sections\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text NOT NULL,
	\`body\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`posts_content_sections_order_idx\` ON \`posts_content_sections\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`posts_content_sections_parent_id_idx\` ON \`posts_content_sections\` (\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`projects_content_sections\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text NOT NULL,
	\`body\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_content_sections_order_idx\` ON \`projects_content_sections\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_content_sections_parent_id_idx\` ON \`projects_content_sections\` (\`_parent_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`projects_content_sections\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`posts_content_sections\`;`)
}
