import { isIP } from 'node:net'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ScanFinding = {
  title: string
  detail: string
}

export type LinkScanResult = {
  hostname: string
  protocol: 'http' | 'https'
  score: number
  level: RiskLevel
  findings: ScanFinding[]
  checkedAt: string
}

const shortenerHosts = new Set([
  'bit.ly',
  'cutt.ly',
  'goo.gl',
  'is.gd',
  'ow.ly',
  'rb.gy',
  't.co',
  'tiny.one',
  'tinyurl.com',
])

const redirectParameters = new Set(['continue', 'next', 'redirect', 'return', 'returnto', 'target', 'url'])

const protectedBrands = [
  { name: 'PayPal', labels: ['paypal'], domains: ['paypal.com', 'paypal.me'] },
  { name: 'Google', labels: ['google'], domains: ['google.com', 'google.co.uk', 'google.ru', 'google.de', 'google.fr', 'google.ca', 'google.co.in', 'googleapis.com', 'googleusercontent.com', 'g.co'] },
  { name: 'Microsoft', labels: ['microsoft'], domains: ['microsoft.com', 'microsoftonline.com', 'office.com', 'office365.com', 'outlook.com', 'live.com', 'azure.com'] },
  { name: 'Apple', labels: ['apple'], domains: ['apple.com', 'icloud.com'] },
  { name: 'Amazon', labels: ['amazon'], domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazonaws.com', 'amazonpay.com'] },
  { name: 'Meta', labels: ['facebook', 'instagram', 'meta'], domains: ['facebook.com', 'fb.com', 'instagram.com', 'meta.com', 'messenger.com'] },
  { name: 'WhatsApp', labels: ['whatsapp'], domains: ['whatsapp.com'] },
  { name: 'Telegram', labels: ['telegram'], domains: ['telegram.org', 'telegram.me'] },
  { name: 'Netflix', labels: ['netflix'], domains: ['netflix.com'] },
  { name: 'Steam', labels: ['steam'], domains: ['steampowered.com', 'steamcommunity.com', 'steamgames.com'] },
  { name: 'Coinbase', labels: ['coinbase'], domains: ['coinbase.com'] },
  { name: 'Binance', labels: ['binance'], domains: ['binance.com'] },
  { name: 'MetaMask', labels: ['metamask'], domains: ['metamask.io'] },
  { name: 'Сбер', labels: ['sberbank', 'sber'], domains: ['sberbank.ru', 'sber.ru', 'sberbank.com'] },
  { name: 'Т-Банк', labels: ['tinkoff', 'tbank'], domains: ['tinkoff.ru', 'tbank.ru'] },
  { name: 'ВТБ', labels: ['vtb'], domains: ['vtb.ru', 'vtb.com'] },
  { name: 'Ozon', labels: ['ozon'], domains: ['ozon.ru', 'ozon.com'] },
  { name: 'Яндекс', labels: ['yandex'], domains: ['yandex.ru', 'yandex.com', 'yandex.net', 'yandex.kz', 'yandex.by'] },
]

const authenticationTerms = new Set([
  'account', 'accounts', 'auth', 'billing', 'confirm', 'credential', 'delivery', 'login', 'password',
  'payment', 'recover', 'recovery', 'security', 'secure', 'signin', 'support', 'unlock', 'update',
  'verify', 'verification', 'wallet', 'suspended', 'webmail',
])

const suspiciousTlds = new Set(['cfd', 'click', 'country', 'rest', 'sbs', 'top', 'work', 'xyz', 'zip'])
const homoglyphs: Record<string, string> = { '0': 'o', '1': 'l', '3': 'e', '5': 's', '7': 't' }

function normalizeHostLabel(value: string) {
  return value.toLowerCase().replace(/[01357]/g, (character) => homoglyphs[character] ?? character)
}

function findImpersonatedBrand(hostname: string) {
  const labels = hostname.split(/[.-]/).map(normalizeHostLabel)
  const brand = protectedBrands.find((profile) =>
    profile.labels.some((label) => labels.includes(label))
  )

  if (!brand) return null
  const officialDomain = brand.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  return officialDomain ? null : brand
}

function findAuthenticationTerms(value: string) {
  return Array.from(new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((part) => authenticationTerms.has(part))))
}

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false

  return (
    octets[0] === 0 ||
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  )
}

export function analyzeLink(input: string): LinkScanResult {
  const value = input.trim()
  if (!value || value.length > 2048) throw new Error('Введите адрес длиной не более 2048 символов.')

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  let parsed: URL

  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('Введите корректный адрес сайта.')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Поддерживаются только адреса http:// и https://.')
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '')
  if (!hostname) throw new Error('В адресе не найдено имя сайта.')

  const findings: ScanFinding[] = []
  let score = 0
  const addFinding = (points: number, title: string, detail: string) => {
    score += points
    findings.push({ title, detail })
  }

  if (parsed.protocol === 'http:') {
    addFinding(12, 'Соединение без HTTPS', 'Адрес использует HTTP: данные между браузером и сайтом могут передаваться без шифрования.')
  }

  if (parsed.username || parsed.password) {
    addFinding(55, 'В адрес встроены учётные данные', 'Ссылки с именем пользователя или паролем перед именем сайта часто используют для маскировки настоящего домена.')
  }

  const ipHostname = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname
  const ipVersion = isIP(ipHostname)
  if (ipVersion !== 0) {
    addFinding(32, 'Вместо домена указан IP-адрес', 'Такой адрес сложнее проверить по названию организации. Не вводите на нём пароли и платёжные данные.')
    if (ipVersion === 4 && isPrivateIpv4(ipHostname)) {
      addFinding(20, 'Адрес указывает на локальную сеть', 'Локальные и служебные IP-адреса не являются обычными публичными сайтами.')
    }
  }

  if (hostname.includes('xn--')) {
    addFinding(32, 'В домене есть Punycode', 'Так кодируются некоторые международные символы; похожие буквы могут маскировать другой домен.')
  }

  const impersonatedBrand = findImpersonatedBrand(hostname)
  if (impersonatedBrand) {
    addFinding(58, `Домен может маскироваться под ${impersonatedBrand.name}`, `В имени хоста найдено название ${impersonatedBrand.name}, но адрес не относится к известным официальным доменам этого сервиса.`)
  }

  const hostnameTerms = findAuthenticationTerms(hostname)
  const pathnameTerms = findAuthenticationTerms(parsed.pathname)
  if (hostnameTerms.length >= 2) {
    const points = Math.min(38, 22 + (hostnameTerms.length - 2) * 6)
    addFinding(points, 'В домене собрано несколько слов для входа или проверки', `В имени хоста встречаются: ${hostnameTerms.join(', ')}.`)
  }

  if (hostnameTerms.length > 0 && pathnameTerms.length > 0) {
    addFinding(16, 'Домен и путь вместе похожи на страницу входа или подтверждения', `Найдены признаки в домене (${hostnameTerms.join(', ')}) и пути (${pathnameTerms.join(', ')}).`)
  }

  const topLevelDomain = hostname.split('.').pop() ?? ''
  if (suspiciousTlds.has(topLevelDomain) && (hostnameTerms.length > 0 || impersonatedBrand)) {
    addFinding(12, 'Подозрительное сочетание доменной зоны и слов в адресе', 'Доменная зона сама по себе не доказывает опасность, но вместе с другими признаками требует осторожности.')
  }

  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    addFinding(30, 'Используется локальный или служебный домен', 'Этот адрес не похож на обычный публичный сайт и может вести на устройство или внутреннюю сеть.')
  }

  if (shortenerHosts.has(hostname)) {
    addFinding(14, 'Используется сокращатель ссылок', 'Конечный адрес скрыт. Перед переходом проверьте его через независимый надёжный источник.')
  }

  const hostnameParts = hostname.split('.').filter(Boolean)
  if (hostnameParts.length >= 5) {
    addFinding(14, 'У домена много поддоменов', 'Длинная цепочка поддоменов может затруднить определение настоящего домена.')
  }

  if (parsed.port && !['80', '443'].includes(parsed.port)) {
    addFinding(16, 'Используется нестандартный порт', 'Публичные сайты обычно работают на стандартных портах HTTP или HTTPS.')
  }

  const queryKeys = Array.from(parsed.searchParams.keys()).map((key) => key.toLowerCase())
  if (queryKeys.some((key) => redirectParameters.has(key))) {
    addFinding(16, 'Есть параметр перенаправления', 'Ссылка может передавать браузер на другой адрес после открытия.')
  }

  const encodedParts = `${parsed.pathname}${parsed.search}`.match(/%[0-9a-f]{2}/gi)?.length ?? 0
  if (encodedParts >= 5) {
    addFinding(10, 'Адрес содержит много кодированных символов', 'Сложно читаемые части URL могут скрывать его фактическое назначение.')
  }

  if (value.length > 180) {
    addFinding(8, 'Адрес необычно длинный', 'Длинные URL труднее проверить визуально, особенно в сообщениях и письмах.')
  }

  const level: RiskLevel = score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low'

  return {
    hostname,
    protocol: parsed.protocol.slice(0, -1) as 'http' | 'https',
    score: Math.min(score, 100),
    level,
    findings,
    checkedAt: new Date().toISOString(),
  }
}
