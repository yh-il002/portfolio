import { createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CommandPalette from './CommandPalette'
import ExperienceCard from './ExperienceCard'
import Header from './Header'
import Hero from './Hero'
import PitchBand from './PitchBand'
import SkillFilter from './SkillFilter'
import type { Experience } from '../types/resume'

const options = [
  { tag: 'React', count: 5, disabled: false },
  { tag: 'TypeScript', count: 3, disabled: false },
]

const experience: Experience = {
  id: 'example',
  company: 'A社',
  project: 'サイト開発',
  role: 'フロントエンドエンジニア',
  period: { start: '2025-01', end: null },
  teamSize: 5,
  employment: '正社員',
  duties: '実装',
  tags: ['React', 'ClaudeCode', 'GitHub Copilot'],
  practices: ['AIを活用した実装'],
}

describe('CommandPalette', () => {
  it('入力にフォーカスを保つ listbox として候補のアクティブ状態を公開する', () => {
    const markup = renderToStaticMarkup(
      <CommandPalette
        open
        options={options}
        selected={['TypeScript']}
        triggerRef={createRef<HTMLButtonElement>()}
        onOpenChange={() => undefined}
        onSelect={() => undefined}
      />,
    )

    expect(markup).toContain('<li role="presentation">')
    expect(markup).toMatch(
      /id="command-option-0"[^>]*role="option"[^>]*aria-selected="true"[^>]*tabindex="-1"/,
    )
    expect(markup).toContain(
      'aria-label="TypeScript（選択中、該当3件）"',
    )
  })
})

describe('Header', () => {
  it('ページ最上部ではスクロール済み状態を持たない', () => {
    const originalDocument = globalThis.document
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: { contains: () => false },
        },
      },
    })

    try {
      const markup = renderToStaticMarkup(
        <Header
          commandButtonRef={createRef<HTMLButtonElement>()}
          onOpenPalette={() => undefined}
        />,
      )
      expect(markup).toContain('<header class="site-header" data-scrolled="false">')
    } finally {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
      })
    }
  })
})

describe('ExperienceCard', () => {
  it('技術タグとは別の一覧で practices を表示する', () => {
    const markup = renderToStaticMarkup(
      <ExperienceCard experience={experience} selected={[]} />,
    )
    expect(markup).toContain('<ul class="experience-practices"')
    expect(markup).toContain('<li>AIを活用した実装</li>')
  })

  it('左カラムを期間だけにし、人数と雇用形態を右カラムへ表示する', () => {
    const markup = renderToStaticMarkup(
      <ExperienceCard experience={experience} selected={[]} />,
    )
    expect(markup).toContain(
      '<div class="experience-period"><p>2025年1月 〜 現在</p></div>',
    )
    expect(markup).toContain(
      '<p class="experience-meta"><span>5名</span><span>正社員</span></p>',
    )
  })
})

describe('PitchBand', () => {
  it('最新経歴の practices からAI関連の取り組みを表示する', () => {
    const markup = renderToStaticMarkup(
      <PitchBand pitch="自己PR" latestExperience={experience} />,
    )
    expect(markup).toContain('<li>AIを活用した実装</li>')
    expect(markup).toContain('<li>GitHub Copilot</li>')
  })
})

describe('Hero', () => {
  const profile = {
    title: 'フロントエンドエンジニア',
    age: 37,
    gender: '男性',
    experienceYears: 15,
    summary: '概要',
    pitch: '自己PR',
    links: [],
  }

  it('アニメーション対応環境ではカウントアップ前を0年にする', () => {
    const originalWindow = globalThis.window
    const originalAnimationFrame = globalThis.requestAnimationFrame
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { matchMedia: () => ({ matches: false }) },
    })
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: () => 1,
    })

    try {
      const markup = renderToStaticMarkup(
        <Hero profile={profile} projectCount={30} />,
      )
      expect(markup).toContain(
        '<p class="hero-number" aria-hidden="true">0<span>年</span></p>',
      )
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      })
      Object.defineProperty(globalThis, 'requestAnimationFrame', {
        configurable: true,
        value: originalAnimationFrame,
      })
    }
  })

  it('SSR環境では経験年数を即時表示する', () => {
    const markup = renderToStaticMarkup(
      <Hero profile={profile} projectCount={30} />,
    )
    expect(markup).toContain(
      '<p class="hero-number" aria-hidden="true">15<span>年</span></p>',
    )
  })
})

describe('SkillFilter', () => {
  it('見出しでラベル付けされた section としてフィルタを公開する', () => {
    const markup = renderToStaticMarkup(
      <SkillFilter
        options={options}
        selected={[]}
        onToggle={() => undefined}
        onClear={() => undefined}
      />,
    )
    expect(markup).toContain(
      '<section class="filter-panel" aria-labelledby="filter-heading">',
    )
  })
})
