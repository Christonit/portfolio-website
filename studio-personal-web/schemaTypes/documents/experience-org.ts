import {defineArrayMember, defineField, defineType} from 'sanity'
import {TimelineIcon} from '@sanity/icons/Timeline'

export const experienceOrg = defineType({
  name: 'experienceOrg',
  title: 'Experience',
  type: 'document',
  icon: TimelineIcon,
  fields: [
    defineField({
      name: 'company',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'period',
      type: 'string',
      description: 'Org display span, e.g. NOV 2020 — PRESENT',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isCurrent',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'location',
      type: 'string',
    }),
    defineField({
      name: 'logoUrl',
      type: 'string',
      description: 'Path under /public, e.g. /images/logos/stockstotrade.png',
    }),
    defineField({
      name: 'roles',
      type: 'array',
      of: [defineArrayMember({type: 'experienceRole'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Timeline order',
      name: 'timelineOrder',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'company', subtitle: 'period'},
  },
})
