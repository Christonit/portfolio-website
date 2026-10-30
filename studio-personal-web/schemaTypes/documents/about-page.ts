import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'subtitle',
      type: 'text',
      rows: 3,
      description: 'Lede under ABOUT ME.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'education',
      type: 'array',
      of: [defineArrayMember({type: 'educationEntry'})],
    }),
    defineField({
      name: 'awards',
      type: 'array',
      of: [defineArrayMember({type: 'awardEntry'})],
    }),
  ],
  preview: {
    prepare: () => ({title: 'About'}),
  },
})
