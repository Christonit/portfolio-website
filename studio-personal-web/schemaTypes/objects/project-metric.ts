import {defineField, defineType} from 'sanity'
import {ChartUpwardIcon} from '@sanity/icons/ChartUpward'

export const projectMetric = defineType({
  name: 'projectMetric',
  title: 'Metric',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'progress',
      type: 'number',
      description: '0–100 bar fill on the dossier.',
      validation: (rule) => rule.min(0).max(100).integer(),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'value'},
  },
})
