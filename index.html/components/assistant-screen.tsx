'use client'

import { useState, type FormEvent } from 'react'
import { AlertTriangle, Bot, LoaderCircle, Send, ShieldCheck, Sparkles, Trash2, UserRound } from 'lucide-react'

export type AssistantMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'Как распознать фишинговое письмо?',
  'Что делать после перехода по подозрительной ссылке?',
  'Как защитить важный аккаунт?',
]

export function AssistantScreen({
  messages,
  isBusy,
  error,
  errorAction,
  hasScanContext,
  onSend,
  onRetry,
  onClear,
}: {
  messages: AssistantMessage[]
  isBusy: boolean
  error: string
  errorAction: string
  hasScanContext: boolean
  onSend: (question: string) => Promise<boolean>
  onRetry: () => void
  onClear: () => void
}) {
  const [question, setQuestion] = useState('')

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = question.trim()
    if (!value || isBusy) return
    if (await onSend(value)) setQuestion('')
  }

  return (
    <div className="screen-content assistant-content">
      <div className="page-heading">
        <p className="eyebrow">CYBERA AI</p>
        <h1>Помощник по безопасности</h1>
        <p>Понятные защитные советы — без автоматических действий.</p>
      </div>

      <section className="assistant-intro" aria-label="О помощнике">
        <span className="assistant-intro-icon"><Sparkles aria-hidden="true" /></span>
        <div>
          <strong>Чем помочь?</strong>
          <p>{hasScanContext ? 'Последний результат проверки доступен как контекст. Полный адрес и параметры не передаются.' : 'Задайте вопрос о ссылках, аккаунтах или защите устройств.'}</p>
        </div>
      </section>

      <div className="assistant-transcript" role="log" aria-live="polite" aria-relevant="additions" aria-label="Диалог с помощником">
        {messages.length === 0 && (
          <div className="assistant-empty">
            <span className="assistant-bot-icon"><Bot aria-hidden="true" /></span>
            <strong>Начните с вопроса</strong>
            <span>Не отправляйте пароли, коды подтверждения или другие секреты.</span>
            <div className="suggestion-list">
              {suggestions.map((suggestion) => <button type="button" key={suggestion} disabled={isBusy} onClick={() => void onSend(suggestion)}>{suggestion}</button>)}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <article className={`assistant-message ${message.role}`} key={message.id}>
            <span className="message-avatar">{message.role === 'assistant' ? <Bot aria-hidden="true" /> : <UserRound aria-hidden="true" />}</span>
            <p>{message.content}</p>
          </article>
        ))}
        {isBusy && <div className="assistant-thinking" role="status"><LoaderCircle className="spin-icon" aria-hidden="true" /> Готовлю ответ…</div>}
        {error && (
          <div className="assistant-error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <p>{error}</p>
            <div className="assistant-error-actions">
              {errorAction && <a href={errorAction} target="_blank" rel="noopener noreferrer">Настроить биллинг</a>}
              <button type="button" onClick={onRetry} disabled={isBusy}>Повторить</button>
            </div>
          </div>
        )}
      </div>

      <form className="assistant-form" onSubmit={submitQuestion}>
        <label className="sr-only" htmlFor="assistant-question">Ваш вопрос</label>
        <textarea
          id="assistant-question"
          rows={2}
          maxLength={1000}
          placeholder="Напишите вопрос…"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              if (event.nativeEvent.isComposing || event.keyCode === 229) return
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          aria-describedby="assistant-privacy"
        />
        <button className="send-button" type="submit" disabled={!question.trim() || isBusy} aria-label="Отправить вопрос">
          {isBusy ? <LoaderCircle className="spin-icon" aria-hidden="true" /> : <Send aria-hidden="true" />}
        </button>
      </form>
      <div className="assistant-footer">
        <p id="assistant-privacy"><ShieldCheck aria-hidden="true" /> Ответы формирует AI Gateway. Не включайте в сообщение пароли и коды.</p>
        {messages.length > 0 && <button type="button" onClick={onClear} disabled={isBusy} aria-label="Очистить диалог"><Trash2 aria-hidden="true" /> Очистить</button>}
      </div>
    </div>
  )
}
