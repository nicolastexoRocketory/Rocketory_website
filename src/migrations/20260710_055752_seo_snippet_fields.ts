import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`posts\` ADD COLUMN \`seo_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD COLUMN \`seo_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD COLUMN \`seo_og_image_id\` integer REFERENCES \`media\`(\`id\`);`)
  await db.run(sql`ALTER TABLE \`posts\` ADD COLUMN \`seo_no_index\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`posts_seo_seo_og_image_idx\` ON \`posts\` (\`seo_og_image_id\`);`)

  await db.run(sql`ALTER TABLE \`projects\` ADD COLUMN \`seo_meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD COLUMN \`seo_meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD COLUMN \`seo_og_image_id\` integer REFERENCES \`media\`(\`id\`);`)
  await db.run(sql`ALTER TABLE \`projects\` ADD COLUMN \`seo_no_index\` integer DEFAULT false;`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`projects_seo_seo_og_image_idx\` ON \`projects\` (\`seo_og_image_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`posts_seo_seo_og_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`seo_no_index\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`seo_og_image_id\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`seo_meta_description\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`seo_meta_title\`;`)

  await db.run(sql`DROP INDEX IF EXISTS \`projects_seo_seo_og_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`seo_no_index\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`seo_og_image_id\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`seo_meta_description\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`seo_meta_title\`;`)
}
