/**
 * AltMonitor Cashflow Engine (High-Level, Production-ready JS)
 * ------------------------------------------------------------
 * Inputs mirror your UI tabs (General, Cash Term, Amortisation, Drawdown).
 * Output matches your “Cashflow Schedule” table (one row per period).
 *
 * Drop this file at: src/engine/cashflowEngine.js
 * You can then wire the “Generate Cashflow” button to call generateCashflowSchedule(...)
 *
 * Notes
 * - Holidays: weekend-only by default. Plug in a country calendar via options.holidays if you wish.
 * - Reference Rate: for Floating, provide a curve getter; for Fixed, provide a fixed value.
 * - Day Count: ACT/360, ACT/365, 30/360 US, 30E/360 supported.
 * - Business Day: Following / Modified Following / Preceding / None.
 * - EOM + “Scheduled On”: both supported (EOM takes precedence when endOfMonth === 1).
 * - Monetary math uses Number; swap in Big.js if you need high precision.
 */

// ---------- Utilities ----------
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const clone = (d) => new Date(d.getTime());

function parseDate(input) {
  if (input instanceof Date) return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  // supports "yyyy-mm-dd" and "dd-mm-yyyy"
  if (typeof input === "string" && /^\d{2}-\d{2}-\d{4}$/.test(input)) {
    const [dd, mm, yyyy] = input.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  }
  // ISO
  return new Date(input);
}

function addMonths(date, n) {
  const d = clone(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  // handle short months (roll back to last day of month if needed)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return d;
}

function setDayOfMonth(date, dom) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = endOfMonth(d).getDate();
  d.setDate(Math.min(dom, last));
  return d;
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isHoliday(d, holidaysSet) {
  if (isWeekend(d)) return true;
  if (!holidaysSet) return false;
  return holidaysSet.has(toISO(d));
}

function adjustBusinessDay(d, convention, holidaysSet) {
  if (convention === "None") return d;

  const tmp = clone(d);
  if (convention === "Following") {
    while (isHoliday(d, holidaysSet)) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return d;
  }
  if (convention === "Preceding") {
    while (isHoliday(d, holidaysSet)) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    return d;
  }
  if (convention === "Modified Following") {
    const month = d.getMonth();
    while (isHoliday(d, holidaysSet)) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (d.getMonth() !== month) {
      d = clone(tmp);
      while (isHoliday(d, holidaysSet)) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    }
    return d;
  }
  return d;
}

// Day count conventions
function diffDays(a, b) {
  return Math.round((b - a) / (24 * 3600 * 1000));
}

function yearFraction(from, to, dcc) {
  if (dcc === "ACT/360") return diffDays(from, to) / 360;
  if (dcc === "ACT/365" || dcc === "Actual/365") return diffDays(from, to) / 365;
  if (dcc === "30E/360") {
    // European 30/360
    let d1 = Math.min(from.getDate(), 30);
    let d2 = Math.min(to.getDate(), 30);
    const m1 = from.getMonth() + 1, m2 = to.getMonth() + 1;
    const y1 = from.getFullYear(), y2 = to.getFullYear();
    const days = 360 * (y2 - y1) + 30 * (m2 - m1) + (d2 - d1);
    return days / 360;
  }
  if (dcc === "30/360" || dcc === "30/360 US") {
    // US 30/360
    let d1 = from.getDate();
    let d2 = to.getDate();
    let m1 = from.getMonth() + 1;
    let m2 = to.getMonth() + 1;
    let y1 = from.getFullYear();
    let y2 = to.getFullYear();

    if (d1 === 31) d1 = 30;
    if (d2 === 31 && d1 === 30) d2 = 30;

    const days = 360 * (y2 - y1) + 30 * (m2 - m1) + (d2 - d1);
    return days / 360;
  }
  // default actual/365
  return diffDays(from, to) / 365;
}

// ---------- Engine helpers ----------
function buildHolidaysSet(options) {
  // options.holidays can be:
  // - array of ISO strings (["2025-01-01", ...])
  // - function(date) => boolean
  if (!options || !options.holidays) return null;
  if (Array.isArray(options.holidays)) return new Set(options.holidays);
  return {
    has: (iso) => !!options.holidays(new Date(iso)),
  };
}

function getBaseRate(date, cashTerm, options) {
  // Fixed: use options.fixedReferenceRate (e.g., 0.05 for 5%)
  // Floating: use options.referenceCurve(date) which returns a % (0.053 for 5.3%)
  if (cashTerm.intervalRateType === "Fixed") {
    const valPct = options?.fixedReferenceRatePct ?? 0; // in percent
    return (valPct / 100) || 0;
  }
  if (typeof options?.referenceCurve === "function") {
    const pct = options.referenceCurve(date) || 0; // returns percent
    return pct / 100;
  }
  // fallback: 0
  return 0;
}

function computeScheduleDate(prevPeriodEnd, cashTerm) {
  // If endOfMonth = 1, next IPD = end-of-month after tenor
  // else use "Scheduled On" (day-of-month)
  const tenor = Number(cashTerm.intervalTenor || 3);
  let next = addMonths(prevPeriodEnd, tenor);

  if (Number(cashTerm.endOfMonth) === 1) {
    next = endOfMonth(next);
  } else if (cashTerm.scheduledOn) {
    next = setDayOfMonth(next, Number(cashTerm.scheduledOn));
  }
  return next;
}

// Apply amortisation events in a given [from, to] window
function applyAmortisation(amortisation, from, to) {
  let principalDue = 0;

  const entries = Array.isArray(amortisation?.entries) ? amortisation.entries : [];
  for (const e of entries) {
    if (!e?.amortisationDate || !e?.dueAmount) continue;
    const dt = parseDate(e.amortisationDate);
    if (dt > from && dt <= to) {
      principalDue += Number(e.dueAmount) || 0;
    }
  }

  // Optional: balloon if type === 'Balloon' and end equals to-period
  if (amortisation?.amortisationType === "Balloon") {
    const endDt = parseDate(amortisation.amortisationEndDate);
    if (endDt && endDt > from && endDt <= to) {
      principalDue += Number(amortisation.balloonAmount || 0);
    }
  }

  return principalDue;
}

// Apply drawdowns in a given [from, to] window
function applyDrawdowns(drawdowns, from, to) {
  let drawn = 0;
  const entries = Array.isArray(drawdowns) ? drawdowns : [];
  for (const d of entries) {
    if (!d?.drawdownDate || !d?.amount) continue;
    const dt = parseDate(d.drawdownDate);
    if (dt > from && dt <= to) {
      drawn += Number(d.amount) || 0;
    }
  }
  return drawn;
}

// ---------- Main Engine ----------
/**
 * @param {Object} params
 * @param {Object} params.general
 *  - fundingDate (dd-mm-yyyy or ISO)
 *  - maturityDate (dd-mm-yyyy or ISO)
 *  - initialCommitment (number)
 *  - commitmentFee (boolean)
 * @param {Object} params.cashTerm
 *  - firstInterestPaymentDate
 *  - scheduledOn (1..31)
 *  - intervalTenor (months)
 *  - endOfMonth (0/1)
 *  - interestType ("Cash Interest" | "PIK" | ...)
 *  - dayCountConvention ("ACT/360"|"ACT/365"|"30/360"|"30E/360")
 *  - intervalRateType ("Fixed"|"Floating")
 *  - referenceRate (label only; curve provided via options.referenceCurve)
 *  - margin (in %) number
 *  - scheduleIPD (array of dom strings like ["30-06","31-12"]) (optional)
 *  - holidayAdjustment (boolean)
 *  - holidayConvention ("Following"|"Modified Following"|"Preceding"|"None")
 *  - holidays (string label; actual dates via options.holidays)
 *  - interestPaymentDates (array of explicit dates) (optional)
 * @param {Object} params.amortisation
 *  - payableOn ("Cash IPD" | "Fixed")
 *  - amortisationType ("Custom"|"Balloon"|...)
 *  - intervalType ("Monthly"|"Quarterly"|...)
 *  - amortisationStartDate (date)
 *  - amortisationEndDate (date)
 *  - description (string)
 *  - entries: [{ amortisationDate, dueAmount, receivedAmount, repayment }]
 *  - balloonAmount (optional)
 * @param {Array}  params.drawdowns
 *  - [{ drawdownDate, amount, commitment, closingBalance, availableUntil, scheduledType }]
 * @param {Object} [options]
 *  - referenceCurve(date) => percent    // for Floating
 *  - fixedReferenceRatePct: number      // for Fixed; percent
 *  - holidays: string[] | (date)=>bool  // holiday set/function; weekends included by default
 *  - commitmentFeePct: number           // percent applied on undrawn
 *  - currency: string                   // label only, unchanged by engine
 *
 * @returns {Array<Object>} rows:
 *  - { fromDate, toDate, edate, eomonth, scheduleIPD, adjustedIPD,
 *      days, yearFraction, baseRatePct, marginPct, allInRatePct,
 *      interestDue, principalDue, commitmentFeeDue, outstanding, undrawn }
 */
function generateCashflowSchedule(params, options = {}) {
  const { general, cashTerm, amortisation, drawdowns } = params;

  const funding = parseDate(general.fundingDate);
  const maturity = parseDate(general.maturityDate);

  let outstanding = Number(general.initialCommitment || 0);
  let undrawn = Number(general.initialCommitment || 0);

  const holidaysSet = buildHolidaysSet(options);
  const dcc = cashTerm.dayCountConvention || "ACT/365";
  const marginPct = Number(cashTerm.margin || 0);
  const margin = marginPct / 100;
  const commitFeePct = Number(options.commitmentFeePct || marginPct) / 100;

  const rows = [];
  let from = clone(funding);

  // determine first to-date (first IPD): explicit override OR inferred by tenor rules
  let to = cashTerm.firstInterestPaymentDate
    ? parseDate(cashTerm.firstInterestPaymentDate)
    : computeScheduleDate(from, cashTerm);

  while (to <= maturity) {
    // EOM + schedule IPD info
    const eom = endOfMonth(to);
    let scheduleIPD = to;
    if (Array.isArray(cashTerm.interestPaymentDates) && cashTerm.interestPaymentDates.length > 0) {
      // explicit override list takes precedence if one falls in (from, to]
      const override = cashTerm.interestPaymentDates
        .map(parseDate)
        .find((d) => d > from && d <= to);
      if (override) scheduleIPD = override;
    }

    const adjustedIPD = cashTerm.holidayAdjustment
      ? adjustBusinessDay(clone(scheduleIPD), cashTerm.holidayConvention || "Following", holidaysSet)
      : scheduleIPD;

    const yf = yearFraction(from, to, dcc);
    const days = diffDays(from, to);

    // reference rate (fixed or from curve)
    const baseRate = getBaseRate(to, cashTerm, options); // decimal (e.g., 0.0525)
    const allIn = baseRate + margin;

    // events
    const periodDrawn = applyDrawdowns(drawdowns, from, to);
    outstanding += periodDrawn;
    undrawn -= periodDrawn;

    const principalDue = applyAmortisation(amortisation, from, to);
    outstanding -= principalDue;
    if (outstanding < 0) outstanding = 0;

    // interest & commitment fee
    const interestDue = outstanding * allIn * yf;
    const commitmentFeeDue = general.commitmentFee ? undrawn * commitFeePct * yf : 0;

    rows.push({
      fromDate: toISO(from),
      toDate: toISO(to),
      edate: toISO(to),
      eomonth: toISO(eom),
      scheduleIPD: toISO(scheduleIPD),
      adjustedIPD: toISO(adjustedIPD),
      days,
      yearFraction: Number(yf.toFixed(10)),
      baseRatePct: Number((baseRate * 100).toFixed(6)),
      marginPct: Number(marginPct.toFixed(6)),
      allInRatePct: Number((allIn * 100).toFixed(6)),
      interestDue: Number(interestDue.toFixed(6)),
      principalDue: Number(principalDue.toFixed(6)),
      commitmentFeeDue: Number(commitmentFeeDue.toFixed(6)),
      outstanding: Number(outstanding.toFixed(6)),
      undrawn: Number(undrawn.toFixed(6)),
    });

    // step period: next fromDate is the day after current toDate
    from = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
    to = computeScheduleDate(to, cashTerm);
    // stop if we overshoot maturity by more than a day
    if (to > maturity && diffDays(maturity, to) !== 0) {
      // add a stub to maturity if needed
      if (from < maturity) {
        to = maturity;
      }
    }
  }

  return rows;
}

// ---------- Exports ----------
module.exports = {
  generateCashflowSchedule,

  // expose helpers for unit tests / Cursor auto-fixes
  _helpers: {
    parseDate,
    toISO,
    yearFraction,
    adjustBusinessDay,
    computeScheduleDate,
    applyAmortisation,
    applyDrawdowns,
  },
};

/* ---------------------------
Example (wire later in app):

const schedule = generateCashflowSchedule(
  {
    general: {
      fundingDate: "11-02-2025",
      maturityDate: "15-09-2026",
      initialCommitment: 2000000,
      commitmentFee: true,
    },
    cashTerm: {
      firstInterestPaymentDate: "15-03-2025",
      scheduledOn: 15,
      intervalTenor: 6,
      endOfMonth: 0,
      interestType: "Cash Interest",
      dayCountConvention: "ACT/365",
      intervalRateType: "Floating",
      referenceRate: "6 Months Sonia",
      margin: 5,               // percent
      scheduleIPD: ["30-06","31-12"],
      holidayAdjustment: true,
      holidayConvention: "Following",
      holidays: "Afghanistan", // label only
      interestPaymentDates: [],// optional overrides
    },
    amortisation: {
      payableOn: "Cash IPD",
      amortisationType: "Custom",
      intervalType: "Monthly",
      amortisationStartDate: "15-03-2025",
      amortisationEndDate: "15-09-2026",
      description: "Balloon Amortisation",
      entries: [
        { amortisationDate: "15-09-2025", dueAmount: 250000 },
        { amortisationDate: "15-03-2026", dueAmount: 250000 },
      ],
      balloonAmount: 0
    },
    drawdowns: [
      { drawdownDate: "11-02-2025", amount: 1000000 },
      { drawdownDate: "15-03-2025", amount: 1000000 },
    ],
  },
  {
    // for Floating:
    referenceCurve: (date) => 5.0,   // returns percent; plug your curve per date
    // for Fixed:
    // fixedReferenceRatePct: 5.0,
    holidays: ["2025-03-15"],        // optional ISO list or function(date)=>bool
    commitmentFeePct: 1.0,           // percent on undrawn
    currency: "USD",
  }
);

--------------------------- */
