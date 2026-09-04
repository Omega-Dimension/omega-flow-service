export const COUNTRIES = [
  { code: 'MM', name: 'Myanmar' },
  { code: 'TH', name: 'Thailand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
] as const;

// Transaction-style lifecycle — no draft.
// pending              -> freelancer created it, client can see it immediately
// pending_confirmation -> client submitted a payment proof, awaiting freelancer review
// paid                 -> freelancer confirmed the payment
// overdue              -> past due_date and still unpaid
export const INVOICE_STATUS = {
  PENDING: 'pending',
  PENDING_CONFIRMATION: 'pending_confirmation',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const INVOICE_EVENTS = {
  NEW: 'invoice:new',
} as const;

export const CONTRACT_EVENTS = {
  SIGNED: 'contract:signed',
  ACTIVATED: 'contract:activated',
} as const;

export const MEETING_EVENTS = {
  NEW: 'meeting:new',
  UPDATE: 'meeting:update',
} as const;