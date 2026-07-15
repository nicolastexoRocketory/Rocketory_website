import * as migration_20260710_055752_seo_snippet_fields from './20260710_055752_seo_snippet_fields';
import * as migration_20260710_062806_contact_inquiries_email_settings from './20260710_062806_contact_inquiries_email_settings';
import * as migration_20260710_083820_email_settings_extras from './20260710_083820_email_settings_extras';
import * as migration_20260715_media_image_sizes from './20260715_media_image_sizes';

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
];
