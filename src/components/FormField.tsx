import React from "react";
import { HelpCircle } from "lucide-react";
import { ProductSchemaField } from "../productSchema";
import CustomSelect from "./CustomSelect";
import MultiSelectChips from "./MultiSelectChips";

interface FormFieldProps {
  field: ProductSchemaField;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

export default function FormField({
  field,
  value,
  onChange,
  error,
}: FormFieldProps) {
  const { key, label, type, required, placeholder, helpText, options = [] } = field;

  if (type === "image[]") return null;

  const renderNumberInput = () => {
    const isUSD = key === "priceUSD";
    const isMWK = key === "priceMWK";
    const symbol = isUSD ? "$" : isMWK ? "MK" : null;

    return (
      <div className="relative flex items-center">
        {symbol && (
          <span className="absolute left-4 text-xs font-mono text-cream/40 select-none">
            {symbol}
          </span>
        )}
        <input
          type="number"
          inputMode="numeric"
          value={value !== null && value !== undefined ? value : ""}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? null : Number(raw));
          }}
          placeholder={placeholder || "0"}
          className={`w-full bg-chocolate border rounded-xl py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors font-mono placeholder-cream/30 ${
            symbol ? (isUSD ? "pl-10" : "pl-12") : "px-4"
          } ${error ? "border-rose-400" : "border-cream/15"}`}
        />
      </div>
    );
  };

  const renderToggleGroup = () => {
    const normalizedOptions = options.map((opt) => String(opt));

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label={label}>
        {normalizedOptions.map((opt) => {
          const isSelected = value === opt;
          const displayText = opt.split("_").join(" ");

          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt)}
              className={`py-2 px-3 text-xs tracking-wider rounded-xl border font-mono uppercase transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-cream border-cream text-chocolate font-bold"
                  : "bg-chocolate border border-cream/15 text-cream/60 hover:border-cream/30 hover:text-cream"
              }`}
            >
              {displayText}
            </button>
          );
        })}
      </div>
    );
  };

  const renderInput = () => {
    switch (type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-chocolate border rounded-xl px-4 py-3.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 ${
              error ? "border-rose-400" : "border-cream/15"
            }`}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={key === "description" ? 4 : 3}
            className={`w-full bg-chocolate border rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder-cream/30 resize-none ${
              error ? "border-rose-400" : "border-cream/15"
            }`}
          />
        );

      case "number":
        return renderNumberInput();

      case "select":
        return (
          <CustomSelect
            value={value || ""}
            options={options}
            onChange={onChange}
            placeholder={placeholder || `Select ${label}`}
          />
        );

      case "radio":
        return renderToggleGroup();

      case "multiselect":
        return (
          <MultiSelectChips
            selectedValues={value || []}
            options={options}
            onChange={onChange}
            allowCustom={key === "details"}
            customPlaceholder={key === "details" ? "Add custom detail highlight..." : undefined}
          />
        );

      case "checkbox":
      case "boolean":
        return (
          <div className="flex items-center space-x-3 py-1">
            <input
              type="checkbox"
              id={key}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-cream/15 bg-chocolate text-gold focus:ring-gold focus:ring-offset-chocolate cursor-pointer"
            />
            <label htmlFor={key} className="text-xs text-cream/80 cursor-pointer select-none font-sans">
              {label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id={`field-group-${key}`} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono tracking-widest uppercase text-gold">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      </div>

      {renderInput()}

      {helpText && (
        <p className="text-[9px] font-mono text-cream/35 flex items-center space-x-1 uppercase tracking-wider select-none">
          <HelpCircle className="w-3 h-3 text-gold/60 shrink-0" />
          <span>{helpText}</span>
        </p>
      )}

      {error && <p className="text-xs text-rose-400 font-mono tracking-wide">{error}</p>}
    </div>
  );
}
