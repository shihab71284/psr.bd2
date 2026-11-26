/**
 * BTCP / PSR.BD Google Analytics 4 (GA4) Key Events Suite
 * Measurement ID: G-7R4Z3777T7
 */

type GTagParamValue = string | number | boolean;
type GTagEventParams = Record<string, GTagParamValue>;

interface AnalyticsWindow {
  gtag?: (
    command: 'event',
    eventName: string,
    eventParams?: Record<string, unknown>
  ) => void;
}

export function trackEvent(name: string, params: GTagEventParams = {}): void {
  try {
    if (typeof window !== 'undefined') {
      const win = window as unknown as AnalyticsWindow;
      if (typeof win.gtag === 'function') {
        win.gtag('event', name, params);
      }
    }
  } catch {
    // Graceful fallback when GA4 is blocked or unavailable
  }
}

/**
 * Key Event 1: PSR Audit Risk Assessment
 */
export function trackAuditRiskCheck(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH', totalScore: number): void {
  trackEvent('psr_audit_risk_check', {
    risk_level: riskLevel,
    risk_score: totalScore
  });
}

/**
 * Key Event 2: Mandatory PSR Service Guide View (e.g. Trade License, Bank Loan, Land Sale)
 */
export function trackPsrGuideView(serviceName: string): void {
  trackEvent('psr_guide_view', {
    service_name: serviceName
  });
}

/**
 * Key Event 3: Tax Lawyer Consultation Click (Chittagong Chamber)
 */
export function trackLawyerContact(method: 'whatsapp' | 'phone' | 'email'): void {
  trackEvent('tax_lawyer_contact', {
    method: method,
    chamber: 'Chittagong Alkaran'
  });
}

/**
 * Key Event 4: Income Tax Calculation (Income Tax Act 2023)
 */
export function trackTaxCalculation(taxableIncome: number, taxPayable: number): void {
  trackEvent('tax_calculation', {
    taxable_income: Math.round(taxableIncome),
    tax_payable: Math.round(taxPayable)
  });
}
