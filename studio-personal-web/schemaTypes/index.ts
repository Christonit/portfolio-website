import {aboutPage} from './documents/about-page'
import {article} from './documents/article'
import {experienceOrg} from './documents/experience-org'
import {project} from './documents/project'
import {siteSettings} from './documents/site-settings'
import {techItem} from './documents/tech-item'
import {awardEntry} from './objects/award-entry'
import {educationEntry} from './objects/education-entry'
import {experienceRole} from './objects/experience-role'
import {projectLink} from './objects/project-link'
import {projectMetric} from './objects/project-metric'

export const schemaTypes = [
  siteSettings,
  aboutPage,
  project,
  article,
  techItem,
  experienceOrg,
  projectMetric,
  projectLink,
  educationEntry,
  awardEntry,
  experienceRole,
]
