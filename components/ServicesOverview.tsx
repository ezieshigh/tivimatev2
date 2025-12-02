import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Globe, Check, Shield, Zap, Package, Calendar as CalendarIcon, Wifi, Truck } from 'lucide-react';
import VenomOverlay from './VenomOverlay';
import ServiceWizard, { WizardStep } from './ServiceWizard';
import CalendarPopup from './CalendarPopup';
import { COUNTRIES, PLANS, Country, Plan } from '../data/plans';

// ============ TYPES ============

type WizardType = 'global-tv' | 'streaming-hub' | null;
type VenomMode = 'enter' | 'exit';

// Installation options with pricing
interface InstallationOption {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  requiresCalendar?: boolean;
  deliveryNote?: string;
}

// Fire Stick options
interface FireStickOption {
  id: string;
  name: string;
  price: number;
  features: string[];
}

// Duration options
interface DurationOption {
  months: number;
  label: string;
  discount?: number;
}

// Streaming HUB plan selection
interface StreamingPlanOption {
  planId: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  badge?: string;
}

// ============ CONSTANTS ============

const INSTALLATION_OPTIONS: InstallationOption[] = [
  {
    id: 'remote',
    name: 'Remote Help',
    price: 25,
    description: 'We connect remotely and install in ~20 minutes',
    icon: <Wifi size={24} />,
    badge: 'Recommended'
  },
  {
    id: 'callout',
    name: 'Callout Visit',
    price: 69.99,
    description: '3-day response time, London area only',
    icon: <CalendarIcon size={24} />,
    requiresCalendar: true,
    deliveryNote: 'London only'
  },
  {
    id: 'firestick',
    name: 'Fire Stick Bundle',
    price: 0, // Base price, actual price depends on device
    description: 'Pre-configured device shipped to you',
    icon: <Truck size={24} />,
    deliveryNote: '>7 days UK delivery'
  }
];

const FIRESTICK_OPTIONS: FireStickOption[] = [
  { id: 'lite', name: 'Fire TV Stick Lite', price: 59, features: ['Full HD', 'Basic remote'] },
  { id: 'standard', name: 'Fire TV Stick', price: 74.99, features: ['Full HD', 'Voice remote'] },
  { id: '4k', name: 'Fire TV Stick 4K', price: 84.99, features: ['4K Ultra HD', 'HDR support'] },
  { id: '4k-max', name: 'Fire TV Stick 4K Max', price: 99.99, features: ['4K Ultra HD', 'Faster CPU', 'Wi-Fi 6E'] },
  { id: 'cube', name: 'Fire TV Cube', price: 189.99, features: ['4K Ultra HD', 'Built-in speaker', 'Extra ports'] }
];

const DURATION_OPTIONS: DurationOption[] = [
  { months: 1, label: '1 Month' },
  { months: 3, label: '3 Months', discount: 5 },
  { months: 6, label: '6 Months', discount: 10 },
  { months: 12, label: '12 Months', discount: 15 }
];

const STREAMING_PLANS: StreamingPlanOption[] = [
  {
    planId: 'cinema-lite',
    name: 'Cinema Lite',
    monthlyPrice: 9.99,
    features: ['1080p HD Quality', 'Cinema Releases', 'Online Support'],
  },
  {
    planId: 'cinema-pro',
    name: 'Cinema Pro',
    monthlyPrice: 13.99,
    features: ['4K Ultra HD', 'Cinema Releases', 'Priority Support', 'VPN Available'],
    badge: 'Most Popular'
  }
];

// ============ WIZARD STEPS DEFINITIONS ============

const GLOBAL_TV_STEPS: WizardStep[] = [
  { id: 'country', label: 'Country' },
  { id: 'duration', label: 'Duration' },
  { id: 'plan', label: 'Plan' },
  { id: 'installation', label: 'Installation' },
  { id: 'summary', label: 'Summary' }
];

const STREAMING_HUB_STEPS: WizardStep[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'duration', label: 'Duration' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'installation', label: 'Installation' },
  { id: 'summary', label: 'Summary' }
];

// ============ MAIN COMPONENT ============

const ServicesOverview: React.FC = () => {
  // Wizard state
  const [activeWizard, setActiveWizard] = useState<WizardType>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [venomVisible, setVenomVisible] = useState(false);
  const [venomMode, setVenomMode] = useState<VenomMode>('enter');
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [glitchCard, setGlitchCard] = useState<'streaming' | 'global-tv' | null>(null);

  // Calendar popup state
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calloutDate, setCalloutDate] = useState<Date | null>(null);

  // Global TV wizard selections
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedTVPlan, setSelectedTVPlan] = useState<string>('tv-single');
  const [selectedInstallation, setSelectedInstallation] = useState<string>('remote');
  const [selectedFirestick, setSelectedFirestick] = useState<string>('4k');

  // Streaming HUB wizard selections
  const [selectedStreamingPlan, setSelectedStreamingPlan] = useState<string>('cinema-pro');
  const [selectedStreamingDuration, setSelectedStreamingDuration] = useState<'monthly' | 'yearly'>('monthly');
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [streamingInstallation, setStreamingInstallation] = useState<string>('remote');
  const [streamingFirestick, setStreamingFirestick] = useState<string>('4k');

  // ============ HANDLERS ============

  const handleBuyClick = useCallback((
    wizardType: WizardType,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Trigger glitch effect on card
    setGlitchCard(wizardType === 'global-tv' ? 'global-tv' : 'streaming');

    // Set origin for venom animation
    setOrigin({ x: centerX, y: centerY });
    setVenomMode('enter');
    setVenomVisible(true);
    setActiveWizard(wizardType);
    setWizardStep(0);

    // Reset selections
    if (wizardType === 'global-tv') {
      setSelectedCountry(null);
      setSelectedDuration(1);
      setSelectedTVPlan('tv-single');
      setSelectedInstallation('remote');
      setCalloutDate(null);
    } else {
      setSelectedStreamingPlan('cinema-pro');
      setSelectedStreamingDuration('monthly');
      setVpnEnabled(false);
      setStreamingInstallation('remote');
    }

    // Clear glitch after animation
    setTimeout(() => setGlitchCard(null), 600);
  }, []);

  const handleCloseWizard = useCallback(() => {
    setVenomMode('exit');
    // Venom exit animation will handle cleanup
  }, []);

  const handleVenomComplete = useCallback(() => {
    if (venomMode === 'exit') {
      setVenomVisible(false);
      setActiveWizard(null);
      setOrigin(null);
    }
  }, [venomMode]);

  const handleStepChange = useCallback((index: number) => {
    setWizardStep(index);
  }, []);

  // ============ PRICE CALCULATIONS ============

  const calculateGlobalTVPrice = useMemo(() => {
    let basePrice = 0;
    let setupFee = 49;
    const duration = selectedDuration;

    // Get plan pricing
    const plan = PLANS.find(p => p.id === selectedTVPlan);
    if (plan) {
      if (selectedTVPlan === 'tv-single' && selectedCountry) {
        basePrice = selectedCountry.tier === 'premium' 
          ? (plan.monthlyPricePremiumCountry || 12.99)
          : (plan.monthlyPriceStandardCountry || 9.99);
      } else if (plan.monthlyPrice) {
        basePrice = plan.monthlyPrice;
      }
    }

    // Apply duration discount
    const durationOption = DURATION_OPTIONS.find(d => d.months === duration);
    const discount = durationOption?.discount || 0;
    const discountedPrice = basePrice * (1 - discount / 100);
    const totalRecurring = discountedPrice * duration;

    // Installation cost
    let installCost = 0;
    if (selectedInstallation === 'remote') {
      installCost = 25;
    } else if (selectedInstallation === 'callout') {
      installCost = 69.99;
    } else if (selectedInstallation === 'firestick') {
      const stick = FIRESTICK_OPTIONS.find(f => f.id === selectedFirestick);
      installCost = stick?.price || 84.99;
    }

    return {
      monthlyPrice: discountedPrice,
      totalRecurring,
      setupFee,
      installCost,
      discount,
      grandTotal: totalRecurring + setupFee + installCost
    };
  }, [selectedCountry, selectedDuration, selectedTVPlan, selectedInstallation, selectedFirestick]);

  const calculateStreamingPrice = useMemo(() => {
    const plan = STREAMING_PLANS.find(p => p.planId === selectedStreamingPlan);
    let monthlyPrice = plan?.monthlyPrice || 13.99;
    const setupFee = 59;

    // VPN add-on
    const vpnCost = vpnEnabled ? 3 : 0;
    monthlyPrice += vpnCost;

    // Yearly discount
    const isYearly = selectedStreamingDuration === 'yearly';
    const discount = isYearly ? 15 : 0;
    const effectiveMonthly = monthlyPrice * (1 - discount / 100);
    const totalRecurring = isYearly ? effectiveMonthly * 12 : effectiveMonthly;

    // Installation cost
    let installCost = 0;
    if (streamingInstallation === 'remote') {
      installCost = 25;
    } else if (streamingInstallation === 'callout') {
      installCost = 69.99;
    } else if (streamingInstallation === 'firestick') {
      const stick = FIRESTICK_OPTIONS.find(f => f.id === streamingFirestick);
      installCost = stick?.price || 84.99;
    }

    return {
      monthlyPrice: effectiveMonthly,
      totalRecurring,
      setupFee,
      installCost,
      vpnCost,
      discount,
      grandTotal: totalRecurring + setupFee + installCost
    };
  }, [selectedStreamingPlan, selectedStreamingDuration, vpnEnabled, streamingInstallation, streamingFirestick]);

  // ============ WIZARD STEP CONTENT RENDERERS ============

  const renderGlobalTVStep = () => {
    switch (wizardStep) {
      case 0: // Country Selection
        return (
          <div className="wizard-step-country">
            <h3 className="wizard-step-title">Select Your Home Country</h3>
            <p className="wizard-step-desc">Choose the country whose TV channels you want to access</p>
            
            <div className="wizard-country-grid">
              {COUNTRIES.map((country) => (
                <button
                  key={country.id}
                  className={`wizard-country-tile ${selectedCountry?.id === country.id ? 'selected' : ''} ${country.tier}`}
                  onClick={() => setSelectedCountry(country)}
                >
                  <span className="wizard-country-flag">{country.flag}</span>
                  <span className="wizard-country-name">{country.name}</span>
                  {country.tier === 'premium' && (
                    <span className="wizard-country-badge">Premium</span>
                  )}
                </button>
              ))}
            </div>

            <div className="wizard-tier-legend">
              <span className="wizard-legend-item">
                <span className="wizard-legend-dot premium" /> Premium (£12.99/mo)
              </span>
              <span className="wizard-legend-item">
                <span className="wizard-legend-dot standard" /> Standard (£9.99/mo)
              </span>
            </div>
          </div>
        );

      case 1: // Duration Selection
        return (
          <div className="wizard-step-duration">
            <h3 className="wizard-step-title">Subscription Duration</h3>
            <p className="wizard-step-desc">Longer commitments = bigger savings</p>

            <div className="wizard-duration-grid">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  className={`wizard-duration-card ${selectedDuration === option.months ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(option.months)}
                >
                  <span className="wizard-duration-label">{option.label}</span>
                  {option.discount && (
                    <span className="wizard-duration-badge">Save {option.discount}%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // TV Plan Selection
        return (
          <div className="wizard-step-plan">
            <h3 className="wizard-step-title">Choose Your Plan</h3>
            <p className="wizard-step-desc">Based on your selection, we recommend the best value</p>

            <div className="wizard-plan-grid">
              {PLANS.filter(p => p.category === 'tv').map((plan) => {
                const isSelected = selectedTVPlan === plan.id;
                const price = plan.monthlyPrice || 
                  (selectedCountry?.tier === 'premium' ? plan.monthlyPricePremiumCountry : plan.monthlyPriceStandardCountry) || 
                  9.99;

                return (
                  <button
                    key={plan.id}
                    className={`wizard-plan-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTVPlan(plan.id)}
                  >
                    <div className="wizard-plan-header">
                      <span className="wizard-plan-name">{plan.name}</span>
                      {plan.badge && (
                        <span className="wizard-plan-badge">{plan.badge.replace('-', ' ')}</span>
                      )}
                    </div>
                    <p className="wizard-plan-tagline">{plan.tagline}</p>
                    <div className="wizard-plan-price">
                      <span className="wizard-plan-amount">£{price.toFixed(2)}</span>
                      <span className="wizard-plan-period">/month</span>
                    </div>
                    <ul className="wizard-plan-features">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i}><Check size={14} /> {feature}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3: // Installation Options
        return renderInstallationStep(
          selectedInstallation,
          setSelectedInstallation,
          selectedFirestick,
          setSelectedFirestick,
          'Both Global TV and Streaming HUB can be installed for these prices.'
        );

      case 4: // Summary
        return (
          <div className="wizard-step-summary">
            <h3 className="wizard-step-title">Order Summary</h3>
            
            <div className="wizard-summary-card">
              <div className="wizard-summary-section">
                <h4>Global TV Subscription</h4>
                <div className="wizard-summary-row">
                  <span>{selectedCountry?.name || 'Country'}</span>
                  <span>{selectedCountry?.tier === 'premium' ? 'Premium' : 'Standard'}</span>
                </div>
                <div className="wizard-summary-row">
                  <span>Plan</span>
                  <span>{PLANS.find(p => p.id === selectedTVPlan)?.name}</span>
                </div>
                <div className="wizard-summary-row">
                  <span>Duration</span>
                  <span>{selectedDuration} month{selectedDuration > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="wizard-summary-section">
                <h4>Installation</h4>
                <div className="wizard-summary-row">
                  <span>{INSTALLATION_OPTIONS.find(i => i.id === selectedInstallation)?.name}</span>
                  <span>£{calculateGlobalTVPrice.installCost.toFixed(2)}</span>
                </div>
                {selectedInstallation === 'firestick' && (
                  <div className="wizard-summary-row sub">
                    <span>{FIRESTICK_OPTIONS.find(f => f.id === selectedFirestick)?.name}</span>
                  </div>
                )}
                {selectedInstallation === 'callout' && calloutDate && (
                  <div className="wizard-summary-row sub">
                    <span>Scheduled: {calloutDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="wizard-summary-totals">
                <div className="wizard-summary-row">
                  <span>Setup Fee</span>
                  <span>£{calculateGlobalTVPrice.setupFee.toFixed(2)}</span>
                </div>
                <div className="wizard-summary-row">
                  <span>Subscription ({selectedDuration}mo @ £{calculateGlobalTVPrice.monthlyPrice.toFixed(2)}/mo)</span>
                  <span>£{calculateGlobalTVPrice.totalRecurring.toFixed(2)}</span>
                </div>
                {calculateGlobalTVPrice.discount > 0 && (
                  <div className="wizard-summary-row discount">
                    <span>Discount Applied</span>
                    <span>-{calculateGlobalTVPrice.discount}%</span>
                  </div>
                )}
                <div className="wizard-summary-row total">
                  <span>Total Due Today</span>
                  <span>£{calculateGlobalTVPrice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStreamingHubStep = () => {
    switch (wizardStep) {
      case 0: // Plan Selection
        return (
          <div className="wizard-step-streaming-plan">
            <h3 className="wizard-step-title">Choose Your Plan</h3>
            <p className="wizard-step-desc">All plans include cinema releases and aggregated streaming</p>

            <div className="wizard-streaming-plan-grid">
              {STREAMING_PLANS.map((plan) => (
                <button
                  key={plan.planId}
                  className={`wizard-streaming-card ${selectedStreamingPlan === plan.planId ? 'selected' : ''}`}
                  onClick={() => setSelectedStreamingPlan(plan.planId)}
                >
                  {plan.badge && (
                    <span className="wizard-streaming-badge">{plan.badge}</span>
                  )}
                  <h4 className="wizard-streaming-name">{plan.name}</h4>
                  <div className="wizard-streaming-price">
                    <span className="wizard-streaming-amount">£{plan.monthlyPrice.toFixed(2)}</span>
                    <span className="wizard-streaming-period">/month</span>
                  </div>
                  <ul className="wizard-streaming-features">
                    {plan.features.map((feature, i) => (
                      <li key={i}><Check size={14} /> {feature}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Duration
        return (
          <div className="wizard-step-streaming-duration">
            <h3 className="wizard-step-title">Billing Period</h3>
            <p className="wizard-step-desc">Save 15% with annual billing</p>

            <div className="wizard-billing-toggle">
              <button
                className={`wizard-billing-option ${selectedStreamingDuration === 'monthly' ? 'selected' : ''}`}
                onClick={() => setSelectedStreamingDuration('monthly')}
              >
                <span className="wizard-billing-label">Monthly</span>
                <span className="wizard-billing-price">£{(STREAMING_PLANS.find(p => p.planId === selectedStreamingPlan)?.monthlyPrice || 13.99).toFixed(2)}/mo</span>
              </button>
              <button
                className={`wizard-billing-option ${selectedStreamingDuration === 'yearly' ? 'selected' : ''}`}
                onClick={() => setSelectedStreamingDuration('yearly')}
              >
                <span className="wizard-billing-label">Yearly</span>
                <span className="wizard-billing-price">
                  £{((STREAMING_PLANS.find(p => p.planId === selectedStreamingPlan)?.monthlyPrice || 13.99) * 0.85 * 12).toFixed(2)}/yr
                </span>
                <span className="wizard-billing-badge">Save 15%</span>
              </button>
            </div>
          </div>
        );

      case 2: // Add-ons
        return (
          <div className="wizard-step-addons">
            <h3 className="wizard-step-title">Privacy Add-ons</h3>
            <p className="wizard-step-desc">Enhance your streaming experience</p>

            <div className="wizard-addon-card">
              <div className="wizard-addon-header">
                <Shield size={24} />
                <div className="wizard-addon-info">
                  <h4>VPN Privacy Protection</h4>
                  <p>Secure your connection and access content anywhere</p>
                </div>
                <div className="wizard-addon-price">+£3.00/mo</div>
              </div>
              
              <button
                className={`wizard-addon-toggle ${vpnEnabled ? 'enabled' : ''}`}
                onClick={() => setVpnEnabled(!vpnEnabled)}
              >
                <span className="wizard-toggle-track">
                  <span className="wizard-toggle-thumb" />
                </span>
                <span className="wizard-toggle-label">{vpnEnabled ? 'Enabled' : 'Disabled'}</span>
              </button>

              <div className="wizard-addon-recommendation">
                <Zap size={16} />
                <span>We strongly recommend enabling VPN for uninterrupted streaming</span>
              </div>
            </div>
          </div>
        );

      case 3: // Installation
        return renderInstallationStep(
          streamingInstallation,
          setStreamingInstallation,
          streamingFirestick,
          setStreamingFirestick,
          'Both Global TV and Streaming HUB can be installed for these prices.'
        );

      case 4: // Summary
        return (
          <div className="wizard-step-summary">
            <h3 className="wizard-step-title">Order Summary</h3>
            
            <div className="wizard-summary-card">
              <div className="wizard-summary-section">
                <h4>Streaming HUB Subscription</h4>
                <div className="wizard-summary-row">
                  <span>Plan</span>
                  <span>{STREAMING_PLANS.find(p => p.planId === selectedStreamingPlan)?.name}</span>
                </div>
                <div className="wizard-summary-row">
                  <span>Billing</span>
                  <span>{selectedStreamingDuration === 'yearly' ? 'Annual' : 'Monthly'}</span>
                </div>
                {vpnEnabled && (
                  <div className="wizard-summary-row">
                    <span>VPN Privacy</span>
                    <span>+£3.00/mo</span>
                  </div>
                )}
              </div>

              <div className="wizard-summary-section">
                <h4>Installation</h4>
                <div className="wizard-summary-row">
                  <span>{INSTALLATION_OPTIONS.find(i => i.id === streamingInstallation)?.name}</span>
                  <span>£{calculateStreamingPrice.installCost.toFixed(2)}</span>
                </div>
                {streamingInstallation === 'firestick' && (
                  <div className="wizard-summary-row sub">
                    <span>{FIRESTICK_OPTIONS.find(f => f.id === streamingFirestick)?.name}</span>
                  </div>
                )}
              </div>

              <div className="wizard-summary-totals">
                <div className="wizard-summary-row">
                  <span>Setup Fee</span>
                  <span>£{calculateStreamingPrice.setupFee.toFixed(2)}</span>
                </div>
                <div className="wizard-summary-row">
                  <span>
                    Subscription ({selectedStreamingDuration === 'yearly' ? '12mo' : '1mo'} @ £{calculateStreamingPrice.monthlyPrice.toFixed(2)}/mo)
                  </span>
                  <span>£{calculateStreamingPrice.totalRecurring.toFixed(2)}</span>
                </div>
                {calculateStreamingPrice.discount > 0 && (
                  <div className="wizard-summary-row discount">
                    <span>Annual Discount</span>
                    <span>-{calculateStreamingPrice.discount}%</span>
                  </div>
                )}
                <div className="wizard-summary-row total">
                  <span>Total Due Today</span>
                  <span>£{calculateStreamingPrice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Shared installation step renderer
  const renderInstallationStep = (
    selectedOption: string,
    setSelectedOption: (id: string) => void,
    selectedStick: string,
    setSelectedStick: (id: string) => void,
    note: string
  ) => (
    <div className="wizard-step-installation">
      <h3 className="wizard-step-title">Installation Method</h3>
      <p className="wizard-step-desc">Choose how you'd like to get set up</p>

      <div className="wizard-install-grid">
        {INSTALLATION_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={`wizard-install-card ${selectedOption === option.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedOption(option.id);
              if (option.id === 'callout') {
                setCalendarOpen(true);
              }
            }}
          >
            <div className="wizard-install-icon">{option.icon}</div>
            <div className="wizard-install-content">
              <span className="wizard-install-name">{option.name}</span>
              <span className="wizard-install-desc">{option.description}</span>
              {option.deliveryNote && (
                <span className="wizard-install-note">{option.deliveryNote}</span>
              )}
            </div>
            <div className="wizard-install-price">
              {option.id === 'firestick' ? 'from £59' : `£${option.price.toFixed(2)}`}
            </div>
            {option.badge && (
              <span className="wizard-install-badge">{option.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Fire Stick selection */}
      <AnimatePresence>
        {selectedOption === 'firestick' && (
          <motion.div
            className="wizard-firestick-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="wizard-firestick-title">
              <Package size={18} /> Select Your Fire Stick
            </h4>
            <div className="wizard-firestick-grid">
              {FIRESTICK_OPTIONS.map((stick) => (
                <button
                  key={stick.id}
                  className={`wizard-firestick-card ${selectedStick === stick.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStick(stick.id)}
                >
                  <span className="wizard-firestick-name">{stick.name}</span>
                  <span className="wizard-firestick-price">£{stick.price.toFixed(2)}</span>
                  <ul className="wizard-firestick-features">
                    {stick.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Callout date display */}
      {selectedOption === 'callout' && calloutDate && (
        <div className="wizard-callout-date">
          <CalendarIcon size={16} />
          <span>Scheduled: {calloutDate.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          <button onClick={() => setCalendarOpen(true)}>Change</button>
        </div>
      )}

      <p className="wizard-install-note-text">{note}</p>
    </div>
  );

  // ============ CAN PROCEED LOGIC ============

  const canProceed = useMemo(() => {
    if (activeWizard === 'global-tv') {
      switch (wizardStep) {
        case 0: return selectedCountry !== null;
        case 1: return selectedDuration > 0;
        case 2: return selectedTVPlan !== '';
        case 3: 
          if (selectedInstallation === 'callout') return calloutDate !== null;
          if (selectedInstallation === 'firestick') return selectedFirestick !== '';
          return true;
        case 4: return true;
        default: return true;
      }
    } else if (activeWizard === 'streaming-hub') {
      switch (wizardStep) {
        case 0: return selectedStreamingPlan !== '';
        case 1: return true;
        case 2: return true;
        case 3:
          if (streamingInstallation === 'callout') return calloutDate !== null;
          if (streamingInstallation === 'firestick') return streamingFirestick !== '';
          return true;
        case 4: return true;
        default: return true;
      }
    }
    return true;
  }, [
    activeWizard, wizardStep, selectedCountry, selectedDuration, selectedTVPlan,
    selectedInstallation, calloutDate, selectedFirestick, selectedStreamingPlan,
    streamingInstallation, streamingFirestick
  ]);

  const currentSteps = activeWizard === 'global-tv' ? GLOBAL_TV_STEPS : STREAMING_HUB_STEPS;
  const isLastStep = wizardStep === currentSteps.length - 1;

  const handleComplete = () => {
    // Here you would add to cart
    console.log('Adding to cart:', {
      wizard: activeWizard,
      ...(activeWizard === 'global-tv' ? {
        country: selectedCountry,
        duration: selectedDuration,
        plan: selectedTVPlan,
        installation: selectedInstallation,
        firestick: selectedInstallation === 'firestick' ? selectedFirestick : null,
        calloutDate: selectedInstallation === 'callout' ? calloutDate : null,
        total: calculateGlobalTVPrice.grandTotal
      } : {
        plan: selectedStreamingPlan,
        duration: selectedStreamingDuration,
        vpn: vpnEnabled,
        installation: streamingInstallation,
        firestick: streamingInstallation === 'firestick' ? streamingFirestick : null,
        total: calculateStreamingPrice.grandTotal
      })
    });
    handleCloseWizard();
  };

  // ============ RENDER ============

  return (
    <section id="services" className="section">
      <div className="container">
        <h2 className="section-title">Two Powerful Solutions</h2>
        <p className="section-subtitle">Choose the perfect setup for your entertainment needs.</p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {/* Card 1 - Streaming HUB */}
          <motion.div 
            whileHover={{ y: -5 }}
            className={`glitch-card accent-red ${glitchCard === 'streaming' ? 'active' : ''}`}
            style={{ 
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Glitch overlays */}
            <div className="scanline-overlay" />
            <div className="rgb-layer red" />
            <div className="rgb-layer cyan" />
            <div className="noise-overlay" />
            <div className="virus-lines" />
            <div className="border-draw top" />
            <div className="border-draw right" />
            <div className="border-draw bottom" />
            <div className="border-draw left" />
            <div className="corner-accent top-left" />
            <div className="corner-accent top-right" />
            <div className="corner-accent bottom-left" />
            <div className="corner-accent bottom-right" />

            <div className="glitch-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="glitch-icon" style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: 'rgba(255,26,26,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '2rem',
                color: 'var(--accent-red)'
              }}>
                <Tv size={32} />
              </div>
              <h3 className="glitch-text-item" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Cinematic Streaming Hub</h3>
              <p className="glitch-text-item" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                Aggregate all your favorite platforms into one seamless interface. No more switching apps.
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#ccc' }}>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ All platforms in one interface</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ New cinema releases included</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Works on Fire Stick & Smart TVs</li>
              </ul>
              <button 
                onClick={(e) => handleBuyClick('streaming-hub', e)} 
                className="hack-button"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </motion.div>

          {/* Card 2 - Global TV */}
          <motion.div 
            whileHover={{ y: -5 }}
            className={`glitch-card accent-white ${glitchCard === 'global-tv' ? 'active' : ''}`}
            style={{ 
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Glitch overlays */}
            <div className="scanline-overlay" />
            <div className="rgb-layer red" />
            <div className="rgb-layer cyan" />
            <div className="noise-overlay" />
            <div className="virus-lines" />
            <div className="border-draw top" />
            <div className="border-draw right" />
            <div className="border-draw bottom" />
            <div className="border-draw left" />
            <div className="corner-accent top-left" />
            <div className="corner-accent top-right" />
            <div className="corner-accent bottom-left" />
            <div className="corner-accent bottom-right" />

            <div className="glitch-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="glitch-icon" style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '2rem',
                color: 'white'
              }}>
                <Globe size={32} />
              </div>
              <h3 className="glitch-text-item" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Global TV Anywhere</h3>
              <p className="glitch-text-item" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                Watch live TV from your home country. Perfect for expats living abroad.
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#ccc' }}>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Access 25+ countries</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Premium sports & news channels</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Reliable HD streams</li>
              </ul>
              <button 
                onClick={(e) => handleBuyClick('global-tv', e)} 
                className="hack-button"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Venom Overlay with Wizard */}
      <AnimatePresence>
        {venomVisible && (
          <VenomOverlay
            isActive={venomVisible}
            mode={venomMode}
            origin={origin}
            onComplete={handleVenomComplete}
          >
            <ServiceWizard
              title={activeWizard === 'global-tv' ? 'Global TV Setup' : 'Streaming HUB Setup'}
              subtitle={activeWizard === 'global-tv' 
                ? 'Configure your home country TV access' 
                : 'Set up your cinematic streaming experience'}
              steps={currentSteps}
              currentStepIndex={wizardStep}
              onStepChange={handleStepChange}
              onClose={handleCloseWizard}
              onComplete={handleComplete}
              canProceed={canProceed}
              isLastStep={isLastStep}
              accentColor={activeWizard === 'global-tv' ? 'cyan' : 'red'}
            >
              {activeWizard === 'global-tv' ? renderGlobalTVStep() : renderStreamingHubStep()}
            </ServiceWizard>
          </VenomOverlay>
        )}
      </AnimatePresence>

      {/* Calendar Popup */}
      <CalendarPopup
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedDate={calloutDate}
        onDateChange={setCalloutDate}
        minDaysFromNow={3}
      />
    </section>
  );
};

export default ServicesOverview;
