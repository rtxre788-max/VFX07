import {
  Activity,
  ChevronRight,
  CircleCheck,
  Globe2,
  History,
  LockKeyhole,
  ScanLine,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { ScanRecord } from '@/components/link-scan-screen'
import { formatDateTime } from '@/lib/format-date-time'

type HomeScreenTarget = 'scan' | 'assistant' | 'history' | 'settings'

const quickActions: { title: string; subtitle: string; icon: LucideIcon; color: string; screen: HomeScreenTarget }[] = [
  { title: 'Проверить ссылку', subtitle: 'Оценка признаков риска', icon: ScanLine, color: 'cyan', screen: 'scan' },
  { title: 'Спросить ИИ', subtitle: 'Совет по кибербезопасности', icon: Sparkles, color: 'violet', screen: 'assistant' },
  { title: 'Журнал сессии', subtitle: 'Реальные результаты', icon: History, color: 'blue', screen: 'history' },
  { title: 'Настройки', subtitle: 'Экспорт и приватность', icon: Settings2, color: 'green', screen: 'settings' },
]

export function HomeScreen({ scans, onOpen }: { scans: ScanRecord[]; onOpen: (screen: HomeScreenTarget) => void }) {
  const latest = scans[0]
  const riskyCount = scans.filter((scan) => scan.level !== 'low').length

  return (
    <div className="screen-content home-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">CYBERA • ЦЕНТР БЕЗОПАСНОСТИ</p>
          <h1>Сначала проверьте<span className="accent-dot">.</span></h1>
          <p className="welcome-subtitle">Ссылки, которым не обязательно доверять.</p>
        </div>
        <span className="avatar" aria-hidden="true"><ShieldCheck /></span>
      </div>

      <section className="protection-card" aria-labelledby="protection-title">
        <div className="protection-glow" />
        <span className="live-status"><span /> АНАЛИЗАТОР ГОТОВ</span>
        <div className="real-hero-content">
          <div className="real-hero-copy">
            <p className="eyebrow">ПРОВЕРКА ССЫЛОК</p>
            <h2 id="protection-title">Узнайте о риске до перехода</h2>
            <p>Анализируем признаки URL, не открывая сайт.</p>
          </div>
          <span className="real-hero-icon"><Shield aria-hidden="true" /></span>
        </div>
        <button className="primary-button" type="button" onClick={() => onOpen('scan')}><ScanLine aria-hidden="true" /> Проверить ссылку</button>
        <p className="hero-footnote"><LockKeyhole aria-hidden="true" /> Эвристическая оценка, не гарантия безопасности</p>
      </section>

      <section className="stats-grid" aria-label="Результаты текущей сессии">
        <article className="stat-card">
          <span className="stat-icon mint"><Globe2 aria-hidden="true" /></span>
          <strong>{scans.length}</strong>
          <span>ссылок проверено</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon purple"><ShieldAlert aria-hidden="true" /></span>
          <strong>{riskyCount}</strong>
          <span>с признаками риска</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon blue"><LockKeyhole aria-hidden="true" /></span>
          <strong>URL</strong>
          <span>сайт не открывается</span>
        </article>
      </section>

      <section className="actions-section" aria-labelledby="actions-title">
        <div className="section-heading">
          <div><p className="eyebrow">ИНСТРУМЕНТЫ</p><h2 id="actions-title">Что сделать</h2></div>
        </div>
        <div className="quick-grid">
          {quickActions.map(({ title, subtitle, icon: Icon, color, screen }) => (
            <button className="quick-card" type="button" key={title} onClick={() => onOpen(screen)}>
              <span className={`quick-icon ${color}`}><Icon aria-hidden="true" /></span>
              <span className="quick-title">{title}</span>
              <span className="quick-subtitle">{subtitle}</span>
              <ChevronRight className="quick-chevron" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="activity-section" aria-labelledby="activity-title">
        <div className="section-heading compact-heading">
          <div><p className="eyebrow">ТЕКУЩАЯ СЕССИЯ</p><h2 id="activity-title">Последняя проверка</h2></div>
          <button className="text-button" type="button" onClick={() => onOpen('history')}>История <ChevronRight aria-hidden="true" /></button>
        </div>
        <div className="activity-card">
          <span className={`activity-icon ${latest ? `risk-${latest.level}` : ''}`}>{latest ? <Activity aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}</span>
          <div className="activity-copy">
            <strong>{latest ? latest.hostname : 'Пока нет проверок'}</strong>
            <span>{latest ? `Риск: ${latest.score}/100 · ${formatDateTime(latest.checkedAt)}` : 'Начните с проверки незнакомой ссылки'}</span>
          </div>
          {latest && <span className={`activity-risk risk-text-${latest.level}`}>{latest.score}</span>}
        </div>
      </section>
      <p className="privacy-footnote"><ShieldCheck aria-hidden="true" /> Cybera не проверяет устройство, сеть или репутационные базы.</p>
    </div>
  )
}
