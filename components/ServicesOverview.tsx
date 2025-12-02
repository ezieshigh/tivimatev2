import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Globe, Check, Shield, Zap, Package, Calendar as CalendarIcon, Wifi, Truck, Clock, Gift, ChevronRight, Star } from 'lucide-react';
import VenomOverlay from './VenomOverlay';
import ServiceWizard, { WizardStep } from './ServiceWizard';
import CalendarPopup from './CalendarPopup';
import {
  TV_COUNTRIES,
  TV_PLANS,
  TV_DURATION_OPTIONS,
  STREAMING_PLANS,
  FIRESTICKS,
  CHRISTMAS_PROMO,
  isChristmasPromoActive,
  FIRESTICK_COPY,
  TRIAL_COPY,
  type TvCountryConfig,
  type TvPlanId,
  type TvDurationMonths,
  type StreamingPlanId,
  type FirestickId,
} from '../data/plans';
import {
  computeTvQuote,
  computeStreamingQuote,
  mergeQuotes,
  getDefaultMergeOptions,
  formatCurrency,
  type TvInput,
  type StreamingInput,
  type InstallationType,
  type Quote,
  type LineItem,
} from '../services/pricing';

// ============ TYPES ============

type WizardType = 'global-tv' | 'streaming-hub' | null;
type VenomMode = 'enter' | 'exit';

// ============ WIZARD STEPS DEFINITIONS ============

const GLOBAL_TV_STEPS: WizardStep[] = [
  { id: 'country', label: 'Country' },
  { id: 'plan', label: 'Plan' },
  { id: 'duration', label: 'Duration' },
  { id: 'installation', label: 'Installation' },
  { id: 'summary', label: 'Summary' }
];

const STREAMING_HUB_STEPS: WizardStep[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'billing', label: 'Billing' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'installation', label: 'Installation' },
  { id: 'summary', label: 'Summary' }
];

// ============ CHRISTMAS PROMO COUNTDOWN ============

const ChristmasPromoBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = CHRISTMAS_PROMO.endDate;
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (!isChristmasPromoActive() || !timeLeft) return null;
  
  return (
    <div className="christmas-promo-banner">
      <div className="promo-content">
        <Gift size={18} />
        <span>{CHRISTMAS_PROMO.label} until 28.12: first month of TV + HUB 20% off</span>
        <div className="promo-timer">
          <Clock size={14} />
          <span>Ends in: {timeLeft}</span>
        </div>
      </div>
    </div>
  );
};

// ============ QUOTE SUMMARY COMPONENT ============

interface QuoteSummaryProps {
  quote: Quote;
  showRecurring?: boolean;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ quote, showRecurring = true }) => {
  const dueLines = quote.lines.filter(l => l.section === 'due');
  const recurringLines = quote.lines.filter(l => l.section === 'recurring');
  const dueAdjustments = quote.adjustments.filter(a => a.section === 'due');
  const recurringAdjustments = quote.adjustments.filter(a => a.section === 'recurring');

  return (
    <div className="quote-summary">
      {/* Due Today Block */}
      <div className="quote-block quote-block-due">
        <h4 className="quote-block-title">
          <span className="quote-icon">💳</span>
          Due Today
        </h4>
        <div className="quote-lines">
          {dueLines.map((line) => (
            <div key={line.key} className="quote-line">
              <span className="quote-line-label">{line.label}</span>
              <span className="quote-line-amount">
                {line.originalAmount && line.originalAmount !== line.amount ? (
                  <>
                    <span className="quote-original">{formatCurrency(line.originalAmount)}</span>
                    <span className="quote-discounted">{formatCurrency(line.amount)}</span>
                    {line.reason && <span className="quote-reason">({line.reason})</span>}
                  </>
                ) : (
                  formatCurrency(line.amount)
                )}
              </span>
            </div>
          ))}
          {dueAdjustments.map((adj) => (
            <div key={adj.key} className="quote-line quote-adjustment">
              <span className="quote-line-label">{adj.label}</span>
              <span className="quote-line-amount discount">{formatCurrency(adj.amount)}</span>
            </div>
          ))}
        </div>
        <div className="quote-total">
          <span>Total Due Today</span>
          <span className="quote-total-amount">{formatCurrency(quote.dueToday)}</span>
        </div>
      </div>

      {/* Recurring Block */}
      {showRecurring && quote.recurringMonthly > 0 && (
        <div className="quote-block quote-block-recurring">
          <h4 className="quote-block-title">
            <span className="quote-icon">🔄</span>
            Recurring
          </h4>
          <div className="quote-lines">
            {recurringLines.map((line) => (
              <div key={line.key} className="quote-line">
                <span className="quote-line-label">{line.label}</span>
                <span className="quote-line-amount">{formatCurrency(line.amount)}</span>
              </div>
            ))}
            {recurringAdjustments.map((adj) => (
              <div key={adj.key} className="quote-line quote-adjustment">
                <span className="quote-line-label">{adj.label}</span>
                <span className="quote-line-amount discount">{formatCurrency(adj.amount)}</span>
              </div>
            ))}
          </div>
          <div className="quote-total">
            <span>Monthly Total</span>
            <span className="quote-total-amount">{formatCurrency(quote.recurringMonthly)}</span>
          </div>
          {quote.recurringLabel && (
            <div className="quote-recurring-label">{quote.recurringLabel}</div>
          )}
        </div>
      )}

      {/* Trial notice */}
      <div className="quote-trial-notice">
        <Shield size={16} />
        <span>{TRIAL_COPY.description}</span>
      </div>
    </div>
  );
};

// ============ MINI QUOTE BAR ============

interface MiniQuoteBarProps {
  quote: Quote;
}

const MiniQuoteBar: React.FC<MiniQuoteBarProps> = ({ quote }) => {
  return (
    <div className="mini-quote-bar">
      <div className="mini-quote-item">
        <span className="mini-quote-label">Due today:</span>
        <span className="mini-quote-amount">{formatCurrency(quote.dueToday)}</span>
      </div>
      {quote.recurringMonthly > 0 && (
        <div className="mini-quote-item">
          <span className="mini-quote-label">Later:</span>
          <span className="mini-quote-amount">{formatCurrency(quote.recurringMonthly)}/mo</span>
        </div>
      )}
    </div>
  );
};

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
  const [selectedCountry, setSelectedCountry] = useState<TvCountryConfig | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<TvDurationMonths>(1);
  const [selectedTVPlan, setSelectedTVPlan] = useState<TvPlanId>('tv-single');
  const [selectedTVTier, setSelectedTVTier] = useState<'lite' | 'pro'>('lite');
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationType>('remote');
  const [selectedFirestick, setSelectedFirestick] = useState<FirestickId>('4k');

  // Streaming HUB wizard selections
  const [selectedStreamingPlan, setSelectedStreamingPlan] = useState<StreamingPlanId>('cinema-pro');
  const [selectedStreamingBilling, setSelectedStreamingBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [streamingInstallation, setStreamingInstallation] = useState<InstallationType>('remote');
  const [streamingFirestick, setStreamingFirestick] = useState<FirestickId>('4k');

  // ============ COMPUTED QUOTES ============

  const tvInput = useMemo((): TvInput | null => {
    if (activeWizard !== 'global-tv' || !selectedCountry) return null;
    
    return {
      planId: selectedTVPlan,
      countryTier: selectedCountry.tier,
      isPro: selectedTVTier === 'pro',
      durationMonths: selectedDuration,
      installation: {
        type: selectedInstallation,
        firestickId: selectedInstallation === 'firestick' ? selectedFirestick : undefined,
      },
    };
  }, [activeWizard, selectedCountry, selectedTVPlan, selectedTVTier, selectedDuration, selectedInstallation, selectedFirestick]);

  const streamingInput = useMemo((): StreamingInput | null => {
    if (activeWizard !== 'streaming-hub') return null;
    
    const plan = STREAMING_PLANS.find(p => p.id === selectedStreamingPlan);
    
    return {
      planId: selectedStreamingPlan,
      billing: selectedStreamingBilling,
      vpnEnabled: vpnEnabled && !(plan?.vpnIncluded),
      installation: {
        type: streamingInstallation,
        firestickId: streamingInstallation === 'firestick' ? streamingFirestick : undefined,
      },
    };
  }, [activeWizard, selectedStreamingPlan, selectedStreamingBilling, vpnEnabled, streamingInstallation, streamingFirestick]);

  const currentQuote = useMemo((): Quote => {
    const quotes: Quote[] = [];
    
    if (tvInput) {
      try {
        quotes.push(computeTvQuote(tvInput));
      } catch {
        // Plan not selected yet
      }
    }
    
    if (streamingInput) {
      try {
        quotes.push(computeStreamingQuote(streamingInput));
      } catch {
        // Plan not selected yet
      }
    }
    
    if (quotes.length === 0) {
      return { dueToday: 0, recurringMonthly: 0, lines: [], adjustments: [] };
    }
    
    const options = getDefaultMergeOptions(!!tvInput, !!streamingInput);
    return mergeQuotes(quotes, options);
  }, [tvInput, streamingInput]);

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
      setSelectedTVTier('lite');
      setSelectedInstallation('remote');
      setCalloutDate(null);
    } else {
      setSelectedStreamingPlan('cinema-pro');
      setSelectedStreamingBilling('monthly');
      setVpnEnabled(false);
      setStreamingInstallation('remote');
    }

    // Clear glitch after animation
    setTimeout(() => setGlitchCard(null), 600);
  }, []);

  const handleCloseWizard = useCallback(() => {
    setVenomMode('exit');
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

  // ============ WIZARD STEP CONTENT RENDERERS ============

  const renderGlobalTVStep = () => {
    switch (wizardStep) {
      case 0: // Country Selection
        return (
          <div className="wizard-step-country">
            <h3 className="wizard-step-title">Select Your Home Country</h3>
            <p className="wizard-step-desc">Choose the country whose TV channels you want to access</p>
            
            <div className="wizard-country-grid">
              {TV_COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  className={`wizard-country-tile ${selectedCountry?.code === country.code ? 'selected' : ''} ${country.tier}`}
                  onClick={() => setSelectedCountry(country)}
                >
                  <span className="wizard-country-flag">{country.flag}</span>
                  <span className="wizard-country-name">{country.name}</span>
                  {country.tier === 'rich' && (
                    <span className="wizard-country-badge">Premium</span>
                  )}
                </button>
              ))}
            </div>

            <div className="wizard-tier-legend">
              <span className="wizard-legend-item">
                <span className="wizard-legend-dot premium" /> Premium (£13.99-16.99/mo)
              </span>
              <span className="wizard-legend-item">
                <span className="wizard-legend-dot standard" /> Standard (£11.99-14.99/mo)
              </span>
            </div>
          </div>
        );

      case 1: // Plan Type Selection (Lite/Pro)
        return (
          <div className="wizard-step-plan-type">
            <h3 className="wizard-step-title">Choose Lite or Pro</h3>
            <p className="wizard-step-desc">Select your service level</p>

            <div className="wizard-plan-type-grid">
              {/* Lite */}
              <button
                className={`wizard-plan-type-card ${selectedTVTier === 'lite' ? 'selected' : ''}`}
                onClick={() => setSelectedTVTier('lite')}
              >
                <div className="plan-type-header">
                  <span className="plan-type-name">TV Global Lite</span>
                </div>
                <div className="plan-type-price">
                  <span className="plan-type-amount">
                    {selectedCountry?.tier === 'cheap' ? '£11.99' : '£13.99'}
                  </span>
                  <span className="plan-type-period">/month</span>
                </div>
                <ul className="plan-type-features">
                  <li><Check size={14} /> Live HD Channels</li>
                  <li><Check size={14} /> Catch-up TV</li>
                  <li><Check size={14} /> Standard Support</li>
                </ul>
              </button>

              {/* Pro */}
              <button
                className={`wizard-plan-type-card ${selectedTVTier === 'pro' ? 'selected' : ''}`}
                onClick={() => setSelectedTVTier('pro')}
              >
                <div className="plan-type-header">
                  <span className="plan-type-name">TV Global Pro</span>
                  <span className="plan-type-badge">Recommended</span>
                </div>
                <div className="plan-type-price">
                  <span className="plan-type-amount">
                    {selectedCountry?.tier === 'cheap' ? '£14.99' : '£16.99'}
                  </span>
                  <span className="plan-type-period">/month</span>
                </div>
                <ul className="plan-type-features">
                  <li><Check size={14} /> Live HD + 4K Channels</li>
                  <li><Check size={14} /> Full Catch-up Library</li>
                  <li><Check size={14} /> Premium Sports Package</li>
                  <li><Check size={14} /> Priority Support</li>
                </ul>
              </button>
            </div>
          </div>
        );

      case 2: // Duration Selection
        return (
          <div className="wizard-step-duration">
            <h3 className="wizard-step-title">Subscription Duration</h3>
            <p className="wizard-step-desc">Longer commitments = bigger savings</p>

            <div className="wizard-duration-grid">
              {TV_DURATION_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  className={`wizard-duration-card ${selectedDuration === option.months ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(option.months)}
                >
                  <span className="wizard-duration-label">{option.label}</span>
                  {option.discount > 0 && (
                    <span className="wizard-duration-badge">Save {option.discount}%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Installation Options
        return renderInstallationStep(
          selectedInstallation,
          setSelectedInstallation,
          selectedFirestick,
          setSelectedFirestick
        );

      case 4: // Summary
        return (
          <div className="wizard-step-summary">
            <h3 className="wizard-step-title">Order Summary</h3>
            
            <div className="wizard-summary-details">
              <div className="summary-row">
                <span className="summary-label">Country</span>
                <span className="summary-value">{selectedCountry?.flag} {selectedCountry?.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Plan</span>
                <span className="summary-value">TV Global {selectedTVTier === 'pro' ? 'Pro' : 'Lite'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Duration</span>
                <span className="summary-value">{selectedDuration} month{selectedDuration > 1 ? 's' : ''}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Installation</span>
                <span className="summary-value">
                  {selectedInstallation === 'remote' ? 'Remote Help' : 
                   selectedInstallation === 'callout' ? 'Callout Visit' : 
                   FIRESTICKS.find(f => f.id === selectedFirestick)?.label}
                </span>
              </div>
            </div>

            <QuoteSummary quote={currentQuote} />
          </div>
        );

      default:
        return null;
    }
  };

  const renderStreamingHubStep = () => {
    const currentPlan = STREAMING_PLANS.find(p => p.id === selectedStreamingPlan);
    
    switch (wizardStep) {
      case 0: // Plan Selection
        return (
          <div className="wizard-step-streaming-plan">
            <h3 className="wizard-step-title">Choose Your Plan</h3>
            <p className="wizard-step-desc">All plans include cinema releases and aggregated streaming</p>

            <div className="wizard-streaming-plan-grid">
              {STREAMING_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  className={`wizard-streaming-card ${selectedStreamingPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStreamingPlan(plan.id)}
                >
                  {plan.badge && (
                    <span className="wizard-streaming-badge">
                      <Star size={12} /> {plan.badge}
                    </span>
                  )}
                  <h4 className="wizard-streaming-name">{plan.label}</h4>
                  <div className="wizard-streaming-price">
                    <span className="wizard-streaming-amount">£{plan.monthlyPrice.toFixed(2)}</span>
                    <span className="wizard-streaming-period">/month</span>
                  </div>
                  <p className="wizard-streaming-support">{plan.supportLevel}</p>
                  <ul className="wizard-streaming-features">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i}><Check size={14} /> {feature}</li>
                    ))}
                  </ul>
                  {plan.id === 'cinema-pro' && (
                    <div className="wizard-streaming-highlight">
                      Recommended for families and expats
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Billing Period
        return (
          <div className="wizard-step-streaming-duration">
            <h3 className="wizard-step-title">Billing Period</h3>
            <p className="wizard-step-desc">Save with annual billing</p>

            <div className="wizard-billing-toggle">
              <button
                className={`wizard-billing-option ${selectedStreamingBilling === 'monthly' ? 'selected' : ''}`}
                onClick={() => setSelectedStreamingBilling('monthly')}
              >
                <span className="wizard-billing-label">Monthly</span>
                <span className="wizard-billing-price">
                  £{currentPlan?.monthlyPrice.toFixed(2)}/mo
                </span>
                <span className="wizard-billing-desc">Flexible, cancel anytime</span>
              </button>
              <button
                className={`wizard-billing-option ${selectedStreamingBilling === 'yearly' ? 'selected' : ''}`}
                onClick={() => setSelectedStreamingBilling('yearly')}
              >
                <span className="wizard-billing-label">Yearly</span>
                <span className="wizard-billing-price">
                  £{currentPlan?.yearlyPrice.toFixed(2)}/yr
                </span>
                <span className="wizard-billing-desc">
                  ~£{((currentPlan?.yearlyPrice ?? 0) / 12).toFixed(2)}/mo equivalent
                </span>
                <span className="wizard-billing-badge">
                  Save £{(((currentPlan?.monthlyPrice ?? 0) * 12) - (currentPlan?.yearlyPrice ?? 0)).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        );

      case 2: // Add-ons
        return (
          <div className="wizard-step-addons">
            <h3 className="wizard-step-title">Privacy Add-ons</h3>
            <p className="wizard-step-desc">Enhance your streaming experience</p>

            {currentPlan?.vpnIncluded ? (
              <div className="wizard-addon-included">
                <Shield size={24} className="addon-included-icon" />
                <div className="addon-included-content">
                  <h4>VPN Privacy Protection Included</h4>
                  <p>Your Cinema Pro plan includes VPN – secure connection to UK/PL from anywhere in the world</p>
                </div>
                <Check size={24} className="addon-included-check" />
              </div>
            ) : (
              <div className="wizard-addon-card">
                <div className="wizard-addon-header">
                  <Shield size={24} />
                  <div className="wizard-addon-info">
                    <h4>VPN Privacy Protection</h4>
                    <p>Secure your connection and access content anywhere</p>
                  </div>
                  <div className="wizard-addon-price">+£2.99/mo</div>
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
            )}
          </div>
        );

      case 3: // Installation
        return renderInstallationStep(
          streamingInstallation,
          setStreamingInstallation,
          streamingFirestick,
          setStreamingFirestick
        );

      case 4: // Summary
        return (
          <div className="wizard-step-summary">
            <h3 className="wizard-step-title">Order Summary</h3>
            
            <div className="wizard-summary-details">
              <div className="summary-row">
                <span className="summary-label">Plan</span>
                <span className="summary-value">{currentPlan?.label}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Billing</span>
                <span className="summary-value">{selectedStreamingBilling === 'yearly' ? 'Annual' : 'Monthly'}</span>
              </div>
              {!currentPlan?.vpnIncluded && (
                <div className="summary-row">
                  <span className="summary-label">VPN Add-on</span>
                  <span className="summary-value">{vpnEnabled ? 'Yes (+£2.99/mo)' : 'No'}</span>
                </div>
              )}
              <div className="summary-row">
                <span className="summary-label">Installation</span>
                <span className="summary-value">
                  {streamingInstallation === 'remote' ? 'Remote Help' : 
                   streamingInstallation === 'callout' ? 'Callout Visit' : 
                   FIRESTICKS.find(f => f.id === streamingFirestick)?.label}
                </span>
              </div>
            </div>

            <QuoteSummary quote={currentQuote} />
          </div>
        );

      default:
        return null;
    }
  };

  // Shared installation step renderer
  const renderInstallationStep = (
    selectedOption: InstallationType,
    setSelectedOption: (id: InstallationType) => void,
    selectedStick: FirestickId,
    setSelectedStick: (id: FirestickId) => void
  ) => (
    <div className="wizard-step-installation">
      <h3 className="wizard-step-title">Installation Method</h3>
      <p className="wizard-step-desc">Choose how you'd like to get set up</p>

      <div className="wizard-install-grid">
        {/* Remote */}
        <button
          className={`wizard-install-card ${selectedOption === 'remote' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('remote')}
        >
          <div className="wizard-install-icon"><Wifi size={24} /></div>
          <div className="wizard-install-content">
            <span className="wizard-install-name">Remote Help</span>
            <span className="wizard-install-desc">We connect remotely and install in ~20 minutes</span>
          </div>
          <div className="wizard-install-price">£30.00</div>
          <span className="wizard-install-badge">Recommended</span>
        </button>

        {/* Firestick */}
        <button
          className={`wizard-install-card ${selectedOption === 'firestick' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('firestick')}
        >
          <div className="wizard-install-icon"><Truck size={24} /></div>
          <div className="wizard-install-content">
            <span className="wizard-install-name">Firestick Plug & Play</span>
            <span className="wizard-install-desc">{FIRESTICK_COPY.recommendation}</span>
            <span className="wizard-install-note">&gt;7 days UK delivery</span>
          </div>
          <div className="wizard-install-price">from £74.99</div>
        </button>

        {/* Callout */}
        <button
          className={`wizard-install-card ${selectedOption === 'callout' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedOption('callout');
            setCalendarOpen(true);
          }}
        >
          <div className="wizard-install-icon"><CalendarIcon size={24} /></div>
          <div className="wizard-install-content">
            <span className="wizard-install-name">Callout Visit</span>
            <span className="wizard-install-desc">{FIRESTICK_COPY.calloutNote}</span>
            <span className="wizard-install-note">London area only</span>
          </div>
          <div className="wizard-install-price">£69.00</div>
        </button>
      </div>

      {/* Firestick description */}
      {selectedOption === 'firestick' && (
        <div className="wizard-firestick-info">
          <p>{FIRESTICK_COPY.description}</p>
        </div>
      )}

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
              {FIRESTICKS.map((stick) => (
                <button
                  key={stick.id}
                  className={`wizard-firestick-card ${selectedStick === stick.id ? 'selected' : ''} ${stick.recommended ? 'recommended' : ''}`}
                  onClick={() => setSelectedStick(stick.id)}
                >
                  {stick.recommended && <span className="firestick-recommended-badge">Popular</span>}
                  <span className="wizard-firestick-name">{stick.label}</span>
                  <span className="wizard-firestick-desc">{stick.description}</span>
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
    </div>
  );

  // ============ CAN PROCEED LOGIC ============

  const canProceed = useMemo(() => {
    if (activeWizard === 'global-tv') {
      switch (wizardStep) {
        case 0: return selectedCountry !== null;
        case 1: return true; // Lite/Pro always has a selection
        case 2: return selectedDuration > 0;
        case 3: 
          if (selectedInstallation === 'callout') return calloutDate !== null;
          if (selectedInstallation === 'firestick') return selectedFirestick !== undefined;
          return true;
        case 4: return true;
        default: return true;
      }
    } else if (activeWizard === 'streaming-hub') {
      switch (wizardStep) {
        case 0: return selectedStreamingPlan !== undefined;
        case 1: return true;
        case 2: return true;
        case 3:
          if (streamingInstallation === 'callout') return calloutDate !== null;
          if (streamingInstallation === 'firestick') return streamingFirestick !== undefined;
          return true;
        case 4: return true;
        default: return true;
      }
    }
    return true;
  }, [
    activeWizard, wizardStep, selectedCountry, selectedDuration,
    selectedInstallation, calloutDate, selectedFirestick, selectedStreamingPlan,
    streamingInstallation, streamingFirestick
  ]);

  const currentSteps = activeWizard === 'global-tv' ? GLOBAL_TV_STEPS : STREAMING_HUB_STEPS;
  const isLastStep = wizardStep === currentSteps.length - 1;

  const handleComplete = () => {
    // Here you would add to cart
    console.log('Adding to cart:', {
      wizard: activeWizard,
      quote: currentQuote,
      ...(activeWizard === 'global-tv' ? {
        country: selectedCountry,
        duration: selectedDuration,
        tier: selectedTVTier,
        installation: selectedInstallation,
        firestick: selectedInstallation === 'firestick' ? selectedFirestick : null,
        calloutDate: selectedInstallation === 'callout' ? calloutDate : null,
      } : {
        plan: selectedStreamingPlan,
        billing: selectedStreamingBilling,
        vpn: vpnEnabled,
        installation: streamingInstallation,
        firestick: streamingInstallation === 'firestick' ? streamingFirestick : null,
      })
    });
    handleCloseWizard();
  };

  // ============ RENDER ============

  return (
    <section id="services" className="section">
      <div className="container">
        {/* Christmas Promo Banner */}
        <ChristmasPromoBanner />
        
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
              <div className="card-price-preview">
                <span className="price-from">from</span>
                <span className="price-amount">£{STREAMING_PLANS[0].monthlyPrice.toFixed(2)}</span>
                <span className="price-period">/month</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#ccc' }}>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ All platforms in one interface</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ New cinema releases included</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Works on Fire Stick & Smart TVs</li>
              </ul>
              <button 
                onClick={(e) => handleBuyClick('streaming-hub', e)} 
                className="hack-button"
              >
                <span>Configure & Buy</span>
                <ChevronRight size={18} />
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
              <div className="card-price-preview">
                <span className="price-from">from</span>
                <span className="price-amount">£{TV_PLANS[0].cheapMonthlyLite.toFixed(2)}</span>
                <span className="price-period">/month</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#ccc' }}>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Access 15+ countries</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Premium sports & news channels</li>
                <li className="glitch-text-item" style={{ marginBottom: '0.5rem' }}>✓ Reliable HD streams</li>
              </ul>
              <button 
                onClick={(e) => handleBuyClick('global-tv', e)} 
                className="hack-button"
              >
                <span>Configure & Buy</span>
                <ChevronRight size={18} />
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
              {/* Mini Quote Bar */}
              {wizardStep > 0 && wizardStep < currentSteps.length - 1 && (
                <MiniQuoteBar quote={currentQuote} />
              )}
              
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

      {/* Additional CSS for new components */}
      <style jsx global>{`
        /* Christmas Promo Banner */
        .christmas-promo-banner {
          background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
          border: 1px solid #3d7a4d;
          border-radius: 8px;
          padding: 12px 20px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(45, 90, 61, 0.3);
        }
        
        .promo-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          color: #e8f5e9;
          font-size: 0.95rem;
        }
        
        .promo-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: bold;
        }

        /* Card Price Preview */
        .card-price-preview {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 1rem;
        }
        
        .price-from {
          color: #888;
          font-size: 0.85rem;
        }
        
        .price-amount {
          font-size: 1.75rem;
          font-weight: bold;
          color: white;
          font-family: var(--font-heading);
        }
        
        .price-period {
          color: #888;
          font-size: 0.9rem;
        }

        /* Quote Summary */
        .quote-summary {
          margin-top: 1.5rem;
        }
        
        .quote-block {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        
        .quote-block-due {
          border-color: var(--accent-red);
        }
        
        .quote-block-recurring {
          border-color: #4fb7b3;
        }
        
        .quote-block-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: white;
        }
        
        .quote-icon {
          font-size: 1.2rem;
        }
        
        .quote-lines {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #333;
        }
        
        .quote-line {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 0.9rem;
          color: #ccc;
        }
        
        .quote-line-label {
          flex: 1;
        }
        
        .quote-line-amount {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          text-align: right;
        }
        
        .quote-original {
          text-decoration: line-through;
          color: #666;
        }
        
        .quote-discounted {
          color: #4fb7b3;
          font-weight: 600;
        }
        
        .quote-reason {
          font-size: 0.75rem;
          color: #4fb7b3;
          background: rgba(79, 183, 179, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
        }
        
        .quote-adjustment {
          color: #4fb7b3;
        }
        
        .quote-adjustment .discount {
          color: #4fb7b3;
        }
        
        .quote-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
        }
        
        .quote-total-amount {
          font-family: var(--font-heading);
          font-size: 1.3rem;
        }
        
        .quote-recurring-label {
          text-align: right;
          font-size: 0.8rem;
          color: #888;
          margin-top: 4px;
        }
        
        .quote-trial-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 1rem;
          background: rgba(79, 183, 179, 0.1);
          border: 1px solid rgba(79, 183, 179, 0.3);
          border-radius: 6px;
          font-size: 0.85rem;
          color: #aaa;
          line-height: 1.5;
        }
        
        .quote-trial-notice svg {
          flex-shrink: 0;
          color: #4fb7b3;
          margin-top: 2px;
        }

        /* Mini Quote Bar */
        .mini-quote-bar {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 10px 16px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid #333;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }
        
        .mini-quote-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .mini-quote-label {
          color: #888;
          font-size: 0.85rem;
        }
        
        .mini-quote-amount {
          color: white;
          font-weight: 600;
          font-family: var(--font-heading);
        }

        /* Summary Details */
        .wizard-summary-details {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid #333;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #222;
        }
        
        .summary-row:last-child {
          border-bottom: none;
        }
        
        .summary-label {
          color: #888;
        }
        
        .summary-value {
          color: white;
          font-weight: 500;
        }

        /* Plan Type Grid */
        .wizard-plan-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .wizard-plan-type-card {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: left;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .wizard-plan-type-card:hover {
          border-color: #555;
          transform: translateY(-2px);
        }
        
        .wizard-plan-type-card.selected {
          border-color: var(--accent-red);
          background: rgba(255, 26, 26, 0.1);
        }
        
        .plan-type-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        
        .plan-type-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
        }
        
        .plan-type-badge {
          font-size: 0.7rem;
          padding: 4px 8px;
          background: var(--accent-red);
          color: white;
          border-radius: 4px;
          text-transform: uppercase;
        }
        
        .plan-type-price {
          margin-bottom: 1rem;
        }
        
        .plan-type-amount {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          font-family: var(--font-heading);
        }
        
        .plan-type-period {
          color: #888;
          font-size: 0.9rem;
        }
        
        .plan-type-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .plan-type-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ccc;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        
        .plan-type-features li svg {
          color: var(--accent-red);
        }

        /* Streaming Plan Improvements */
        .wizard-streaming-highlight {
          margin-top: 1rem;
          padding: 8px 12px;
          background: rgba(79, 183, 179, 0.1);
          border-radius: 4px;
          font-size: 0.8rem;
          color: #4fb7b3;
          text-align: center;
        }
        
        .wizard-streaming-support {
          color: #888;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        /* Addon Included State */
        .wizard-addon-included {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(79, 183, 179, 0.1);
          border: 1px solid rgba(79, 183, 179, 0.3);
          border-radius: 8px;
        }
        
        .addon-included-icon {
          color: #4fb7b3;
        }
        
        .addon-included-content h4 {
          color: white;
          margin-bottom: 4px;
        }
        
        .addon-included-content p {
          color: #888;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .addon-included-check {
          color: #4fb7b3;
          margin-left: auto;
        }

        /* Firestick Info */
        .wizard-firestick-info {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #333;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
        }
        
        .wizard-firestick-info p {
          color: #aaa;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.5;
        }

        /* Firestick Recommended Badge */
        .wizard-firestick-card.recommended {
          border-color: #4fb7b3;
        }
        
        .firestick-recommended-badge {
          position: absolute;
          top: -8px;
          right: 12px;
          background: #4fb7b3;
          color: #000;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 3px;
          text-transform: uppercase;
        }
        
        .wizard-firestick-card {
          position: relative;
        }
        
        .wizard-firestick-desc {
          color: #888;
          font-size: 0.8rem;
          margin-bottom: 8px;
        }

        /* Billing Option Improvements */
        .wizard-billing-desc {
          display: block;
          font-size: 0.8rem;
          color: #888;
          margin-top: 4px;
        }
        
        .wizard-billing-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 10px;
          background: #4fb7b3;
          color: #000;
          font-size: 0.75rem;
          font-weight: bold;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
};

export default ServicesOverview;
