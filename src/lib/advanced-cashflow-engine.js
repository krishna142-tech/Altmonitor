/*
 * advanced-cashflow-engine.js (ESM)
 *
 * Advanced, extensible loan cashflow engine for portfolio monitoring.
 * - Uses Luxon for robust date handling
 * - Uses Decimal.js for precise monetary math
 * - Customizable day count and business day conventions
 * - Modular event handlers (extensible registry)
 * - Suitable for DB persistence and portfolio aggregation
 *
 * Exports:
 *   - generateLoanSchedule(loan, events, options)
 *   - aggregateByInvestor(loanSchedules, options)
 *   - registerEventHandler(type, handler)
 *   - builtInHandlers (for reference/extension)
 */

import { DateTime } from 'luxon'
import Decimal from 'decimal.js'

// --------------------------
// Defaults / Precision
// --------------------------
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

// --------------------------
// Utilities: Dates & Formatting
// --------------------------
/**
 * @typedef {Object} CalendarOptions
 * @property {string[]} [holidays] - ISO date strings, e.g. ['2025-01-26']
 * @property {(dt: DateTime) => boolean} [isHoliday] - Optional custom function to determine holidays
 * @property {number[]} [weekend] - Weekday numbers considered weekend, default [6,7] (Sat=6, Sun=7 in Luxon)
 */

const iso = (dt) => dt.toISODate()
const parseISO = (s) => DateTime.fromISO(s, { zone: 'utc' })

function addMonthsPreserveDOM(dt, months, { preserveEOM = true } = {}) {
  // Preserve end-of-month if applicable
  const isEOM = dt.plus({ days: 1 }).month !== dt.month
  const moved = dt.plus({ months })
  if (preserveEOM && isEOM) {
    const end = moved.endOf('month')
    return end
  }
  // If original DOM > days in new month, Luxon auto-adjusts to EOM
  return moved
}

function daysBetween(start, end) {
  return end.startOf('day').diff(start.startOf('day'), 'days').days
}

// --------------------------
// Day Count Conventions
// --------------------------
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function dayCountFraction(start, end, convention = 'ACT/360') {
  const s = start.startOf('day')
  const e = end.startOf('day')
  const dd = e.diff(s, 'days').days

  switch (String(convention).toUpperCase()) {
    case 'ACT/360':
      return { yearFraction: dd / 360, days: dd }
    case 'ACT/365':
      return { yearFraction: dd / 365, days: dd }
    case 'ACT/365L': {
      const years = []
      for (let y = s.year; y <= e.year; y++) years.push(y)
      const includesLeap = years.some(isLeapYear)
      return { yearFraction: dd / (includesLeap ? 366 : 365), days: dd }
    }
    case '30/360':
    case '30/360 US': {
      let d1 = Math.min(s.day, 30)
      let d2 = e.day
      if (s.day === 31) d1 = 30
      if (e.day === 31 && d1 === 30) d2 = 30
      const dd30 = 360 * (e.year - s.year) + 30 * (e.month - s.month) + (d2 - d1)
      return { yearFraction: dd30 / 360, days: dd30 }
    }
    case '30E/360': {
      const d1 = Math.min(s.day, 30)
      const d2 = Math.min(e.day, 30)
      const dd30 = 360 * (e.year - s.year) + 30 * (e.month - s.month) + (d2 - d1)
      return { yearFraction: dd30 / 360, days: dd30 }
    }
    default:
      throw new Error(`Unsupported day count: ${convention}`)
  }
}

// --------------------------
// Business Day Adjustment
// --------------------------
function defaultIsHoliday(dt, holidays = []) {
  return holidays.includes(dt.toISODate())
}

/**
 * @param {DateTime} dt
 * @param {'FOLLOWING'|'PRECEDING'|'MODIFIED_FOLLOWING'|'NONE'} convention
 * @param {CalendarOptions} calendar
 */
function adjustBusinessDay(dt, convention = 'FOLLOWING', calendar = {}) {
  if (!dt || convention === 'NONE') return dt

  const weekends = calendar.weekend || [6, 7] // Luxon: Monday 1 ... Sunday 7
  const holidayCheck = calendar.isHoliday || ((d) => defaultIsHoliday(d, calendar.holidays || []))

  const isHolidayOrWeekend = (d) => weekends.includes(d.weekday) || holidayCheck(d)

  if (!isHolidayOrWeekend(dt)) return dt

  const origMonth = dt.month

  if (convention.toUpperCase() === 'FOLLOWING') {
    let moved = dt
    while (isHolidayOrWeekend(moved)) moved = moved.plus({ days: 1 })
    return moved
  }
  if (convention.toUpperCase() === 'PRECEDING') {
    let moved = dt
    while (isHolidayOrWeekend(moved)) moved = moved.minus({ days: 1 })
    return moved
  }
  if (
    convention.toUpperCase() === 'MODIFIED_FOLLOWING' ||
    convention.toUpperCase() === 'MODIFIEDFOLLOWING' ||
    convention.toUpperCase() === 'MODFOLLOWING'
  ) {
    let moved = dt
    while (isHolidayOrWeekend(moved)) moved = moved.plus({ days: 1 })
    if (moved.month !== origMonth) {
      let movedBack = dt
      while (isHolidayOrWeekend(movedBack)) movedBack = movedBack.minus({ days: 1 })
      return movedBack
    }
    return moved
  }
  return dt
}

// --------------------------
// FX & Index Helpers
// --------------------------
function buildEventMaps(events) {
  const fxMap = new Map() // key: `${date}:${from}->${to}` => rate Decimal
  const indexMap = new Map() // key: `${index}:${date}` => Decimal
  const refRateMap = new Map() // key: `${date}` => Decimal

  for (const ev of events || []) {
    if (ev.type === 'fx_update') {
      fxMap.set(`${ev.date}:${ev.fromCurrency}->${ev.toCurrency}`, new Decimal(ev.rate || 1))
    } else if (ev.type === 'index_update') {
      indexMap.set(`${ev.indexName}:${ev.date}`, new Decimal(ev.value || 0))
    } else if (ev.type === 'refRate_update') {
      refRateMap.set(ev.date, new Decimal(ev.rate || 0))
    }
  }
  return { fxMap, indexMap, refRateMap }
}

function getRefRateForDate(loan, refRateMap, dateISO) {
  if (typeof loan.refRateFn === 'function') {
    const r = loan.refRateFn(dateISO)
    return new Decimal(r || 0)
  }
  // latest <= date
  const keys = [...refRateMap.keys()].filter((k) => k <= dateISO).sort()
  return keys.length ? new Decimal(refRateMap.get(keys[keys.length - 1])) : new Decimal(loan.refRate || 0)
}

function getIndexValue(indexMap, indexName, dateISO) {
  const keys = [...indexMap.keys()].filter((k) => k.startsWith(`${indexName}:`))
  const candidates = keys
    .map((k) => ({ k, date: k.split(':')[1] }))
    .filter((c) => c.date <= dateISO)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!candidates.length) return null
  return new Decimal(indexMap.get(candidates[candidates.length - 1].k) || 0)
}

function getFXRate(fxMap, fromCurrency, toCurrency, dateISO) {
  if (!fromCurrency || fromCurrency === toCurrency) return new Decimal(1)
  const exactKey = `${dateISO}:${fromCurrency}->${toCurrency}`
  if (fxMap.has(exactKey)) return new Decimal(fxMap.get(exactKey))

  const keys = [...fxMap.keys()].filter((k) => k.endsWith(`${fromCurrency}->${toCurrency}`))
  const candidates = keys
    .map((k) => ({ k, date: k.split(':')[0] }))
    .filter((c) => c.date <= dateISO)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (candidates.length) return new Decimal(fxMap.get(candidates[candidates.length - 1].k))

  // try reverse
  const revKeys = [...fxMap.keys()].filter((k) => k.endsWith(`${toCurrency}->${fromCurrency}`))
  const revCandidates = revKeys
    .map((k) => ({ k, date: k.split(':')[0] }))
    .filter((c) => c.date <= dateISO)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (revCandidates.length) {
    const r = new Decimal(fxMap.get(revCandidates[revCandidates.length - 1].k) || 1)
    return r.equals(0) ? new Decimal(1) : new Decimal(1).div(r)
  }
  return new Decimal(1)
}

// --------------------------
// Event Registry (Extensible)
// --------------------------
/**
 * Handlers receive (ctx, ev, dateISO) and can mutate ctx state and row fields.
 * ctx: { facility, outstanding, draws, loan, maps, options }
 * row: supplied via ctx.currentRow when generating periods
 */
const builtInHandlers = {
  drawdown(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.outstanding = ctx.outstanding.plus(amt)
    ctx.draws.push({ date: dateISO, amount: amt, currency: ev.currency || ctx.loan.currency })
    ctx.currentRow.eventsApplied.push({ type: 'drawdown', date: dateISO, amount: amt.toNumber(), currency: ev.currency })
  },
  prepayment(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    const feePct = new Decimal(ev.feePct || 0)
    const fee = amt.times(feePct)
    ctx.outstanding = Decimal.max(new Decimal(0), ctx.outstanding.minus(amt))
    ctx.currentRow.prepaymentAmount = ctx.currentRow.prepaymentAmount.plus(amt)
    ctx.currentRow.prepaymentFee = ctx.currentRow.prepaymentFee.plus(fee)
    ctx.currentRow.eventsApplied.push({ type: 'prepayment', date: dateISO, amount: amt.toNumber(), fee: fee.toNumber(), currency: ev.currency })
  },
  commitment_upsize(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.facility = ctx.facility.plus(amt)
    ctx.currentRow.eventsApplied.push({ type: 'commitment_upsize', date: dateISO, amount: amt.toNumber(), facilityAfter: ctx.facility.toNumber() })
  },
  commitment_downsize(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.facility = Decimal.max(new Decimal(0), ctx.facility.minus(amt))
    ctx.currentRow.eventsApplied.push({ type: 'commitment_downsize', date: dateISO, amount: amt.toNumber(), facilityAfter: ctx.facility.toNumber() })
  },
  commitment_change(ctx, ev, dateISO) {
    ctx.facility = new Decimal(ev.newFacilityAmount || 0)
    ctx.currentRow.eventsApplied.push({ type: 'commitment_change', date: dateISO, newFacility: ctx.facility.toNumber() })
  },
  amortisation(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    const idx = new Decimal(ev.indexedAmount || 0)
    const received = !!ev.received
    const pipAmort = !!(ctx.loan.pip && ctx.loan.pip.amortisation)

    if (pipAmort && !received) {
      ctx.currentRow.indexedAmortisationAmountDue = ctx.currentRow.indexedAmortisationAmountDue.plus(idx)
      ctx.currentRow.amortisationDue = ctx.currentRow.amortisationDue.plus(amt)
    } else {
      ctx.outstanding = Decimal.max(new Decimal(0), ctx.outstanding.minus(amt))
      ctx.currentRow.amortisationDue = ctx.currentRow.amortisationDue.plus(amt.plus(idx))
      if (received) {
        ctx.currentRow.amortisationReceived = ctx.currentRow.amortisationReceived.plus(amt)
        ctx.currentRow.indexedAmortisationAmountReceived = ctx.currentRow.indexedAmortisationAmountReceived.plus(idx)
      }
    }
    ctx.currentRow.eventsApplied.push({ type: 'amortisation', date: dateISO, amount: amt.toNumber(), indexed: idx.toNumber(), received })
  },
  interest_payment(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.currentRow.interestAmountReceived = ctx.currentRow.interestAmountReceived.plus(amt)
    ctx.currentRow.eventsApplied.push({ type: 'interest_payment', date: dateISO, amount: amt.toNumber(), currency: ev.currency })
  },
  payment_in_kind(ctx, ev, dateISO) {
    const kind = ev.kind
    const amt = new Decimal(ev.amount || 0)
    if (kind === 'interest') {
      ctx.currentRow.indexedInterestAmountDue = ctx.currentRow.indexedInterestAmountDue.plus(amt)
      ctx.currentRow.eventsApplied.push({ type: 'payment_in_kind', date: dateISO, kind: 'interest', amount: amt.toNumber() })
    } else if (kind === 'amortisation') {
      ctx.currentRow.indexedAmortisationAmountDue = ctx.currentRow.indexedAmortisationAmountDue.plus(amt)
      ctx.currentRow.eventsApplied.push({ type: 'payment_in_kind', date: dateISO, kind: 'amortisation', amount: amt.toNumber() })
    }
  },
  fx_update(ctx, ev, dateISO) {
    ctx.maps.fxMap.set(`${dateISO}:${ev.fromCurrency}->${ev.toCurrency}`, new Decimal(ev.rate || 1))
    ctx.currentRow.eventsApplied.push({ type: 'fx_update', date: dateISO, from: ev.fromCurrency, to: ev.toCurrency, rate: Number(ev.rate || 1) })
  },
  index_update(ctx, ev, dateISO) {
    ctx.maps.indexMap.set(`${ev.indexName}:${dateISO}`, new Decimal(ev.value || 0))
    ctx.currentRow.eventsApplied.push({ type: 'index_update', date: dateISO, indexName: ev.indexName, value: Number(ev.value || 0) })
  },
  commitment_fee_payment(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.currentRow.commitmentFeeReceived = ctx.currentRow.commitmentFeeReceived.plus(amt)
    ctx.currentRow.eventsApplied.push({ type: 'commitment_fee_payment', date: dateISO, amount: amt.toNumber() })
  },
  refRate_update(ctx, ev, dateISO) {
    ctx.maps.refRateMap.set(dateISO, new Decimal(ev.rate || 0))
    ctx.currentRow.eventsApplied.push({ type: 'refRate_update', date: dateISO, rate: Number(ev.rate || 0) })
  }
}

const handlerRegistry = new Map(Object.entries(builtInHandlers))
export function registerEventHandler(type, handler) {
  handlerRegistry.set(type, handler)
}

// --------------------------
// Core Engine
// --------------------------
/**
 * @typedef {Object} LoanInput
 * @property {string} loanId
 * @property {string} investorId
 * @property {string} borrowerId
 * @property {string} currency
 * @property {string} [baseCurrency]
 * @property {number|string} facilityAmount
 * @property {{date:string, amount:number|string, currency?:string}[]} [initialDrawdowns]
 * @property {number} [margin] - decimal, e.g. 0.03 for 3%
 * @property {(dateISO:string)=>number} [refRateFn]
 * @property {{date:string, rate:number}[]} [refRateSeries]
 * @property {number} [commitmentFeeRate]
 * @property {string} [dayCount]
 * @property {'MONTHLY'|'QUARTERLY'|'SEMIANNUAL'|'ANNUAL'} [frequency]
 * @property {string} [businessDayConvention]
 * @property {string[]} [holidays]
 * @property {{interest?:boolean, amortisation?:boolean}} [pip]
 * @property {string} [interestAccrualStart]
 * @property {{date:string, amount:number|string, currency?:string, indexedAmount?:number|string, received?:boolean}[]} [amortisationSchedule]
 * @property {string} maturityDate
 * @property {{ indexName:string, baseIndexValue:number }} [indexed]
 */

/**
 * @typedef {Object} EngineOptions
 * @property {string} [baseCurrency]
 * @property {'ACT/360'|'ACT/365'|'ACT/365L'|'30/360'|'30E/360'} [dayCount]
 * @property {'FOLLOWING'|'PRECEDING'|'MODIFIED_FOLLOWING'|'NONE'} [businessDayConvention]
 * @property {CalendarOptions} [calendar]
 * @property {{ preserveEOM?:boolean }} [schedule]
 * @property {'number'|'string'|'decimal'} [serialize] - how to serialize numbers in output
 */

function serializeDecimal(x, mode = 'number') {
  if (mode === 'decimal') return x
  if (mode === 'string') return x.toFixed(8)
  return x.toNumber()
}

export function generateLoanSchedule(loan, events = [], options = {}) {
  const freqMonthsMap = { MONTHLY: 1, QUARTERLY: 3, SEMIANNUAL: 6, ANNUAL: 12 }
  const freq = String(loan.frequency || options.frequency || 'QUARTERLY').toUpperCase()
  const intervalMonths = freqMonthsMap[freq] || 3
  const dayCount = loan.dayCount || options.dayCount || 'ACT/360'
  const bdayConv = loan.businessDayConvention || options.businessDayConvention || 'FOLLOWING'
  const calendar = options.calendar || { holidays: loan.holidays || [] }
  const baseCurrency = loan.baseCurrency || options.baseCurrency || loan.currency
  const serialize = options.serialize || 'number'

  // Build event maps used during iteration
  const maps = buildEventMaps(events)

  // Group events by ISO date for fast lookup
  const eventsByDate = new Map()
  for (const ev of events) {
    const key = ev.date
    if (!eventsByDate.has(key)) eventsByDate.set(key, [])
    eventsByDate.get(key).push(ev)
  }

  // Initial state
  let facility = new Decimal(loan.facilityAmount || 0)
  let outstanding = new Decimal(0)
  const draws = []

  const initialDraws = (loan.initialDrawdowns || [])
    .map((d) => ({ ...d, dateISO: d.date }))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))

  for (const d of initialDraws) {
    const amt = new Decimal(d.amount || 0)
    outstanding = outstanding.plus(amt)
    draws.push({ date: d.dateISO, amount: amt, currency: d.currency || loan.currency })
  }

  // Anchors from accrual start (or first draw) to maturity
  const accrualStart = loan.interestAccrualStart
    ? parseISO(loan.interestAccrualStart)
    : initialDraws.length
    ? parseISO(initialDraws[0].dateISO)
    : DateTime.utc()

  const maturity = parseISO(loan.maturityDate)

  // Construct anchor periods
  const anchors = []
  let cursor = accrualStart
  const addMonthsHook = options?.schedule?.nextAnchorFn || ((dt) => addMonthsPreserveDOM(dt, intervalMonths, { preserveEOM: options?.schedule?.preserveEOM !== false }))
  while (cursor < maturity) {
    const next = addMonthsHook(cursor)
    anchors.push({ start: cursor, end: next })
    cursor = next
  }
  if (!anchors.length) anchors.push({ start: accrualStart, end: maturity })
  const last = anchors[anchors.length - 1]
  if (last.end > maturity) anchors[anchors.length - 1] = { ...last, end: maturity }

  // Add amortisation schedule as events
  if (Array.isArray(loan.amortisationSchedule)) {
    for (const a of loan.amortisationSchedule) {
      const list = eventsByDate.get(a.date) || []
      list.push({ type: 'amortisation', date: a.date, amount: a.amount, currency: a.currency || loan.currency, indexedAmount: a.indexedAmount || 0, received: !!a.received })
      eventsByDate.set(a.date, list)
    }
  }

  // Result container
  const cashflows = []

  // Context shared across handlers
  const ctx = {
    loan,
    maps,
    options: { bdayConv, calendar, dayCount, serialize, baseCurrency },
    facility,
    outstanding,
    draws,
    currentRow: null
  }

  // Iterate periods
  for (const anchor of anchors) {
    // Scheduled and adjusted dates
    const scheduled = anchor.end
    const businessDayAdjuster = options.businessDayAdjuster || ((dt, conv, cal) => adjustBusinessDay(dt, conv, cal))
    const adjusted = businessDayAdjuster(scheduled, bdayConv, calendar)
    const startISO = iso(anchor.start)
    const scheduledISO = iso(scheduled)
    const adjustedISO = iso(adjusted)

    // Apply events on start date (e.g., drawdowns effective from start)
    if (eventsByDate.has(startISO)) {
      ctx.currentRow = { eventsApplied: [] } // temp row just for start-date effects
      for (const ev of eventsByDate.get(startISO)) {
        const handler = handlerRegistry.get(ev.type)
        if (handler) handler(ctx, ev, startISO)
      }
    }

    // Day count
    const dayCountFn = options.dayCountFn || dayCountFraction
    const { yearFraction, days } = dayCountFn(anchor.start, adjusted, dayCount)

    // Rates
    const refRate = getRefRateForDate(loan, maps.refRateMap, adjustedISO)
    const margin = new Decimal(loan.margin || 0)
    const allIn = refRate.plus(margin)

    // Interest due on outstanding
    const interestDue = ctx.outstanding.times(allIn).times(yearFraction)

    // Commitment fee on undrawn
    const undrawn = Decimal.max(new Decimal(0), ctx.facility.minus(ctx.outstanding))
    const commitmentFeeRate = new Decimal(loan.commitmentFeeRate || 0)
    const commitmentFeeDue = commitmentFeeRate.times(undrawn).times(yearFraction)

    // FX revaluation for outstanding into base currency
    const fxOutstanding = getFXRate(maps.fxMap, loan.currency, baseCurrency, adjustedISO)
    const outstandingBase = ctx.outstanding.times(fxOutstanding)

    // Indexed adjustments (example CPI indexation)
    let indexedInterestDue = new Decimal(0)
    if (loan.indexed && loan.indexed.indexName) {
      const idxVal = getIndexValue(maps.indexMap, loan.indexed.indexName, adjustedISO)
      if (idxVal !== null && idxVal !== undefined && loan.indexed.baseIndexValue) {
        const scale = new Decimal(idxVal).div(loan.indexed.baseIndexValue)
        indexedInterestDue = interestDue.times(scale.minus(1))
      }
    }

    // Initialize row
    const row = {
      loanId: loan.loanId,
      investorId: loan.investorId,
      interestStartDate: startISO,
      interestEndDate: adjustedISO,
      scheduledInterestPaymentDate: scheduledISO,
      adjustedInterestPaymentDate: adjustedISO,
      noOfDays: days,
      yearFraction,
      outstandingPrincipal: ctx.outstanding,
      outstandingPrincipalBase: outstandingBase,
      drawdowns: [],
      amortisationDue: new Decimal(0),
      amortisationReceived: new Decimal(0),
      indexedAmortisationAmountDue: new Decimal(0),
      indexedAmortisationAmountReceived: new Decimal(0),
      prepaymentAmount: new Decimal(0),
      prepaymentFee: new Decimal(0),
      repayment: new Decimal(0),
      interestAmountDue: interestDue,
      interestAmountReceived: new Decimal(0),
      indexedInterestAmountDue: indexedInterestDue,
      indexedInterestAmountReceived: new Decimal(0),
      closingBalance: ctx.outstanding,
      margin,
      referenceRate: refRate,
      allInRate: allIn,
      currency: loan.currency,
      baseCurrency,
      commitmentAmount: ctx.facility,
      undrawnAmount: undrawn,
      commitmentFeeDue,
      commitmentFeeReceived: new Decimal(0),
      pip: loan.pip || {},
      feeArrangementDiscount: new Decimal(loan.feeArrangementDiscount || 0),
      eventsApplied: [],
      fxRateOutstanding: fxOutstanding
    }

    ctx.currentRow = row

    // Apply events that occur between start (exclusive) and adjusted (inclusive)
    let iter = anchor.start.plus({ days: 1 })
    while (iter <= adjusted) {
      const k = iso(iter)
      if (eventsByDate.has(k)) {
        for (const ev of eventsByDate.get(k)) {
          const handler = handlerRegistry.get(ev.type)
          if (handler) handler(ctx, ev, k)
        }
      }
      iter = iter.plus({ days: 1 })
    }

    // Update closing after events
    row.closingBalance = ctx.outstanding

    // PIK behavior: if interest PIK, mark as due but not received
    if (loan.pip && loan.pip.interest) {
      // leave as-is; consumers can decide capitalisation
    }

    // Push row (serialize as requested)
    cashflows.push(serializeRow(row, serialize))
  }

  return {
    cashflows,
    draws: ctx.draws.map((d) => ({ ...d, amount: serializeDecimal(d.amount, serialize) })),
    facilityAtEnd: serializeDecimal(ctx.facility, serialize),
    outstandingAtEnd: serializeDecimal(ctx.outstanding, serialize),
    fxMap: Object.fromEntries([...maps.fxMap.entries()].map(([k, v]) => [k, serializeDecimal(new Decimal(v), serialize)])),
    indexMap: Object.fromEntries([...maps.indexMap.entries()].map(([k, v]) => [k, serializeDecimal(new Decimal(v), serialize)]))
  }
}

function serializeRow(row, mode) {
  const out = { ...row }
  for (const k of Object.keys(out)) {
    const v = out[k]
    if (v instanceof Decimal) out[k] = serializeDecimal(v, mode)
  }
  // nested arrays
  out.eventsApplied = (out.eventsApplied || []).map((e) => ({ ...e }))
  out.drawdowns = (out.drawdowns || []).map((d) => ({ ...d }))
  return out
}

// --------------------------
// Aggregation Helpers
// --------------------------
export function aggregateByInvestor(schedules, options = { baseCurrency: null, serialize: 'number' }) {
  const byInvestor = {}
  for (const s of schedules) {
    const rows = s.cashflows || s
    const inv = s.investorId || (rows[0] && rows[0].investorId) || 'UNKNOWN'
    if (!byInvestor[inv]) byInvestor[inv] = []
    byInvestor[inv].push(...rows)
  }
  const out = {}
  for (const inv of Object.keys(byInvestor)) {
    const rows = byInvestor[inv]
    const map = {}
    for (const r of rows) {
      const d = r.adjustedInterestPaymentDate || r.scheduledInterestPaymentDate || r.interestEndDate
      if (!map[d]) map[d] = { date: d, interestDue: 0, interestReceived: 0, principalDue: 0, principalReceived: 0, commitmentFeeDue: 0, outstanding: 0 }
      map[d].interestDue += Number(r.interestAmountDue || 0) + Number(r.indexedInterestAmountDue || 0)
      map[d].interestReceived += Number(r.interestAmountReceived || 0) + Number(r.indexedInterestAmountReceived || 0)
      map[d].principalDue += Number(r.amortisationDue || 0) + Number(r.prepaymentAmount || 0) + Number(r.indexedAmortisationAmountDue || 0)
      map[d].principalReceived += Number(r.amortisationReceived || 0) + Number(r.indexedAmortisationAmountReceived || 0)
      map[d].commitmentFeeDue += Number(r.commitmentFeeDue || 0)
      map[d].outstanding = Math.max(map[d].outstanding, Number(r.outstandingPrincipal || 0))
    }
    out[inv] = Object.values(map).sort((a, b) => String(a.date).localeCompare(String(b.date)))
  }
  return out
}

export { builtInHandlers, dayCountFraction, adjustBusinessDay, addMonthsPreserveDOM } 