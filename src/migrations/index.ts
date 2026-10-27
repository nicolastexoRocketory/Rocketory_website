import * as migration_20260710_055752_seo_snippet_fields from './20260710_055752_seo_snippet_fields';
import * as migration_20260710_062806_contact_inquiries_email_settings from './20260710_062806_contact_inquiries_email_settings';
import * as migration_20260710_083820_email_settings_extras from './20260710_083820_email_settings_extras';
import * as migration_20260715_media_image_sizes from './20260715_media_image_sizes';
import * as migration_20260817_media_is_ai_generated from './20260817_media_is_ai_generated';
import * as migration_20260817_media_site_path from './20260817_media_site_path';
import * as migration_20261027_posts_bottom_gallery from './20261027_posts_bottom_gallery';
import * as migration_20261027_content_sections from './20261027_content_sections';
import * as migration_20261027_content_intro from './20261027_content_intro';

export const migrations = [
  {
    up: migration_20260710_055752_seo_snippet_fields.up,
    down: migration_20260710_055752_seo_snippet_fields.down,
    name: '20260710_055752_seo_snippet_fields',
  },
  {
    up: migration_20260710_062806_contact_inquiries_email_settings.up,
    down: migration_20260710_062806_contact_inquiries_email_settings.down,
    name: '20260710_062806_contact_inquiries_email_settings'
  },
  {
    up: migration_20260710_083820_email_settings_extras.up,
    down: migration_20260710_083820_email_settings_extras.down,
    name: '20260710_083820_email_settings_extras',
  },
  {
    up: migration_20260715_media_image_sizes.up,
    down: migration_20260715_media_image_sizes.down,
    name: '20260715_media_image_sizes',
  },
  {
    up: migration_20260817_media_is_ai_generated.up,
    down: migration_20260817_media_is_ai_generated.down,
    name: '20260817_media_is_ai_generated',
  },
  {
    up: migration_20260817_media_site_path.up,
    down: migration_20260817_media_site_path.down,
    name: '20260817_media_site_path',
  },
  {
    up: migration_20261027_posts_bottom_gallery.up,
    down: migration_20261027_posts_bottom_gallery.down,
    name: '20261027_posts_bottom_gallery',
  },
  {
    up: migration_20261027_content_sections.up,
    down: migration_20261027_content_sections.down,
    name: '20261027_content_sections',
  },
  {
    up: migration_20261027_content_intro.up,
    down: migration_20261027_content_intro.down,
    name: '20261027_content_intro',
  },
];
