'use client'

import { useState, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileDown,
  Globe2,
  History,
  Home,
  LockKeyhole,
  ScanLine,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { AssistantScreen, type AssistantMessage } from '@/components/assistant-screen'
import { LinkScanScreen, type ScanRecord } from '@/components/link-scan-screen'

type Screen = 'home' | 'scan' | 'assistant' | 'history' | 'settings'

const navigation: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'scan', label: 'Скан', icon: ScanLine },
  { id: 'assistant', label: 'ИИ', icon: Sparkles },
  { id: 'history', label: 'История', icon: History },
  { id: 'settings', label: 'Настройки', icon: Settings2 },
]

const quickActions: { title: string; subtitle: string; icon: LucideIcon; color: string; screen: Screen }[] = [
  { title: 'Проверить ссылку', subtitle: 'Оценка признаков риска', icon: ScanLine, color: 'cyan', screen: 'scan' },
  { title: 'Спросить ИИ', subtitle: 'Совет по кибербезопасности', icon: Sparkles, color: 'violet', screen: 'assistant' },
  { title: 'Журнал сессии', subtitle: 'Реальные результаты', icon: History, color: 'blue', screen: 'history' },
  { title: 'Настройки', subtitle: 'Экспорт и приватность', icon: Settings2, color: 'green', screen: 'settings' },
]

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function Header({ onAssistant, onHome }: { onAssistant: () => void; onHome: () => void }) {
  return (
    <header className="app-header">
      <button className="brand" type="button" onClick={onHome} aria-label="Cybera — на главную">
        <span className="brand-mark"><ShieldCheck aria-hidden="true" /></span>
        <span>cybera<span className="brand-dot">.</span></span>
      </button>
      <div className="header-actions">
        <span className="live-status"><span /> ГОТОВ К ПРОВЕРКЕ</span>
        <button className="icon-button notification-button" type="button" onClick={onAssistant} aria-label="Открыть AI-помощника">
          <Sparkles aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function HomeScreen({ scans, onOpen }: { scans: ScanRecord[]; onOpen: (screen: Screen) => void }) {
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

function HistoryScreen({ rows, onOpenScan, onClear }: { rows: ScanRecord[]; onOpenScan: () => void; onClear: () => void }) {
  return (
    <div className="screen-content history-content">
      <div className="page-heading">
        <p className="eyebrow">РЕАЛЬНЫЕ РЕЗУЛЬТАТЫ</p>
        <h1>История проверок</h1>
        <p>Хранится только в памяти этой вкладки.</p>
      </div>
      <div className="history-summary">
        <span className="history-summary-icon"><Activity aria-hidden="true" /></span>
        <div><strong>{rows.length ? `Проверок: ${rows.length}` : 'История пока пуста'}</strong><span>Текущая сессия · не отправляется в базу</span></div>
      </div>
      <div className="history-controls">
        <p className="list-label">ПОСЛЕДНИЕ ПРОВЕРКИ</p>
        {rows.length > 0 && <button className="text-button" type="button" onClick={onClear}><Trash2 aria-hidden="true" /> Очистить</button>}
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon"><ScanLine aria-hidden="true" /></span>
          <strong>Здесь появятся ваши результаты</strong>
          <span>Проверьте адрес сайта — Cybera добавит его оценку в журнал этой сессии.</span>
          <button className="primary-button" type="button" onClick={onOpenScan}><ScanLine aria-hidden="true" /> Проверить ссылку</button>
        </div>
      ) : (
        <div className="history-list">
          {rows.map((row) => {
            const Icon = row.level === 'high' ? ShieldAlert : row.level === 'medium' ? AlertTriangle : ShieldCheck
            return (
              <article className="history-item" key={row.id}>
                <span className={`history-item-icon risk-${row.level}`}><Icon aria-hidden="true" /></span>
                <div className="history-item-copy"><strong>{row.hostname}</strong><span>{row.protocol.toUpperCase()} · риск {row.score}/100</span><time><Clock3 aria-hidden="true" /> {formatDateTime(row.checkedAt)}</time></div>
                <span className={`history-risk-badge risk-${row.level}`} aria-label={`Уровень риска: ${row.level}`}>{row.score}</span>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="setting-row">
      <div className="setting-copy"><strong>{label}</strong><span>{description}</span></div>
      <button className={`toggle ${checked ? 'is-on' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>
    </div>
  )
}

function SettingsScreen({
  showRecommendations,
  confirmClear,
  historyCount,
  onToggleRecommendations,
  onToggleClearConfirmation,
  onExport,
  onClear,
}: {
  showRecommendations: boolean
  confirmClear: boolean
  historyCount: number
  onToggleRecommendations: () => void
  onToggleClearConfirmation: () => void
  onExport: () => void
  onClear: () => void
}) {
  return (
    <div className="screen-content settings-content">
      <div className="page-heading">
        <p className="eyebrow">УПРАВЛЕНИЕ</p>
        <h1>Настройки</h1>
        <p>Все настройки действуют в этой вкладке.</p>
      </div>
      <p className="list-label">ПОВЕДЕНИЕ ПРИЛОЖЕНИЯ</p>
      <section className="settings-card" aria-label="Настройки приложения">
        <Toggle label="Подробные рекомендации" description="Показывать детали найденных признаков" checked={showRecommendations} onChange={onToggleRecommendations} />
        <div className="settings-divider" />
        <Toggle label="Подтверждать очистку" description="Спрашивать перед удалением истории" checked={confirmClear} onChange={onToggleClearConfirmation} />
      </section>
      <p className="list-label">ЖУРНАЛ СЕССИИ</p>
      <section className="settings-card settings-links" aria-label="Действия с журналом">
        <button type="button" onClick={onExport} disabled={historyCount === 0}><span className="settings-link-icon"><FileDown aria-hidden="true" /></span><span>Скачать журнал JSON</span><ChevronRight aria-hidden="true" /></button>
        <div className="settings-divider" />
        <button type="button" onClick={onClear} disabled={historyCount === 0}><span className="settings-link-icon"><Trash2 aria-hidden="true" /></span><span>Очистить историю</span><ChevronRight aria-hidden="true" /></button>
      </section>
      <p className="list-label">КАК РАБОТАЕТ CYBERA</p>
      <div className="privacy-note settings-note"><LockKeyhole aria-hidden="true" /><p>Проверка оценивает только признаки URL и не открывает целевой сайт. История и переключатели не сохраняются после перезагрузки. AI-помощник отправляет вопрос в Vercel AI Gateway; не передавайте ему пароли и коды.</p></div>
      <p className="settings-version">CYBERA • ЗАЩИТНЫЕ ИНСТРУМЕНТЫ</p>
    </div>
  )
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function CyberGuardApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [notice, setNotice] = useState('')
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [confirmClear, setConfirmClear] = useState(true)
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([])
  const [assistantBusy, setAssistantBusy] = useState(false)
  const [assistantError, setAssistantError] = useState('')
  const [assistantErrorAction, setAssistantErrorAction] = useState('')
  const [assistantContext, setAssistantContext] = useState<ScanRecord | null>(null)

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  function addScan(scan: ScanRecord) {
    setScans((current) => [scan, ...current].slice(0, 50))
  }

  function askAboutScan(scan: ScanRecord) {
    setAssistantContext(scan)
    setScreen('assistant')
  }

  async function sendAssistantMessage(question: string, isRetry = false) {
    if (assistantBusy) return false
    setAssistantBusy(true)
    setAssistantError('')
    setAssistantErrorAction('')
    const conversation = isRetry ? assistantMessages.slice(0, -1) : assistantMessages
    const priorMessages = conversation.slice(-8).map(({ role, content }) => ({ role, content }))
    if (!isRetry) {
      setAssistantMessages((current) => [...current, { id: makeId(), role: 'user', content: question }])
    }

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: priorMessages,
          context: assistantContext ? {
            hostname: assistantContext.hostname,
            protocol: assistantContext.protocol,
            level: assistantContext.level,
            score: assistantContext.score,
            findings: assistantContext.findings.map((finding) => finding.title),
          } : null,
        }),
      })
      const payload = await response.json() as { answer?: string; error?: string; actionUrl?: string }
      if (!response.ok || !payload.answer) {
        setAssistantError(payload.error || 'Помощник временно недоступен.')
        setAssistantErrorAction(payload.actionUrl || '')
        return false
      }
      setAssistantMessages((current) => [...current, { id: makeId(), role: 'assistant', content: payload.answer! }])
      return true
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : 'Помощник временно недоступен. Попробуйте ещё раз.')
      setAssistantErrorAction('')
      return false
    } finally {
      setAssistantBusy(false)
    }
  }

  function retryAssistantMessage() {
    const lastQuestion = [...assistantMessages].reverse().find((message) => message.role === 'user')
    if (lastQuestion) void sendAssistantMessage(lastQuestion.content, true)
  }

  function clearHistory() {
    if (!scans.length) return
    if (confirmClear && !window.confirm('Очистить историю проверок текущей сессии?')) return
    setScans([])
    showNotice('История текущей сессии очищена.')
  }

  function exportHistory() {
    if (!scans.length) return
    const data = JSON.stringify(scans.map(({ id, hostname, protocol, score, level, findings, checkedAt }) => ({ id, hostname, protocol, score, level, findings, checkedAt })), null, 2)
    const fileUrl = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `cybera-history-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1_000)
    showNotice('Журнал скачан в формате JSON.')
  }

  const statusNotice: ReactNode = notice ? <div className="notice-toast" role="status"><CircleCheck aria-hidden="true" /> {notice}</div> : null

  return (
    <main className="app-stage">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <section className="device-shell" aria-label="Приложение Cybera">
        <div className="app-window">
          <Header onAssistant={() => setScreen('assistant')} onHome={() => setScreen('home')} />
          <div className="screen-scroll" key={screen}>
            {screen === 'home' && <HomeScreen scans={scans} onOpen={setScreen} />}
            {screen === 'scan' && <LinkScanScreen onResult={addScan} onAskAssistant={askAboutScan} showRecommendations={showRecommendations} />}
            {screen === 'assistant' && <AssistantScreen messages={assistantMessages} isBusy={assistantBusy} error={assistantError} errorAction={assistantErrorAction} hasScanContext={Boolean(assistantContext)} onSend={sendAssistantMessage} onRetry={retryAssistantMessage} onClear={() => { setAssistantMessages([]); setAssistantError(''); setAssistantErrorAction('') }} />}
            {screen === 'history' && <HistoryScreen rows={scans} onOpenScan={() => setScreen('scan')} onClear={clearHistory} />}
            {screen === 'settings' && <SettingsScreen showRecommendations={showRecommendations} confirmClear={confirmClear} historyCount={scans.length} onToggleRecommendations={() => setShowRecommendations((current) => !current)} onToggleClearConfirmation={() => setConfirmClear((current) => !current)} onExport={exportHistory} onClear={clearHistory} />}
          </div>
          <nav className="bottom-nav" aria-label="Основная навигация">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button className={`nav-item ${screen === id ? 'active' : ''}`} type="button" key={id} onClick={() => setScreen(id)} aria-current={screen === id ? 'page' : undefined}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="home-indicator" aria-hidden="true"><span /></div>
          {statusNotice}
        </div>
      </section>
    </main>
  )
}
