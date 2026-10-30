import {defineField, defineType} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'

export const educationEntry = defineType({
  name: 'educationEntry',
  title: 'Education',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'degree',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'school',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'period',
      type: 'string',
      description: 'Display span, e.g. AUG 2025 — PRESENT',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isCurrent',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      type: 'string',
      description: 'Optional badge next to the degree, e.g. CURRENT',
    }),
    defineField({
      name: 'note',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'degree', subtitle: 'school'},
  },
})
