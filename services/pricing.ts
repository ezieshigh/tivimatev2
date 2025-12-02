/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pricing Engine - Pure functions for calculating prices
 * This file contains NO React or Next.js specific logic
 * It can be used in both frontend and backend contexts
 */

import {
  TV_PLANS,
  TV_DURATION_DISCOUNTS,
  STREAMING_PLANS,
  FIRESTICKS,
  INSTALLATION_PRICES,
  SHIPPING,
  ORDER_THRESHOLD_FREE_INSTALL,
  BUNDLE_DISCOUNTS,
  VPN_ADDON_MONTHLY_PRICE,
  isChristmasPromoActive,
  CHRISTMAS_PROMO,
  type TvPlanId,
  type TvCountryTier,
  type TvDurationMonths,
  type StreamingPlanId,
  type FirestickId,
} from '@/data/plans';

// ============ INPUT TYPES ============

export type InstallationType = 'remote' | 'callout' | 'firestick';

export interface InstallationSelection {
  type: InstallationType;
  firestickId?: FirestickId;
  standalone?: boolean; // true if installation-only product (no subscription)
}

export interface StreamingInput {
  planId: StreamingPlanId;
  billing: 'monthly' | 'yearly';
  vpnEnabled: boolean; // cost ignored if planId === 'cinema-pro'
  installation: InstallationSelection;
}

export interface TvInput {
  planId: TvPlanId;
  countryTier: TvCountryTier;
  isPro: boolean;
  durationMonths: TvDurationMonths;
  installation: InstallationSelection;
}

// ============ OUTPUT TYPES ============

export type LineSection = 'due' | 'recurring';

export interface LineItem {
  key: string;
  label: string;
  amount: number;
  section: LineSection;
  originalAmount?: number;  // show as strikethrough if present
  reason?: string;          // short description: bundle, threshold, promo, coupon
  type?: 'subscription' | 'installation' | 'device' | 'shipping' | 'fee' | 'addon';
}

export interface Adjustment {
  key: string;
  label: string;
  amount: number;       // negative for discounts
  section: LineSection;
}

export interface Quote {
  dueToday: number;
  recurringMonthly: number;
  recurringLabel?: string; // e.g. "for next 5 months", "billed annually"
  lines: LineItem[];
  adjustments: Adjustment[];
  // Metadata for analytics
  source?: 'tv' | 'streaming';
}

// ============ MERGE OPTIONS ============

export interface MergeOptions {
  waiveInstallForBundle: boolean;     // true when TV + HUB are both in the order
  orderThresholdFreeInstall?: number; // e.g. 40
  seasonalPromoPercentFirstMonth?: number; // e.g. 0.2 for 20% off
  seasonalPromoActive?: boolean;
  couponCode?: string;
}

// ============ HELPER FUNCTIONS ============

/**
 * Round to 2 decimal places
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Clamp a number to non-negative (avoid negative totals in edge cases)
 */
function clampNonNegative(n: number): number {
  return n < 0 ? 0 : n;
}

/**
 * Get Firestick by ID
 */
function getFirestick(id: FirestickId) {
  return FIRESTICKS.find(f => f.id === id);
}

/**
 * Get TV Plan by ID
 */
function getTvPlan(id: TvPlanId) {
  return TV_PLANS.find(p => p.id === id);
}

/**
 * Get Streaming Plan by ID
 */
function getStreamingPlan(id: StreamingPlanId) {
  return STREAMING_PLANS.find(p => p.id === id);
}

// ============ INSTALLATION COST ============

export interface InstallationCostResult {
  install: number;
  device: number;
  shipping: number;
  lineItems: LineItem[];
}

export function computeInstallationCost(
  sel: InstallationSelection,
  options?: { deviceSubtotal?: number }
): InstallationCostResult {
  const lineItems: LineItem[] = [];
  let install = 0;
  let device = 0;
  let shipping = 0;

  if (sel.type === 'remote') {
    install = sel.standalone 
      ? INSTALLATION_PRICES.remoteStandalone 
      : INSTALLATION_PRICES.remote;
    
    lineItems.push({
      key: 'installation-remote',
      label: sel.standalone ? 'Remote Setup (Standalone)' : 'Remote Installation',
      amount: install,
      section: 'due',
      type: 'installation',
    });
  } else if (sel.type === 'callout') {
    install = sel.standalone 
      ? INSTALLATION_PRICES.calloutStandalone 
      : INSTALLATION_PRICES.callout;
    
    lineItems.push({
      key: 'installation-callout',
      label: sel.standalone ? 'Callout Visit (Standalone)' : 'Callout Visit',
      amount: install,
      section: 'due',
      type: 'installation',
    });
  } else if (sel.type === 'firestick') {
    // Installation considered included in device price
    install = 0;
    const stick = sel.firestickId ? getFirestick(sel.firestickId) : FIRESTICKS[1]; // Default to 4K
    device = stick?.price ?? 84.99;

    lineItems.push({
      key: 'device-firestick',
      label: stick?.label ?? 'Fire TV Stick 4K',
      amount: device,
      section: 'due',
      type: 'device',
    });

    // Calculate shipping
    const deviceSubtotal = options?.deviceSubtotal ?? device;
    shipping = deviceSubtotal > SHIPPING.freeThreshold ? 0 : SHIPPING.standardRate;

    if (shipping > 0) {
      lineItems.push({
        key: 'shipping',
        label: 'Shipping',
        amount: shipping,
        section: 'due',
        type: 'shipping',
      });
    } else {
      lineItems.push({
        key: 'shipping',
        label: 'Shipping',
        amount: 0,
        section: 'due',
        type: 'shipping',
        originalAmount: SHIPPING.standardRate,
        reason: 'Free over £100',
      });
    }
  }

  return { install, device, shipping, lineItems };
}

// ============ TV QUOTE ============

export function computeTvQuote(input: TvInput): Quote {
  const plan = getTvPlan(input.planId);
  if (!plan) {
    throw new Error(`Unknown TV plan: ${input.planId}`);
  }

  const lines: LineItem[] = [];
  const adjustments: Adjustment[] = [];

  // Determine base monthly from tier + Lite/Pro
  let baseMonthly: number;
  if (input.countryTier === 'cheap') {
    baseMonthly = input.isPro ? plan.cheapMonthlyPro : plan.cheapMonthlyLite;
  } else {
    baseMonthly = input.isPro ? plan.richMonthlyPro : plan.richMonthlyLite;
  }

  // Apply duration discount
  const discount = TV_DURATION_DISCOUNTS[input.durationMonths] ?? 0;
  const effectiveMonthly = round2(baseMonthly * (1 - discount));

  // App fee (one-time)
  lines.push({
    key: 'tv-app-fee',
    label: 'App License Fee',
    amount: plan.appFee,
    section: 'due',
    type: 'fee',
  });

  // First month subscription
  const planLabel = `TV Global ${input.isPro ? 'Pro' : 'Lite'}`;
  
  if (discount > 0) {
    lines.push({
      key: 'tv-first-month',
      label: `${planLabel} – first month`,
      amount: effectiveMonthly,
      section: 'due',
      type: 'subscription',
      originalAmount: baseMonthly,
      reason: `${Math.round(discount * 100)}% off (${input.durationMonths}mo commitment)`,
    });
  } else {
    lines.push({
      key: 'tv-first-month',
      label: `${planLabel} – first month`,
      amount: effectiveMonthly,
      section: 'due',
      type: 'subscription',
    });
  }

  // Recurring (for months 2+)
  let recurringLabel: string | undefined;
  if (input.durationMonths > 1) {
    recurringLabel = `for next ${input.durationMonths - 1} months`;
    lines.push({
      key: 'tv-recurring',
      label: `${planLabel} – recurring`,
      amount: effectiveMonthly,
      section: 'recurring',
      type: 'subscription',
    });
  }

  // Installation
  const installResult = computeInstallationCost(input.installation);
  lines.push(...installResult.lineItems);

  // Calculate totals
  const dueToday = round2(
    plan.appFee + 
    effectiveMonthly + 
    installResult.install + 
    installResult.device + 
    installResult.shipping
  );

  const recurringMonthly = input.durationMonths > 1 ? effectiveMonthly : 0;

  return {
    dueToday,
    recurringMonthly,
    recurringLabel,
    lines,
    adjustments,
    source: 'tv',
  };
}

// ============ STREAMING QUOTE ============

export function computeStreamingQuote(input: StreamingInput): Quote {
  const plan = getStreamingPlan(input.planId);
  if (!plan) {
    throw new Error(`Unknown streaming plan: ${input.planId}`);
  }

  const lines: LineItem[] = [];
  const adjustments: Adjustment[] = [];

  // Compute monthly base
  let baseMonthly = plan.monthlyPrice;
  let vpnCost = 0;

  // VPN add-on (only for Lite)
  if (!plan.vpnIncluded && input.vpnEnabled) {
    vpnCost = VPN_ADDON_MONTHLY_PRICE;
    baseMonthly += vpnCost;
  }

  let dueToday: number;
  let recurringMonthly: number;
  let recurringLabel: string;

  if (input.billing === 'monthly') {
    dueToday = baseMonthly;
    recurringMonthly = baseMonthly;
    recurringLabel = 'billed monthly';

    lines.push({
      key: 'streaming-first-month',
      label: `Streaming HUB ${plan.label} – first month`,
      amount: plan.monthlyPrice,
      section: 'due',
      type: 'subscription',
    });

    if (vpnCost > 0) {
      lines.push({
        key: 'streaming-vpn',
        label: 'VPN Privacy Add-on',
        amount: vpnCost,
        section: 'due',
        type: 'addon',
      });
      lines.push({
        key: 'streaming-vpn-recurring',
        label: 'VPN Privacy Add-on',
        amount: vpnCost,
        section: 'recurring',
        type: 'addon',
      });
    }

    lines.push({
      key: 'streaming-recurring',
      label: `Streaming HUB ${plan.label} – recurring`,
      amount: plan.monthlyPrice,
      section: 'recurring',
      type: 'subscription',
    });
  } else {
    // Yearly billing
    dueToday = plan.yearlyPrice;
    if (vpnCost > 0) {
      dueToday += vpnCost * 12; // VPN is still monthly-priced but paid annually
    }
    recurringMonthly = round2(dueToday / 12);
    recurringLabel = 'billed annually';

    // Show savings
    const monthlySavings = round2((plan.monthlyPrice * 12) - plan.yearlyPrice);
    
    lines.push({
      key: 'streaming-yearly',
      label: `Streaming HUB ${plan.label} – yearly`,
      amount: plan.yearlyPrice,
      section: 'due',
      type: 'subscription',
      originalAmount: round2(plan.monthlyPrice * 12),
      reason: `Save £${monthlySavings.toFixed(2)}`,
    });

    if (vpnCost > 0) {
      lines.push({
        key: 'streaming-vpn-yearly',
        label: 'VPN Privacy Add-on (12 months)',
        amount: round2(vpnCost * 12),
        section: 'due',
        type: 'addon',
      });
    }
  }

  // Installation
  const installResult = computeInstallationCost(input.installation);
  lines.push(...installResult.lineItems);

  // Add installation costs to due today
  dueToday = round2(
    dueToday + 
    installResult.install + 
    installResult.device + 
    installResult.shipping
  );

  return {
    dueToday,
    recurringMonthly,
    recurringLabel,
    lines,
    adjustments,
    source: 'streaming',
  };
}

// ============ MERGE QUOTES ============

export function mergeQuotes(quotes: Quote[], options: MergeOptions): Quote {
  if (quotes.length === 0) {
    return {
      dueToday: 0,
      recurringMonthly: 0,
      lines: [],
      adjustments: [],
    };
  }

  if (quotes.length === 1) {
    // Single quote - still apply discounts
    return applyDiscounts(quotes[0], options);
  }

  // Merge all lines and adjustments
  const allLines: LineItem[] = [];
  const allAdjustments: Adjustment[] = [];

  for (const quote of quotes) {
    allLines.push(...quote.lines);
    allAdjustments.push(...quote.adjustments);
  }

  // Build merged quote
  let merged: Quote = {
    dueToday: 0,
    recurringMonthly: 0,
    lines: allLines,
    adjustments: allAdjustments,
    recurringLabel: buildRecurringLabel(quotes),
  };

  // Apply discounts
  merged = applyDiscounts(merged, options);

  return merged;
}

/**
 * Build a combined recurring label from multiple quotes
 */
function buildRecurringLabel(quotes: Quote[]): string | undefined {
  const labels = quotes
    .map(q => q.recurringLabel)
    .filter((l): l is string => !!l);
  
  if (labels.length === 0) return undefined;
  if (labels.length === 1) return labels[0];
  
  // If mixed (e.g., "billed monthly" and "for next 5 months"), use the more specific one
  const hasMonthly = labels.some(l => l.includes('monthly'));
  const hasYearly = labels.some(l => l.includes('annually'));
  
  if (hasMonthly && hasYearly) {
    return 'mixed billing';
  }
  
  return labels[0];
}

/**
 * Apply all discounts in order
 */
function applyDiscounts(quote: Quote, options: MergeOptions): Quote {
  const lines = [...quote.lines.map(l => ({ ...l }))];
  const adjustments = [...quote.adjustments.map(a => ({ ...a }))];

  // (a) TV + HUB bundle discount
  if (options.waiveInstallForBundle) {
    applyBundleDiscount(lines);
  }

  // Calculate base due today before threshold check
  const dueTodayBase = lines
    .filter(l => l.section === 'due')
    .reduce((sum, l) => sum + l.amount, 0);

  // (b) Order threshold discount (only if bundle discount wasn't applied)
  if (options.orderThresholdFreeInstall && dueTodayBase >= options.orderThresholdFreeInstall) {
    if (!options.waiveInstallForBundle) {
      applyThresholdDiscount(lines, options.orderThresholdFreeInstall);
    }
  }

  // (c) Seasonal promo
  if (options.seasonalPromoActive && options.seasonalPromoPercentFirstMonth) {
    applySeasonalPromo(lines, adjustments, options.seasonalPromoPercentFirstMonth);
  }

  // (d) Coupon code
  if (options.couponCode) {
    applyCoupon(lines, adjustments, options.couponCode);
  }

  // Recalculate totals
  const dueToday = round2(
    lines
      .filter(l => l.section === 'due')
      .reduce((sum, l) => sum + l.amount, 0) +
    adjustments
      .filter(a => a.section === 'due')
      .reduce((sum, a) => sum + a.amount, 0)
  );

  const recurringMonthly = round2(
    lines
      .filter(l => l.section === 'recurring')
      .reduce((sum, l) => sum + l.amount, 0) +
    adjustments
      .filter(a => a.section === 'recurring')
      .reduce((sum, a) => sum + a.amount, 0)
  );

  return {
    ...quote,
    dueToday,
    recurringMonthly,
    lines,
    adjustments,
  };
}

/**
 * Apply bundle discount (TV + HUB)
 */
function applyBundleDiscount(lines: LineItem[]): void {
  for (const line of lines) {
    if (line.type === 'installation' && line.section === 'due') {
      if (line.key.includes('remote')) {
        // Remote: use configured discount (currently 100% off)
        if (!line.originalAmount) {
          line.originalAmount = line.amount;
        }
        line.amount = round2(line.originalAmount * (1 - BUNDLE_DISCOUNTS.remoteInstallDiscount));
        line.reason = 'Bundle TV + HUB';
      } else if (line.key.includes('callout')) {
        // Callout: use configured discount (currently 50% off)
        if (!line.originalAmount) {
          line.originalAmount = line.amount;
        }
        line.amount = round2(line.originalAmount * (1 - BUNDLE_DISCOUNTS.calloutInstallDiscount));
        line.reason = 'Bundle TV + HUB (-50%)';
      }
    }
  }
}

/**
 * Apply threshold discount (order >= £40)
 */
function applyThresholdDiscount(lines: LineItem[], threshold: number): void {
  for (const line of lines) {
    if (line.type === 'installation' && line.section === 'due' && !line.reason) {
      if (line.key.includes('remote')) {
        // Remote: 100% off
        if (!line.originalAmount) {
          line.originalAmount = line.amount;
        }
        line.amount = 0;
        line.reason = `Order over £${threshold}`;
      } else if (line.key.includes('callout')) {
        // Callout: 50% off
        if (!line.originalAmount) {
          line.originalAmount = line.amount;
        }
        line.amount = round2(line.originalAmount * 0.5);
        line.reason = `Order over £${threshold} (-50%)`;
      }
    }
  }
}

/**
 * Apply seasonal promo (e.g., Christmas -20%)
 */
function applySeasonalPromo(
  lines: LineItem[],
  adjustments: Adjustment[],
  percentOff: number
): void {
  for (const line of lines) {
    // Only apply to first-month subscription items in due section
    if (
      line.type === 'subscription' &&
      line.section === 'due' &&
      line.key.includes('first-month')
    ) {
      // We want the seasonal discount to apply to the current effective price
      const currentPrice = line.amount;
      const discount = round2(currentPrice * percentOff);
      // Preserve originalAmount as the price before any seasonal promo
      if (!line.originalAmount) {
        line.originalAmount = currentPrice;
      }
      line.amount = clampNonNegative(round2(currentPrice - discount));
      const promoReason = CHRISTMAS_PROMO.shortLabel;
      if (line.reason) {
        line.reason = `${line.reason}, ${promoReason}`;
      } else {
        line.reason = promoReason;
      }
    }
  }
}

/**
 * Apply coupon code discount
 */
function applyCoupon(
  lines: LineItem[], 
  adjustments: Adjustment[], 
  couponCode: string
): void {
  // Simple 10% off subscription items in due section
  let totalDiscount = 0;
  
  for (const line of lines) {
    if (line.type === 'subscription' && line.section === 'due') {
      const discount = round2(line.amount * 0.10);
      totalDiscount += discount;
    }
  }

  if (totalDiscount > 0) {
    adjustments.push({
      key: `coupon-${couponCode}`,
      label: `Promo code ${couponCode.toUpperCase()}`,
      amount: -totalDiscount,
      section: 'due',
    });
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

/**
 * Check if current date is before Christmas promo end
 */
export function getSeasonalPromoOptions(): Pick<MergeOptions, 'seasonalPromoActive' | 'seasonalPromoPercentFirstMonth'> {
  const active = isChristmasPromoActive();
  return {
    seasonalPromoActive: active,
    seasonalPromoPercentFirstMonth: active ? CHRISTMAS_PROMO.percentOff : undefined,
  };
}

/**
 * Get default merge options for the wizard
 */
export function getDefaultMergeOptions(hasTv: boolean, hasStreaming: boolean): MergeOptions {
  const promoOptions = getSeasonalPromoOptions();
  
  return {
    waiveInstallForBundle: hasTv && hasStreaming,
    orderThresholdFreeInstall: ORDER_THRESHOLD_FREE_INSTALL,
    ...promoOptions,
  };
}

/**
 * Compute a complete order quote from TV and/or Streaming inputs
 */
export function computeOrderQuote(
  tvInput: TvInput | null,
  streamingInput: StreamingInput | null,
  couponCode?: string
): Quote {
  const quotes: Quote[] = [];
  
  if (tvInput) {
    quotes.push(computeTvQuote(tvInput));
  }
  
  if (streamingInput) {
    quotes.push(computeStreamingQuote(streamingInput));
  }

  const options = getDefaultMergeOptions(!!tvInput, !!streamingInput);
  if (couponCode) {
    options.couponCode = couponCode;
  }

  return mergeQuotes(quotes, options);
}

// ============ ANALYTICS HELPER ============

/**
 * Generate order metadata for analytics/storage
 */
export interface OrderMetadata {
  planId: string;
  billingCycle: 'monthly' | 'yearly' | 'multi-month';
  countryCode?: string;
  countryTier?: TvCountryTier;
  hasBundle: boolean;
  hasFirestick: boolean;
  installType: InstallationType;
  totalDueToday: number;
  recurringMonthly: number;
  acquisitionChannel: 'wizard' | 'phone' | 'manual';
  promoApplied?: string;
}

export function buildOrderMetadata(
  tvInput: TvInput | null,
  streamingInput: StreamingInput | null,
  quote: Quote,
  channel: 'wizard' | 'phone' | 'manual' = 'wizard'
): OrderMetadata {
  const planIds: string[] = [];
  if (tvInput) planIds.push(tvInput.planId);
  if (streamingInput) planIds.push(streamingInput.planId);

  const installation = tvInput?.installation ?? streamingInput?.installation;
  const hasFirestick = installation?.type === 'firestick';

  let billingCycle: 'monthly' | 'yearly' | 'multi-month' = 'monthly';
  if (streamingInput?.billing === 'yearly') {
    billingCycle = 'yearly';
  } else if (tvInput && tvInput.durationMonths > 1) {
    billingCycle = 'multi-month';
  }

  // Check if promo was applied
  let promoApplied: string | undefined;
  const promoLine = quote.lines.find(l => l.reason?.includes('Christmas'));
  if (promoLine) {
    promoApplied = 'christmas-2025';
  }

  return {
    planId: planIds.join('+'),
    billingCycle,
    countryCode: tvInput?.planId === 'tv-single' ? undefined : undefined, // Would need country code from selection
    countryTier: tvInput?.countryTier,
    hasBundle: !!tvInput && !!streamingInput,
    hasFirestick,
    installType: installation?.type ?? 'remote',
    totalDueToday: quote.dueToday,
    recurringMonthly: quote.recurringMonthly,
    acquisitionChannel: channel,
    promoApplied,
  };
}

