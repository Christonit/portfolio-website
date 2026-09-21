import {DoubleQuoteIcon} from '@sanity/icons/DoubleQuote'
import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: DoubleQuoteIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'quote',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required().max(600),
    }),
    defineField({
      name: 'role',
      title: 'Role / company',
      type: 'string',
      description: 'Optional context shown below the name.',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'photo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          validation: (rule) => rule.required().warning('Alt text is important for accessibility.'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Homepage order',
      name: 'homepageOrder',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo'},
  },
})
