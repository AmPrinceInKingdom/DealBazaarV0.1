import type { LocaleCode } from "@/lib/i18n";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "LKR"
  | "INR"
  | "JPY"
  | "AUD"
  | "CAD"
  | "AED"
  | "SGD"
  | "CNY"
  | "MYR";

export const currencyRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  LKR: 304,
  INR: 83.2,
  JPY: 147.4,
  AUD: 1.52,
  CAD: 1.35,
  AED: 3.67,
  SGD: 1.35,
  CNY: 7.24,
  MYR: 4.74,
};

export const languageOptions: Array<{ value: LocaleCode; label: string }> = [
  { value: "en", label: "English" },
  { value: "si", label: "Sinhala" },
  { value: "ta", label: "Tamil" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
];

export const currencyOptions: Array<{ value: CurrencyCode; label: string }> = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "LKR", label: "LKR" },
  { value: "INR", label: "INR" },
  { value: "JPY", label: "JPY" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
  { value: "AED", label: "AED" },
  { value: "SGD", label: "SGD" },
  { value: "CNY", label: "CNY" },
  { value: "MYR", label: "MYR" },
];

export function convertPriceFromUsd(value: number, currency: CurrencyCode) {
  return value * currencyRates[currency];
}

export function formatMarketPrice(
  valueInUsd: number,
  currency: CurrencyCode,
  locale: LocaleCode,
) {
  const converted = convertPriceFromUsd(valueInUsd, currency);
  const localeMap: Record<LocaleCode, string> = {
    en: "en-US",
    si: "si-LK",
    ta: "ta-IN",
    hi: "hi-IN",
    es: "es-ES",
    ar: "ar-AE",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-PT",
  };
  const localeTag = localeMap[locale] ?? "en-US";

  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency,
    maximumFractionDigits:
      currency === "LKR" || currency === "INR" || currency === "JPY" ? 0 : 2,
  }).format(converted);
}
