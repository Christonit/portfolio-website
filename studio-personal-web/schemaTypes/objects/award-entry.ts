import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

export const awardEntry = defineType({
  name: 'awardEntry',
  title: 'Award',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'org',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
    }),
    defineField({
      name: 'period',
      type: 'string',
      description: 'Display date, e.g. NOV 2017',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'org'},
  },
})
