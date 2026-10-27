import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`posts_bottom_gallery\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer NOT NULL,
	\`caption\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`posts_bottom_gallery_order_idx\` ON \`posts_bottom_gallery\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`posts_bottom_gallery_parent_id_idx\` ON \`posts_bottom_gallery\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`posts_bottom_gallery_image_idx\` ON \`posts_bottom_gallery\` (\`image_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`projects_bottom_gallery\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer NOT NULL,
	\`caption\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_bottom_gallery_order_idx\` ON \`projects_bottom_gallery\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_bottom_gallery_parent_id_idx\` ON \`projects_bottom_gallery\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`projects_bottom_gallery_image_idx\` ON \`projects_bottom_gallery\` (\`image_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`projects_bottom_gallery\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`posts_bottom_gallery\`;`)
}
