import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'displayName',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mission',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'employerLabel',
      type: 'string',
    }),
    defineField({
      name: 'employerUrl',
      type: 'url',
    }),
    defineField({
      name: 'featuredProjects',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})],
      validation: (rule) => rule.max(8),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
