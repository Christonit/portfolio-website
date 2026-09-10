import {defineArrayMember, defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'

export const experienceRole = defineType({
  name: 'experienceRole',
  title: 'Role',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'period',
      type: 'string',
      description: 'Display span, e.g. NOV 2023 — PRESENT',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'employmentType',
      title: 'Type',
      type: 'string',
      description: 'Only when it is not the default — e.g. CONTRACTOR',
    }),
    defineField({
      name: 'isCurrent',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'note',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'relatedWork',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}, {type: 'article'}],
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'role', subtitle: 'period'},
  },
})
