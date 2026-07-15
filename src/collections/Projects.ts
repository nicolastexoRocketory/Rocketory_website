import type { CollectionConfig } from 'payload'

import { buildContentCollectionFields } from './shared/contentFields'
import {
  revalidateProjectAfterChange,
  revalidateProjectAfterDelete,
} from './Projects/hooks/revalidateProject'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: 'Projekt-Kategorie',
    plural: 'Projekt-Kategorien',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Referenzen',
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

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Referenz',
    plural: 'Referenzen',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
    group: 'Referenzen',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateProjectAfterChange],
    afterDelete: [revalidateProjectAfterDelete],
  },
  fields: buildContentCollectionFields({
    categoryRelationTo: 'project-categories',
    categoryDescription: 'Kategorie für Filter auf der Projekte-Seite.',
    excerptDescription: 'Wird in der Projekt-Übersicht und unter der Überschrift angezeigt.',
  }),
}
