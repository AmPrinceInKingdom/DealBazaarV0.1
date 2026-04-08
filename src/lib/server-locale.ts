import { cookies } from "next/headers";
import type { LocaleCode } from "@/lib/i18n";
import type { CurrencyCode } from "@/lib/market";

const supportedLocales: LocaleCode[] = [
  "en",
  "si",
  "ta",
  "hi",
  "es",
  "ar",
  "fr",
  "de",
  "pt",
];

const supportedCurrencies: CurrencyCode[] = [
  "USD",
  "EUR",
  "GBP",
  "LKR",
  "INR",
  "JPY",
  "AUD",
  "CAD",
  "AED",
  "SGD",
  "CNY",
  "MYR",
];

function isLocale(value: string): value is LocaleCode {
  return supportedLocales.includes(value as LocaleCode);
}

function isCurrency(value: string): value is CurrencyCode {
  return supportedCurrencies.includes(value as CurrencyCode);
}

export async function getRequestLocale(): Promise<LocaleCode> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("db_locale")?.value;
  if (locale && isLocale(locale)) {
    return locale;
  }
  return "en";
}

export async function getRequestCurrency(): Promise<CurrencyCode> {
  const cookieStore = await cookies();
  const currency = cookieStore.get("db_currency")?.value;
  if (currency && isCurrency(currency)) {
    return currency;
  }
  return "USD";
}
