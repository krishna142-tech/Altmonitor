export declare function generateAdvancedSchedule(
  loan: any,
  events?: any[],
  options?: any
): {
  rows: any[];
  internalRows: any[];
  totals: { totalClosingBalance: number };
  maps: any;
};

export { generateAdvancedSchedule as generateCashflowSchedule };
export default generateAdvancedSchedule;