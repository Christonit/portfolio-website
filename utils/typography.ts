export type TypographyFamilyRole = 'display' | 'sans' | 'mono'

export interface TypographyStyle {
  semanticName: string
  familyRole: TypographyFamilyRole
  size: `${number}px`
  lineHeight: `${number}px`
  weight: 400 | 600
  sample: string
  usage: string
}

export const typography = {
  display: {
    semanticName: 'Display',
    familyRole: 'display',
    size: '44px',
    lineHeight: '40px',
    weight: 600,
    sample: 'Selected work',
    usage: 'Primary page and project displays.',
  },
  'heading-lg': {
    semanticName: 'Heading/Large',
    familyRole: 'display',
    size: '24px',
    lineHeight: '30px',
    weight: 600,
    sample: 'Capabilities',
    usage: 'Large section headings.',
  },
  'heading-section': {
    semanticName: 'Heading/Section',
    familyRole: 'display',
    size: '18px',
    lineHeight: '24px',
    weight: 600,
    sample: 'Project overview',
    usage: 'Section headings and grouped content.',
  },
  'title-ui': {
    semanticName: 'Title/UI',
    familyRole: 'sans',
    size: '16px',
    lineHeight: '20px',
    weight: 600,
    sample: 'Availability',
    usage: 'Compact interface titles.',
  },
  'body-compact': {
    semanticName: 'Body/Compact',
    familyRole: 'sans',
    size: '14px',
    lineHeight: '20px',
    weight: 400,
    sample: 'A concise description for the interface.',
    usage: 'Compact UI body copy.',
  },
  'body-prose': {
    semanticName: 'Body/Prose',
    familyRole: 'sans',
    size: '16px',
    lineHeight: '24px',
    weight: 400,
    sample: 'Long-form project and biography prose stays comfortably readable.',
    usage: 'Long-form project and biography prose.',
  },
  'label-ui': {
    semanticName: 'Label/UI',
    familyRole: 'sans',
    size: '12px',
    lineHeight: '16px',
    weight: 600,
    sample: 'ABOUT',
    usage: 'Navigation and interface labels — the sans counterpart to Label/Data.',
  },
  'label-data': {
    semanticName: 'Label/Data',
    familyRole: 'mono',
    size: '12px',
    lineHeight: '16px',
    weight: 400,
    sample: 'STATUS / 2026',
    usage: 'Labels, metadata, and data values.',
  },
} as const satisfies Record<string, TypographyStyle>

export type TypographyStyleKey = keyof typeof typography
