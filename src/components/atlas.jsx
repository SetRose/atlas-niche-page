import { useState, useEffect, useRef } from 'react'
import { X, List, Sun, Moon, CaretDown } from '@phosphor-icons/react'

/* ============================================================
   THEME
   ============================================================ */

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('atlas-theme', next)
  }
  return { theme, toggle, isDark: theme === 'dark' }
}

/* ============================================================
   HELPERS
   ============================================================ */

export const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')

/* Format salary: 85 000 ₽ up to 800 000, then 1,2 млн ₽ */
export function fmtSalary(n, { period = '' } = {}) {
  if (n <= 800000) return `${fmt(n)} ₽${period}`
  const mln = (n / 1000000).toFixed(1).replace('.', ',')
  return `${mln} млн ₽${period}`
}

/* ============================================================
   LOGO
   ============================================================ */

export function AtlasLogo() {
  return (
    <a href="#/" className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <defs>
          <clipPath id="tri-clip-shared">
            <path d="M10 2L18 18H2L10 2Z" />
          </clipPath>
        </defs>
        <path d="M10 2L18 18H2L10 2Z" fill="#4F46E5" />
        <g clipPath="url(#tri-clip-shared)">
          <line x1="2" y1="10" x2="18" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="2" y1="14" x2="18" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="10" y1="2" x2="10" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </g>
      </svg>
      <span className="font-onest text-[20px] font-bold" style={{ color: 'var(--logo-text)' }}>Atlas</span>
    </a>
  )
}

/* ============================================================
   PRIMITIVES
   ============================================================ */

export function Badge({ children, color, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-[9999px] text-[13px] font-medium"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  )
}

export function Card({ children, className = '', hover = false, onClick, style = {} }) {
  const ref = useRef(null)
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`rounded-[12px] p-5 transition-colors duration-150 ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        ...style,
      }}
      onMouseEnter={() => {
        if (hover && ref.current) ref.current.style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={() => {
        if (hover && ref.current) ref.current.style.borderColor = 'var(--border-default)'
      }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children, className = '' }) {
  return (
    <h2
      className={`font-onest text-[20px] md:text-[24px] font-semibold leading-[1.25] mb-4 ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </h2>
  )
}

export function Source({ children }) {
  return (
    <p className="mt-3 text-[11px] leading-[1.45]" style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

export function HBar({ label, value, maxValue, color = '#818CF8' }) {
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

/* ============================================================
   CTA & EMAIL BLOCKS
   ============================================================ */

export function CTABanner({ heading, sub, buttonText = 'Проверить свою идею', subNote = 'Бесплатно, без регистрации' }) {
  return (
    <div
      className="rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, var(--cta-gradient-from), var(--cta-gradient-to))' }}
    >
      <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {heading || 'У вас другая идея? Проверим за 2 минуты на реальных данных'}
      </p>
      <div className="flex flex-col items-center shrink-0">
        <button
          className="px-6 py-3 rounded-[8px] text-[14px] font-medium text-white whitespace-nowrap"
          style={{ background: 'var(--accent)' }}
        >
          {buttonText}
        </button>
        <span className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {sub || subNote}
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   MODAL
   ============================================================ */

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full md:w-[600px] md:max-h-[80vh] max-h-[80vh] overflow-y-auto rounded-t-[16px] md:rounded-[12px] p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ============================================================
   FAQ
   ============================================================ */

export function FAQItem({ q, a, open, onToggle }) {
  const contentRef = useRef(null)
  return (
    <div className="border-b" style={{ borderColor: 'var(--border-default)' }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[15px] font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{q}</span>
        <CaretDown
          size={18}
          className="shrink-0 transition-transform duration-250"
          style={{
            color: 'var(--text-secondary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: open ? (contentRef.current?.scrollHeight || 800) + 'px' : '0px' }}
      >
        <div
          ref={contentRef}
          className="pb-4 text-[14px] leading-[1.55]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {a}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   HEADER / MOBILE MENU
   ============================================================ */

export function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-[36px] h-[36px] rounded-[8px] transition-colors duration-150 shrink-0"
      style={{ border: '1px solid var(--border-default)', background: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-dropdown)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {isDark ? (
        <Sun size={18} style={{ color: 'var(--text-secondary)' }} />
      ) : (
        <Moon size={18} style={{ color: 'var(--text-secondary)' }} />
      )}
    </button>
  )
}

const NAV_LINKS = [
  { label: 'Бизнес-ниши', href: '#/', key: 'niches' },
  { label: 'Профессии', href: '#/profession', key: 'professions' },
  { label: 'Статьи', href: '#/articles', key: 'articles' },
]

export function Header({ onMobileMenu, mobileMenuOpen, isDark, onThemeToggle, activeNav = 'niches' }) {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--sticky-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-default)' }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <AtlasLogo />
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-[14px] font-medium transition-colors duration-150"
              style={{
                color: activeNav === item.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3 overflow-hidden">
          <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          <button
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-medium text-white shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            Проверить идею
          </button>
          <button
            className="md:hidden p-2 shrink-0"
            onClick={onMobileMenu}
            style={{ color: 'var(--text-primary)' }}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export function MobileMenu({ open, activeNav = 'niches' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'var(--bg-page)', top: '56px' }}>
      <nav className="flex flex-col p-6 gap-4">
        {NAV_LINKS.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className="text-[16px] font-medium"
            style={{ color: activeNav === item.key ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            {item.label}
          </a>
        ))}
        <button
          className="mt-4 px-4 py-3 rounded-[8px] text-[14px] font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          Проверить идею
        </button>
      </nav>
    </div>
  )
}

/* ============================================================
   STICKY TABS (parameterized)
   ============================================================ */

export function StickyTabs({ tabs, activeZone, visible }) {
  return (
    <div
      className="fixed left-0 right-0 z-30 border-b transition-transform duration-300"
      style={{
        top: '56px',
        background: 'var(--sticky-bg)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border-default)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="shrink-0 px-4 py-2 rounded-[9999px] text-[13px] font-medium transition-colors duration-150 whitespace-nowrap"
              style={{
                background: activeZone === t.id ? 'rgba(79,70,229,0.15)' : 'transparent',
                color: activeZone === t.id ? '#818CF8' : 'var(--text-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   KPI CARD
   ============================================================ */

export function KpiCard({ icon: Icon, label, value, context, contextColor, onClick, valueSize = 32, className = '', children, gridMode = false }) {
  const layoutCls = gridMode ? '' : 'min-w-[200px] snap-start shrink-0 md:shrink md:min-w-0'
  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`${layoutCls} ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} weight="duotone" color="#4F46E5" />
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div
        className="font-num font-bold leading-[1.2]"
        style={{ color: 'var(--text-primary)', fontSize: valueSize }}
      >
        {value}
      </div>
      {context && (
        <div className="mt-1 text-[13px] font-medium" style={{ color: contextColor || 'var(--text-secondary)' }}>
          {context}
        </div>
      )}
      {children}
    </Card>
  )
}

/* ============================================================
   SLIDE-IN EMAIL
   ============================================================ */

export function SlideInEmail({ visible, onClose, title = 'Не упустите изменения', body, placeholder = 'Email', buttonText = 'Получить' }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-40 hidden md:block transition-all duration-300"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
      }}
    >
      <Card className="w-[300px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} className="p-1" style={{ color: 'var(--text-secondary)' }} aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>
        {body && (
          <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>{body}</p>
        )}
        <div className="flex gap-2">
          <input
            type="email"
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-[8px] text-[13px] outline-none"
            style={{
              background: 'var(--bg-dropdown)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            className="px-3 py-2 rounded-[8px] text-[13px] font-medium text-white shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {buttonText}
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ============================================================
   MOBILE STICKY CTA
   ============================================================ */

export function MobileStickyCTA({ visible, text = 'Проверить идею', sub = 'Бесплатно', onClick }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 px-4 pb-3 pt-2"
      style={{
        background: 'var(--bg-card)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
      }}
    >
      <div className="flex flex-col items-center">
        <button
          onClick={onClick}
          className="px-6 py-3 rounded-[8px] text-[14px] font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          {text}
        </button>
        <span className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>{sub}</span>
      </div>
    </div>
  )
}
