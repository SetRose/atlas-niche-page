import { useState, useEffect, useMemo, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Coffee, Briefcase, TrendUp, GraduationCap, Clock, MapPin, Users,
  Target, Path, CaretDown, CheckCircle, XCircle, ArrowRight, CaretRight,
  Sparkle, BookOpen, EnvelopeSimple, House, Star, Info, Lightbulb,
} from '@phosphor-icons/react'

import {
  useTheme, fmt,
  Badge, Card, SectionTitle, Source,
  CTABanner, Modal, FAQItem,
  Header, MobileMenu, StickyTabs, KpiCard, SlideInEmail, MobileStickyCTA,
} from './components/atlas.jsx'

// ═══ FEATURE FLAGS ═══════════════════════════════════

const SHOW_EXPERT_QUOTE = false  // hide until CMS has real data
const SHOW_RSY = true

// ═══ DATA ════════════════════════════════════════════

const PERCENTILES = { p10: 25000, p25: 32000, p50: 42000, p75: 58000, p90: 85000 }
const AVG_RF = 48000

// Axis for the main percentile bar (20K–90K)
const AXIS_MIN = 20000
const AXIS_MAX = 90000
const scale = (v) => Math.max(0, Math.min(100, ((v - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100))

// Grades — wider axis to include expert P90
const GRADES = [
  { key: 'beginner',    label: 'Начинающий', sub: '0–1 год',    p10: 22000, p25: 25000, p50: 32000, p75: 40000, p90: 48000 },
  { key: 'experienced', label: 'Опытный',    sub: '1–3 года',   p10: 30000, p25: 38000, p50: 48000, p75: 62000, p90: 72000 },
  { key: 'expert',      label: 'Эксперт',    sub: '3+ лет',     p10: 40000, p25: 50000, p50: 65000, p75: 85000, p90: 110000 },
]
const GRADE_MIN = 20000
const GRADE_MAX = 120000
const gscale = (v) => Math.max(0, Math.min(100, ((v - GRADE_MIN) / (GRADE_MAX - GRADE_MIN)) * 100))

const SALARY_DYNAMICS = [
  { m: 'Май', v: 36000 },
  { m: 'Июн', v: 36500 },
  { m: 'Июл', v: 37000 },
  { m: 'Авг', v: 37500 },
  { m: 'Сен', v: 38000 },
  { m: 'Окт', v: 39000 },
  { m: 'Ноя', v: 39500 },
  { m: 'Дек', v: 39500 },
  { m: 'Янв', v: 40500 },
  { m: 'Фев', v: 41000 },
  { m: 'Мар', v: 41500 },
  { m: 'Апр', v: 42000 },
]

const SKILLS_PRIMARY = [
  { name: 'Приготовление кофе',    v: 87, cat: 'Технические' },
  { name: 'Латте-арт',             v: 72, cat: 'Технические' },
  { name: 'Работа с кофемолкой',   v: 65, cat: 'Инструменты' },
  { name: 'Кассовый аппарат',      v: 58, cat: 'Инструменты' },
  { name: 'Работа в команде',      v: 54, cat: 'Soft Skills' },
  { name: 'Стрессоустойчивость',   v: 48, cat: 'Soft Skills' },
  { name: 'Знание сортов кофе',    v: 42, cat: 'Технические' },
]
const SKILLS_EXTRA = [
  { name: 'Обслуживание гостей',                 v: 38, cat: 'Soft Skills' },
  { name: 'Уборка',                              v: 35, cat: 'Инструменты' },
  { name: 'Чайная карта',                        v: 28, cat: 'Технические' },
  { name: 'Альтернативные методы заваривания',   v: 22, cat: 'Технические' },
  { name: 'Английский язык',                     v: 18, cat: 'Soft Skills' },
]

const PROS = [
  'Быстрый старт: можно работать уже через 2 недели курсов',
  'Не требуется высшее образование — 92% вакансий без требований к ВО',
  'Стабильный спрос: +1 200 вакансий, рост 28% за год',
  'Живое общение и творчество: латте-арт, авторские напитки',
  'Возможность чаевых: +20–40% к зарплате в популярных заведениях',
  'Путь к собственному бизнесу — понимание операционки изнутри',
]

const CONS = [
  'Физически тяжело: 8–12 часов на ногах',
  'Низкий старт зарплаты: 25 000 ₽ в первые месяцы',
  'Сменный график: вечера, выходные, праздники',
  'Высокая нагрузка в часы пик (утро, обед)',
  'Ожоги паром и кофемашиной — типичный профриск',
  'Потолок зарплаты без перехода в управление — ~70 000 ₽',
]

const CAREER_STEPS = [
  {
    title: 'Стажёр', sub: '0–3 мес', min: 25000, max: 32000,
    tasks: [
      'Мытьё посуды, подготовка рабочего места',
      'Освоение кофемашины под наставником',
      'Изучение меню и сортов зерна',
      'Приём базовых заказов',
    ],
    share: '14% бариста на этом уровне',
    p10: 22000, p90: 38000,
  },
  {
    title: 'Бариста', sub: '3–12 мес', min: 35000, max: 45000,
    tasks: [
      'Самостоятельная работа за стойкой',
      'Эспрессо, капучино, латте, альтернативные методы',
      'Работа с кассой, ведение смены',
      'Поддержание чистоты и стандартов качества',
    ],
    share: '48% бариста на этом уровне',
    p10: 30000, p90: 52000,
  },
  {
    title: 'Старший бариста', sub: '1–2 года', min: 45000, max: 60000,
    tasks: [
      'Наставничество стажёров',
      'Контроль качества и калибровка кофемашины',
      'Закупка зерна и расходников',
      'Обучение команды латте-арту',
    ],
    share: '22% бариста на этом уровне',
    p10: 40000, p90: 68000,
  },
  {
    title: 'Управляющий кофейни', sub: '2–4 года', min: 60000, max: 90000,
    tasks: [
      'Управление сменами и графиком',
      'Финансовая отчётность и P&L',
      'Работа с поставщиками и арендодателем',
      'Маркетинг локальной точки',
    ],
    share: '12% бариста на этом уровне',
    p10: 55000, p90: 100000,
  },
  {
    title: 'Владелец / Франчайзи', sub: '3–5 лет', min: 80000, max: 200000,
    tasks: [
      'Открытие собственной точки или франшиза',
      'Бизнес-план, инвестиции, аренда локации',
      'Найм команды и построение процессов',
      'Масштабирование до сети',
    ],
    share: '4% бариста выходят в владельцы',
    p10: 60000, p90: 250000,
  },
]

const COURSES = [
  {
    school: 'Нетология', title: 'Профессия бариста с нуля',
    duration: '3 месяца', oldPrice: 89000, price: 44500, rating: 4.7,
    erid: '2VfnxwSmP13', inn: '7726460245',
  },
  {
    school: 'Skillbox', title: 'Бариста и кофейное дело',
    duration: '2 месяца', oldPrice: 65000, price: 32500, rating: 4.5,
    erid: '2VfnxwQKc9A', inn: '9704088865',
  },
  {
    school: 'Эдюсон', title: 'Кофейный мастер',
    duration: '6 недель', oldPrice: 45000, price: 22500, rating: 4.6,
    erid: '2VfnxwLz84M', inn: '7708323859',
  },
]

const NICHES = [
  { name: 'Кофейня',   salary: 85000, vacancies: 420, slug: 'кофейня' },
  { name: 'Ресторан',  salary: 48000, vacancies: 280, slug: 'ресторан' },
  { name: 'Пекарня',   salary: 40000, vacancies: 150, slug: 'пекарня' },
  { name: 'Отель',     salary: 45000, vacancies: 90,  slug: 'отель' },
  { name: 'Коворкинг', salary: 42000, vacancies: 35,  slug: 'коворкинг' },
  { name: 'Кейтеринг', salary: 50000, vacancies: 25,  slug: 'кейтеринг' },
]

const CITIES = [
  { name: 'Москва',           v: 58000 },
  { name: 'Санкт-Петербург',  v: 50000 },
  { name: 'Екатеринбург',     v: 42000 },
  { name: 'Краснодар',        v: 40000 },
  { name: 'Новосибирск',      v: 38000 },
  { name: 'Казань',           v: 37000 },
  { name: 'Нижний Новгород',  v: 36000 },
  { name: 'Самара',           v: 35000 },
  { name: 'Ростов-на-Дону',   v: 34000 },
  { name: 'Воронеж',          v: 33000 },
]
const CITY_BENCHMARK = 42000  // средняя по РФ для медианы по городам

const SIMILAR = [
  { name: 'Кондитер',    salary: 48000 },
  { name: 'Повар',       salary: 45000 },
  { name: 'Бармен',      salary: 40000 },
  { name: 'Официант',    salary: 35000 },
  { name: 'Сомелье',     salary: 65000 },
  { name: 'Кофе-мастер', salary: 55000 },
]

const FAQ_DATA = [
  {
    q: 'Сколько зарабатывает бариста в России в 2026 году?',
    a: 'Медиана — 42 000 ₽ в месяц. В Москве — около 58 000 ₽, в Петербурге — 50 000 ₽, в регионах диапазон 25 000–40 000 ₽. Опытный бариста с навыком латте-арта получает 48 000–62 000 ₽.',
  },
  {
    q: 'Как стать бариста с нуля?',
    a: 'Самый быстрый путь — курсы от 2 недель (базовый уровень) до 3 месяцев (полноценная профессия с практикой). Часть школ даёт возможность пройти стажировку в партнёрских кофейнях. Альтернатива — устроиться стажёром в кофейню без опыта, многие сети обучают за 2–4 недели.',
  },
  {
    q: 'Нужно ли высшее образование?',
    a: 'Нет. 92% вакансий не требуют высшего образования. Достаточно курсов (2–12 недель) или опыта работы в кофейне. Высшее образование не даёт преимуществ при найме на позицию бариста.',
  },
  {
    q: 'Какие навыки нужны бариста?',
    a: 'Базовые: приготовление эспрессо (87% вакансий), латте-арт (72%), работа с кофемолкой (65%), знание сортов кофе (42%). Soft skills: работа в команде (54%), стрессоустойчивость (48%), клиентоориентированность. Инструменты: кассовый аппарат (58%), кофемашина, альтернативные методы заваривания.',
  },
  {
    q: 'Можно ли работать удалённо?',
    a: 'Нет, бариста — офлайн-профессия по определению. Но есть смежные удалённые роли: кофейный блогер, обучение онлайн, кофе-консультант, cupper (дегустатор) для импортёров.',
  },
  {
    q: 'Востребована ли профессия в 2026 году?',
    a: 'Да. В апреле 2026 открыто 1 200 вакансий по России, рост 28% за год. Кофейный рынок продолжает расти — открываются новые точки и форматы to-go, особенно в городах от 300 тыс. населения.',
  },
  {
    q: 'Заменит ли нейросеть бариста?',
    a: 'Нет в обозримом будущем. Автоматические кофемашины существуют и используются в офисах, но гости кофеен ценят человеческий контакт, латте-арт и атмосферу. ИИ может помочь в аналитике продаж и подборе зерна, но не заменит бариста за стойкой.',
  },
  {
    q: 'Какие курсы лучше?',
    a: 'Для быстрого старта (стажёр через 2 недели) — интенсив на 2–4 недели. Для профессионального уровня — 3-месячный курс с практикой в партнёрской кофейне. Бюджетный вариант — бесплатные курсы от центра занятости (Работа России) с возможностью стипендии.',
  },
]

const PERCENTILE_INFO = {
  p10: {
    title: '10-й перцентиль — 25 000 ₽',
    body: '10% бариста зарабатывают меньше этой суммы. Это стажёры без опыта и сотрудники в малых городах с низкими ставками.',
  },
  p25: {
    title: '25-й перцентиль — 32 000 ₽',
    body: 'Нижняя граница «среднего» диапазона. Бариста с опытом до года в региональных кофейнях.',
  },
  p50: {
    title: 'Медиана — 42 000 ₽',
    body: 'Половина бариста получают больше, половина — меньше. Это более репрезентативный показатель, чем среднее арифметическое.',
  },
  p75: {
    title: '75-й перцентиль — 58 000 ₽',
    body: 'Верхняя граница «среднего» диапазона. Опытные бариста с навыком латте-арта в специализированных кофейнях крупных городов.',
  },
  p90: {
    title: '90-й перцентиль — 85 000 ₽',
    body: '10% бариста зарабатывают больше. Это старшие бариста и шеф-бариста в премиальных заведениях Москвы и Петербурга с большими чаевыми.',
  },
}

const PROF_TABS = [
  { id: 'zone1', label: 'Зарплата' },
  { id: 'zone2', label: 'Навыки' },
  { id: 'zone3', label: 'Карьера' },
  { id: 'zone4', label: 'Обучение' },
  { id: 'zone5', label: 'Города' },
  { id: 'zone6', label: 'FAQ' },
]

// ═══ PERCENTILE BAR ═══════════════════════════════════

function PercentileBar({ onDotClick }) {
  const { p10, p25, p50, p75, p90 } = PERCENTILES
  return (
    <div>
      {/* labels row — desktop absolute, mobile flex */}
      <div className="hidden sm:block relative h-5 mb-2">
        <span className="absolute text-[12px] font-num" style={{ left: `${scale(p25)}%`, transform: 'translateX(-50%)', color: 'var(--text-secondary)' }}>
          P25: <span className="font-semibold">{fmt(p25)} ₽</span>
        </span>
        <span className="absolute text-[12px] font-num font-semibold" style={{ left: `${scale(p50)}%`, transform: 'translateX(-50%)', color: 'var(--text-primary)' }}>
          P50: {fmt(p50)} ₽
        </span>
        <span className="absolute text-[12px] font-num" style={{ left: `${scale(p75)}%`, transform: 'translateX(-50%)', color: 'var(--text-secondary)' }}>
          P75: <span className="font-semibold">{fmt(p75)} ₽</span>
        </span>
      </div>
      <div className="sm:hidden flex items-baseline justify-between mb-2 text-[12px] font-num gap-1">
        <span style={{ color: 'var(--text-secondary)' }}>P25 · {fmt(p25)}</span>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>P50 · {fmt(p50)} ₽</span>
        <span style={{ color: 'var(--text-secondary)' }}>P75 · {fmt(p75)}</span>
      </div>

      {/* bar */}
      <div className="pbar">
        <div className="pbar-whisker" style={{ left: `${scale(p10)}%`, width: `${scale(p25) - scale(p10)}%` }} />
        <div className="pbar-whisker" style={{ left: `${scale(p75)}%`, width: `${scale(p90) - scale(p75)}%` }} />
        <div className="pbar-iqr" style={{ left: `${scale(p25)}%`, width: `${scale(p75) - scale(p25)}%` }} />
        <div className="pbar-median" style={{ left: `${scale(p50)}%` }} />
        <div className="pbar-benchmark" style={{ left: `${scale(AVG_RF)}%` }} />
        {['p10', 'p25', 'p50', 'p75', 'p90'].map((k) => (
          <button
            key={k}
            className="pbar-dot"
            style={{ left: `${scale(PERCENTILES[k])}%` }}
            onClick={() => onDotClick(k)}
            aria-label={PERCENTILE_INFO[k].title}
          />
        ))}
      </div>

      {/* axis ticks */}
      <div className="relative h-5 mt-1">
        {[20, 30, 40, 50, 60, 70, 80, 90].map((k) => (
          <span
            key={k}
            className="absolute text-[10px] font-num"
            style={{ left: `${scale(k * 1000)}%`, transform: 'translateX(-50%)', color: 'var(--text-muted)' }}
          >
            {k}K
          </span>
        ))}
      </div>

      {/* P10/P90 hints */}
      <div className="flex items-baseline justify-between mt-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span className="font-num">P10: {fmt(p10)} ₽</span>
        <span className="font-num">P90: {fmt(p90)} ₽</span>
      </div>

      {/* benchmark + range */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-block', width: 16, borderTop: '1px dashed var(--benchmark-line)' }} />
          Средняя по России: <span className="font-num">{fmt(AVG_RF)} ₽</span>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Диапазон: <span className="font-num">{fmt(p10)} ₽</span> — <span className="font-num">{fmt(p90)} ₽</span>
        </span>
      </div>
    </div>
  )
}

// ═══ GRADE ROW (IQR + median on common axis) ══════════

function GradeRow({ grade }) {
  return (
    <div className="grid grid-cols-[1fr_auto] md:grid-cols-[200px_1fr_200px] items-center gap-3 md:gap-4 py-2">
      <div>
        <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{grade.label}</p>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{grade.sub}</p>
      </div>
      <div className="col-span-2 md:col-span-1 order-3 md:order-none grade-row">
        <div
          className="grade-iqr"
          style={{ left: `${gscale(grade.p25)}%`, width: `${gscale(grade.p75) - gscale(grade.p25)}%` }}
        />
        <div className="grade-median" style={{ left: `${gscale(grade.p50)}%` }} />
      </div>
      <div className="text-right font-num text-[13px]">
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(grade.p50)} ₽</span>{' '}
        <span style={{ color: 'var(--text-muted)' }}>· {fmt(grade.p25)}–{fmt(grade.p75)}</span>
      </div>
    </div>
  )
}

function GradeAxis() {
  const marks = [20, 40, 60, 80, 100, 120]
  return (
    <div className="relative h-4 mt-2 md:ml-[200px] md:mr-[200px]">
      {marks.map((k) => (
        <span
          key={k}
          className="absolute text-[10px] font-num"
          style={{ left: `${gscale(k * 1000)}%`, transform: 'translateX(-50%)', color: 'var(--text-muted)' }}
        >
          {k}K
        </span>
      ))}
    </div>
  )
}

// ═══ SKILL ROW ═══════════════════════════════════════

function SkillRow({ name, v }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px]" style={{ color: 'var(--text-primary)' }}>{name}</span>
        <span className="font-num text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{v}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

// ═══ CITY BAR ═══════════════════════════════════════

function CityBar({ name, v, maxV, onClick }) {
  const widthPct = (v / maxV) * 100
  const benchPct = (CITY_BENCHMARK / maxV) * 100
  return (
    <div className="grid grid-cols-[140px_1fr_90px] items-center gap-3 py-1.5">
      <span className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>{name}</span>
      <div className="city-track">
        <div className="city-fill" style={{ width: `${widthPct}%` }} onClick={onClick} />
        <div
          style={{
            position: 'absolute',
            left: `${benchPct}%`,
            top: -4,
            bottom: -4,
            width: 0,
            borderLeft: '1px dashed var(--benchmark-line)',
          }}
        />
      </div>
      <span className="text-right font-num text-[13px]" style={{ color: 'var(--text-primary)' }}>
        {fmt(v)} ₽
      </span>
    </div>
  )
}

// ═══ COURSE CARD ═════════════════════════════════════

function CourseCard({ c }) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-[12px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{c.school}</p>
          <p className="text-[16px] font-semibold leading-[1.3]" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Star size={14} weight="fill" color="#FBBF24" />
          <span className="font-num text-[13px]" style={{ color: 'var(--text-secondary)' }}>{c.rating}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
        <Clock size={14} />
        <span>Длительность: {c.duration}</span>
      </div>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-num text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(c.price)} ₽</span>
        <span className="font-num text-[13px] line-through" style={{ color: 'var(--text-muted)' }}>{fmt(c.oldPrice)} ₽</span>
      </div>
      <div className="mb-4">
        <span
          className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          Скидка 50% по промокоду ATLAS
        </span>
      </div>
      <div className="flex-1" />
      <button
        className="w-full py-2.5 rounded-[8px] text-[14px] font-medium text-white flex items-center justify-center gap-1.5 mb-3"
        style={{ background: 'var(--accent)' }}
      >
        Начать обучение <ArrowRight size={14} weight="bold" />
      </button>
      <p className="text-[11px] leading-[1.4]" style={{ color: 'var(--text-muted)' }}>
        Реклама · {c.school} · ИНН {c.inn} · erid: {c.erid}
      </p>
    </Card>
  )
}

function FreeCourseCard() {
  return (
    <Card className="flex flex-col h-full" style={{ border: '1px solid var(--trend-up)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[12px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Работа России</p>
          <p className="text-[16px] font-semibold leading-[1.3]" style={{ color: 'var(--text-primary)' }}>
            Бесплатно от государства
          </p>
        </div>
        <span
          className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-medium shrink-0"
          style={{ color: 'var(--trend-up)', border: '1px solid var(--trend-up)', background: 'transparent' }}
        >
          Без оплаты
        </span>
      </div>
      <p className="text-[14px] leading-[1.5] mb-2" style={{ color: 'var(--text-secondary)' }}>
        Центр занятости: бесплатные курсы + стипендия от государства.
      </p>
      <p className="text-[12px] leading-[1.5] mb-4" style={{ color: 'var(--text-muted)' }}>
        Для безработных и ищущих работу — бесплатно при регистрации через портал trudvsem.ru.
      </p>
      <div className="flex-1" />
      <button
        className="w-full py-2.5 rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-1.5"
        style={{
          background: 'transparent',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
        }}
      >
        Узнать условия <ArrowRight size={14} weight="bold" />
      </button>
    </Card>
  )
}

// ═══ CAREER STEPPER ═══════════════════════════════════

function StepperNode({ n, filled = true }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-num text-[14px] font-bold shrink-0"
      style={{
        width: 40,
        height: 40,
        background: filled ? 'var(--accent)' : 'var(--bg-card)',
        color: filled ? '#fff' : 'var(--accent)',
        border: filled ? 'none' : '2px solid var(--accent)',
      }}
    >
      {n}
    </div>
  )
}

// ═══ WHERE NEEDED (niche card) ═══════════════════════

function NicheCard({ n }) {
  return (
    <a
      href={`#/niches/${n.slug}`}
      className="block transition-colors duration-150"
      style={{ textDecoration: 'none' }}
    >
      <Card hover className="h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{n.name}</span>
          <ArrowRight size={16} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div className="font-num text-[24px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {fmt(n.salary)} ₽
        </div>
        <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>медианная зарплата</div>
        <div className="flex items-center gap-2 text-[13px] pt-3 mt-3 border-t" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
          <Briefcase size={14} weight="duotone" color="#4F46E5" />
          <span className="font-num">{fmt(n.vacancies)}</span>
          <span>{pluralVac(n.vacancies)}</span>
        </div>
      </Card>
    </a>
  )
}

function pluralVac(n) {
  const abs = Math.abs(n) % 100
  const mod10 = abs % 10
  if (abs > 10 && abs < 20) return 'вакансий'
  if (mod10 > 1 && mod10 < 5) return 'вакансии'
  if (mod10 === 1) return 'вакансия'
  return 'вакансий'
}

// ═══ LINE CHART TOOLTIP ══════════════════════════════

function SalaryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-[8px] px-3 py-2 text-[12px]"
      style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}
    >
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="font-num" style={{ color: '#818CF8' }}>{fmt(payload[0].value)} ₽</p>
    </div>
  )
}

// ═══ MAIN COMPONENT ═══════════════════════════════════

export default function ProfessionPage() {
  const { toggle: toggleTheme, isDark } = useTheme()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeZone, setActiveZone] = useState('zone1')
  const [tabsVisible, setTabsVisible] = useState(false)
  const [scrollingDown, setScrollingDown] = useState(false)
  const [modal, setModal] = useState(null)  // {type, key?} or null
  const [faqOpen, setFaqOpen] = useState(0)
  const [emailDismissed, setEmailDismissed] = useState(false)
  const [slideEmail, setSlideEmail] = useState(false)
  const [mobileCTA, setMobileCTA] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // profession-specific state
  const [gradeKey, setGradeKey] = useState('experienced')
  const grade = GRADES.find((g) => g.key === gradeKey)
  const [skillFilter, setSkillFilter] = useState('Все')
  const [skillsExpanded, setSkillsExpanded] = useState(false)
  const [stepModal, setStepModal] = useState(null)
  const [citiesOpen, setCitiesOpen] = useState(false)

  const axisColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'

  // Responsive flag
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // IntersectionObserver for active tab
  useEffect(() => {
    const zones = PROF_TABS.map((t) => t.id)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveZone(e.target.id)
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )
    zones.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Scroll handler for tabs visibility, slide-in email, mobile CTA
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

  // Filtered skills
  const visibleSkills = useMemo(() => {
    const all = skillsExpanded ? [...SKILLS_PRIMARY, ...SKILLS_EXTRA] : SKILLS_PRIMARY
    if (skillFilter === 'Все') return all
    return all.filter((s) => s.cat === skillFilter)
  }, [skillFilter, skillsExpanded])

  const maxCity = Math.max(...CITIES.map((c) => c.v))

  const scrollToLearn = () => document.getElementById('zone4')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Header
        onMobileMenu={() => setMobileMenu(!mobileMenu)}
        mobileMenuOpen={mobileMenu}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        activeNav="professions"
      />
      <MobileMenu open={mobileMenu} activeNav="professions" />
      <StickyTabs tabs={PROF_TABS} activeZone={activeZone} visible={tabsVisible && !scrollingDown} />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* ═══════════════ ZONE 1 — IDENTIFICATION & SALARY ═══════════════ */}
        <section id="zone1" className="pt-6">

          {/* Block 1 — Breadcrumbs, H1, region selector, byline */}
          <div className="mb-6">
            <nav className="text-[13px] mb-3 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumbs">
              <span>Главная</span>
              <CaretRight size={10} />
              <span>Профессии</span>
              <CaretRight size={10} />
              <span>Сфера услуг</span>
              <CaretRight size={10} />
              <span style={{ color: 'var(--text-secondary)' }}>Бариста</span>
            </nav>
            <h1 className="font-onest text-[28px] md:text-[36px] font-bold leading-[1.15] mb-4" style={{ color: 'var(--text-primary)' }}>
              Профессия Бариста: зарплата, навыки и карьера в 2026 году
            </h1>
            <div className="mb-4">
              <select
                className="md:hidden w-full px-4 py-2.5 rounded-[8px] text-[13px] font-medium appearance-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option>Вся Россия</option>
                <option disabled>Москва (скоро)</option>
                <option disabled>Санкт-Петербург (скоро)</option>
                <option disabled>Екатеринбург (скоро)</option>
              </select>
              <div className="hidden md:flex gap-2 flex-wrap">
                {['Вся Россия', 'Москва', 'Санкт-Петербург', 'Екатеринбург'].map((r, i) => (
                  <button
                    key={r}
                    className="relative h-[36px] px-4 rounded-[18px] text-[13px] font-medium transition-colors duration-150"
                    style={{
                      background: i === 0 ? 'var(--accent)' : 'transparent',
                      color: i === 0 ? 'white' : 'var(--text-secondary)',
                      opacity: i === 0 ? 1 : 0.45,
                      border: i === 0 ? 'none' : '1px solid var(--border-default)',
                    }}
                    title={i !== 0 ? 'Данные скоро появятся' : undefined}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Подготовлено <a href="#/team" style={{ color: '#818CF8' }}>редакцией Atlas</a> · Обновлено 15 апреля 2026
            </p>
          </div>

          {/* Block 2 — Median hero + percentile bar */}
          <Card className="mb-6">
            <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Медиана зарплаты в России
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div className="salary-hero">
                {fmt(PERCENTILES.p50)} <span style={{ color: 'var(--text-primary)' }}>₽</span>
                <span className="text-[18px] font-medium ml-1" style={{ color: 'var(--text-muted)' }}>/мес</span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9999px] text-[13px] font-medium self-start md:self-end"
                style={{ background: 'var(--bg-dropdown)', color: 'var(--text-secondary)' }}
              >
                <TrendUp size={14} weight="bold" style={{ transform: 'scaleY(-1)' }} />
                <span className="font-num">−12%</span>
                к средней по стране
              </span>
            </div>

            <PercentileBar onDotClick={(k) => setModal({ type: 'percentile', key: k })} />

            <Source>HeadHunter, Trudvsem · апрель 2026 · выборка 8 400 вакансий</Source>
          </Card>

          {/* Block 3 — Grades (stack of 3 on common axis) */}
          <Card className="mb-6">
            <SectionTitle>Зарплата растёт в 2 раза за 3 года опыта</SectionTitle>

            {/* Desktop: stacked 3 rows */}
            <div className="hidden md:block">
              <div className="space-y-2">
                {GRADES.map((g) => (
                  <GradeRow key={g.key} grade={g} />
                ))}
              </div>
              <GradeAxis />
            </div>

            {/* Mobile: segmented control + selected row */}
            <div className="md:hidden">
              <div className="flex gap-1 mb-4 p-1 rounded-[10px]" style={{ background: 'var(--bg-dropdown)' }}>
                {GRADES.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGradeKey(g.key)}
                    className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors duration-150"
                    style={{
                      background: gradeKey === g.key ? 'var(--bg-card)' : 'transparent',
                      color: gradeKey === g.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                      border: gradeKey === g.key ? '1px solid var(--border-hover)' : '1px solid transparent',
                      minHeight: 44,
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Summary: medians of all 3 */}
              <div className="flex flex-wrap gap-2 mb-4 text-[12px]">
                {GRADES.map((g) => (
                  <span
                    key={g.key}
                    className="px-2 py-1 rounded-[6px] font-num"
                    style={{
                      background: gradeKey === g.key ? 'rgba(79,70,229,0.15)' : 'var(--bg-dropdown)',
                      color: gradeKey === g.key ? '#818CF8' : 'var(--text-secondary)',
                    }}
                  >
                    {g.label === 'Начинающий' ? 'Нач.' : g.label === 'Опытный' ? 'Опыт.' : 'Эксп.'}: {fmt(g.p50)} ₽
                  </span>
                ))}
              </div>

              <GradeRow grade={grade} />
              <GradeAxis />
            </div>

            <Source>HeadHunter · распределение по стажу, апрель 2026</Source>
          </Card>

          {/* Block 4 — 4 KPI cards (2x2 mobile, 4 cols desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <KpiCard
              gridMode
              icon={Briefcase}
              label="Вакансии"
              value={<span className="font-num">1 200</span>}
              context="↑ +340 за месяц"
              contextColor="var(--trend-up)"
              valueSize={28}
              onClick={() => setModal({ type: 'kpi-vacancies' })}
            />
            <KpiCard
              gridMode
              icon={TrendUp}
              label="Востребованность"
              value={<Badge color="#60A5FA" bg={`rgba(96,165,250, var(--badge-alpha))`}>Высокая</Badge>}
              context="+28% за год"
              valueSize={28}
              onClick={() => setModal({ type: 'kpi-demand' })}
            />
            <KpiCard
              gridMode
              icon={GraduationCap}
              label="Порог входа"
              value={<span style={{ fontFamily: 'Onest, sans-serif' }}>Курсы</span>}
              context="ВО не требуется"
              valueSize={28}
              onClick={() => setModal({ type: 'kpi-entry' })}
            />
            <KpiCard
              gridMode
              icon={Clock}
              label="Режим работы"
              value={<span style={{ fontFamily: 'Onest, sans-serif' }}>Сменный</span>}
              context="78% вакансий"
              valueSize={28}
              onClick={() => setModal({ type: 'kpi-schedule' })}
            />
          </div>
          <div id="kpi-end" />
        </section>

        {/* ═══════════════ ZONE 2 — DYNAMICS & SKILLS ═══════════════ */}
        <section id="zone2" className="mb-16">

          {/* Block 5 — Salary dynamics line chart */}
          <Card className="mb-8">
            <SectionTitle>Зарплата выросла на 17% за год — с 36 000 до 42 000 ₽</SectionTitle>
            <div className="h-[240px] md:h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SALARY_DYNAMICS} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    tickFormatter={(v) => (v / 1000).toFixed(0) + 'К'}
                  />
                  <Tooltip content={<SalaryTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#818CF8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#818CF8', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div
              className="mt-4 p-4 rounded-[8px] flex items-start gap-3"
              style={{ background: 'rgba(79,70,229,0.06)', borderLeft: '3px solid var(--accent)' }}
            >
              <Sparkle size={18} weight="duotone" color="#4F46E5" className="shrink-0 mt-0.5" />
              <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI-интерпретация. </span>
                Рост ускоряется последние 3 месяца — спрос на бариста растёт вместе с кофейным рынком. Ключевой драйвер — открытие новых точек в регионах и форматов to-go.
              </p>
            </div>
            <Source>HeadHunter · помесячная медиана, май 2025 — апрель 2026</Source>
          </Card>

          {/* Block 6 — Skills with filter pills */}
          <Card className="mb-8">
            <SectionTitle>Приготовление кофе и латте-арт — в 87% вакансий</SectionTitle>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Топ навыков бариста по данным 8 400 вакансий
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Все', 'Технические', 'Инструменты', 'Soft Skills'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSkillFilter(f)}
                  className="h-[36px] px-4 rounded-[18px] text-[13px] font-medium transition-colors duration-150"
                  style={{
                    background: skillFilter === f ? 'var(--accent)' : 'transparent',
                    color: skillFilter === f ? 'white' : 'var(--text-secondary)',
                    border: skillFilter === f ? 'none' : '1px solid var(--border-default)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {visibleSkills.map((s) => (
                <SkillRow key={s.name} name={s.name} v={s.v} />
              ))}
            </div>

            <button
              onClick={() => setSkillsExpanded((v) => !v)}
              className="mt-6 px-4 py-2 rounded-[8px] text-[13px] font-medium flex items-center gap-2"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              {skillsExpanded ? 'Скрыть' : 'Показать ещё'}
              <CaretDown
                size={14}
                style={{ transform: skillsExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
              />
            </button>

            <Source>HeadHunter · частота навыков в активных вакансиях, апрель 2026</Source>
          </Card>

          {/* CTA #1 — after skills */}
          <CTABanner
            heading="Не знаете, с чего начать? Подберём курс под ваш опыт и темп обучения"
            buttonText="Подобрать курс обучения"
            subNote="Бесплатно, за 2 минуты"
          />
        </section>

        {/* ═══════════════ ZONE 3 — CAREER & CONTENT ═══════════════ */}
        <section id="zone3" className="mb-16 mt-16">

          {/* Block 7 — AI profession description */}
          <Card className="mb-8">
            <SectionTitle>О профессии «Бариста»</SectionTitle>
            <div className="text-[15px] leading-[1.6] space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Бариста — это специалист по приготовлению кофейных напитков. Профессия включает в себя знание сортов зерна, степеней обжарки, работу с эспрессо-машиной и кофемолкой, а также технику латте-арта — рисования узоров на молочной пене. Бариста работает за стойкой и напрямую общается с гостями, поэтому коммуникативные навыки не менее важны, чем технические.
              </p>
              <p>
                Профессия особенно востребована в нише{' '}
                <a href="#/" style={{ color: '#818CF8', textDecoration: 'underline' }}>кофейня</a>{' '}
                — на специализированные заведения приходится около 35% всех вакансий. Остальной спрос распределён между ресторанами, отелями и пекарнями. В крупных городах появляются узкоспециализированные роли: head-бариста, cupper (дегустатор), обжарщик.
              </p>
              <p>
                Порог входа низкий: большинство работодателей готовы брать сотрудников без опыта, если есть базовая подготовка. Уже через 2 недели интенсивных курсов можно выйти на позицию стажёра, а через 3–6 месяцев — стать полноценным бариста. Для карьерного роста важно развивать и технические навыки (альтернативные методы заваривания, авторские напитки), и управленческие — в перспективе 3–5 лет есть возможность открыть{' '}
                <a href="#/" style={{ color: '#818CF8', textDecoration: 'underline' }}>собственную кофейню</a>.
              </p>
              <p>
                Главные минусы — физическая нагрузка (8–12 часов на ногах) и сменный график, включая вечера и выходные. Плюсы — живое общение, творческая составляющая, стабильный рынок и быстрый старт карьеры без высшего образования.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <Sparkle size={12} weight="duotone" color="#4F46E5" />
              AI-анализ на основе 8 источников данных: HeadHunter, Trudvsem, Росстат, Яндекс.Трудоустройство, отраслевые исследования 2024–2026
            </div>
          </Card>

          {/* Block 8 — Pros / Cons */}
          <Card className="mb-8">
            <SectionTitle>Быстрый старт без образования — но физически тяжёлая работа</SectionTitle>
            <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Объективный взгляд на плюсы и минусы
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--trend-up)' }}>Плюсы</p>
                <div className="space-y-3">
                  {PROS.map((p, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={18} weight="fill" color="var(--trend-up)" className="mt-0.5 shrink-0" />
                      <span className="text-[14px] leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--trend-down)' }}>Минусы</p>
                <div className="space-y-3">
                  {CONS.map((c, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <XCircle size={18} weight="fill" color="var(--trend-down)" className="mt-0.5 shrink-0" />
                      <span className="text-[14px] leading-[1.5]" style={{ color: 'var(--text-secondary)' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Block 9 — Career stepper */}
          <Card className="mb-8">
            <SectionTitle>От стажёра до владельца кофейни за 3–5 лет</SectionTitle>
            <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
              5 карьерных ступеней и типичная зарплата на каждой
            </p>

            {/* Desktop: horizontal stepper */}
            <div className="hidden lg:grid grid-cols-5 gap-3">
              {CAREER_STEPS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStepModal(i)}
                  className="text-left p-4 rounded-[12px] transition-colors duration-150 flex flex-col gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                >
                  <div className="flex items-center gap-2.5">
                    <StepperNode n={i + 1} />
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-num text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {fmt(s.min)}–{fmt(s.max)} ₽
                    </p>
                    <div className="mini-range mt-2">
                      <div
                        className="mini-range-fill"
                        style={{
                          left: `${((s.min - 25000) / 175000) * 100}%`,
                          width: `${((s.max - s.min) / 175000) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] mt-1" style={{ color: '#818CF8' }}>
                    Подробнее →
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile / tablet: vertical stepper */}
            <div className="lg:hidden space-y-0">
              {CAREER_STEPS.map((s, i) => (
                <div key={i} className="flex gap-4 pb-5 relative last:pb-0">
                  <div className="flex flex-col items-center">
                    <StepperNode n={i + 1} />
                    {i < CAREER_STEPS.length - 1 && (
                      <div className="flex-1 w-0.5 mt-1" style={{ background: 'var(--accent)', opacity: 0.4, minHeight: 32 }} />
                    )}
                  </div>
                  <button
                    onClick={() => setStepModal(i)}
                    className="flex-1 text-left p-4 rounded-[12px] transition-colors duration-150"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                      <div>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
                      </div>
                      <p className="font-num text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {fmt(s.min)}–{fmt(s.max)} ₽
                      </p>
                    </div>
                    <div className="mini-range mb-2">
                      <div
                        className="mini-range-fill"
                        style={{
                          left: `${((s.min - 25000) / 175000) * 100}%`,
                          width: `${((s.max - s.min) / 175000) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px]" style={{ color: '#818CF8' }}>
                      Подробнее →
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Step 5 link: open your coffeeshop */}
            <div className="mt-6 p-4 rounded-[8px] flex items-center justify-between gap-3 flex-wrap" style={{ background: 'rgba(79,70,229,0.06)' }}>
              <div className="flex items-center gap-2 text-[14px]" style={{ color: 'var(--text-primary)' }}>
                <Lightbulb size={18} weight="duotone" color="#4F46E5" />
                <span>Следующий шаг — открыть свою кофейню</span>
              </div>
              <a
                href="#/"
                className="text-[13px] font-medium flex items-center gap-1"
                style={{ color: '#818CF8' }}
              >
                Открыть нишу «Кофейня» <ArrowRight size={12} weight="bold" />
              </a>
            </div>
          </Card>

          {/* Block 10 — Expert quote (HIDDEN via feature flag) */}
          {SHOW_EXPERT_QUOTE && (
            <Card className="mb-8" style={{ borderLeft: '3px solid var(--accent)' }}>
              {/* Placeholder — never renders while SHOW_EXPERT_QUOTE = false */}
            </Card>
          )}
        </section>

        {/* ═══════════════ ZONE 4 — LEARNING ═══════════════ */}
        <section id="zone4" className="mb-16">

          {/* Block 11 — CPA courses (3 paid + 1 free) */}
          <div className="mb-8">
            <SectionTitle>Курсы для бариста: от 2 недель до профессионального уровня</SectionTitle>
            <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
              3 платных курса с промокодом ATLAS и 1 бесплатная альтернатива
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COURSES.map((c) => (
                <CourseCard key={c.school} c={c} />
              ))}
              <FreeCourseCard />
            </div>
            <Source>Данные о курсах от партнёров Atlas · апрель 2026 · промокод действует до 30 июня 2026</Source>
          </div>

          {/* CTA #2 — after courses */}
          <CTABanner
            heading="Нужна помощь с выбором? Построим персональный план: от курса до первой работы"
            buttonText="Построить карьерный план"
            subNote="Бесплатно, за 5 минут"
          />

          {/* Block 12 — Where barista is needed (profession → niche) */}
          <div className="mt-10">
            <SectionTitle>Бариста нужен не только в кофейнях — 6 ниш с вакансиями</SectionTitle>
            <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
              Перейдите в нишу, чтобы открыть полный отчёт
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NICHES.map((n) => (
                <NicheCard key={n.slug} n={n} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ ZONE 5 — CITIES ═══════════════ */}
        <section id="zone5" className="mb-16">

          {/* Block 13 — Cities */}
          <Card className="mb-8">
            <SectionTitle>В Москве бариста получает на 40% больше, чем в среднем по стране</SectionTitle>
            <p className="text-[14px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Медианная зарплата в топ-10 городов
            </p>

            {/* Desktop: always expanded */}
            <div className="hidden md:block">
              <div className="space-y-1">
                {CITIES.map((c) => (
                  <CityBar
                    key={c.name}
                    name={c.name}
                    v={c.v}
                    maxV={maxCity}
                    onClick={() => setModal({ type: 'city', data: c })}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-block', width: 16, borderTop: '1px dashed var(--benchmark-line)' }} />
                Средняя по России: <span className="font-num">{fmt(CITY_BENCHMARK)} ₽</span>
              </div>
            </div>

            {/* Mobile: accordion */}
            <div className="md:hidden">
              <button
                onClick={() => setCitiesOpen(!citiesOpen)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-[8px]"
                style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}
              >
                <span className="flex items-center gap-2 text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  <MapPin size={16} weight="duotone" color="#4F46E5" />
                  {citiesOpen ? 'Скрыть города' : 'Показать все 10 городов'}
                </span>
                <CaretDown
                  size={16}
                  style={{
                    color: 'var(--text-secondary)',
                    transform: citiesOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 250ms',
                  }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-250"
                style={{ maxHeight: citiesOpen ? '800px' : '0px' }}
              >
                <div className="space-y-1 mt-4">
                  {CITIES.map((c) => (
                    <CityBar
                      key={c.name}
                      name={c.name}
                      v={c.v}
                      maxV={maxCity}
                      onClick={() => setModal({ type: 'city', data: c })}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-block', width: 16, borderTop: '1px dashed var(--benchmark-line)' }} />
                  Средняя по России: <span className="font-num">{fmt(CITY_BENCHMARK)} ₽</span>
                </div>
              </div>
            </div>

            <Source>HeadHunter · медиана зарплат по городам, апрель 2026</Source>
          </Card>

          {/* Block 14 — Similar professions */}
          <div className="mb-8">
            <SectionTitle>Похожие профессии</SectionTitle>
            <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Близкие по навыкам и отрасли
            </p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {SIMILAR.map((p) => (
                <Card key={p.name} hover className="min-w-[200px] shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                    style={{ background: 'rgba(79,70,229,0.15)' }}
                  >
                    <Coffee size={20} weight="duotone" color="#4F46E5" />
                  </div>
                  <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>медиана</p>
                  <p className="font-num text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {fmt(p.salary)} ₽
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ ZONE 6 — FAQ & MORE ═══════════════ */}
        <section id="zone6" className="mb-16">

          {/* Block 15 — FAQ */}
          <Card className="mb-8">
            <SectionTitle>Частые вопросы</SectionTitle>
            <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              8 главных вопросов о профессии бариста
            </p>
            <div>
              {FAQ_DATA.map((item, i) => (
                <FAQItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  open={faqOpen === i}
                  onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)}
                />
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: FAQ_DATA.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                  })),
                }),
              }}
            />
          </Card>

          {/* Block 16 — Related articles */}
          <div className="mb-8">
            <SectionTitle>Статьи по теме</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card hover>
                <div className="flex items-center gap-2 text-[12px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  <BookOpen size={14} />
                  Гайд · 12 минут
                </div>
                <p className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Как открыть кофейню в 2026 году
                </p>
                <p className="text-[13px] leading-[1.5] mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Пошаговый разбор: аренда, оборудование, меню, команда. Реальные цифры окупаемости.
                </p>
                <span className="text-[13px] font-medium flex items-center gap-1" style={{ color: '#818CF8' }}>
                  Читать <ArrowRight size={12} weight="bold" />
                </span>
              </Card>
              <Card hover>
                <div className="flex items-center gap-2 text-[12px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  <BookOpen size={14} />
                  Статья · 8 минут
                </div>
                <p className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  10 ошибок начинающего бариста
                </p>
                <p className="text-[13px] leading-[1.5] mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Разбор частых ошибок за стойкой и на собеседовании. От темп-тампера до общения с гостями.
                </p>
                <span className="text-[13px] font-medium flex items-center gap-1" style={{ color: '#818CF8' }}>
                  Читать <ArrowRight size={12} weight="bold" />
                </span>
              </Card>
            </div>
          </div>

          {/* Block 17 — Email lead magnet */}
          <div className="mb-8 p-6 md:p-8 rounded-[16px]" style={{ background: 'rgba(79,70,229, 0.06)' }}>
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: 'rgba(79,70,229,0.15)' }}
              >
                <EnvelopeSimple size={22} weight="duotone" color="#4F46E5" />
              </div>
              <div>
                <h3 className="text-[18px] md:text-[20px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Получите PDF-гайд: как стать бариста за 3 месяца — дорожная карта
                </h3>
                <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                  Бесплатно, на email. Плюс ежемесячные обновления зарплат и новые курсы.
                </p>
              </div>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 max-w-[520px]" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-[8px] text-[14px] outline-none"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-[8px] text-[14px] font-medium text-white whitespace-nowrap flex items-center justify-center gap-1.5"
                style={{ background: 'var(--accent)' }}
              >
                Получить гайд <ArrowRight size={14} weight="bold" />
              </button>
            </form>
            <p className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Нажимая кнопку, вы соглашаетесь с <a href="#" style={{ color: '#818CF8' }}>политикой обработки персональных данных</a>.
            </p>
          </div>

          {/* CTA #3 — personal plan */}
          <div className="mb-8">
            <CTABanner
              heading="Персональный план от консультанта Atlas"
              buttonText="Получить персональный план"
              subNote="Бесплатная консультация — 30 минут"
            />
          </div>

          {/* Block 18 — Sources + disclaimer + RSYA */}
          <div className="py-8 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>
              Подготовлено редакцией <span style={{ color: '#818CF8' }}>Atlas</span> · Обновлено 15 апреля 2026 · Следующее обновление — 15 мая 2026
            </p>
            <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Источники данных</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { k: 'Зарплаты',   v: 'HeadHunter',  d: '8 400 вакансий' },
                { k: 'Вакансии',   v: 'Trudvsem',    d: 'Портал «Работа России»' },
                { k: 'Статистика', v: 'Росстат',     d: 'Официальные данные 2024–2025' },
              ].map((s) => (
                <div
                  key={s.k}
                  className="p-4 rounded-[8px]"
                  style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-default)' }}
                >
                  <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>{s.k}</p>
                  <p className="text-[14px] font-medium" style={{ color: '#818CF8' }}>{s.v}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{s.d}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] leading-[1.5] mb-6" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Дисклеймер.</strong> Данные носят справочный характер и основаны на публичных источниках. Реальная зарплата может отличаться в зависимости от работодателя, региона и индивидуальных навыков. Atlas не является кадровым агентством и не гарантирует трудоустройство. Для принятия решений рекомендуется консультироваться со специалистами.
            </p>

            {SHOW_RSY && (
              <div
                className="p-4 text-center rounded-[8px]"
                style={{
                  border: '1px dashed var(--border-default)',
                  minHeight: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Info size={14} /> РСЯ рекламный блок · placeholder 728×90
                </span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ─── OVERLAYS ─── */}

      {/* Percentile explanation modal */}
      <Modal
        open={modal?.type === 'percentile'}
        onClose={() => setModal(null)}
        title={modal?.type === 'percentile' ? PERCENTILE_INFO[modal.key].title : ''}
      >
        <p className="text-[14px] leading-[1.55]" style={{ color: 'var(--text-secondary)' }}>
          {modal?.type === 'percentile' ? PERCENTILE_INFO[modal.key].body : ''}
        </p>
      </Modal>

      {/* City detail modal */}
      <Modal
        open={modal?.type === 'city'}
        onClose={() => setModal(null)}
        title={modal?.type === 'city' ? modal.data.name : ''}
      >
        {modal?.type === 'city' && (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="font-num text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(modal.data.v)} ₽</span>
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>медианная зарплата</span>
            </div>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              Относительно среднего по России ({fmt(CITY_BENCHMARK)} ₽):{' '}
              <span className="font-num font-semibold" style={{ color: modal.data.v >= CITY_BENCHMARK ? 'var(--trend-up)' : 'var(--text-secondary)' }}>
                {modal.data.v >= CITY_BENCHMARK ? '+' : ''}
                {Math.round(((modal.data.v - CITY_BENCHMARK) / CITY_BENCHMARK) * 100)}%
              </span>
            </p>
            <p className="text-[12px] pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-default)' }}>
              Источник: HeadHunter · апрель 2026
            </p>
          </div>
        )}
      </Modal>

      {/* Career step modal */}
      <Modal
        open={stepModal !== null}
        onClose={() => setStepModal(null)}
        title={stepModal !== null ? `${stepModal + 1}. ${CAREER_STEPS[stepModal].title}` : ''}
      >
        {stepModal !== null && (
          <div className="space-y-4">
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{CAREER_STEPS[stepModal].sub}</p>

            <div>
              <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Диапазон зарплаты P10–P90
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-num text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {fmt(CAREER_STEPS[stepModal].min)}–{fmt(CAREER_STEPS[stepModal].max)} ₽
                </span>
              </div>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Крайние значения (P10 / P90): <span className="font-num">{fmt(CAREER_STEPS[stepModal].p10)}</span> / <span className="font-num">{fmt(CAREER_STEPS[stepModal].p90)}</span> ₽
              </p>
            </div>

            <div>
              <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Типичные задачи
              </p>
              <ul className="space-y-1.5">
                {CAREER_STEPS[stepModal].tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} weight="fill" color="#818CF8" className="mt-1 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="p-3 rounded-[8px] text-[13px]"
              style={{ background: 'var(--bg-dropdown)', color: 'var(--text-secondary)' }}
            >
              <Users size={14} weight="duotone" color="#4F46E5" className="inline mr-1.5 align-text-bottom" />
              {CAREER_STEPS[stepModal].share}
            </div>
          </div>
        )}
      </Modal>

      {/* KPI modals */}
      <Modal
        open={modal?.type === 'kpi-vacancies'}
        onClose={() => setModal(null)}
        title="Вакансии: 1 200 на рынке"
      >
        <p className="text-[14px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          Активные вакансии на HeadHunter по запросу «бариста». За апрель 2026 открыто +340 новых позиций. Рост 28% год к году.
        </p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Источник: HeadHunter · апрель 2026</p>
      </Modal>
      <Modal
        open={modal?.type === 'kpi-demand'}
        onClose={() => setModal(null)}
        title="Востребованность: высокая"
      >
        <p className="text-[14px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          Соотношение вакансий к активным резюме — один из самых высоких показателей в сфере услуг. На каждое резюме приходится 1,8 вакансии.
        </p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Источник: HeadHunter · HH Ratio, апрель 2026</p>
      </Modal>
      <Modal
        open={modal?.type === 'kpi-entry'}
        onClose={() => setModal(null)}
        title="Порог входа: курсы"
      >
        <p className="text-[14px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          92% вакансий не требуют высшего образования. Достаточно курсов (2–12 недель) или опыта работы в кофейне. Часть сетевых заведений обучает стажёров с нуля за 2–4 недели.
        </p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Источник: AI-анализ 8 400 вакансий · апрель 2026</p>
      </Modal>
      <Modal
        open={modal?.type === 'kpi-schedule'}
        onClose={() => setModal(null)}
        title="Режим работы: сменный"
      >
        <p className="text-[14px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          78% вакансий — сменный график (2/2, 3/3 или 5/2). Вечерние смены и работа по выходным — норма для профессии. Полностью дневной график встречается только в корпоративных кофейнях.
        </p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Источник: HeadHunter · апрель 2026</p>
      </Modal>

      <SlideInEmail
        visible={slideEmail && !emailDismissed}
        onClose={() => setEmailDismissed(true)}
        title="Не упустите новые курсы"
        body="Ежемесячные обновления зарплат бариста и новые курсы на email"
        buttonText="Получить гайд"
      />
      <MobileStickyCTA
        visible={mobileCTA && isMobile}
        text="Подобрать курс"
        sub="Бесплатно"
        onClick={scrollToLearn}
      />
    </div>
  )
}
