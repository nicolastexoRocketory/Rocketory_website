import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { ContactInquiries } from './collections/ContactInquiries'
import { Categories, Posts } from './collections/Posts'
import { ProjectCategories, Projects } from './collections/Projects'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { EmailSettings } from './globals/EmailSettings'
import { Homepage } from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'light',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' – Rocketory Landing CMS',
    },
    components: {
      graphics: {
        Logo: '@/components/admin/RocketoryLogo',
        Icon: '@/components/admin/RocketoryIcon',
      },
      beforeNavLinks: ['@/components/admin/MatomoAnalyticsNavLink#MatomoAnalyticsNavLink'],
      views: {
        statistik: {
          Component: '@/components/admin/MatomoAnalyticsView#MatomoAnalyticsView',
          path: '/statistik',
          exact: true,
        },
      },
    },
  },
  collections: [Users, Media, Categories, Posts, ProjectCategories, Projects, ContactInquiries],
  globals: [Homepage, EmailSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
  sharp,
})
