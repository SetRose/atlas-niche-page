import { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from 'recharts'
import {
  List, X, Triangle,
  TrendUp, Buildings, Briefcase,
  ChartLineUp, Scales,
  CaretDown, CheckCircle, XCircle,
  CurrencyCircleDollar, Clock, UserCirclePlus,
  ShieldCheck, Certificate, Bell,
  Coffee, Storefront, MapPin, Users,
  Sun, Moon
} from '@phosphor-icons/react'

// ─── THEME ───────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark')
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('atlas-theme', next)
  }
  return { theme, toggle, isDark: theme === 'dark' }
}

// ─── DATA ─────────────────────────────────────────────

const DEMAND_DATA = [
  { m: 'Янв 24', v: 9800 }, { m: 'Фев', v: 10200 }, { m: 'Мар', v: 11000 },
  { m: 'Апр', v: 11400 }, { m: 'Май', v: 13500 }, { m: 'Июн', v: 14200 },
  { m: 'Июл', v: 12800 }, { m: 'Авг', v: 12100 }, { m: 'Сен', v: 11600 },
  { m: 'Окт', v: 11200 }, { m: 'Ноя', v: 10800 }, { m: 'Дек', v: 10400 },
  { m: 'Янв 25', v: 10600 }, { m: 'Фев', v: 11000 }, { m: 'Мар', v: 11800 },
  { m: 'Апр', v: 12200 }, { m: 'Май', v: 14800 }, { m: 'Июн', v: 15500 },
  { m: 'Июл', v: 13900 }, { m: 'Авг', v: 13200 }, { m: 'Сен', v: 12600 },
  { m: 'Окт', v: 12000 }, { m: 'Ноя', v: 11600 }, { m: 'Дек', v: 11200 },
]

const SPARK_DATA = DEMAND_DATA.slice(-12).map(d => ({ v: d.v }))

const BIRTH_DEATH = [
  { m: 'Май 24', reg: 95, liq: 42 }, { m: 'Июн', reg: 88, liq: 45 },
  { m: 'Июл', reg: 82, liq: 40 }, { m: 'Авг', reg: 78, liq: 38 },
  { m: 'Сен', reg: 85, liq: 44 }, { m: 'Окт', reg: 90, liq: 46 },
  { m: 'Ноя', reg: 92, liq: 48 }, { m: 'Дек', reg: 75, liq: 50 },
  { m: 'Янв 25', reg: 110, liq: 52 }, { m: 'Фев', reg: 105, liq: 48 },
  { m: 'Мар', reg: 98, liq: 45 }, { m: 'Апр', reg: 102, liq: 48 },
]

const SEASON_HEAT = [
  { m: 'Янв', v: 0.65 }, { m: 'Фев', v: 0.70 }, { m: 'Мар', v: 0.78 },
  { m: 'Апр', v: 0.82 }, { m: 'Май', v: 1.0 }, { m: 'Июн', v: 0.97 },
  { m: 'Июл', v: 0.88 }, { m: 'Авг', v: 0.83 }, { m: 'Сен', v: 0.80 },
  { m: 'Окт', v: 0.75 }, { m: 'Ноя', v: 0.72 }, { m: 'Дек', v: 0.68 },
]

const REGIONS_TOP = [
  { name: 'Москва', companies: 320, demand: 3200 },
  { name: 'Санкт-Петербург', companies: 185, demand: 2100 },
  { name: 'Краснодар', companies: 87, demand: 2400 },
  { name: 'Екатеринбург', companies: 72, demand: 1600 },
  { name: 'Новосибирск', companies: 65, demand: 1400 },
]

const REGION_TABLE = [
  { name: 'Краснодар', demand: '2 400', companies: 87, index: 'Высокий', color: '#60A5FA' },
  { name: 'Пермь', demand: '1 800', companies: 23, index: 'Высокий', color: '#60A5FA' },
  { name: 'Казань', demand: '1 200', companies: 58, index: 'Средний', color: '#94A3B8' },
  { name: 'Новосибирск', demand: '1 400', companies: 65, index: 'Средний', color: '#94A3B8' },
  { name: 'Самара', demand: '980', companies: 45, index: 'Низкий', color: '#FBBF24' },
]

const PIE_DATA = [
  { name: 'Микро (до 15 чел.)', value: 85, color: '#818CF8' },
  { name: 'Малые (16–100)', value: 12, color: '#60A5FA' },
  { name: 'Средние (101–250)', value: 3, color: '#94A3B8' },
]

const BANKS = [
  {
    name: 'Точка', letter: 'Т', recommended: true,
    features: ['0 ₽/мес первые 3 месяца', 'Эквайринг от 1,5%', 'Кассовая интеграция'],
    erid: '2VtzqwmK4gP', inn: '7709486011', advertiser: 'АО «Точка»'
  },
  {
    name: 'Т-Банк', letter: 'Т',
    features: ['0 ₽/мес первые 2 месяца', 'Эквайринг от 1,69%', 'Кешбэк 1% на все'],
    erid: '2VtzqwmK4gQ', inn: '7710140679', advertiser: 'АО «Тинькофф Банк»'
  },
  {
    name: 'Альфа-Банк', letter: 'А',
    features: ['0 ₽/мес первый месяц', 'Эквайринг от 1,8%', 'Кешбэк на рекламу'],
    erid: '2VtzqwmK4gR', inn: '7728168971', advertiser: 'АО «Альфа-Банк»'
  },
]

const FAQ_DATA = [
  {
    q: 'Нужна ли лицензия для кофейни?',
    a: 'Нет, кофейня не требует лицензии. Нужно уведомить Роспотребнадзор о начале деятельности. ОКВЭД: 56.10 (деятельность ресторанов и кафе). Также понадобится санитарно-эпидемиологическое заключение на помещение.'
  },
  {
    q: 'Сколько стоит открыть кофейню?',
    a: 'От 500 000 ₽ (мини-формат, takeaway) до 2 000 000 ₽ (полноценное заведение с посадкой). Основные статьи: аренда (30%), ремонт (20%), оборудование — кофемашина от 150 000 ₽ (25%), первая закупка сырья (10%), маркетинг (15%).'
  },
  {
    q: 'Какой ОКВЭД выбрать?',
    a: 'Основной: 56.10 (деятельность ресторанов и услуги по доставке продуктов питания). Дополнительные: 47.24 (розничная торговля хлебом и хлебобулочными изделиями), 56.10.21 (приготовление и продажа напитков). Регистрация ОКВЭД бесплатна при открытии ИП/ООО.'
  },
  {
    q: 'Кофейня или пекарня — что выгоднее?',
    a: 'Кофейня дешевле в запуске (500 000 ₽ vs 800 000 ₽), быстрее окупается (8–14 мес vs 12–18 мес), но маржинальность пекарни выше (65% vs 55% на выпечку). Комбинация «кофейня + выпечка» — самая прибыльная модель, позволяющая увеличить средний чек на 40–60%.'
  },
  {
    q: 'Можно ли открыть кофейню без опыта?',
    a: 'Да, 60% владельцев кофеен не имели опыта в HoReCa. Ключевое: нанять опытного бариста и пройти базовый курс по обжарке и приготовлению кофе (40–80 часов). Франшиза снижает риски, но увеличивает стартовые вложения на 200 000–500 000 ₽.'
  },
]

const SIMILAR_NICHES = [
  { name: 'Пекарня', verdict: 'Перспективная', color: '#60A5FA', demand: '8 200', companies: '980' },
  { name: 'Чайная', verdict: 'Умеренная', color: '#94A3B8', demand: '3 100', companies: '420' },
  { name: 'Бар', verdict: 'Умеренная', color: '#94A3B8', demand: '6 800', companies: '1 560' },
  { name: 'Кондитерская', verdict: 'Перспективная', color: '#60A5FA', demand: '5 400', companies: '670' },
]

const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')

// ─── SMALL COMPONENTS ─────────────────────────────────

function AtlasLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <defs>
          <clipPath id="tri-clip">
            <path d="M10 2L18 18H2L10 2Z" />
          </clipPath>
        </defs>
        <path d="M10 2L18 18H2L10 2Z" fill="#4F46E5" />
        <g clipPath="url(#tri-clip)">
          <line x1="2" y1="10" x2="18" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="2" y1="14" x2="18" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="10" y1="2" x2="10" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </g>
      </svg>
      <span className="font-onest text-[20px] font-bold" style={{ color: 'var(--logo-text)' }}>Atlas</span>
    </div>
  )
}

function Badge({ children, color, bg }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[9999px] text-[13px] font-medium"
      style={{ color, background: bg }}>
      {children}
    </span>
  )
}

function Card({ children, className = '', hover = false, onClick, style = {} }) {
  const ref = useRef(null)
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`rounded-[12px] p-5 transition-colors duration-150 ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', ...style }}
      onMouseEnter={() => { if (hover && ref.current) ref.current.style.borderColor = 'var(--border-hover)' }}
      onMouseLeave={() => { if (hover && ref.current) ref.current.style.borderColor = 'var(--border-default)' }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="font-onest text-[20px] md:text-[24px] font-semibold leading-[1.25] mb-4"
      style={{ color: 'var(--text-primary)' }}>
      {children}
    </h2>
  )
}

function Source({ children }) {
  return <p className="mt-3 text-[11px] leading-[1.45]" style={{ color: 'var(--text-muted)' }}>{children}</p>
}

function HBar({ label, value, maxValue, color = '#818CF8' }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-num text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
      </div>
      <div className="h-[6px] rounded-full" style={{ background: 'var(--bar-track)' }}>
        <div className="h-full rounded-full" style={{ width: `${(value / maxValue) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

function LicenseItem({ icon: Icon, label, value, color }) {
  return (
    <div className="p-3 rounded-[8px]" style={{ background: 'var(--bg-dropdown)' }}>
      <Icon size={20} weight="duotone" color="#4F46E5" className="mb-2" />
      <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-[13px] font-medium" style={{ color }}>{value}</p>
    </div>
  )
}

function OkvedChips() {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {[
        { pct: '70%', name: 'Розничная торговля выпечкой', code: '47.24' },
        { pct: '45%', name: 'Хлебобулочные изделия', code: '10.71' },
        { pct: '22%', name: 'Доставка еды', code: '56.21' },
        { pct: '15%', name: 'Торговля напитками', code: '47.25' },
      ].map(item => (
        <span key={item.code}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px]"
          style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}>
          <span className="font-num font-semibold" style={{ color: '#818CF8' }}>{item.pct}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>({item.code})</span>
        </span>
      ))}
    </div>
  )
}

function CTABanner({ heading, sub }) {
  return (
    <div className="rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, var(--cta-gradient-from), var(--cta-gradient-to))' }}>
      <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {heading || 'У вас другая идея? Проверим за 2 минуты на реальных данных'}
      </p>
      <div className="flex flex-col items-center shrink-0">
        <button className="px-6 py-3 rounded-[8px] text-[14px] font-medium text-white whitespace-nowrap"
          style={{ background: 'var(--accent)' }}>
          Проверить свою идею
        </button>
        <span className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {sub || 'Бесплатно, без регистрации'}
        </span>
      </div>
    </div>
  )
}

function InlineEmail() {
  return (
    <div className="rounded-[12px] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      style={{ background: 'rgba(79,70,229, 0.06)' }}>
      <div className="shrink-0">
        <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Получить отчёт по нише «Кофейня»
        </p>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Спрос, конкуренция, зарплаты — раз в месяц на email
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
        <input type="email" placeholder="Email"
          className="px-3 py-2.5 rounded-[8px] text-[13px] outline-none min-w-[200px]"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
        <button className="px-5 py-2.5 rounded-[8px] text-[13px] font-medium text-white whitespace-nowrap"
          style={{ background: 'var(--accent)' }}>Получить</button>
      </div>
    </div>
  )
}

// ─── TOOLTIPS ─────────────────────────────────────────

function DemandTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[8px] px-3 py-2 text-[12px]"
      style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="font-num" style={{ color: '#818CF8' }}>{fmt(payload[0].value)} запр.</p>
    </div>
  )
}

function BirthDeathTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[8px] px-3 py-2 text-[12px]"
      style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}>
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-num" style={{ color: p.color }}>
          {p.dataKey === 'reg' ? '↑ Открыто' : '↓ Закрыто'}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── MODALS ───────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full md:w-[600px] md:max-h-[80vh] max-h-[70vh] overflow-y-auto rounded-t-[16px] md:rounded-[12px] p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} className="p-1" style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────

function FAQItem({ q, a, open, onToggle }) {
  const contentRef = useRef(null)
  return (
    <div className="border-b" style={{ borderColor: 'var(--border-default)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[15px] font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{q}</span>
        <CaretDown size={18} className="shrink-0 transition-transform duration-250"
          style={{ color: 'var(--text-secondary)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      <div className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: open ? (contentRef.current?.scrollHeight || 500) + 'px' : '0px' }}>
        <div ref={contentRef} className="pb-4 text-[14px] leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>{a}</div>
      </div>
    </div>
  )
}

// ─── HEADER ───────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle}
      className="flex items-center justify-center w-[36px] h-[36px] rounded-[8px] transition-colors duration-150 shrink-0"
      style={{ border: '1px solid var(--border-default)', background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-dropdown)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}>
      {isDark
        ? <Sun size={18} style={{ color: 'var(--text-secondary)' }} />
        : <Moon size={18} style={{ color: 'var(--text-secondary)' }} />}
    </button>
  )
}

function Header({ onMobileMenu, mobileMenuOpen, isDark, onThemeToggle }) {
  return (
    <header className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--sticky-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-default)' }}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <AtlasLogo />
        <nav className="hidden md:flex items-center gap-6">
          {['Бизнес-ниши', 'Профессии', 'Статьи'].map(item => (
            <a key={item} href="#" className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3 overflow-hidden">
          <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-medium text-white shrink-0"
            style={{ background: 'var(--accent)' }}>
            Проверить идею
          </button>
          <button className="md:hidden p-2 shrink-0" onClick={onMobileMenu} style={{ color: 'var(--text-primary)' }}>
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ open }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'var(--bg-page)', top: '56px' }}>
      <nav className="flex flex-col p-6 gap-4">
        {['Бизнес-ниши', 'Профессии', 'Статьи'].map(item => (
          <a key={item} href="#" className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>{item}</a>
        ))}
        <button className="mt-4 px-4 py-3 rounded-[8px] text-[14px] font-medium text-white"
          style={{ background: 'var(--accent)' }}>Проверить идею</button>
      </nav>
    </div>
  )
}

// ─── STICKY TABS ──────────────────────────────────────

function StickyTabs({ activeZone, visible }) {
  const tabs = [
    { id: 'zone1', label: 'Обзор' },
    { id: 'zone2', label: 'Динамика' },
    { id: 'zone3', label: 'Конкуренция' },
    { id: 'zone4', label: 'Финансы' },
    { id: 'zone5', label: 'Дополнительно' },
  ]
  return (
    <div className="fixed left-0 right-0 z-30 border-b transition-transform duration-300"
      style={{
        top: '56px',
        background: 'var(--sticky-bg)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border-default)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="shrink-0 px-4 py-2 rounded-[9999px] text-[13px] font-medium transition-colors duration-150 whitespace-nowrap"
              style={{
                background: activeZone === t.id ? 'rgba(79,70,229,0.15)' : 'transparent',
                color: activeZone === t.id ? '#818CF8' : 'var(--text-secondary)',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── KPI CARD ─────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, context, contextColor, spark, onClick }) {
  return (
    <Card hover={!!onClick} onClick={onClick} className="min-w-[200px] snap-start shrink-0 md:shrink md:min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} weight="duotone" color="#4F46E5" />
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div className="font-num text-[32px] font-bold leading-[1.2]" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {context && (
        <div className="mt-1 text-[13px] font-medium" style={{ color: contextColor || 'var(--text-secondary)' }}>{context}</div>
      )}
      {spark && (
        <div className="mt-2 h-[20px]">
          <ResponsiveContainer width="100%" height={20}>
            <AreaChart data={SPARK_DATA}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#818CF8" strokeWidth={1.5}
                fill="url(#sparkGrad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

// ─── SLIDE-IN EMAIL ───────────────────────────────────

function SlideInEmail({ visible, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block transition-all duration-300"
      style={{ transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))', opacity: visible ? 1 : 0 }}>
      <Card className="w-[300px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Не упустите изменения</span>
          <button onClick={onClose} className="p-1" style={{ color: 'var(--text-secondary)' }}><X size={16} /></button>
        </div>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>Ежемесячный отчёт: спрос, конкуренты, зарплаты</p>
        <div className="flex gap-2">
          <input type="email" placeholder="Email"
            className="flex-1 px-3 py-2 rounded-[8px] text-[13px] outline-none"
            style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          <button className="px-3 py-2 rounded-[8px] text-[13px] font-medium text-white shrink-0"
            style={{ background: 'var(--accent)' }}>Получить</button>
        </div>
      </Card>
    </div>
  )
}

// ─── MOBILE STICKY CTA ───────────────────────────────

function MobileStickyCTA({ visible }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 px-4 pb-3 pt-2"
      style={{
        background: 'var(--bg-card)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
      }}>
      <div className="flex flex-col items-center">
        <button className="px-6 py-3 rounded-[8px] text-[14px] font-medium text-white"
          style={{ background: 'var(--accent)' }}>Проверить идею</button>
        <span className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>Бесплатно</span>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────

export default function App() {
  const { theme, toggle: toggleTheme, isDark } = useTheme()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeZone, setActiveZone] = useState('zone1')
  const [tabsVisible, setTabsVisible] = useState(false)
  const [scrollingDown, setScrollingDown] = useState(false)
  const [modal, setModal] = useState(null)
  const [faqOpen, setFaqOpen] = useState(0)
  const [emailDismissed, setEmailDismissed] = useState(false)
  const [slideEmail, setSlideEmail] = useState(false)
  const [mobileCTA, setMobileCTA] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [licenseOpen, setLicenseOpen] = useState(false)
  const [okvedOpen, setOkvedOpen] = useState(false)

  const axisColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'
  const legendColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const zones = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5']
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveZone(e.target.id) })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )
    zones.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let prev = window.scrollY
    const handleScroll = () => {
      const cur = window.scrollY
      const down = cur > prev
      setScrollingDown(down)
      setTabsVisible(cur > 600)
      if (!emailDismissed) {
        const depth = cur / (document.body.scrollHeight - window.innerHeight)
        setSlideEmail(depth > 0.4)
      }
      const kpiEnd = document.getElementById('kpi-end')
      if (kpiEnd) {
        const rect = kpiEnd.getBoundingClientRect()
        setMobileCTA(rect.top < 0 && !down)
      }
      prev = cur
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [emailDismissed])

  const maxRegion = Math.max(...REGIONS_TOP.map(r => r.companies))

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Header onMobileMenu={() => setMobileMenu(!mobileMenu)} mobileMenuOpen={mobileMenu}
        isDark={isDark} onThemeToggle={toggleTheme} />
      <MobileMenu open={mobileMenu} />
      <StickyTabs activeZone={activeZone} visible={tabsVisible && !scrollingDown} />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6">

        {/* ═══════════════════════ ZONE 1 — Identification ═══════════════════════ */}
        <section id="zone1" className="pt-6">

          {/* Block 1 — Region switcher */}
          <div className="mb-6">
            <select className="md:hidden w-full px-4 py-2.5 rounded-[8px] text-[13px] font-medium appearance-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
              <option>Вся Россия</option>
              <option disabled>Москва (скоро)</option>
              <option disabled>Санкт-Петербург (скоро)</option>
              <option disabled>Екатеринбург (скоро)</option>
              <option disabled>Краснодар (скоро)</option>
            </select>
            <div className="hidden md:flex gap-2 flex-wrap">
              {['Вся Россия', 'Москва', 'Санкт-Петербург', 'Екатеринбург', 'Краснодар'].map((r, i) => (
                <button key={r}
                  className="relative h-[36px] px-4 rounded-[18px] text-[13px] font-medium transition-colors duration-150"
                  style={{
                    background: i === 0 ? 'var(--accent)' : 'transparent',
                    color: i === 0 ? 'white' : 'var(--text-secondary)',
                    opacity: i === 0 ? 1 : 0.45,
                    border: i === 0 ? 'none' : '1px solid var(--border-default)',
                  }}
                  title={i !== 0 ? 'Данные скоро появятся' : undefined}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Block 2 — Verdict */}
          <div className="mb-6">
            <div className="text-[13px] mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>Главная</span><span>›</span><span>Бизнес-ниши</span><span>›</span>
              <span style={{ color: 'var(--text-secondary)' }}>Кофейня</span>
            </div>
            <h1 className="font-onest text-[28px] md:text-[36px] font-bold leading-[1.2] mb-4"
              style={{ color: 'var(--text-primary)' }}>
              Кофейня — анализ бизнес-ниши
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge color="#60A5FA" bg={`rgba(96,165,250, var(--badge-alpha))`}>↑ Перспективная</Badge>
              <Badge color="var(--text-secondary)" bg="var(--bar-track)">Растущая</Badge>
            </div>
            <p className="text-[15px] leading-[1.6] mb-2" style={{ color: 'var(--text-secondary)' }}>
              Высокий спрос (<span className="font-num">12 400</span> запросов/мес) при умеренной конкуренции (<span className="font-num">1 240</span> компаний). Рынок растёт <span className="font-num">+8%</span> за год.
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Данные на апрель 2026 · Обновляются ежемесячно
            </p>
          </div>

          {/* Block 3 — KPI Cards */}
          <div className="mb-6">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible pb-2 md:pb-0">
              <KpiCard icon={ChartLineUp} label="Спрос, тыс." value="12,4"
                context="↑ +15% за год" contextColor="var(--trend-up)" spark onClick={() => setModal('demand')} />
              <KpiCard icon={TrendUp} label="D-S Gap"
                value={<Badge color="#60A5FA" bg={`rgba(96,165,250, var(--badge-alpha))`}>Высокий</Badge>} />
              <KpiCard icon={Buildings} label="Компаний" value={<span className="font-num">1 240</span>}
                context="↑ +87 за год" contextColor="var(--trend-up)" onClick={() => setModal('companies')} />
              <KpiCard icon={TrendUp} label="Чист. рост" value="+135" context="бизнесов/мес" />
              <KpiCard icon={Briefcase} label="Вакансии" value={<span className="font-num">3 420</span>}
                context="↑ +8% за год" contextColor="var(--trend-up)" onClick={() => setModal('vacancies')} />
            </div>
          </div>
          <div id="kpi-end" />
        </section>

        {/* Block 4 — Seasonal Alert */}
        <div className="mb-8 rounded-[12px] px-5 py-4"
          style={{ background: 'var(--season-alert-bg)', borderLeft: '3px solid #FBBF24' }}>
          <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
            &#128197; Пик спроса: май–июнь (+45%). До пика — 1 месяц.
          </p>
        </div>

        {/* ═══════════════════════ ZONE 2 — Market Dynamics ═══════════════════════ */}
        <section id="zone2" className="mb-16">

          {/* Block 5 — Demand Chart */}
          <Card className="mb-8">
            <SectionTitle>Спрос вырос на 15% за год — пик в мае-июне</SectionTitle>
            <div className="h-[240px] md:h-[320px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMAND_DATA}>
                  <defs>
                    <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false} tickLine={false} width={45}
                    tickFormatter={v => (v / 1000).toFixed(0) + 'К'} />
                  <Tooltip content={<DemandTooltip />} />
                  <Area type="monotone" dataKey="v" stroke="#818CF8" strokeWidth={2}
                    fill="url(#demandFill)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Сезонность по месяцам</p>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
                {SEASON_HEAT.map(s => (
                  <div key={s.m} className="text-center">
                    <div className="h-[28px] rounded-[4px] mb-1"
                      style={{ background: `rgba(129,140,248, ${s.v * 0.6 + 0.05})` }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.m}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                Пиковые месяцы: май, июнь. Провал: январь.
              </p>
            </div>
            <Source>Яндекс Wordstat · апрель 2026</Source>
          </Card>

          {/* Inline Email — between block 5 and block 6 */}
          <div className="mb-8"><InlineEmail /></div>

          {/* CTA #1 — after block 5 + inline email, before block 6 */}
          <div className="mb-8"><CTABanner /></div>

          {/* Block 6 — Birth/Death */}
          <Card>
            <SectionTitle>+87 бизнесов/мес — рынок растёт, но 48 закрываются</SectionTitle>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 h-[240px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BIRTH_DEATH} barGap={2}>
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: axisColor }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: axisColor }}
                      axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<BirthDeathTooltip />} />
                    <Legend formatter={v => v === 'reg' ? '↑ Открыто' : '↓ Закрыто'}
                      wrapperStyle={{ fontSize: '12px', color: legendColor }} />
                    <Bar dataKey="reg" name="reg" fill="#10B981" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="liq" name="liq" fill="#EF4444" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="md:w-[260px] p-4 rounded-[12px]"
                style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}>
                <p className="text-[14px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Выживаемость</p>
                <p className="font-num text-[28px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>65%</p>
                <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>бизнесов живут более 3 лет</p>
                <div className="pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    Средний срок жизни — <span className="font-num font-semibold" style={{ color: 'var(--text-primary)' }}>4,2 года</span>
                  </p>
                </div>
              </div>
            </div>
            <Source>ФНС · Статистика регистраций · апрель 2026</Source>
          </Card>
        </section>

        {/* ═══════════════════════ ZONE 3 — Competition ═══════════════════════ */}
        <section id="zone3" className="mb-16">

          {/* Block 7 — Competition */}
          <Card className="mb-8">
            <SectionTitle>1 240 компаний — 85% микробизнесы, рынок фрагментирован</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>По размеру</p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                        dataKey="value" isAnimationActive={false} stroke="none">
                        {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}%`, n]}
                        contentStyle={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {PIE_DATA.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-[12px]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                      <span className="font-num ml-auto font-medium" style={{ color: 'var(--text-primary)' }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Форма собственности</p>
                <div className="space-y-4 mt-4">
                  {[{ label: 'ИП', pct: 78 }, { label: 'ООО', pct: 22 }].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[13px] mb-1.5">
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span className="font-num font-medium" style={{ color: 'var(--text-primary)' }}>{item.pct}%</span>
                      </div>
                      <div className="h-[8px] rounded-full" style={{ background: 'var(--bar-track)' }}>
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.label === 'ИП' ? '#818CF8' : '#60A5FA' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Топ-5 регионов</p>
                {REGIONS_TOP.map(r => (
                  <HBar key={r.name} label={r.name} value={r.companies} maxValue={maxRegion} />
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-[8px]" style={{ background: 'var(--cta-gradient-from)' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                <MapPin size={16} weight="duotone" color="#4F46E5" className="inline mr-1.5 align-text-bottom" />
                Недооценённый регион: <strong>Пермь</strong> — <span className="font-num">23</span> компании при спросе <span className="font-num">1 800</span> запр./мес
              </p>
            </div>
            <Source>ФНС РМСП · Росстат · апрель 2026</Source>
          </Card>

          {/* Block 8 — Regional Table */}
          <Card className="mb-8">
            <SectionTitle>Краснодар и Пермь — лучшие регионы для старта</SectionTitle>
            <div className="hidden md:block overflow-x-auto mt-4">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                    {['Регион', 'Спрос/мес', 'Компании', 'Индекс'].map((h, i) => (
                      <th key={h} className={`${i === 0 ? 'text-left' : 'text-right'} py-3 px-3 font-medium text-[12px]`}
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REGION_TABLE.map(r => (
                    <tr key={r.name} className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                      <td className="py-3 px-3" style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                      <td className="py-3 px-3 text-right font-num" style={{ color: 'var(--text-primary)' }}>{r.demand}</td>
                      <td className="py-3 px-3 text-right font-num" style={{ color: 'var(--text-primary)' }}>{r.companies}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded-[4px] text-[12px] font-medium"
                          style={{ color: r.color, background: `${r.color}15` }}>{r.index}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden flex flex-col gap-3 mt-4">
              {REGION_TABLE.map(r => (
                <div key={r.name} className="p-4 rounded-[8px]"
                  style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
                    <span className="px-2 py-0.5 rounded-[4px] text-[12px] font-medium"
                      style={{ color: r.color, background: `${r.color}15` }}>{r.index}</span>
                  </div>
                  <div className="flex gap-4 text-[13px]">
                    <span style={{ color: 'var(--text-secondary)' }}>Спрос: <span className="font-num font-medium" style={{ color: 'var(--text-primary)' }}>{r.demand}</span></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Компании: <span className="font-num font-medium" style={{ color: 'var(--text-primary)' }}>{r.companies}</span></span>
                  </div>
                </div>
              ))}
            </div>
            <Source>ФНС РМСП · Яндекс Wordstat · Росстат · апрель 2026</Source>
          </Card>

          {/* Block 9 — Licensing (mobile: accordion, desktop: grid) */}
          <Card className="mb-8">
            {/* Mobile accordion */}
            <div className="md:hidden">
              <button onClick={() => setLicenseOpen(!licenseOpen)} className="w-full flex items-center justify-between">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Лицензирование и налоги</span>
                <CaretDown size={18} style={{ color: 'var(--text-secondary)', transform: licenseOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 250ms' }} />
              </button>
              <div className="overflow-hidden transition-all duration-250" style={{ maxHeight: licenseOpen ? '400px' : '0' }}>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <LicenseItem icon={Certificate} label="Лицензия" value="Не нужна" color="#60A5FA" />
                  <LicenseItem icon={Scales} label="Налог" value="Патент / УСН" color="var(--text-secondary)" />
                  <LicenseItem icon={ShieldCheck} label="Класс риска" value="1" color="#5EEAD4" />
                  <LicenseItem icon={Bell} label="Уведомления" value="Роспотребнадзор" color="#FBBF24" />
                </div>
              </div>
            </div>
            {/* Desktop grid */}
            <div className="hidden md:block">
              <SectionTitle>Лицензирование и налоги</SectionTitle>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <LicenseItem icon={Certificate} label="Лицензия" value="Не нужна" color="#60A5FA" />
                <LicenseItem icon={Scales} label="Налог" value="Патент / УСН" color="var(--text-secondary)" />
                <LicenseItem icon={ShieldCheck} label="Класс риска" value="1" color="#5EEAD4" />
                <LicenseItem icon={Bell} label="Уведомления" value="Роспотребнадзор" color="#FBBF24" />
              </div>
            </div>
          </Card>

          {/* CTA #2 */}
          <CTABanner heading="Изучили конкурентов? Готовы действовать?" />
        </section>

        {/* ═══════════════════════ ZONE 4 — Economics ═══════════════════════ */}
        <section id="zone4" className="mb-16 mt-16">

          {/* Block 10 — AI Description */}
          <Card className="mb-8">
            <SectionTitle>О нише «Кофейня»</SectionTitle>
            <div className="text-[15px] leading-[1.6] space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Кофейный бизнес в России переживает устойчивый рост: за последние пять лет количество кофеен увеличилось на 42%, а культура потребления кофе продолжает развиваться даже в регионах. Средний россиянин выпивает 1,7 чашки кофе в день — это ниже европейского уровня (2,4), что создаёт значительный потенциал для роста рынка. Ключевые драйверы — урбанизация, рост доходов молодого населения (25–40 лет) и формирование привычки пить specialty-кофе.
              </p>
              <p>
                Формат мини-кофейни (takeaway, 15–25 м²) показывает наилучшее соотношение инвестиций к окупаемости: запуск от 500 000 ₽, выход на прибыль за 8–12 месяцев. Основной риск — выбор локации: 70% закрывшихся кофеен называют низкий трафик главной причиной. Наибольший потенциал — в городах с населением 300 000–700 000 человек, где конкуренция ниже, а спрос растёт быстрее столичного. Модель «кофейня + выпечка» увеличивает средний чек на 45% и рекомендуется для формата с посадочными местами.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Начинающим', 'С бюджетом от 300К', 'Можно одному', 'Подходит для регионов'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-[9999px] text-[12px] font-medium"
                  style={{ background: 'rgba(79,70,229,0.1)', color: '#818CF8' }}>{tag}</span>
              ))}
            </div>
            <p className="mt-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>AI-анализ на основе 12 источников данных</p>
          </Card>

          {/* Block 11 — Finances */}
          <Card className="mb-8">
            <SectionTitle>Финансы: от 500 000 ₽ до первой прибыли за 8–14 месяцев</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                { icon: CurrencyCircleDollar, label: 'Стартовый капитал', value: '500К–2М ₽' },
                { icon: Clock, label: 'Окупаемость', value: '8–14 мес' },
                { icon: UserCirclePlus, label: 'CAC (стоимость клиента)', value: '~380 ₽' },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-[8px] text-center"
                  style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}>
                  <item.icon size={24} weight="duotone" color="#4F46E5" className="mx-auto mb-2" />
                  <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                  <p className="font-num text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Что нужно для входа</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { label: 'Офис/помещение', ok: true },
                  { label: 'Склад', ok: false },
                  { label: 'Оборудование', ok: true },
                  { label: 'Можно одному', ok: true },
                  { label: 'Проверить лендингом', ok: false },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-[13px]">
                    {item.ok ? <CheckCircle size={16} weight="fill" color="var(--trend-up)" /> : <XCircle size={16} weight="fill" color="var(--trend-down)" />}
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Block 12 — Launch Checklist */}
          <Card className="mb-8">
            <SectionTitle>7 шагов чтобы открыть кофейню за 2–3 месяца</SectionTitle>
            <div className="mt-4 space-y-0">
              {[
                { n: 1, title: 'Выбрать формат', desc: 'Мини (takeaway), классическая (с посадкой) или сетевая (франшиза)' },
                { n: 2, title: 'Открыть расчётный счёт', cpa: true },
                { n: 3, title: 'Зарегистрировать ИП/ООО', desc: 'ОКВЭД 56.10, уведомление в Роспотребнадзор' },
                { n: 4, title: 'Найти помещение', desc: '1 этаж, проходимость от 1 000 чел/день, вытяжка, водоснабжение' },
                { n: 5, title: 'Купить оборудование', desc: 'Кофемашина, кофемолка, холодильник, витрина — от 150 000 ₽' },
                { n: 6, title: 'Нанять бариста', desc: 'Медианная зарплата 42 000 ₽, 1 200 вакансий на рынке' },
                { n: 7, title: 'Запустить рекламу', desc: 'Яндекс.Карты, Instagram*, локальные каналы' },
              ].map(step => (
                <div key={step.n} className="flex gap-4 py-4 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center justify-center w-[28px] h-[28px] rounded-full shrink-0 text-[13px] font-bold"
                    style={{ background: 'rgba(79,70,229,0.15)', color: '#818CF8' }}>{step.n}</div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{step.title}</p>
                    {step.desc && <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>}
                    {step.cpa && (
                      <div className="mt-3 p-4 rounded-[8px]" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)' }}>
                        <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          Открыть в Точке — 0 ₽/мес первые 3 мес + кассовая интеграция
                          <span className="ml-1" style={{ color: '#818CF8' }}> →</span>
                        </p>
                        <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                          Реклама · АО «Точка» · ИНН 7709486011 · erid: 2VtzqwmK4gP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Block 13 — Bank Comparison */}
          <Card className="mb-8">
            <SectionTitle>Сравнение банков для кофейни</SectionTitle>
            <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>AI рекомендует Точку: бесплатно 3 мес + кассы</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-3 md:overflow-visible">
              {BANKS.map(bank => (
                <div key={bank.name}
                  className="min-w-[260px] md:min-w-0 shrink-0 md:shrink p-5 rounded-[12px] flex flex-col relative"
                  style={{
                    background: 'var(--bg-card)',
                    border: bank.recommended ? '1px solid rgba(79,70,229,0.4)' : '1px solid var(--border-default)',
                  }}>
                  {bank.recommended && (
                    <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-[4px] text-[11px] font-medium"
                      style={{ background: 'var(--accent)', color: 'white' }}>Рекомендация для кофейни</div>
                  )}
                  <div className="flex items-center gap-3 mb-4 mt-1">
                    <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[16px] font-bold"
                      style={{ background: 'rgba(79,70,229,0.15)', color: '#818CF8' }}>{bank.letter}</div>
                    <span className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{bank.name}</span>
                  </div>
                  <div className="flex-1 space-y-2 mb-4">
                    {bank.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px]">
                        <CheckCircle size={16} weight="fill" color="var(--trend-up)" className="mt-0.5 shrink-0" />
                        <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-[8px] text-[14px] font-medium text-white mb-2"
                    style={{ background: 'var(--accent)' }}>Открыть счёт</button>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Реклама · {bank.advertiser} · ИНН {bank.inn} · erid: {bank.erid}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ═══════════════════════ ZONE 5 — Additional ═══════════════════════ */}
        <section id="zone5" className="mb-16">

          {/* Block 14 — Related OKVED */}
          <Card className="mb-8">
            {/* Mobile accordion */}
            <div className="md:hidden">
              <button onClick={() => setOkvedOpen(!okvedOpen)} className="w-full flex items-center justify-between">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>70% кофеен добавляют выпечку</span>
                <CaretDown size={18} style={{ color: 'var(--text-secondary)', transform: okvedOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 250ms' }} />
              </button>
              <div className="overflow-hidden transition-all duration-250" style={{ maxHeight: okvedOpen ? '300px' : '0' }}>
                <OkvedChips />
              </div>
            </div>
            {/* Desktop expanded */}
            <div className="hidden md:block">
              <SectionTitle>70% кофеен добавляют выпечку</SectionTitle>
              <OkvedChips />
            </div>
          </Card>

          {/* Block 15 — Pros/Cons */}
          <Card className="mb-8">
            <SectionTitle>Стабильный спрос и быстрый старт — но локация решает всё</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--trend-up)' }}>Преимущества</p>
                <div className="space-y-3">
                  {[
                    'Стабильный ежедневный спрос — кофе пьют каждый день',
                    'Быстрый запуск — от идеи до открытия за 2–3 месяца',
                    'Низкий порог входа — от 500 000 ₽ в формате takeaway',
                    'Высокая маржинальность — до 70% на напитках',
                    'Масштабируемость — от одной точки к сети',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={18} weight="fill" color="var(--trend-up)" className="mt-0.5 shrink-0" />
                      <span className="text-[14px] leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--trend-down)' }}>Риски</p>
                <div className="space-y-3">
                  {[
                    'Локация решает 70% успеха — ошибка стоит всех инвестиций',
                    'Высокая конкуренция в крупных городах — 320 точек в Москве',
                    'Зависимость от поставщиков зерна — цены растут на 10–15%/год',
                    'Сезонные колебания спроса — январь на 35% ниже пика',
                    'Текучка персонала — средний срок работы бариста 8 месяцев',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <XCircle size={18} weight="fill" color="var(--trend-down)" className="mt-0.5 shrink-0" />
                      <span className="text-[14px] leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Block 16 — Who to hire */}
          <Card className="mb-8">
            <SectionTitle>Кого нанимать: 3 ключевые роли</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                { role: 'Бариста', salary: '42 000 ₽', vacancies: '1 200', Icon: Coffee },
                { role: 'Управляющий', salary: '68 000 ₽', vacancies: '340', Icon: Users },
                { role: 'Кондитер', salary: '48 000 ₽', vacancies: '890', Icon: Storefront },
              ].map(p => (
                <div key={p.role} className="p-4 rounded-[8px] transition-colors duration-150"
                  style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}>
                  <p.Icon size={24} weight="duotone" color="#4F46E5" className="mb-3" />
                  <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{p.role}</p>
                  <p className="font-num text-[20px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{p.salary}</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}><span className="font-num">{p.vacancies}</span> вакансий</p>
                </div>
              ))}
            </div>
            <Source>HeadHunter · апрель 2026</Source>
          </Card>

          {/* Block 17 — FAQ */}
          <Card className="mb-8">
            <SectionTitle>Частые вопросы о кофейном бизнесе</SectionTitle>
            <div className="mt-2">
              {FAQ_DATA.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} open={faqOpen === i}
                  onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)} />
              ))}
            </div>
          </Card>

          {/* Block 18 — Similar niches + Email */}
          <div className="mb-8">
            <SectionTitle>Похожие ниши</SectionTitle>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {SIMILAR_NICHES.map(n => (
                <Card key={n.name} hover className="min-w-[220px] shrink-0">
                  <p className="text-[15px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{n.name}</p>
                  <Badge color={n.color} bg={`${n.color}18`}>
                    {n.verdict === 'Перспективная' ? '↑' : '→'} {n.verdict}
                  </Badge>
                  <div className="flex gap-4 mt-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                    <span>Спрос: <span className="font-num font-medium" style={{ color: 'var(--text-primary)' }}>{n.demand}</span></span>
                    <span>Комп.: <span className="font-num font-medium" style={{ color: 'var(--text-primary)' }}>{n.companies}</span></span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Email subscription */}
          <div className="mb-8 p-6 md:p-8 rounded-[16px]" style={{ background: 'rgba(79,70,229, 0.06)' }}>
            <h3 className="text-[18px] md:text-[20px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Получайте ежемесячный отчёт по нише «Кофейня»
            </h3>
            <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Изменения спроса, новые конкуренты, динамика зарплат
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-[480px]">
              <input type="email" placeholder="Ваш email"
                className="flex-1 px-4 py-3 rounded-[8px] text-[14px] outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              <button className="px-6 py-3 rounded-[8px] text-[14px] font-medium text-white whitespace-nowrap"
                style={{ background: 'var(--accent)' }}>Получить отчёт</button>
            </div>
          </div>

          {/* CTA #3 */}
          <div className="mb-8">
            <CTABanner heading="Готовы проверить свою идею на реальных данных?" />
          </div>

          {/* Block 19 — Sources */}
          <div className="py-8 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>
              Подготовлено редакцией <span style={{ color: '#818CF8' }}>Atlas</span> · Обновлено 15 апреля 2026
            </p>
            <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Источники данных</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 mb-6">
              {[
                ['Спрос', 'Яндекс Wordstat'], ['Компании', 'ФНС РМСП'],
                ['Зарплаты', 'HeadHunter'], ['Регионы', 'Росстат'],
                ['Тренды', 'Google Trends'], ['ОКВЭД', 'ФНС'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 py-1 text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <span style={{ color: '#818CF8' }}>{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] leading-[1.45]" style={{ color: 'var(--text-muted)' }}>
              Atlas предоставляет аналитическую информацию на основе открытых данных. Это не финансовый совет и не гарантия результата. Все данные носят информационный характер. Atlas не является продуктом HeadHunter и не аффилирован с ООО «Хэдхантер». Данные обновляются ежемесячно, возможны расхождения с текущими показателями источников.
            </p>
          </div>
        </section>
      </main>

      {/* ─── OVERLAYS ─── */}

      <Modal open={modal === 'demand'} onClose={() => setModal(null)} title="Спрос: 12 400 запросов/мес">
        <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
          Количество поисковых запросов в Яндексе, связанных с открытием и ведением кофейни. Включает «открыть кофейню», «бизнес-план кофейни», «оборудование для кофейни» и 340+ связанных запросов.
        </p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMAND_DATA.slice(-12)}>
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={45}
                tickFormatter={v => (v / 1000).toFixed(0) + 'К'} />
              <Tooltip content={<DemandTooltip />} />
              <Area type="monotone" dataKey="v" stroke="#818CF8" strokeWidth={2}
                fill="url(#demandFill)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Source>Яндекс Wordstat · апрель 2026</Source>
      </Modal>

      <Modal open={modal === 'companies'} onClose={() => setModal(null)} title="Компании: 1 240 в РМСП">
        <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
          Количество зарегистрированных субъектов МСП с основным ОКВЭД 56.10, работающих в сегменте кофеен. Данные из Реестра МСП ФНС.
        </p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BIRTH_DEATH.slice(-6)}>
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<BirthDeathTooltip />} />
              <Bar dataKey="reg" fill="#10B981" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="liq" fill="#EF4444" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Source>ФНС · Реестр МСП · апрель 2026</Source>
      </Modal>

      <Modal open={modal === 'vacancies'} onClose={() => setModal(null)} title="Вакансии: 3 420">
        <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
          Открытые вакансии на HeadHunter в категориях «бариста», «кофейня», «управляющий кофейни». Рост на 8% за последний год свидетельствует о расширении рынка.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { role: 'Бариста', count: '1 200', pct: '35%' },
            { role: 'Управляющий', count: '340', pct: '10%' },
            { role: 'Кондитер', count: '890', pct: '26%' },
          ].map(v => (
            <div key={v.role} className="text-center">
              <p className="font-num text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{v.count}</p>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{v.role}</p>
            </div>
          ))}
        </div>
        <Source>HeadHunter · апрель 2026</Source>
      </Modal>

      <SlideInEmail visible={slideEmail && !emailDismissed} onClose={() => setEmailDismissed(true)} />
      <MobileStickyCTA visible={mobileCTA && isMobile} />
    </div>
  )
}
