
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CountryTier = "standard" | "premium";

export type Country = {
  id: string;
  name: string;
  tier: CountryTier;
  flag?: string; // Optional emoji flag
};

export type PlanCategory = "streaming" | "tv" | "bundle";

export type PlanBadge = "most-popular" | "best-value" | "for-expats" | "limited-offer";

export type Plan = {
  id: string;
  category: PlanCategory;
  name: string;
  tagline: string;
  badge?: PlanBadge;
  devicesIncluded: number;
  canAddDevices: boolean;
  addDevicePriceMonthly?: number;
  setupFee: number;                 // Base setup fee
  
  // Pricing variations
  monthlyPrice?: number;            // Standard fixed price
  yearlyPrice?: number;             // Standard fixed yearly
  
  // Complex pricing for Country Tiers
  monthlyPriceStandardCountry?: number;
  monthlyPricePremiumCountry?: number;
  yearlyPriceStandardCountry?: number;
  yearlyPricePremiumCountry?: number;
  
  includesAllCountries?: boolean;
  maxCountries?: number;            // e.g. 5 for EU pack
  
  features: string[];
};

export const COUNTRIES: Country[] = [
  // Premium
  { id: 'uk', name: 'United Kingdom', tier: 'premium', flag: '🇬🇧' },
  { id: 'de', name: 'Germany', tier: 'premium', flag: '🇩🇪' },
  { id: 'fr', name: 'France', tier: 'premium', flag: '🇫🇷' },
  { id: 'it', name: 'Italy', tier: 'premium', flag: '🇮🇹' },
  { id: 'es', name: 'Spain', tier: 'premium', flag: '🇪🇸' },
  { id: 'il', name: 'Israel', tier: 'premium', flag: '🇮🇱' },
  { id: 'ru', name: 'Russia', tier: 'premium', flag: '🇷🇺' },
  
  // Standard
  { id: 'pl', name: 'Poland', tier: 'standard', flag: '🇵🇱' },
  { id: 'ua', name: 'Ukraine', tier: 'standard', flag: '🇺🇦' },
  { id: 'ge', name: 'Georgia', tier: 'standard', flag: '🇬🇪' },
  { id: 'am', name: 'Armenia', tier: 'standard', flag: '🇦🇲' },
  { id: 'kz', name: 'Kazakhstan', tier: 'standard', flag: '🇰🇿' },
  { id: 'baltic', name: 'Baltics (LT/LV/EE)', tier: 'standard', flag: '🇪🇪' },
  { id: 'ro_md', name: 'Romania & Moldova', tier: 'standard', flag: '🇷🇴' },
  { id: 'tr_az', name: 'Türkiye & Azerbaijan', tier: 'standard', flag: '🇹🇷' },
];

export const PLANS: Plan[] = [
  // --- STREAMING ---
  {
    id: 'cinema-lite',
    category: 'streaming',
    name: 'Cinema Lite',
    tagline: 'Essential cinema access.',
    setupFee: 59,
    monthlyPrice: 9.99,
    devicesIncluded: 1,
    canAddDevices: false,
    features: [
      'Aggregated Streaming Hub',
      '1080p HD Quality',
      'Cinema Releases Included',
      'Online Support',
    ]
  },
  {
    id: 'cinema-pro',
    category: 'streaming',
    name: 'Cinema Pro',
    tagline: 'The ultimate 4K experience.',
    badge: 'most-popular',
    setupFee: 59,
    monthlyPrice: 13.99,
    devicesIncluded: 1,
    canAddDevices: false,
    features: [
      'Aggregated Streaming Hub',
      '4K Ultra HD Optimized',
      'Cinema Releases Included',
      'Priority 6h Support Window',
      'Privacy-first VPN Available (+£6.50/mo)',
    ]
  },
  {
    id: 'cinema-yearly',
    category: 'streaming',
    name: 'Cinema Yearly',
    tagline: 'Commit for a year and save.',
    badge: 'best-value',
    setupFee: 59,
    yearlyPrice: 119,
    devicesIncluded: 1,
    canAddDevices: false,
    features: [
      'Includes everything in Cinema Lite',
      'Equivalent to £9.90/month',
      'Priority Installation',
      '12 Months Guaranteed Rate',
    ]
  },

  // --- GLOBAL TV ---
  {
    id: 'tv-single',
    category: 'tv',
    name: 'Single Country',
    tagline: 'Your home channels, reliable and clear.',
    setupFee: 49,
    monthlyPriceStandardCountry: 9.99,
    monthlyPricePremiumCountry: 12.99,
    yearlyPriceStandardCountry: 89,
    yearlyPricePremiumCountry: 119,
    devicesIncluded: 1,
    canAddDevices: true,
    addDevicePriceMonthly: 4,
    features: [
      'Select 1 Country',
      'Live HD Channels',
      'Catch-up TV (Selected channels)',
      'Stable Sports Feeds',
    ]
  },
  {
    id: 'tv-eu-pack',
    category: 'tv',
    name: 'EU & Friends Pack',
    tagline: 'Mix and match up to 5 regions.',
    badge: 'for-expats',
    setupFee: 49,
    monthlyPrice: 24.99,
    devicesIncluded: 2,
    canAddDevices: true,
    addDevicePriceMonthly: 4,
    maxCountries: 5,
    features: [
      'Choose any 5 Countries (Max 2 Premium)',
      'Great for Multi-lingual Families',
      '2 Devices Included',
      'Premium Sports Included',
    ]
  },
  {
    id: 'tv-world',
    category: 'tv',
    name: 'World Unlimited',
    tagline: 'No borders. Total access.',
    setupFee: 49,
    monthlyPrice: 29.99,
    yearlyPrice: 179,
    devicesIncluded: 2,
    canAddDevices: true,
    addDevicePriceMonthly: 4,
    includesAllCountries: true,
    features: [
      'Access ALL 15 Regions',
      'Full Global Sports Package',
      '2 Devices Included',
      'Priority Support',
    ]
  },

  // --- BUNDLES ---
  {
    id: 'bundle-home',
    category: 'bundle',
    name: 'Home & Cinema',
    tagline: 'Streaming Hub + 1 Home Country.',
    setupFee: 79,
    monthlyPriceStandardCountry: 17.99,
    monthlyPricePremiumCountry: 19.99,
    devicesIncluded: 3, // 1 Stream + 2 TV
    canAddDevices: true,
    features: [
      'Cinematic Streaming Hub (1 Device)',
      'Global TV Single Country (2 Devices)',
      'Save on Setup Fees',
      'Unified Billing',
    ]
  },
  {
    id: 'bundle-max',
    category: 'bundle',
    name: 'Globe & Cinema Max',
    tagline: 'Everything we offer. No compromises.',
    badge: 'limited-offer',
    setupFee: 99,
    monthlyPrice: 34.99,
    yearlyPrice: 259,
    devicesIncluded: 3, // 1 Stream + 2 TV
    canAddDevices: true,
    includesAllCountries: true,
    features: [
      'Cinematic Streaming Hub (1 Device)',
      'World Unlimited TV (2 Devices)',
      'Best Possible Value',
      'Priority VIP Support',
    ]
  },
];
