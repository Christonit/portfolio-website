import {defineQuery} from 'groq'

export const PORTFOLIO_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    _updatedAt,
    displayName,
    role,
    location,
    mission,
    employerLabel,
    employerUrl,
    featuredProjects[]->{
      _id,
      _type,
      _updatedAt,
      name,
      title,
      "slug": slug.current,
      category,
      role,
      link,
      externalUrl,
      imageUrl,
      imageAlt,
      imageWidth,
      imageHeight,
      imageTone,
      videoUrl,
      icon,
      cardDescription,
      tags,
      tasks,
      dossier,
      "tech": tech[]->name,
      links[]{label, url},
      metric,
      sortOrder
    }
  },
  "about": *[_id == "aboutPage"][0]{
    _updatedAt,
    subtitle,
    body,
    education[]{
      _key,
      degree,
      school,
      period,
      isCurrent,
      status,
      note
    },
    awards[]{
      _key,
      title,
      org,
      location,
      period
    }
  },
  "techStack": *[_type == "techItem" && showOnHome == true] | order(sortOrder asc){
    _updatedAt,
    name,
    iconUrl
  },
  "works": *[_type in ["project", "article"]] | order(sortOrder asc){
    _id,
    _type,
    _updatedAt,
    name,
    title,
    "slug": slug.current,
    category,
    role,
    link,
    externalUrl,
    imageUrl,
    imageAlt,
    imageWidth,
    imageHeight,
    imageTone,
    videoUrl,
    icon,
    cardDescription,
    tags,
    tasks,
    dossier,
    "tech": tech[]->name,
    links[]{label, url},
    metric,
    sortOrder
  },
  "experience": *[_type == "experienceOrg"] | order(sortOrder asc){
    _updatedAt,
    company,
    period,
    isCurrent,
    location,
    logoUrl,
    roles[]{
      _key,
      role,
      period,
      employmentType,
      isCurrent,
      tags,
      note,
      "projects": relatedWork[]->slug.current
    }
  }
}`)
