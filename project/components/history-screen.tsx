import { Activity, AlertTriangle, Clock3, ScanLine, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react'
import type { ScanRecord } from '@/components/link-scan-screen'
import { formatDateTime } from '@/lib/format-date-time'

export function HistoryScreen({ rows, onOpenScan, onClear }: { rows: ScanRecord[]; onOpenScan: () => void; onClear: () => void }) {
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
