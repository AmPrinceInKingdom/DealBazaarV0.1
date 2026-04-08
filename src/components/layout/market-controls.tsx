"use client";

import { useMarket } from "@/contexts/market-context";
import { Select } from "@/components/ui/select";
import type { LocaleCode } from "@/lib/i18n";
import type { CurrencyCode } from "@/lib/market";

export function MarketControls({ compact = false }: { compact?: boolean }) {
  const {
    locale,
    currency,
    setLocale,
    setCurrency,
    languageOptions,
    currencyOptions,
    t,
  } = useMarket();

  return (
    <div className={`flex items-center gap-2 ${compact ? "flex-col" : ""}`}>
      <label className="sr-only">{t("market.language")}</label>
      <Select
        value={locale}
        onChange={(event) => setLocale(event.target.value as LocaleCode)}
        className={compact ? "h-9 min-w-[170px]" : "h-9 min-w-[120px]"}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <label className="sr-only">{t("market.currency")}</label>
      <Select
        value={currency}
        onChange={(event) =>
          setCurrency(event.target.value as CurrencyCode)
        }
        className={compact ? "h-9 min-w-[170px]" : "h-9 min-w-[120px]"}
      >
        {currencyOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
