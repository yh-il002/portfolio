export type ProfileLink = {
  label: string
  url: string
}

export type Profile = {
  title: string
  age: number
  gender: string
  experienceYears: number
  summary: string
  pitch: string
  links: ProfileLink[]
}

/** 1: 独学 / 2: 経験あり / 3: 得意。範囲外の値は表示時にクランプする */
export type Skill = {
  name: string
  level: 1 | 2 | 3
}

export type SkillCategory = {
  category: string
  items: Skill[]
}

/** "YYYY-MM" 形式。end が null なら現在進行中 */
export type Period = {
  start: string
  end: string | null
}

export type Experience = {
  id: string
  company: string
  project: string
  role: string
  period: Period
  teamSize: number | null
  employment: string
  duties: string
  tags: string[]
  /** 技術名ではない取り組み・概念・職能（フィルタ対象外） */
  practices: string[]
}

export type Resume = {
  profile: Profile
  skills: SkillCategory[]
  experiences: Experience[]
}
