import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type PerformanceModeContextValue = {
	staticModeEnabled: boolean;
	setStaticModeEnabled: (enabled: boolean) => void;
	toggleStaticMode: () => void;
};

const PerformanceModeContext = createContext<PerformanceModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'static-mode-enabled';

export const PerformanceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [staticModeEnabled, setStaticModeEnabled] = useState<boolean>(false);

	// Initialize from localStorage or OS preference
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored !== null) {
				setStaticModeEnabled(stored === '1');
				return;
			}
		} catch {
			/* ignore storage errors */
		}
		// Fallback to prefers-reduced-motion
		if (typeof window !== 'undefined' && 'matchMedia' in window) {
			const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			setStaticModeEnabled(prefersReduced);
		}
	}, []);

	// Persist and reflect on <body> attribute
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, staticModeEnabled ? '1' : '0');
		} catch {
			/* ignore storage errors */
		}
		if (typeof document !== 'undefined') {
			if (staticModeEnabled) {
				document.body.setAttribute('data-static-mode', 'true');
				// Avoid CSS smooth scrolling which can stutter on low-end devices
				document.documentElement.style.scrollBehavior = 'auto';
			} else {
				document.body.removeAttribute('data-static-mode');
				document.documentElement.style.scrollBehavior = 'smooth';
			}
		}
	}, [staticModeEnabled]);

	const value = useMemo<PerformanceModeContextValue>(() => ({
		staticModeEnabled,
		setStaticModeEnabled,
		toggleStaticMode: () => setStaticModeEnabled((v) => !v),
	}), [staticModeEnabled]);

	return (
		<PerformanceModeContext.Provider value={value}>
			{children}
		</PerformanceModeContext.Provider>
	);
};

export function usePerformanceMode(): PerformanceModeContextValue {
	const ctx = useContext(PerformanceModeContext);
	if (!ctx) {
		throw new Error('usePerformanceMode must be used within a PerformanceModeProvider');
	}
	return ctx;
}


