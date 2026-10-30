import {defineArrayMember, defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Web', value: 'Web'},
          {title: 'Web3', value: 'Web3'},
          {title: 'Fintech', value: 'Fintech'},
          {title: 'Healthcare', value: 'Healthcare'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'string',
    }),
    defineField({
      name: 'link',
      type: 'url',
      title: 'Live URL',
    }),
    defineField({
      name: 'cardDescription',
      type: 'text',
      rows: 3,
      description: 'Short summary on homepage and board cards.',
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
      description: 'Existing public path while stills live in the repo, e.g. /images/canopy-image.webp',
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
      name: 'imageTone',
      type: 'string',
      options: {
        list: [
          {title: 'Dark', value: 'dark'},
          {title: 'Light', value: 'light'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'videoUrl',
      type: 'string',
      description: 'Hosted preview URL or public path. Do not upload video as a Sanity file.',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      description: 'Material Symbol name used when there is no preview image.',
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
      description: 'Case-study paragraphs on the dossier sheet.',
    }),
    defineField({
      name: 'links',
      type: 'array',
      of: [defineArrayMember({type: 'projectLink'})],
      description: 'Outbound references listed on the dossier, e.g. a CoinGecko or press page.',
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
    select: {title: 'name', subtitle: 'role'},
  },
})
