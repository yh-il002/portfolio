export type ProfileLink = {
  label: string
  url: string
}

export type Profile = {
  name: string
  title: string
  summary: string
  location?: string
  links: ProfileLink[]
}

/** 1: 学習中 / 2: 実務あり / 3: 主戦力 / 4: 指導可。範囲外の値は表示時にクランプする */
export type Skill = {
  name: string
  level: number
  years?: number
}

export type SkillCategory = {
  category: string
  items: Skill[]
}

/** "YYYY-MM" 形式。end が null なら現職 */
export type Period = {
  start: string
  end: string | null
}

export type Experience = {
  id: string
  company: string
  role: string
  period: Period
  summary: string
  scale?: string
  highlights: string[]
  tags: string[]
}

export type Resume = {
  profile: Profile
  skills: SkillCategory[]
  experiences: Experience[]
}
