import {TimelineIcon} from '@sanity/icons/Timeline'
import {CaseIcon} from '@sanity/icons/Case'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {BoltIcon} from '@sanity/icons/Bolt'
import {UserIcon} from '@sanity/icons/User'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
      S.listItem()
        .title('About')
        .icon(UserIcon)
        .child(S.document().schemaType('aboutPage').documentId('aboutPage').title('About')),
      S.divider(),
      S.listItem()
        .title('Projects')
        .icon(CaseIcon)
        .child(S.documentTypeList('project').title('Projects').defaultOrdering([{field: 'sortOrder', direction: 'asc'}])),
      S.listItem()
        .title('Articles')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('article').title('Articles').defaultOrdering([{field: 'sortOrder', direction: 'asc'}])),
      S.listItem()
        .title('Tech stack')
        .icon(BoltIcon)
        .child(S.documentTypeList('techItem').title('Tech').defaultOrdering([{field: 'sortOrder', direction: 'asc'}])),
      S.listItem()
        .title('Experience')
        .icon(TimelineIcon)
        .child(
          S.documentTypeList('experienceOrg')
            .title('Experience')
            .defaultOrdering([{field: 'sortOrder', direction: 'asc'}]),
        ),
    ])
