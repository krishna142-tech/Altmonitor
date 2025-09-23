/**
 * advanced-cashflow-engine.js
 *
 * Comprehensive loan/facility cashflow engine for AltMonitor.
 * - Uses Luxon (DateTime) for robust date handling
 * - Uses Decimal.js for precise monetary math
 * - Supports: fixed/floating ref rates (ref series or function), many day-counts,
 *   business day conventions, EOM/scheduled-on behaviour, holiday calendars,
 *   mid-period events with sub-period splitting, PIK, indexed interest/amortisation,
 *   prepayments, commitment upsize/downsize/change, FX/index updates, multi-currency.
 *
 * Export:
 *   - generateAdvancedSchedule(loan, events, options)
 *
 * Notes:
 *  - Events are processed in chronological order within each period and can be:
 *    drawdown, prepayment, amortisation, commitment_upsize, commitment_downsize,
 *    commitment_change, fx_update, index_update, refRate_update, payment_in_kind,
 *    interest_payment, commitment_fee_payment
 *
 *  - Conservative default: drawdown on period START is effective immediately for that
 *    period; drawdowns on intermediate dates are prorated (engine splits period).
 *
 *  - For production use, call unit tests for day counts, EOM/modified-following etc.
 */

import { DateTime } from 'luxon'
import Decimal from 'decimal.js'

// Ensure DateTime and Decimal are available for use throughout the file
if (typeof DateTime === 'undefined') throw new Error('Luxon DateTime not imported correctly');
if (typeof Decimal === 'undefined') throw new Error('Decimal.js not imported correctly');

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

// ---------- Helpers ----------

// Export generateAdvancedSchedule as generateCashflowSchedule for compatibility
export { generateAdvancedSchedule as generateCashflowSchedule }

const toISO = (dt) => (dt instanceof DateTime ? dt.toISODate() : DateTime.fromJSDate(dt).toISODate())

function parseToDT(input) {
  if (!input) return null
  if (input instanceof DateTime) return input.startOf('day')
  if (input instanceof Date) return DateTime.fromJSDate(input).startOf('day')
  // Accept 'dd-mm-yyyy' or ISO 'yyyy-mm-dd'
  if (typeof input === 'string') {
    if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
      const [dd, mm, yyyy] = input.split('-').map(Number)
      return DateTime.fromObject({ year: yyyy, month: mm, day: dd }).startOf('day')
    }
    // ISO
    return DateTime.fromISO(input).startOf('day')
  }
  throw new Error('Unsupported date input: ' + String(input))
}

function addMonthsPreserveEOM(dt, months, preserveEOM = true) {
  if (!dt) return null
  const isEOM = dt.plus({ days: 1 }).month !== dt.month
  const moved = dt.plus({ months })
  if (preserveEOM && isEOM) return moved.endOf('month').startOf('day')
  return moved.startOf('day')
}

function endOfMonthDT(dt) {
  return dt.endOf('month').startOf('day')
}

function clampDecimal(d) {
  if (!(d instanceof Decimal)) return new Decimal(d || 0)
  return d
}

// ---------- Day Count Conventions ----------
function dayCountFractionLuxon(startDT, endDT, convention = 'ACT/360') {
  const s = startDT.startOf('day')
  const e = endDT.startOf('day')
  const days = e.diff(s, 'days').days
  const conv = (convention || '').toUpperCase()

  if (conv === 'ACT/360') return { yearFraction: days / 360, days }
  if (conv === 'ACT/365' || conv === 'ACT/365F' || conv === 'ACTUAL/365') return { yearFraction: days / 365, days }
  if (conv === 'ACT/365L') {
    let includesLeap = false
    for (let y = s.year; y <= e.year; y++) if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) includesLeap = true
    return { yearFraction: days / (includesLeap ? 366 : 365), days }
  }
  if (conv === '30E/360') {
    const d1 = Math.min(s.day, 30)
    const d2 = Math.min(e.day, 30)
    const months = (e.year - s.year) * 12 + (e.month - s.month)
    const dd = 360 * Math.floor((e.year - s.year)) + 30 * (e.month - s.month) + (d2 - d1)
    return { yearFraction: dd / 360, days: dd }
  }
  if (conv === '30/360' || conv === '30/360 US') {
    let d1 = s.day
    let d2 = e.day
    if (d1 === 31) d1 = 30
    if (d2 === 31 && d1 === 30) d2 = 30
    const dd = 360 * (e.year - s.year) + 30 * (e.month - s.month) + (d2 - d1)
    return { yearFraction: dd / 360, days: dd }
  }
  // default to ACT/365
  return { yearFraction: days / 365, days }
}

// ---------- Business Day Adjust ----------
function defaultIsHoliday(dt, holidays = []) {
  return holidays.includes(dt.toISODate())
}

function isWeekendDT(dt, weekend = [6, 7]) {
  // Luxon: Monday=1 ... Sunday=7
  return weekend.includes(dt.weekday)
}

function adjustBusinessDay(dt, convention = 'FOLLOWING', calendar = {}) {
  if (!dt) return dt
  const conv = (convention || 'FOLLOWING').toUpperCase()
  if (conv === 'NONE') return dt.startOf('day')

  const weekend = calendar.weekend || [6, 7]
  const isHolidayFn = calendar.isHoliday || ((d) => defaultIsHoliday(d, calendar.holidays || []))
  const isHolidayOrWeekend = (d) => isWeekendDT(d, weekend) || isHolidayFn(d)

  if (!isHolidayOrWeekend(dt)) return dt.startOf('day')

  const origMonth = dt.month
  if (conv === 'FOLLOWING') {
    let moved = dt
    while (isHolidayOrWeekend(moved)) moved = moved.plus({ days: 1 })
    return moved.startOf('day')
  }
  if (conv === 'PRECEDING') {
    let moved = dt
    while (isHolidayOrWeekend(moved)) moved = moved.minus({ days: 1 })
    return moved.startOf('day')
  }
  if (conv === 'MODIFIED_FOLLOWING' || conv === 'MODIFIEDFOLLOWING' || conv === 'MODFOLLOWING') {
    let moved = dt
    while (isHolidayOrWeekend(moved)) moved = moved.plus({ days: 1 })
    if (moved.month !== origMonth) {
      let movedBack = dt
      while (isHolidayOrWeekend(movedBack)) movedBack = movedBack.minus({ days: 1 })
      return movedBack.startOf('day')
    }
    return moved.startOf('day')
  }
  return dt.startOf('day')
}

// ---------- Reference Rate, FX, Index helpers ----------
function buildMapsFromEvents(events = []) {
  const fxMap = new Map() // key `${date}:${from}->${to}` => Decimal(rate)
  const indexMap = new Map() // key `${indexName}:${date}` => Decimal(value)
  const refRateMap = new Map() // key `${date}` => Decimal(rate)
  for (const ev of events || []) {
    if (!ev || !ev.type) continue
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

function getRefRateForDate(loan, refRateMap, dateISO, options = {}) {
  // loan.refRateFn preferred, returns decimal (e.g., 0.0525)
  if (typeof loan.refRateFn === 'function') {
    const r = loan.refRateFn(dateISO)
    return new Decimal(r || 0)
  }
  // else check refRateMap latest <= dateISO
  const keys = [...refRateMap.keys()].filter((k) => k <= dateISO).sort()
  if (keys.length) return new Decimal(refRateMap.get(keys[keys.length - 1]))
  // else fallback to loan.refRate (decimal) or options.fixedReferenceRatePct
  if (loan.refRate !== undefined && loan.refRate !== null) return new Decimal(loan.refRate)
  if (options.fixedReferenceRatePct !== undefined) return new Decimal(options.fixedReferenceRatePct).div(100)
  return new Decimal(0)
}

function getIndexValue(indexMap, indexName, dateISO) {
  if (!indexName) return null
  const keys = [...indexMap.keys()].filter((k) => k.startsWith(`${indexName}:`))
  const candidates = keys
    .map((k) => ({ k, date: k.split(':')[1] }))
    .filter((c) => c.date <= dateISO)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!candidates.length) return null
  return new Decimal(indexMap.get(candidates[candidates.length - 1].k))
}

function getFXRate(fxMap, fromCurrency, toCurrency, dateISO) {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return new Decimal(1)
  const exact = `${dateISO}:${fromCurrency}->${toCurrency}`
  if (fxMap.has(exact)) return new Decimal(fxMap.get(exact))
  // pick latest <= dateISO
  const keys = [...fxMap.keys()].filter((k) => k.endsWith(`${fromCurrency}->${toCurrency}`))
  const candidates = keys
    .map((k) => ({ k, date: k.split(':')[0] }))
    .filter((c) => c.date <= dateISO)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (candidates.length) return new Decimal(fxMap.get(candidates[candidates.length - 1].k))
  // try reverse and invert
  const revKeys = [...fxMap.keys()].filter((k) => k.endsWith(`${toCurrency}->${fromCurrency}`))
  const revCandidates = revKeys
    .map((k) => ({ k, date: k.split(':')[0] }))
    .filter((c) => c.date <= dateISO)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (revCandidates.length) {
    const rr = new Decimal(fxMap.get(revCandidates[revCandidates.length - 1].k) || 1)
    return rr.equals(0) ? new Decimal(1) : new Decimal(1).div(rr)
  }
  // fallback
  return new Decimal(1)
}

// ---------- Event handler registry ----------
const builtInHandlers = {
  drawdown(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.outstanding = ctx.outstanding.plus(amt)
    ctx.draws.push({ date: dateISO, amount: amt, currency: ev.currency || ctx.loan.currency })
    ctx.currentRow.eventsApplied.push({ type: 'drawdown', date: dateISO, amount: amt.toNumber(), currency: ev.currency })
    // track draw detail in row
    ctx.currentRow.drawdowns.push({ date: dateISO, amount: amt.toNumber(), currency: ev.currency })
  },
  prepayment(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    const feePct = new Decimal(ev.feePct || 0)
    const fee = amt.times(feePct)
    ctx.outstanding = Decimal.max(new Decimal(0), ctx.outstanding.minus(amt))
    ctx.currentRow.prepaymentAmount = ctx.currentRow.prepaymentAmount.plus(amt)
    ctx.currentRow.prepaymentFee = ctx.currentRow.prepaymentFee.plus(fee)
    ctx.currentRow.eventsApplied.push({
      type: 'prepayment',
      date: dateISO,
      amount: amt.toNumber(),
      fee: fee.toNumber(),
      currency: ev.currency,
    })
  },
  amortisation(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    const idx = new Decimal(ev.indexedAmount || 0)
    const received = !!ev.received
    const pipAmort = !!(ctx.loan.pip && ctx.loan.pip.amortisation)
    if (pipAmort && !received) {
      ctx.currentRow.indexedAmortisationAmountDue = ctx.currentRow.indexedAmortisationAmountDue.plus(idx)
      ctx.currentRow.amortisationDue = ctx.currentRow.amortisationDue.plus(amt)
      // don't reduce outstanding if PIK and not received
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
  prepayment_fee(ctx, ev, dateISO) {
    const fee = new Decimal(ev.amount || 0)
    ctx.currentRow.prepaymentFee = ctx.currentRow.prepaymentFee.plus(fee)
    ctx.currentRow.eventsApplied.push({ type: 'prepayment_fee', date: dateISO, amount: fee.toNumber() })
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
  fx_update(ctx, ev, dateISO) {
    ctx.maps.fxMap.set(`${dateISO}:${ev.fromCurrency}->${ev.toCurrency}`, new Decimal(ev.rate || 1))
    ctx.currentRow.eventsApplied.push({ type: 'fx_update', date: dateISO, from: ev.fromCurrency, to: ev.toCurrency, rate: ev.rate })
  },
  index_update(ctx, ev, dateISO) {
    ctx.maps.indexMap.set(`${ev.indexName}:${dateISO}`, new Decimal(ev.value || 0))
    ctx.currentRow.eventsApplied.push({ type: 'index_update', date: dateISO, indexName: ev.indexName, value: ev.value })
  },
  refRate_update(ctx, ev, dateISO) {
    ctx.maps.refRateMap.set(dateISO, new Decimal(ev.rate || 0))
    ctx.currentRow.eventsApplied.push({ type: 'refRate_update', date: dateISO, rate: ev.rate })
  },
  payment_in_kind(ctx, ev, dateISO) {
    const kind = ev.kind
    const amt = new Decimal(ev.amount || 0)
    if (kind === 'interest') {
      ctx.currentRow.indexedInterestAmountDue = ctx.currentRow.indexedInterestAmountDue.plus(amt)
      ctx.currentRow.eventsApplied.push({ type: 'payment_in_kind', date: dateISO, kind: 'interest', amount: amt.toNumber() })
      if (ctx.loan.pip && ctx.loan.pip.interestCapitalize) {
        // Capitalise into outstanding
        ctx.outstanding = ctx.outstanding.plus(amt)
      }
    } else if (kind === 'amortisation') {
      ctx.currentRow.indexedAmortisationAmountDue = ctx.currentRow.indexedAmortisationAmountDue.plus(amt)
      ctx.currentRow.eventsApplied.push({ type: 'payment_in_kind', date: dateISO, kind: 'amortisation', amount: amt.toNumber() })
      if (ctx.loan.pip && ctx.loan.pip.amortisationCapitalize) {
        ctx.outstanding = ctx.outstanding.plus(amt)
      }
    } else {
      ctx.currentRow.eventsApplied.push({ type: 'payment_in_kind', date: dateISO, kind: kind, amount: amt.toNumber() })
    }
  },
  interest_payment(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.currentRow.interestAmountReceived = ctx.currentRow.interestAmountReceived.plus(amt)
    ctx.currentRow.eventsApplied.push({ type: 'interest_payment', date: dateISO, amount: amt.toNumber(), currency: ev.currency })
  },
  commitment_fee_payment(ctx, ev, dateISO) {
    const amt = new Decimal(ev.amount || 0)
    ctx.currentRow.commitmentFeeReceived = ctx.currentRow.commitmentFeeReceived.plus(amt)
    ctx.currentRow.eventsApplied.push({ type: 'commitment_fee_payment', date: dateISO, amount: amt.toNumber() })
  },
}

const handlerRegistry = new Map(Object.entries(builtInHandlers))
export function registerEventHandler(type, handler) {
  handlerRegistry.set(type, handler)
}

// ---------- Core Engine ----------

/**
 * Generate an advanced schedule for a single loan/facility
 * @param {Object} loan - loan / facility config (see README in file for complete shape)
 * @param {Array} events - chronological event list (drawdown, amortisation, fx_update, etc.)
 * @param {Object} options - engine options:
 *    { baseCurrency, schedule: { preserveEOM }, calendar: { holidays, isHoliday, weekend }, dayCountFn, serialize }
 * @returns {Object} { rows: Array, draws, facilityAtEnd, outstandingAtEnd, maps: {fxMap,indexMap,refRateMap} }
 */
export function generateAdvancedSchedule(loan = {}, events = [], options = {}) {
  // defaults & input normalisation
  const freqMonthsMap = { MONTHLY: 1, QUARTERLY: 3, SEMIANNUAL: 6, ANNUAL: 12 }
  const freq = (loan.frequency || options.frequency || 'QUARTERLY').toUpperCase()
  const intervalMonths = freqMonthsMap[freq] || Number(loan.intervalTenor) || 3
  const dayCount = loan.dayCount || options.dayCount || 'ACT/360'
  const businessDayConvention = loan.businessDayConvention || options.businessDayConvention || 'FOLLOWING'
  const calendar = { holidays: loan.holidays || options.holidays || [], isHoliday: options.calendar?.isHoliday, weekend: options.calendar?.weekend }
  const preserveEOM = options?.schedule?.preserveEOM !== false
  const baseCurrency = loan.baseCurrency || options.baseCurrency || loan.currency
  const serialize = options.serialize || 'number' // 'number'|'string'|'decimal'

  // maps from events
  const maps = buildMapsFromEvents(events)

  // group events by ISO date for quick lookup - keep chronological order in arrays
  const eventsByDate = new Map()
  for (const ev of (events || [])) {
    const dateISO = parseToDT(ev.date).toISODate()
    if (!eventsByDate.has(dateISO)) eventsByDate.set(dateISO, [])
    eventsByDate.get(dateISO).push(ev)
  }
  // ensure events per date are stable in original order (they are)

  // initial facility and outstanding
  let facility = new Decimal(loan.facilityAmount || loan.commitment || 0)
  let outstanding = new Decimal(0)
  const draws = []

  // initial drawdowns from loan.initialDrawdowns (if provided)
  const initialDraws = (loan.initialDrawdowns || []).map((d) => ({ ...d, dateISO: parseToDT(d.date).toISODate() })).sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  for (const d of initialDraws) {
    const amt = new Decimal(d.amount || 0)
    outstanding = outstanding.plus(amt)
    draws.push({ date: d.dateISO, amount: amt, currency: d.currency || loan.currency })
  }

  // Determine accrual start:
  const accrualStart = parseToDT(loan.interestAccrualStart) || (initialDraws.length ? parseToDT(initialDraws[0].date) : parseToDT(loan.fundingDate) || DateTime.utc().startOf('day'))
  const maturity = parseToDT(loan.maturityDate)
  if (!maturity) throw new Error('maturityDate is required on loan')

  // anchors (periods) generation - firstIPD override respected
  const anchors = []
  let cursor = accrualStart
  // If user provided firstInterestPaymentDate and it's > accrualStart, use it as the first 'to' date
  const firstIPD = loan.firstInterestPaymentDate ? parseToDT(loan.firstInterestPaymentDate) : null

  // If firstIPD exists and <= accrualStart, ignore it
  if (firstIPD && firstIPD > accrualStart) {
    anchors.push({ start: accrualStart, end: firstIPD })
    cursor = firstIPD
  }

  while (cursor < maturity) {
    const nextRaw = addMonthsPreserveEOM(cursor, intervalMonths, preserveEOM)
    // apply scheduledOn/day-of-month or EOM rule
    let next = nextRaw
    if (loan.endOfMonth === 1) {
      next = endOfMonthDT(next)
    } else if (loan.scheduledOn) {
      const dayNum = Number(loan.scheduledOn)
      const candidate = DateTime.fromObject({ year: next.year, month: next.month, day: 1 }).set({ day: Math.min(dayNum, next.endOf('month').day) })
      next = candidate.startOf('day')
    }
    // If interestPaymentDates overrides exist and one falls after cursor and <= next, we could split - but we still keep anchors.
    anchors.push({ start: cursor, end: next })
    cursor = next
    if (anchors.length > 10000) throw new Error('Too many anchor periods (possible infinite loop)')
  }
  // Ensure last anchor ends exactly at maturity (not beyond)
  if (anchors.length) {
    const last = anchors[anchors.length - 1]
    if (last.end > maturity) anchors[anchors.length - 1] = { start: last.start, end: maturity }
  } else {
    anchors.push({ start: accrualStart, end: maturity })
  }

  // If amortisation schedule provided, add amort events to eventsByDate to ensure they are applied
  if (Array.isArray(loan.amortisationSchedule)) {
    for (const a of loan.amortisationSchedule) {
      const k = parseToDT(a.date).toISODate()
      if (!eventsByDate.has(k)) eventsByDate.set(k, [])
      eventsByDate.get(k).push({ type: 'amortisation', date: a.date, amount: a.amount, currency: a.currency || loan.currency, indexedAmount: a.indexedAmount || 0, received: !!a.received })
    }
  }

  // context for handlers
  const ctx = {
    loan,
    maps,
    options: { calendar, dayCount, preserveEOM },
    facility: new Decimal(facility),
    outstanding: new Decimal(outstanding),
    draws,
    currentRow: null,
  }

  // helper to apply all events at a date to context
  function applyEventsAtDate(dateISO, row) {
    if (!eventsByDate.has(dateISO)) return
    for (const ev of eventsByDate.get(dateISO)) {
      const handler = handlerRegistry.get(ev.type)
      ctx.currentRow = row
      if (handler) handler(ctx, ev, dateISO)
      else {
        row.eventsApplied.push({ type: ev.type || 'unknown', date: dateISO, raw: ev })
      }
    }
  }

  // core rows
  const rows = []

  // iterate anchors and produce rows. Within each anchor we split into segments at event dates to compute prorated interest & fees.
  for (const anchor of anchors) {
    const scheduled = anchor.end
    // adjusted scheduled IPD according to holiday rules
    const adjusted = loan.holidayAdjustment ? adjustBusinessDay(scheduled, loan.holidayConvention || businessDayConvention, calendar) : scheduled
    const scheduledISO = scheduled.toISODate()
    const adjustedISO = adjusted.toISODate()
    const startISO = anchor.start.toISODate()

    // Prepare a row skeleton using Decimal values
    const row = {
      loanId: loan.loanId,
      interestStartDate: startISO,
      interestEndDate: adjustedISO,
      scheduledInterestPaymentDate: scheduledISO,
      adjustedInterestPaymentDate: adjustedISO,
      eomonth: scheduled.endOf('month').toISODate(),
      noOfDays: 0,
      yearFraction: new Decimal(0),
      outstandingPrincipal: ctx.outstanding, // Decimal
      outstandingPrincipalBase: new Decimal(0),
      drawdowns: [],
      amortisationDue: new Decimal(0),
      amortisationReceived: new Decimal(0),
      indexedAmortisationAmountDue: new Decimal(0),
      indexedAmortisationAmountReceived: new Decimal(0),
      prepaymentAmount: new Decimal(0),
      prepaymentFee: new Decimal(0),
      repayment: new Decimal(0),
      interestAmountDue: new Decimal(0),
      interestAmountReceived: new Decimal(0),
      indexedInterestAmountDue: new Decimal(0),
      indexedInterestAmountReceived: new Decimal(0),
      closingBalance: ctx.outstanding,
      margin: new Decimal(loan.margin || 0),
      referenceRate: new Decimal(0),
      allInRate: new Decimal(0),
      currency: loan.currency,
      baseCurrency,
      commitmentAmount: ctx.facility,
      undrawnAmount: Decimal.max(new Decimal(0), ctx.facility.minus(ctx.outstanding)),
      commitmentFeeDue: new Decimal(0),
      commitmentFeeReceived: new Decimal(0),
      pip: loan.pip || {},
      feeArrangementDiscount: new Decimal(loan.feeArrangementDiscount || 0),
      eventsApplied: [],
      fxRateOutstanding: new Decimal(1),
    }

  // Pre-apply events that are on the start date (effective immediately for the period)
  if (eventsByDate.has(startISO)) {
    applyEventsAtDate(startISO, row)
  }

  // collect event dates within (start, adjusted] to split the accrual
  const eventDatesSet = new Set()
  for (const [dISO] of eventsByDate) {
    const dt = parseToDT(dISO)
    if (dt > anchor.start && dt <= adjusted) {
      eventDatesSet.add(dISO)
    }
  }
  // also include the adjusted date as last boundary
  const boundaries = [anchor.start.toISODate(), ...[...eventDatesSet].sort(), adjusted.toISODate()]
  // unique & sorted boundaries as DateTime objects
  const boundariesDT = boundaries.map((s) => parseToDT(s))

  // For rate lookup and FX/index maps, ensure maps reflect pre-existing events
  // (maps was prebuilt from events list, but handlers may have modified maps via fx_update/index_update/refRate_update)
  ctx.currentRow = row // ensure handlers can write into currentRow
  // compute ref rate for the period AFTER all intermediate events? We'll compute per segment, using ref rate at segment end.

  // iterate segments
  for (let i = 0; i < boundariesDT.length - 1; i++) {
    const segStart = boundariesDT[i]
    const segEnd = boundariesDT[i + 1]
    // compute daycount & year fraction
    const { yearFraction: segYF, days: segDays } = (options.dayCountFn || dayCountFractionLuxon)(segStart, segEnd, dayCount)
    // ref rate at segEnd (end-of-segment)
    const segEndISO = segEnd.toISODate()
    const refRate = getRefRateForDate(loan, maps.refRateMap, segEndISO, options) // Decimal
    const marginDec = new Decimal(loan.margin || 0) // note: loan.margin typically decimal (e.g., 0.05) or percent? Accept both. We'll treat as decimal unless user used percent.
    // if user provided margin in percent (common), convert if >1: (5 -> 0.05)
    const marginNormalized = marginDec.greaterThan(1) ? marginDec.div(100) : marginDec
    const allIn = refRate.plus(marginNormalized)
    // compute interest for the segment using outstanding at segStart
    const interestSeg = ctx.outstanding.times(allIn).times(segYF)
    // commitment fee prorated for undrawn at segStart
    const undrawn = Decimal.max(new Decimal(0), ctx.facility.minus(ctx.outstanding))
    const commitFeeRate = new Decimal(loan.commitmentFeeRate || options.commitmentFeePct || 0) // decimal (e.g., 0.01)
    const commitFeeSeg = commitFeeRate.times(undrawn).times(segYF)

    // accumulate
    row.interestAmountDue = row.interestAmountDue.plus(interestSeg)
    row.commitmentFeeDue = row.commitmentFeeDue.plus(commitFeeSeg)
    row.yearFraction = row.yearFraction.plus(segYF)
    row.noOfDays = row.noOfDays + segDays

    // After computing interest for the segment, apply events that fall exactly at segEnd (they affect next segment/outstanding)
    const segEndISOKey = segEnd.toISODate()
    if (eventsByDate.has(segEndISOKey)) {
      applyEventsAtDate(segEndISOKey, row)
    }
  } // end segments

  // After segments, update reference rate and all-in rate for row (we'll use ref rate at adjusted date)
  const refRateAdj = getRefRateForDate(loan, maps.refRateMap, adjustedISO, options)
  row.referenceRate = refRateAdj
  // normalize margin as decimal (if recorded as percent > 1)
  const marginNormalizedFinal = new Decimal(loan.margin || 0)
  const marginFinal = marginNormalizedFinal.greaterThan(1) ? marginNormalizedFinal.div(100) : marginNormalizedFinal
  row.margin = marginFinal
  row.allInRate = refRateAdj.plus(marginFinal)

  // FX revaluation outstanding -> base currency
  const fxOutstanding = getFXRate(maps.fxMap, loan.currency, baseCurrency, adjustedISO)
  row.fxRateOutstanding = fxOutstanding
  row.outstandingPrincipalBase = ctx.outstanding.times(fxOutstanding)

  // PIK interest handling: if interest PIK and configured to capitalise, capitalise now
  if (loan.pip && loan.pip.interest && loan.pip.interestCapitalize) {
    // capitalise the interestAmountDue to outstanding
    ctx.outstanding = ctx.outstanding.plus(row.interestAmountDue)
    row.eventsApplied.push({ type: 'pik_capitalisation_interest', date: adjustedISO, amount: row.interestAmountDue.toNumber() })
  }

  // PIK amortisation handling: if amortisation PIK and configured to capitalise, add to outstanding
  if (loan.pip && loan.pip.amortisation && loan.pip.amortisationCapitalize) {
    ctx.outstanding = ctx.outstanding.plus(row.amortisationDue)
    row.eventsApplied.push({ type: 'pik_capitalisation_amortisation', date: adjustedISO, amount: row.amortisationDue.toNumber() })
  }

  // update closing balance & undrawn & commitment
  row.closingBalance = ctx.outstanding
  row.commitmentAmount = ctx.facility
  row.undrawnAmount = Decimal.max(new Decimal(0), ctx.facility.minus(ctx.outstanding))
  // ensure outstanding is non-negative
  if (ctx.outstanding.isNegative()) ctx.outstanding = new Decimal(0)

  // serialize values per options
  rows.push({
    interestStartDate: row.interestStartDate,
    interestEndDate: row.interestEndDate,
    scheduledInterestPaymentDate: row.scheduledInterestPaymentDate,
    adjustedInterestPaymentDate: row.adjustedInterestPaymentDate,
    eomonth: row.eomonth,
    drawdowns: row.drawdowns,
    amortisationDue: row.amortisationDue,
    amortisationReceived: row.amortisationReceived,
    interestAmountDue: row.interestAmountDue,
    closingBalance: row.closingBalance,
  })
  rows.push(serializeRowForUI(row, serialize))
} // end anchors

return {
rows,
draws: ctx.draws.map((d) => ({ ...d, amount: new Decimal(d.amount).toNumber() })),
facilityAtEnd: ctx.facility.toNumber ? ctx.facility.toNumber() : ctx.facility,
outstandingAtEnd: ctx.outstanding.toNumber ? ctx.outstanding.toNumber() : ctx.outstanding,
maps: {
fxMap: Object.fromEntries([...maps.fxMap.entries()].map(([k, v]) => [k, new Decimal(v).toNumber ? new Decimal(v).toNumber() : v])),
indexMap: Object.fromEntries([...maps.indexMap.entries()].map(([k, v]) => [k, new Decimal(v).toNumber ? new Decimal(v).toNumber() : v])),
refRateMap: Object.fromEntries([...maps.refRateMap.entries()].map(([k, v]) => [k, new Decimal(v).toNumber ? new Decimal(v).toNumber() : v])),
},
}
}

// ---------- Serialization to UI/DB friendly row ----------
function serializeDecimal(d, mode = 'number') {
  if (!(d instanceof Decimal)) d = new Decimal(d || 0)
  if (mode === 'decimal') return d
  if (mode === 'string') return d.toFixed(8)
  return Number(d.toFixed(6))
}

/**
 * Map internal row (with Decimal fields) to UI-friendly object matching Excel orange headers
 */
function serializeRowForUI(row, serialize = 'number') {
  // Keep many fields and convert decimals
  return {
    // matching Excel headers (you can change keys to exact UI keys)
    'From Date': row.interestStartDate,
    'To Date': row.interestEndDate,
    'Edate': row.scheduledInterestPaymentDate,
    'Eomonth': row.scheduledInterestPaymentDate ? DateTime.fromISO(row.scheduledInterestPaymentDate).endOf('month').toISODate() : row.scheduledInterestPaymentDate,
    'Schedule IPD': row.scheduledInterestPaymentDate,
    'Adjusted IPD': row.adjustedInterestPaymentDate,
    'Days': Number(row.noOfDays || 0),
    'Year Fraction': typeof row.yearFraction.toNumber === 'function' ? Number(row.yearFraction.toNumber()) : Number(row.yearFraction),
    'Margin': serializeDecimal(row.margin, serialize),
    'Base Rate': serializeDecimal(row.referenceRate, serialize),
    'All In Rate': serializeDecimal(row.allInRate, serialize),
    'Interest Due': serializeDecimal(row.interestAmountDue, serialize),
    'Principal Due': serializeDecimal(row.amortisationDue.plus ? row.amortisationDue : row.amortisationDue, serialize),
    'Commitment Fee Due': serializeDecimal(row.commitmentFeeDue, serialize),
    'Outstanding': serializeDecimal(row.closingBalance, serialize),
    'Undrawn': serializeDecimal(row.undrawnAmount, serialize),
    // extras (raw)
    '_raw': {
      drawdowns: (row.drawdowns || []).map((d) => ({ ...d })),
      eventsApplied: row.eventsApplied || [],
      interestAmountReceived: serializeDecimal(row.interestAmountReceived, serialize),
      amortisationReceived: serializeDecimal(row.amortisationReceived, serialize),
      indexedInterestAmountDue: serializeDecimal(row.indexedInterestAmountDue || new Decimal(0), serialize),
      indexedAmortisationAmountDue: serializeDecimal(row.indexedAmortisationAmountDue || new Decimal(0), serialize),
      outstandingBase: serializeDecimal(row.outstandingPrincipalBase || new Decimal(0), serialize),
      fxRateOutstanding: serializeDecimal(row.fxRateOutstanding || new Decimal(1), serialize),
      currency: row.currency,
      baseCurrency: row.baseCurrency,
    },
  }
}

// ---------- Exports ----------
export default generateAdvancedSchedule

// also export helpers for unit testing
export const _helpers = {
  parseToDT,
  toISO,
  dayCountFractionLuxon,
  adjustBusinessDay,
  addMonthsPreserveEOM,
  getRefRateForDate,
  getFXRate,
  getIndexValue,
  registerEventHandler,
}
