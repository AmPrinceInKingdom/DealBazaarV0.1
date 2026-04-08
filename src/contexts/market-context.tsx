"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { LocaleCode } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import {
  type CurrencyCode,
  formatMarketPrice,
  languageOptions,
  currencyOptions,
} from "@/lib/market";

const LOCALE_KEY = "deal-bazaar-locale";
const CURRENCY_KEY = "deal-bazaar-currency";

type MarketContextValue = {
  locale: LocaleCode;
  currency: CurrencyCode;
  languageOptions: typeof languageOptions;
  currencyOptions: typeof currencyOptions;
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  t: (key: string) => string;
  formatPrice: (valueInUsd: number) => string;
};

const MarketContext = createContext<MarketContextValue | undefined>(undefined);

export function MarketProvider({
  children,
  initialLocale,
  initialCurrency,
}: {
  children: React.ReactNode;
  initialLocale: LocaleCode;
  initialCurrency: CurrencyCode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback(
    (value: LocaleCode) => {
      setLocaleState(value);
      localStorage.setItem(LOCALE_KEY, value);
      document.cookie = `db_locale=${value}; path=/; max-age=31536000`;
      router.refresh();
    },
    [router],
  );

  const setCurrency = useCallback((value: CurrencyCode) => {
    setCurrencyState(value);
    localStorage.setItem(CURRENCY_KEY, value);
    document.cookie = `db_currency=${value}; path=/; max-age=31536000`;
  }, []);

  const value = useMemo(
    () => ({
      locale,
      currency,
      languageOptions,
      currencyOptions,
      setLocale,
      setCurrency,
      t: (key: string) => translate(key, locale),
      formatPrice: (valueInUsd: number) =>
        formatMarketPrice(valueInUsd, currency, locale),
    }),
    [locale, currency, setLocale, setCurrency],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within MarketProvider");
  }
  return context;
}
