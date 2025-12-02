"use client";

import AppLegacy from "./AppLegacy";
import { PerformanceModeProvider } from "../context/PerformanceModeContext";

export default function Page() {
  return (
    <PerformanceModeProvider>
      <AppLegacy />
    </PerformanceModeProvider>
  );
}