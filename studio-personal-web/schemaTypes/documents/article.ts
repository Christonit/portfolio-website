import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'externalUrl',
      type: 'url',
      description: 'Canonical article URL (dev.to today).',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'cardDescription',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'imageUrl',
      type: 'string',
    }),
    defineField({
      name: 'imageAlt',
      type: 'string',
    }),
    defineField({
      name: 'imageWidth',
      type: 'number',
    }),
    defineField({
      name: 'imageHeight',
      type: 'number',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      initialValue: 'article',
    }),
    defineField({
      name: 'tasks',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'tech',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'techItem'}]})],
    }),
    defineField({
      name: 'dossier',
      type: 'array',
      of: [defineArrayMember({type: 'text'})],
    }),
    defineField({
      name: 'metric',
      type: 'projectMetric',
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Board order',
      name: 'boardOrder',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'externalUrl'},
  },
})
