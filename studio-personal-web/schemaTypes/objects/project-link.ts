import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const projectLink = defineType({
  name: 'projectLink',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      description: 'Shown on the dossier, e.g. CoinGecko listing.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url'},
  },
})
