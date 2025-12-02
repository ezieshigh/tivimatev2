/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized pricing and plan definitions
 * This is the single source of truth for all pricing-related data
 */

// ============ TV COUNTRIES ============

export type TvCountryTier = 'cheap' | 'rich';

export interface TvCountryConfig {
  code: string;      // 'PL', 'UK', 'DE', etc.
  name: string;
  tier: TvCountryTier;
  flag?: string;     // Optional emoji flag
}

export const TV_COUNTRIES: TvCountryConfig[] = [
  // Rich tier countries (approx cost ~£6.5/month base)
  { code: 'UK', name: 'United Kingdom', tier: 'rich', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', tier: 'rich', flag: '🇩🇪' },
  { code: 'FR', name: 'France', tier: 'rich', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', tier: 'rich', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', tier: 'rich', flag: '🇪🇸' },
  { code: 'IL', name: 'Israel', tier: 'rich', flag: '🇮🇱' },
  { code: 'RU', name: 'Russia', tier: 'rich', flag: '🇷🇺' },
  
  // Cheap tier countries (approx cost ~£5/month base)
  { code: 'PL', name: 'Poland', tier: 'cheap', flag: '🇵🇱' },
  { code: 'UA', name: 'Ukraine', tier: 'cheap', flag: '🇺🇦' },
  { code: 'GE', name: 'Georgia', tier: 'cheap', flag: '🇬🇪' },
  { code: 'AM', name: 'Armenia', tier: 'cheap', flag: '🇦🇲' },
  { code: 'KZ', name: 'Kazakhstan', tier: 'cheap', flag: '🇰🇿' },
  { code: 'BALTIC', name: 'Baltics (LT/LV/EE)', tier: 'cheap', flag: '🇪🇪' },
  { code: 'RO_MD', name: 'Romania & Moldova', tier: 'cheap', flag: '🇷🇴' },
  { code: 'TR_AZ', name: 'Türkiye & Azerbaijan', tier: 'cheap', flag: '🇹🇷' },
];

// Helper to get country by code
export function getCountryByCode(code: string): TvCountryConfig | undefined {
  return TV_COUNTRIES.find(c => c.code === code);
}

// ============ TV PLANS ============

export type TvPlanId = 'tv-single' | 'tv-eu-pack' | 'tv-world';

export interface TvPlanDefinition {
  id: TvPlanId;
  label: string;
  type: 'single' | 'bundle';
  // Cheap tier pricing (Lite/Pro)
  cheapMonthlyLite: number;
  cheapMonthlyPro: number;
  // Rich tier pricing (Lite/Pro)
  richMonthlyLite: number;
  richMonthlyPro: number;
  // One-time app fee
  appFee: number;
  // Features
  features: string[];
  devicesIncluded: number;
  maxCountries?: number;
  includesAllCountries?: boolean;
}

export const TV_PLANS: TvPlanDefinition[] = [
  {
    id: 'tv-single',
    label: 'Single Country',
    type: 'single',
    cheapMonthlyLite: 11.99,
    cheapMonthlyPro: 14.99,
    richMonthlyLite: 13.99,
    richMonthlyPro: 16.99,
    appFee: 4.99,
    devicesIncluded: 1,
    features: [
      'Select 1 Country',
      'Live HD Channels',
      'Catch-up TV (Selected channels)',
      'Stable Sports Feeds',
    ]
  },
  {
    id: 'tv-eu-pack',
    label: 'EU & Friends Pack',
    type: 'bundle',
    // EU pack uses average pricing
    cheapMonthlyLite: 22.99,
    cheapMonthlyPro: 27.99,
    richMonthlyLite: 24.99,
    richMonthlyPro: 29.99,
    appFee: 4.99,
    devicesIncluded: 2,
    maxCountries: 5,
    features: [
      'Choose any 5 Countries (Max 2 Rich)',
      'Great for Multi-lingual Families',
      '2 Devices Included',
      'Premium Sports Included',
    ]
  },
  {
    id: 'tv-world',
    label: 'World Unlimited',
    type: 'bundle',
    // World uses rich pricing as base
    cheapMonthlyLite: 27.99,
    cheapMonthlyPro: 32.99,
    richMonthlyLite: 29.99,
    richMonthlyPro: 34.99,
    appFee: 4.99,
    devicesIncluded: 2,
    includesAllCountries: true,
    features: [
      'Access ALL 15 Regions',
      'Full Global Sports Package',
      '2 Devices Included',
      'Priority Support',
    ]
  },
];

// ============ TV DURATION DISCOUNTS ============

export type TvDurationMonths = 1 | 3 | 6 | 12;

export const TV_DURATION_DISCOUNTS: Record<TvDurationMonths, number> = {
  1: 0,      // 0%
  3: 0.05,   // 5%
  6: 0.10,   // 10%
  12: 0.15,  // 15%
};

export const TV_DURATION_OPTIONS: { months: TvDurationMonths; label: string; discount: number }[] = [
  { months: 1, label: '1 Month', discount: 0 },
  { months: 3, label: '3 Months', discount: 5 },
  { months: 6, label: '6 Months', discount: 10 },
  { months: 12, label: '12 Months', discount: 15 },
];

// ============ STREAMING HUB PLANS ============

export type StreamingPlanId = 'cinema-lite' | 'cinema-pro';

export interface StreamingPlanDefinition {
  id: StreamingPlanId;
  label: string;
  monthlyPrice: number;
  yearlyPrice: number;
  vpnIncluded: boolean;
  features: string[];
  badge?: string;
  supportLevel: string;
}

export const STREAMING_PLANS: StreamingPlanDefinition[] = [
  {
    id: 'cinema-lite',
    label: 'Cinema Lite',
    monthlyPrice: 14.99,
    yearlyPrice: 159.99,  // ~£13.33/month
    vpnIncluded: false,
    supportLevel: 'Standard support',
    features: [
      'Aggregated Streaming Hub',
      '1080p HD Quality',
      'Cinema Releases Included',
      'Standard Support',
      'VPN available as add-on (+£2.99/mo)',
    ]
  },
  {
    id: 'cinema-pro',
    label: 'Cinema Pro',
    monthlyPrice: 18.99,
    yearlyPrice: 199.99,  // ~£16.67/month
    vpnIncluded: true,
    supportLevel: 'Priority support (often under 10 minutes)',
    badge: 'Most Popular',
    features: [
      'Aggregated Streaming Hub',
      '4K Ultra HD Optimized',
      'Cinema Releases Included',
      'Priority Support (< 10 min response)',
      'VPN Included – secure connection worldwide',
    ]
  },
];

// VPN add-on price for Lite plan
export const VPN_ADDON_MONTHLY_PRICE = 2.99;

// ============ FIRESTICK DEVICES ============

export type FirestickId = 'standard' | '4k' | '4k-max' | 'cube';

export interface FirestickDefinition {
  id: FirestickId;
  label: string;
  description: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

export const FIRESTICKS: FirestickDefinition[] = [
  { 
    id: 'standard', 
    label: 'Fire TV Stick', 
    description: 'Full HD, standard', 
    price: 74.99,
    features: ['Full HD', 'Voice remote']
  },
  { 
    id: '4k', 
    label: 'Fire TV Stick 4K', 
    description: 'Popular 4K model', 
    price: 84.99,
    features: ['4K Ultra HD', 'HDR support'],
    recommended: true
  },
  { 
    id: '4k-max', 
    label: 'Fire TV Stick 4K Max', 
    description: 'More powerful, better Wi-Fi', 
    price: 99.99,
    features: ['4K Ultra HD', 'Faster CPU', 'Wi-Fi 6E']
  },
  { 
    id: 'cube', 
    label: 'Fire TV Cube', 
    description: 'Top box with extra ports', 
    price: 189.99,
    features: ['4K Ultra HD', 'Built-in speaker', 'Extra ports']
  },
];

// ============ INSTALLATION CONSTANTS ============

export const INSTALLATION_PRICES = {
  // With subscription
  remote: 30,
  callout: 69,
  // Standalone (no subscription)
  remoteStandalone: 59.99,
  calloutStandalone: 79.99,
};

// ============ SHIPPING ============

export const SHIPPING = {
  freeThreshold: 100,  // Free shipping if device subtotal > £100
  standardRate: 5.99,
};

// ============ THRESHOLD AND BUNDLE RULES ============

export const ORDER_THRESHOLD_FREE_INSTALL = 40; // Discounted/free install if due today >= £40

export const BUNDLE_DISCOUNTS = {
  // When TV + HUB are both present
  remoteInstallDiscount: 1.0,    // 100% off (free)
  calloutInstallDiscount: 0.5,   // 50% off
};

// ============ SEASONAL PROMO ============

export const CHRISTMAS_PROMO = {
  active: true,
  endDate: new Date('2025-12-28T23:59:59'),
  percentOff: 0.20,  // 20% off first month
  label: '🎄 Christmas offer',
  shortLabel: 'Christmas promo -20%',
};

// Helper to check if promo is active
export function isChristmasPromoActive(): boolean {
  if (!CHRISTMAS_PROMO.active) return false;
  return new Date() < CHRISTMAS_PROMO.endDate;
}

// ============ COPY CONSTANTS ============

export const FIRESTICK_COPY = {
  recommendation: "Recommended: Firestick plug & play – we ship a ready, pre-configured device, you plug it into any TV and start watching immediately.",
  description: "You don't need a smart TV – Firestick turns any screen into a modern home cinema in seconds. Plug it into any TV, take it with you on holidays or to your family, and your whole setup travels in your pocket.",
  calloutNote: "Callout visit is mainly for people who prefer a technician to do everything on-site (ideal for older customers).",
};

export const TRIAL_COPY = {
  title: "7-Day Trial Guarantee",
  description: "Try it for 7 days – if you're not happy, we'll refund 100% of your first month's subscription. Installation and hardware are one-time costs and stay with you – we don't uninstall or take anything back.",
};

// ============ LEGACY EXPORTS FOR BACKWARDS COMPATIBILITY ============

// These are kept for any components that might still reference the old structure
export type CountryTier = TvCountryTier extends 'cheap' ? 'standard' : 'premium';

export type Country = {
  id: string;
  name: string;
  tier: 'standard' | 'premium';
  flag?: string;
};

// Map old country format
export const COUNTRIES: Country[] = TV_COUNTRIES.map(c => ({
  id: c.code.toLowerCase(),
  name: c.name,
  tier: c.tier === 'cheap' ? 'standard' : 'premium',
  flag: c.flag,
}));

export type PlanCategory = 'streaming' | 'tv' | 'bundle';
export type PlanBadge = 'most-popular' | 'best-value' | 'for-expats' | 'limited-offer';

export type Plan = {
  id: string;
  category: PlanCategory;
  name: string;
  tagline: string;
  badge?: PlanBadge;
  devicesIncluded: number;
  canAddDevices: boolean;
  addDevicePriceMonthly?: number;
  setupFee: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  monthlyPriceStandardCountry?: number;
  monthlyPricePremiumCountry?: number;
  yearlyPriceStandardCountry?: number;
  yearlyPricePremiumCountry?: number;
  includesAllCountries?: boolean;
  maxCountries?: number;
  features: string[];
};

// Legacy PLANS array for backwards compatibility
export const PLANS: Plan[] = [
  // Streaming
  {
    id: 'cinema-lite',
    category: 'streaming',
    name: 'Cinema Lite',
    tagline: 'Essential cinema access.',
    setupFee: INSTALLATION_PRICES.remote,
    monthlyPrice: STREAMING_PLANS[0].monthlyPrice,
    yearlyPrice: STREAMING_PLANS[0].yearlyPrice,
    devicesIncluded: 1,
    canAddDevices: false,
    features: STREAMING_PLANS[0].features,
  },
  {
    id: 'cinema-pro',
    category: 'streaming',
    name: 'Cinema Pro',
    tagline: 'The ultimate 4K experience.',
    badge: 'most-popular',
    setupFee: INSTALLATION_PRICES.remote,
    monthlyPrice: STREAMING_PLANS[1].monthlyPrice,
    yearlyPrice: STREAMING_PLANS[1].yearlyPrice,
    devicesIncluded: 1,
    canAddDevices: false,
    features: STREAMING_PLANS[1].features,
  },
  // TV
  {
    id: 'tv-single',
    category: 'tv',
    name: 'Single Country',
    tagline: 'Your home channels, reliable and clear.',
    setupFee: TV_PLANS[0].appFee,
    monthlyPriceStandardCountry: TV_PLANS[0].cheapMonthlyLite,
    monthlyPricePremiumCountry: TV_PLANS[0].richMonthlyLite,
    devicesIncluded: TV_PLANS[0].devicesIncluded,
    canAddDevices: true,
    addDevicePriceMonthly: 4,
    features: TV_PLANS[0].features,
  },
  {
    id: 'tv-eu-pack',
    category: 'tv',
    name: 'EU & Friends Pack',
    tagline: 'Mix and match up to 5 regions.',
    badge: 'for-expats',
    setupFee: TV_PLANS[1].appFee,
    monthlyPrice: TV_PLANS[1].richMonthlyLite,
    devicesIncluded: TV_PLANS[1].devicesIncluded,
    canAddDevices: true,
    addDevicePriceMonthly: 4,
    maxCountries: TV_PLANS[1].maxCountries,
    features: TV_PLANS[1].features,
  },
  {
    id: 'tv-world',
    category: 'tv',
    name: 'World Unlimited',
    tagline: 'No borders. Total access.',
    setupFee: TV_PLANS[2].appFee,
    monthlyPrice: TV_PLANS[2].richMonthlyLite,
    devicesIncluded: TV_PLANS[2].devicesIncluded,
    canAddDevices: true,
    addDevicePriceMonthly: 4,
    includesAllCountries: true,
    features: TV_PLANS[2].features,
  },
];
