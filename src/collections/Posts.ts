import type { CollectionConfig } from 'payload'

import { buildContentCollectionFields } from './shared/contentFields'
import { revalidatePostAfterChange, revalidatePostAfterDelete } from './Posts/hooks/revalidatePost'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Blog-Kategorie',
    plural: 'Blog-Kategorien',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Blog',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Beitrag',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
    group: 'Blog',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePostAfterChange],
    afterDelete: [revalidatePostAfterDelete],
  },
  fields: buildContentCollectionFields({
    categoryRelationTo: 'categories',
    categoryDescription: 'Blog-Kategorie für Filter auf der Blog-Seite.',
    excerptDescription: 'Wird in der Blog-Übersicht und unter der Überschrift angezeigt.',
  }),
}
