/**
 * advanced-cashflow-engine.js
 *
 * Production-ready advanced cashflow schedule engine.
 * - Exports generateAdvancedSchedule(loan, events, options)
 * - Also exports generateCashflowSchedule as an alias for compatibility
 *
 * Important: Uses Luxon and Decimal.js
 *   npm install luxon decimal.js
 */

import { DateTime } from "luxon";
import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

/* -------------------------
   Utility / Parsing Helpers
   ------------------------- */
const toISODate = (dt) => (dt ? dt.toISODate() : null);

function parseDateToDT(input) {
  if (!input) return null;
  if (DateTime.isDateTime(input)) return input.startOf("day");
  if (input instanceof Date) return DateTime.fromJSDate(input).startOf("day");
  if (typeof input === "string") {
    // Support dd-mm-yyyy and ISO yyyy-mm-dd
    const ddmmyyyy = /^\d{2}-\d{2}-\d{4}$/.test(input);
    if (ddmmyyyy) {
      const [dd, mm, yyyy] = input.split("-").map(Number);
      return DateTime.fromObject({ year: yyyy, month: mm, day: dd }).startOf("day");
    }
    const dt = DateTime.fromISO(input);
    if (dt.isValid) return dt.startOf("day");
  }
  throw new Error(`Unsupported date format: ${input}`);
}

function cloneDT(dt) {
  return DateTime.fromISO(dt.toISODate());
}

function endOfMonthDT(dt) {
  return dt.endOf("month").startOf("day");
}

function addMonthsPreserveEOM(dt, months, preserveEOM = true) {
  const isEOM = dt.plus({ days: 1 }).month !== dt.month;
  const moved = dt.plus({ months });
  if (preserveEOM && isEOM) return moved.endOf("month").startOf("day");
  return moved.startOf("day");
}

/* -------------------------
   Day Count Conventions
   ------------------------- */
function diffDays(a, b) {
  return Math.round(b.diff(a, "days").days);
}

function yearFraction(a, b, dcc = "ACT/365") {
  const days = diffDays(a, b);
  const conv = (dcc || "").toUpperCase();
  if (conv === "ACT/360") return days / 360;
  if (conv === "ACT/365" || conv === "ACTUAL/365") return days / 365;
  if (conv === "ACT/365L") {
    // use 366 if leap-year included
    let includesLeap = false;
    for (let y = a.year; y <= b.year; y++) {
      if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) includesLeap = true;
    }
    return days / (includesLeap ? 366 : 365);
  }
  if (conv === "30E/360") {
    const d1 = Math.min(a.day, 30);
    const d2 = Math.min(b.day, 30);
    const months = (b.year - a.year) * 12 + (b.month - a.month);
    const dd = 360 * (b.year - a.year) + 30 * (b.month - a.month) + (d2 - d1);
    return dd / 360;
  }
  if (conv === "30/360" || conv === "30/360 US") {
    let d1 = a.day;
    let d2 = b.day;
    if (d1 === 31) d1 = 30;
    if (d2 === 31 && d1 === 30) d2 = 30;
    const dd = 360 * (b.year - a.year) + 30 * (b.month - a.month) + (d2 - d1);
    return dd / 360;
  }
  // default:
  return days / 365;
}

/* -------------------------
   Business Day Adjustment
   ------------------------- */
function isWeekend(dt, weekend = [6, 7]) {
  // Luxon: Monday=1 ... Sunday=7
  return weekend.includes(dt.weekday);
}

function buildIsHoliday(calendar = {}) {
  // calendar.holidays: array of ISO dates or function
  if (typeof calendar.isHoliday === "function") return calendar.isHoliday;
  const holidaysSet = new Set(Array.isArray(calendar.holidays) ? calendar.holidays : []);
  return (dt) => holidaysSet.has(dt.toISODate());
}

function isBusinessDay(dt, calendar = {}) {
  const weekend = calendar.weekend || [6, 7];
  const isHoliday = buildIsHoliday(calendar);
  return !isWeekend(dt, weekend) && !isHoliday(dt);
}

function adjustBusinessDay(dt, convention = "FOLLOWING", calendar = {}) {
  if (!dt) return dt;
  const conv = (convention || "FOLLOWING").toUpperCase();
  const weekend = calendar.weekend || [6, 7];
  const isHoliday = buildIsHoliday(calendar);

  const isBad = (d) => isWeekend(d, weekend) || isHoliday(d);
  if (!isBad(dt)) return dt.startOf("day");

  if (conv === "NONE") return dt.startOf("day");

  if (conv === "FOLLOWING") {
    let m = dt;
    while (isBad(m)) m = m.plus({ days: 1 });
    return m.startOf("day");
  }

  if (conv === "PRECEDING") {
    let m = dt;
    while (isBad(m)) m = m.minus({ days: 1 });
    return m.startOf("day");
  }

  if (conv === "MODIFIED FOLLOWING" || conv === "MODIFIED_FOLLOWING" || conv === "MODIFIEDFOLLOWING") {
    let m = dt;
    while (isBad(m)) m = m.plus({ days: 1 });
    if (m.month !== dt.month) {
      let mb = dt;
      while (isBad(mb)) mb = mb.minus({ days: 1 });
      return mb.startOf("day");
    }
    return m.startOf("day");
  }
  // fallback to following
  let m = dt;
  while (isBad(m)) m = m.plus({ days: 1 });
  return m.startOf("day");
}

/* -------------------------
   Event / Maps helpers
   ------------------------- */
function buildMapsFromEvents(eventsInput) {
  const events = Array.isArray(eventsInput) ? eventsInput : [];
  const fxMap = new Map();
  const indexMap = new Map();
  const refRateMap = new Map();

  for (const ev of events) {
    if (!ev || !ev.type) continue;
    const dateISO = parseDateToDT(ev.date).toISODate();
    if (ev.type === "fx_update") {
      const key = `${dateISO}:${ev.fromCurrency}->${ev.toCurrency}`;
      fxMap.set(key, new Decimal(ev.rate || ev.value || 1));
    } else if (ev.type === "index_update") {
      const key = `${ev.indexName}:${dateISO}`;
      indexMap.set(key, new Decimal(ev.value || 0));
    } else if (ev.type === "refRate_update") {
      refRateMap.set(dateISO, new Decimal(ev.rate || 0));
    }
  }
  return { fxMap, indexMap, refRateMap };
}

function getRefRateForDate(loan, refRateMap, dateISO, options = {}) {
  // loan.refRateFn(dateISO) preferred -> returns decimal (e.g., 0.0525)
  if (typeof loan.refRateFn === "function") {
    const r = loan.refRateFn(dateISO);
    return new Decimal(r || 0);
  }
  // else pick latest <= dateISO from refRateMap
  const available = [...refRateMap.keys()].filter((k) => k <= dateISO).sort();
  if (available.length) return new Decimal(refRateMap.get(available[available.length - 1]));
  // fallback to loan.refRate (decimal) or options.fixedReferenceRatePct (percent)
  if (loan.refRate !== undefined && loan.refRate !== null) return new Decimal(loan.refRate);
  if (options.fixedReferenceRatePct !== undefined) return new Decimal(options.fixedReferenceRatePct).div(100);
  // default rate is 5% (0.05)
  return new Decimal(0.05);
}

function getFXRate(fxMap, fromCurrency, toCurrency, dateISO) {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return new Decimal(1);
  const exact = `${dateISO}:${fromCurrency}->${toCurrency}`;
  if (fxMap.has(exact)) return new Decimal(fxMap.get(exact));
  // latest <= dateISO for pair
  const candidates = [...fxMap.keys()].filter((k) => k.endsWith(`${fromCurrency}->${toCurrency}`));
  const ok = candidates.map((k) => ({ k, date: k.split(":")[0] })).filter((c) => c.date <= dateISO).sort((a, b) => a.date.localeCompare(b.date));
  if (ok.length) return new Decimal(fxMap.get(ok[ok.length - 1].k));
  // try reverse
  const rev = [...fxMap.keys()].filter((k) => k.endsWith(`${toCurrency}->${fromCurrency}`));
  const ok2 = rev.map((k) => ({ k, date: k.split(":")[0] })).filter((c) => c.date <= dateISO).sort((a, b) => a.date.localeCompare(b.date));
  if (ok2.length) {
    const r = new Decimal(fxMap.get(ok2[ok2.length - 1].k) || 1);
    return r.equals(0) ? new Decimal(1) : new Decimal(1).div(r);
  }
  return new Decimal(1);
}

/* -------------------------
   Core schedule builder
   ------------------------- */

/**
 * Main function
 * @param {Object} loan - loan object with fields mapped from platform tabs:
 *   General Tab: fundingDate, agreementDate, maturityDate, facilityAmount, baseCurrency, revolvingFacility, amortisationEnabled
 *   Cash Term Tab: firstInterestPaymentDate, scheduledOn, endOfMonth, dayCountConvention, holidayAdjustment, holidayConvention, intervalTenor, margin, commitmentFeeRate, interestPaymentDates
 *   Amortisation Tab: amortisationSchedule: array of { date, amount, received }
 *   Drawdown Tab: drawdowns: array of { drawdownDate, amount }
 * @param {Array} events - array of event objects (drawdown, amortisation, refRate_update, fx_update, index_update, etc.)
 * @param {Object} options - engine options { baseCurrency, preserveEOM, calendar }
 * @returns {Object} { rows: Array<UI rows>, internalRows: Array<internal row objects>, totals: { totalClosingBalance } }
 */
function generateAdvancedSchedule(loan = {}, events = [], options = {}) {
  // Normalize inputs
  const eventsArr = Array.isArray(events) ? events : [];
  const maps = buildMapsFromEvents(eventsArr);
  const calendar = options.calendar || { holidays: loan.holidays || [], weekend: [6, 7], isHoliday: null };
  const preserveEOM = options.preserveEOM !== undefined ? options.preserveEOM : true;
  const dayCount = loan.dayCountConvention || loan.dayCount || "ACT/365";
  const businessConvention = loan.holidayConvention || loan.businessDayConvention || "FOLLOWING";

  // facility / commitment - mapped from General Tab
  let facilityAmount = new Decimal(Number(loan.facilityAmount || loan.commitment || 0));
  // outstanding starts at 0 unless drawdowns present
  let outstanding = new Decimal(0);

  // Handle drawdowns from Drawdown Tab - map drawdowns array to drawdownEntries
  const drawdownEntries = Array.isArray(loan.drawdowns) ? loan.drawdowns.slice() : [];
  
  // If no explicit drawdowns provided, default behaviour: assume full drawdown at funding date
  if (drawdownEntries.length === 0) {
    // default: full facility at funding date
    const fundingDate = loan.fundingDate || loan.startDate || loan.funding;
    if (fundingDate) {
      drawdownEntries.push({ drawdownDate: fundingDate, amount: Number(loan.facilityAmount || loan.commitment || 0) });
    }
  }

  // sort drawdowns & amortisations
  const sortedDrawdowns = (Array.isArray(drawdownEntries) ? drawdownEntries : []).map(d => ({ ...d, dateISO: parseDateToDT(d.drawdownDate).toISODate() })).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const amortEntries = Array.isArray(loan.amortisationSchedule) ? loan.amortisationSchedule.map(a => ({ ...a, dateISO: parseDateToDT(a.date).toISODate() })).sort((a, b) => a.dateISO.localeCompare(b.dateISO)) : [];

  // accrual start & maturity
  const fundingDT = parseDateToDT(loan.fundingDate || loan.funding || loan.interestAccrualStart || loan.startDate);
  if (!fundingDT) throw new Error("fundingDate (or startDate) is required in loan object");
  const maturityDT = parseDateToDT(loan.maturityDate || loan.maturity || loan.endDate);
  if (!maturityDT) throw new Error("maturityDate (or endDate) is required in loan object");

  // Determine interval tenor
  const tenorMonths = Number(loan.intervalTenor || loan.tenorMonths || options.intervalMonths || 3);

  // Build anchor periods: chain from fundingDT to maturityDT using tenorMonths and scheduledOn / EOM rules
  const anchors = [];
  let cursor = fundingDT;
  const firstIPD = loan.firstInterestPaymentDate ? parseDateToDT(loan.firstInterestPaymentDate) : null;

  // If a firstIPD is present and > funding, make first anchor to it
  if (firstIPD && firstIPD > fundingDT) {
    anchors.push({ start: fundingDT, end: firstIPD });
    cursor = firstIPD;
  }

  // Now iterate
  while (cursor < maturityDT) {
    let next = addMonthsPreserveEOM(cursor, tenorMonths, preserveEOM);

    // scheduledOn vs EOM
    if (Number(loan.endOfMonth) === 1) {
      next = endOfMonthDT(next);
    } else if (loan.scheduledOn) {
      const dayNum = Number(loan.scheduledOn);
      // create candidate in next month same month as next
      const candidate = DateTime.fromObject({ year: next.year, month: next.month, day: 1 }).set({ day: Math.min(dayNum, next.endOf('month').day) });
      next = candidate.startOf('day');
    }

    // If next goes beyond maturity, cap at maturity
    if (next > maturityDT) next = maturityDT;

    // Prevent infinite loops
    if (!anchors.length && next <= cursor) throw new Error("Invalid schedule progression, next <= cursor (possible zero-tenor)");
    anchors.push({ start: cursor, end: next });
    cursor = next;
    // safety break (avoid infinite loops)
    if (anchors.length > 10000) throw new Error("Too many anchor periods detected (possible misconfiguration)");
  }

  // Prepare events-by-date map for quick processing
  const eventsByDate = new Map();
  for (const ev of eventsArr) {
    if (!ev || !ev.date) continue;
    const dISO = parseDateToDT(ev.date).toISODate();
    if (!eventsByDate.has(dISO)) eventsByDate.set(dISO, []);
    eventsByDate.get(dISO).push(ev);
  }

  // Also include drawdowns and amort entries as events so they are applied consistently
  for (const d of sortedDrawdowns) {
    const dISO = d.dateISO;
    if (!eventsByDate.has(dISO)) eventsByDate.set(dISO, []);
    eventsByDate.get(dISO).push({ type: "drawdown", ...d });
  }
  for (const a of amortEntries) {
    const aISO = a.dateISO;
    if (!eventsByDate.has(aISO)) eventsByDate.set(aISO, []);
    eventsByDate.get(aISO).push({ type: "amortisation", ...a });
  }

  // Sort event lists on each date to keep stable application order (drawdown before interest on same date etc.)
  for (const [k, arr] of eventsByDate.entries()) {
    eventsByDate.set(k, arr); // keep order as inserted
  }

  // Context to maintain through anchors
  const rowsInternal = [];
  let runningOutstanding = outstanding; // Decimal
  // If initial drawdowns were present we already added to outstanding above

  // For each anchor produce exactly one row
  for (const anchor of anchors) {
    // Scheduled IPD (unadjusted) is anchor.end by default; if interestPaymentDates override contains a date in (start,end] use it
    let scheduledIPD = anchor.end;
    if (Array.isArray(loan.interestPaymentDates) && loan.interestPaymentDates.length) {
      // find a date in interestPaymentDates that is > start and <= end
      const found = loan.interestPaymentDates
        .map(d => parseDateToDT(d))
        .find(d => d > anchor.start && d <= anchor.end);
      if (found) scheduledIPD = found;
    }

    // compute adjusted IPD using business day logic
    const adjustedIPD = loan.holidayAdjustment ? adjustBusinessDay(scheduledIPD, businessConvention, calendar) : scheduledIPD;

    // We'll compute sub-segments across any event dates in (start, adjustedIPD] to prorate interest and fees
    const segmentBoundaryISOs = new Set();
    segmentBoundaryISOs.add(anchor.start.toISODate());
    // collect event dates > start && <= adjustedIPD
    for (const dateISO of eventsByDate.keys()) {
      const evDT = parseDateToDT(dateISO);
      if (evDT > anchor.start && evDT <= adjustedIPD) segmentBoundaryISOs.add(evDT.toISODate());
    }
    segmentBoundaryISOs.add(adjustedIPD.toISODate());
    const segmentBoundaries = [...segmentBoundaryISOs].sort().map(s => parseDateToDT(s));

    // Initialize row accumulators
    let rowInterestDue = new Decimal(0);
    let rowPrincipalDue = new Decimal(0);
    let rowCommitmentFeeDue = new Decimal(0);
    let rowPrepaymentFee = new Decimal(0);
    let rowAmortDue = new Decimal(0);
    let rowAmortReceived = new Decimal(0);
    let eventsApplied = [];

    // Pre-apply events on anchor.start (effective at start)
    const startISO = anchor.start.toISODate();
    if (eventsByDate.has(startISO)) {
      for (const ev of eventsByDate.get(startISO)) {
        if (ev.type === "drawdown") {
          const amt = new Decimal(ev.amount || 0);
          runningOutstanding = runningOutstanding.plus(amt);
          eventsApplied.push({ type: "drawdown", date: startISO, amount: amt.toNumber() });
        } else if (ev.type === "amortisation") {
          const amt = new Decimal(ev.amount || 0);
          const received = !!ev.received;
          rowAmortDue = rowAmortDue.plus(amt);
          if (received) {
            runningOutstanding = Decimal.max(new Decimal(0), runningOutstanding.minus(amt));
            rowAmortReceived = rowAmortReceived.plus(amt);
          }
          eventsApplied.push({ type: "amortisation", date: startISO, amount: amt.toNumber(), received: !!ev.received });
        } else {
          // other event types (prepayment, refRate_update etc.) will be handled later or in segment loop
          eventsApplied.push({ type: ev.type || "unknown", date: startISO, raw: ev });
        }
      }
    }

    // Walk segments to prorate interest/commitment fee
    for (let i = 0; i < segmentBoundaries.length - 1; i++) {
      const segStart = segmentBoundaries[i];
      const segEnd = segmentBoundaries[i + 1];
      const segDays = diffDays(segStart, segEnd);
      const segYF = yearFraction(segStart, segEnd, dayCount);

      // reference rate at segEnd
      const segEndISO = segEnd.toISODate();
      const refRate = getRefRateForDate(loan, maps.refRateMap, segEndISO, options); // Decimal
      // margin: loan.margin might be provided as percent (e.g., 5) or decimal (0.05). normalize:
      let marginDec = new Decimal(loan.margin === undefined ? 0 : loan.margin);
      if (marginDec.greaterThan(1)) marginDec = marginDec.div(100);
      const allInRate = refRate.plus(marginDec);

      // interest accrues on runningOutstanding during the segment
      const interestSeg = runningOutstanding.times(allInRate).times(segYF);
      rowInterestDue = rowInterestDue.plus(interestSeg);

      // commitment fee on undrawn
      const undrawn = Decimal.max(new Decimal(0), facilityAmount.minus(runningOutstanding));
      const commitFeeRate = new Decimal((loan.commitmentFeeRate !== undefined ? loan.commitmentFeeRate : options.commitmentFeePct) || 0);
      // commitFeeRate might be percent or decimal
      const commitFeeRateNorm = commitFeeRate.greaterThan(1) ? commitFeeRate.div(100) : commitFeeRate;
      const commitSeg = undrawn.times(commitFeeRateNorm).times(segYF);
      rowCommitmentFeeDue = rowCommitmentFeeDue.plus(commitSeg);

      // After computing accrual for this segment, apply any events that occur exactly at segEnd
      const segEndISOKey = segEndISO;
      if (eventsByDate.has(segEndISOKey)) {
        for (const ev of eventsByDate.get(segEndISOKey)) {
          if (ev.type === "drawdown") {
            const amt = new Decimal(ev.amount || 0);
            runningOutstanding = runningOutstanding.plus(amt);
            eventsApplied.push({ type: "drawdown", date: segEndISOKey, amount: amt.toNumber() });
          } else if (ev.type === "amortisation") {
            const amt = new Decimal(ev.amount || 0);
            const received = !!ev.received;
            rowAmortDue = rowAmortDue.plus(amt);
            if (received) {
              runningOutstanding = Decimal.max(new Decimal(0), runningOutstanding.minus(amt));
              rowAmortReceived = rowAmortReceived.plus(amt);
            }
            eventsApplied.push({ type: "amortisation", date: segEndISOKey, amount: amt.toNumber(), received: !!ev.received });
          } else if (ev.type === "prepayment") {
            const amt = new Decimal(ev.amount || 0);
            runningOutstanding = Decimal.max(new Decimal(0), runningOutstanding.minus(amt));
            rowPrincipalDue = rowPrincipalDue.plus(amt);
            eventsApplied.push({ type: "prepayment", date: segEndISOKey, amount: amt.toNumber() });
          } else if (ev.type === "prepayment_fee") {
            const fee = new Decimal(ev.amount || 0);
            rowPrepaymentFee = rowPrepaymentFee.plus(fee);
            eventsApplied.push({ type: "prepayment_fee", date: segEndISOKey, amount: fee.toNumber() });
          } else {
            eventsApplied.push({ type: ev.type || "unknown", date: segEndISOKey, raw: ev });
          }
        }
      }
    } // end segments

    // finalize principal/amort/prior computed variables
    // sum principal due includes amort due + prepayments (we tracked prepayments into rowPrincipalDue above)
    rowPrincipalDue = rowPrincipalDue.plus(rowAmortDue);

    // Record row internal
    const internalRow = {
      fromDate: anchor.start.toISODate(),
      toDate: anchor.end.toISODate(),
      edate: scheduledIPD.toISODate(),
      eomonth: endOfMonthDT(scheduledIPD).toISODate(),
      scheduleIPD: scheduledIPD.toISODate(),
      adjustedIPD: adjustedIPD.toISODate(),
      days: diffDays(anchor.start, anchor.end),
      yearFraction: yearFraction(anchor.start, anchor.end, dayCount),
      margin: (new Decimal(loan.margin || 0)).toNumber(),
      defaultRate: getRefRateForDate(loan, maps.refRateMap, adjustedIPD.toISODate(), options).toNumber(),
      paymentConvention: businessConvention,
      holidayAdjustment: !!loan.holidayAdjustment,
      interestDue: Number(rowInterestDue.toFixed(6)),
      principalDue: Number(rowPrincipalDue.toFixed(6)),
      commitmentFeeDue: Number(rowCommitmentFeeDue.toFixed(6)),
      outstandingAfter: Number(runningOutstanding.toFixed(6)),
      undrawnAfter: Number(Decimal.max(new Decimal(0), facilityAmount.minus(runningOutstanding)).toFixed(6)),
      eventsApplied,
    };

    // Append to internal rows and to UI serialization
    rowsInternal.push(internalRow);

    // No separate extra row push - we push one row per anchor
    // Note: runningOutstanding already reflects events applied on / before anchor.end

  } // end anchors

  // Build UI rows matching exact platform requirements
  const uiRows = rowsInternal.map(r => ({
    "From Date": r.fromDate,
    "To Date": r.toDate,
    "Edate": r.edate,
    "Eomonth": r.eomonth,
    "Schedule IPD": r.scheduleIPD,
    "Adjusted IPD": r.adjustedIPD,
    "Margin": Number((Number(r.margin) > 1 ? Number(r.margin) : Number(r.margin) * 100).toFixed(6)), // Convert to percentage for display
    "Default Rate": Number((r.defaultRate * 100).toFixed(6)), // Convert to percentage for display
    "Payment Convention": r.paymentConvention,
    "Holiday Adjustment": r.holidayAdjustment ? "Yes" : "No",
    "Days": r.days,
    "Year Fraction": Number(r.yearFraction.toFixed ? Number(r.yearFraction.toFixed(10)) : r.yearFraction),
    "Interest Due": Number(r.interestDue.toFixed ? Number(r.interestDue.toFixed(6)) : r.interestDue),
    "Principal Due": Number(r.principalDue.toFixed ? Number(r.principalDue.toFixed(6)) : r.principalDue),
    "Commitment Fee Due": Number(r.commitmentFeeDue.toFixed ? Number(r.commitmentFeeDue.toFixed(6)) : r.commitmentFeeDue),
    "Outstanding": Number(r.outstandingAfter.toFixed ? Number(r.outstandingAfter.toFixed(6)) : r.outstandingAfter),
    "Undrawn": Number(r.undrawnAfter.toFixed ? Number(r.undrawnAfter.toFixed(6)) : r.undrawnAfter),
    "_events": r.eventsApplied
  }));

  // Total closing balance = last outstanding
  const totalClosingBalance = uiRows.length ? Number(uiRows[uiRows.length - 1]["Outstanding"]) : 0;

  return {
    rows: uiRows,
    internalRows: rowsInternal,
    totals: { totalClosingBalance },
    maps: {
      fxMap: Object.fromEntries([...maps.fxMap.entries()].map(([k, v]) => [k, new Decimal(v).toNumber ? new Decimal(v).toNumber() : v])),
      indexMap: Object.fromEntries([...maps.indexMap.entries()].map(([k, v]) => [k, new Decimal(v).toNumber ? new Decimal(v).toNumber() : v])),
      refRateMap: Object.fromEntries([...maps.refRateMap.entries()].map(([k, v]) => [k, new Decimal(v).toNumber ? new Decimal(v).toNumber() : v])),
    }
  };
}

// Export alias for backward compatibility
export { generateAdvancedSchedule as generateCashflowSchedule };

// default export
export { generateAdvancedSchedule };
export default generateAdvancedSchedule;
