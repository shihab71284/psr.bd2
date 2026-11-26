/**
 * BTCP / PSR.BD Google Analytics 4 (GA4) Key Events Suite
 * Measurement ID: G-7R4Z3777T7
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  } catch (err) {
    console.debug('[Analytics] Skipped:', name);
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
