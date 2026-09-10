import {defineField, defineType} from 'sanity'
import {BoltIcon} from '@sanity/icons/Bolt'

export const techItem = defineType({
  name: 'techItem',
  title: 'Tech',
  type: 'document',
  icon: BoltIcon,
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
      name: 'iconUrl',
      type: 'string',
      description: 'Path under /public, e.g. /images/react-svgrepo-com.svg',
    }),
    defineField({
      name: 'showOnHome',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      hidden: ({document}) => !document?.showOnHome,
    }),
  ],
  orderings: [
    {
      title: 'Home order',
      name: 'homeOrder',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'slug.current'},
  },
})
