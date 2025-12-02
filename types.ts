/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  day: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum Section {
  HERO = 'hero',
  LINEUP = 'lineup',
  EXPERIENCE = 'experience',
  TICKETS = 'tickets',
}

export type BillingPeriod = 'month' | 'year';

export interface CartItem {
  id: string; // unique instance id
  planId: string;
  name: string;
  variantName?: string; // e.g., "United Kingdom"
  setupFee: number;
  recurringPrice: number;
  period: BillingPeriod;
  category: string;
}
