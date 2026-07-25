import resumeJson from './data/resume.json'
import type { Resume } from './types/resume'

const resume: Resume = resumeJson

export default function App() {
  return <main className="p-8 text-ink">{resume.profile.name}</main>
}
