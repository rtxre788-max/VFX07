'use client'

import { useState, type ReactNode } from 'react'
import {
  CircleCheck,
  History,
  Home,
  ScanLine,
  Settings2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AssistantScreen, type AssistantMessage } from '@/components/assistant-screen'
import { HistoryScreen } from '@/components/history-screen'
import { HomeScreen } from '@/components/home-screen'
import { LinkScanScreen, type ScanRecord } from '@/components/link-scan-screen'
import { SettingsScreen } from '@/components/settings-screen'

type Screen = 'home' | 'scan' | 'assistant' | 'history' | 'settings'

const navigation: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'scan', label: 'Скан', icon: ScanLine },
  { id: 'assistant', label: 'ИИ', icon: Sparkles },
  { id: 'history', label: 'История', icon: History },
  { id: 'settings', label: 'Настройки', icon: Settings2 },
]

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
          <AppHeader onAssistant={() => setScreen('assistant')} onHome={() => setScreen('home')} />
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
