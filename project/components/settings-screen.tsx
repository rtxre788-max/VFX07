import { ChevronRight, FileDown, LockKeyhole, Trash2 } from 'lucide-react'

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="setting-row">
      <div className="setting-copy"><strong>{label}</strong><span>{description}</span></div>
      <button className={`toggle ${checked ? 'is-on' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>
    </div>
  )
}

export function SettingsScreen({
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
