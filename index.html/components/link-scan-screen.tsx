'use client'

import { useState, type FormEvent } from 'react'
import { AlertTriangle, Globe2, LoaderCircle, LockKeyhole, ScanLine, Shield, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import type { LinkScanResult, RiskLevel } from '@/lib/link-scan'

export type ScanRecord = LinkScanResult & { id: string }

type ScanState = 'idle' | 'invalid' | 'error' | 'loading'

const riskLabels: Record<RiskLevel, string> = {
  low: 'Низкий риск по формату',
  medium: 'Есть настораживающие признаки',
  high: 'Высокий риск по формату',
}

export function LinkScanScreen({
  onResult,
  onAskAssistant,
  showRecommendations,
}: {
  onResult: (result: ScanRecord) => void
  onAskAssistant: (result: ScanRecord) => void
  showRecommendations: boolean
}) {
  const [address, setAddress] = useState('')
  const [state, setState] = useState<ScanState>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScanRecord | null>(null)

  async function handleScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = address.trim()
    if (!value) {
      setState('invalid')
      setError('Введите адрес сайта.')
      return
    }

    setState('loading')
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      })
      const payload = await response.json() as LinkScanResult | { error?: string }
      if (!response.ok || !('hostname' in payload)) {
        throw new Error('error' in payload ? payload.error : undefined)
      }

      const scan = { ...payload, id: crypto.randomUUID() }
      setResult(scan)
      setState('idle')
      onResult(scan)
    } catch (scanError) {
      setState('error')
      setError(scanError instanceof Error && scanError.message ? scanError.message : 'Не удалось проверить адрес. Попробуйте ещё раз.')
    }
  }

  const ResultIcon = result?.level === 'high' ? ShieldAlert : result?.level === 'medium' ? AlertTriangle : ShieldCheck

  return (
    <div className="screen-content scan-content">
      <div className="page-heading">
        <p className="eyebrow">CYBERA SCAN</p>
        <h1>Проверка ссылки</h1>
        <p>Проверьте признаки риска до перехода на сайт.</p>
      </div>
      <div className="scan-visual" aria-hidden="true">
        <div className="scan-orbit orbit-one" />
        <div className="scan-orbit orbit-two" />
        <div className="scan-shield"><ShieldCheck /></div>
        <Sparkles className="scan-sparkle sparkle-one" />
        <Sparkles className="scan-sparkle sparkle-two" />
      </div>
      <form className="scan-form" onSubmit={handleScan}>
        <label htmlFor="url-address">Адрес сайта</label>
        <div className="url-input-wrap">
          <Globe2 aria-hidden="true" />
          <input
            id="url-address"
            name="url"
            type="text"
            autoComplete="url"
            inputMode="url"
            maxLength={2048}
            placeholder="Например, example.com"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value)
              setState('idle')
              setError('')
              setResult(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
            }}
            aria-invalid={state === 'invalid' || state === 'error'}
            aria-describedby={state === 'invalid' || state === 'error' ? 'scan-error' : 'scan-help'}
          />
          {address && (
            <button className="clear-input" type="button" onClick={() => { setAddress(''); setState('idle'); setError(''); setResult(null) }} aria-label="Очистить адрес">
              ×
            </button>
          )}
        </div>
        {state === 'invalid' || state === 'error'
          ? <p className="input-message error-message" id="scan-error" role="alert">{error}</p>
          : <p className="input-message" id="scan-help">Ссылка не открывается: анализируются только признаки самого URL.</p>}
        <button className="primary-button" type="submit" disabled={state === 'loading'}>
          {state === 'loading' ? <LoaderCircle className="spin-icon" aria-hidden="true" /> : <ScanLine aria-hidden="true" />}
          {state === 'loading' ? 'Проверяем…' : 'Проверить адрес'}
        </button>
      </form>

      {result && (
        <section className={`scan-result risk-${result.level}`} aria-labelledby="scan-result-title" aria-live="polite">
          <div className="scan-result-header">
            <span className="result-icon"><ResultIcon aria-hidden="true" /></span>
            <div className="scan-result-copy">
              <p className="eyebrow">ОЦЕНКА РИСКА</p>
              <h2 id="scan-result-title">{riskLabels[result.level]}</h2>
              <span className="scan-result-host">{result.protocol}://{result.hostname}</span>
            </div>
            <strong className="result-score" aria-label={`Оценка риска ${result.score} из 100`}>{result.score}<span>/100</span></strong>
          </div>
          {showRecommendations && (
            <ul className="finding-list">
              {result.findings.length > 0
                ? result.findings.map((finding) => <li key={finding.title}><strong>{finding.title}</strong><span>{finding.detail}</span></li>)
                : <li><strong>Явных признаков не найдено</strong><span>Это не подтверждает безопасность сайта и не проверяет его репутацию.</span></li>}
            </ul>
          )}
          <button className="assistant-link-button" type="button" onClick={() => onAskAssistant(result)}>
            <Sparkles aria-hidden="true" /> Объяснить результат с ИИ
          </button>
        </section>
      )}

      <div className="privacy-note"><LockKeyhole aria-hidden="true" /><p>Cybera анализирует структуру адреса и не посещает целевой сайт. Проверка по эвристикам не заменяет антивирус и не гарантирует безопасность.</p></div>
    </div>
  )
}
