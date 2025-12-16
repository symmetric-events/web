// import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { env } from './env'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Events } from './collections/Events'
import { Trainers } from './collections/Trainers'
import { Testimonials } from './collections/Testimonials'
import { Categories } from './collections/Categories'
import { Orders } from './collections/Orders'
import { DiscountCodes } from './collections/DiscountCodes'
import { Blog } from './collections/Blog'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // Required for any cloud storage plugin using clientUploads (S3 / Vercel Blob, etc.)
      // This mounts the provider *inside* Payload's RootProvider (correct place in the tree).
      providers: ['@payloadcms/ui/providers/UploadHandlers#UploadHandlersProvider'],
    },
  },
  collections: [Users, Media, Events, Trainers, Testimonials, Categories, Orders, DiscountCodes, Blog],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // vercelBlobStorage({
    //   enabled: true,
    //   collections: {
    //     media: true,
    //   },
    //   token: env.BLOB_READ_WRITE_TOKEN || '',
    //   clientUploads: true, // Direct client uploads to bypass Vercel's 4.5MB limit
    // }),
  ],
})
