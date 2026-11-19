import { ShieldCheck, Sparkles } from 'lucide-react'

export function AppHeader({ onAssistant, onHome }: { onAssistant: () => void; onHome: () => void }) {
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
