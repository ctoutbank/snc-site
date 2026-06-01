"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export interface DatePickerFlatProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  corAccent?: string;
}

export function DatePickerFlat({ date, setDate, className, placeholder = "Filtrar Data", corAccent = "#D4A843" }: DatePickerFlatProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Fecha o popover se clicar fora
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className || ""}`} ref={popoverRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.03)", color: date ? "#fff" : "#8a94a3",
          border: `1px solid ${isOpen ? corAccent : "rgba(255,255,255,0.1)"}`, padding: "8px 12px",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, outline: "none",
          transition: "all 0.2s", cursor: "pointer", borderRadius: 4,
          minWidth: 160, justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarIcon size={14} color={date ? corAccent : "#8a94a3"} />
          <span>{date ? format(date, "dd/MM/yyyy") : placeholder}</span>
        </div>
        {date && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setDate(undefined);
              setIsOpen(false);
            }}
            style={{ padding: 2, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", cursor: "pointer" }}
            title="Limpar data"
          >
            <X size={10} color="#cfd6df" />
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: 4, zIndex: 9999,
          background: "#0A1628", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8, boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          padding: 10, minWidth: 240
        }}>
          <div className="custom-flat-picker" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <style>{`
              .custom-flat-picker * {
                font-family: var(--font-inter), system-ui, -apple-system, sans-serif !important;
              }
              .custom-flat-picker .rdp {
                --rdp-cell-size: 28px;
                --rdp-accent-color: ${corAccent};
                --rdp-background-color: transparent;
                --rdp-outline: 2px solid var(--rdp-accent-color);
                --rdp-outline-selected: 2px solid var(--rdp-accent-color);
                margin: 0 auto;
                color: #cfd6df;
                font-size: 11px;
              }
              .custom-flat-picker .rdp-day {
                font-size: 11px;
              }
              .custom-flat-picker .rdp-day_selected, 
              .custom-flat-picker .rdp-day_selected:focus-visible, 
              .custom-flat-picker .rdp-day_selected:hover {
                background-color: ${corAccent} !important;
                color: #0A1628 !important;
                font-weight: bold;
                border-radius: 4px;
              }
              .custom-flat-picker .rdp-day_today:not(.rdp-day_selected) {
                font-weight: bold;
                color: ${corAccent};
              }
              .custom-flat-picker .rdp-dropdown {
                background: rgba(255,255,255,0.05);
                color: #fff;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 4px;
                padding: 3px 6px;
                cursor: pointer;
                font-size: 10px;
              }
              .custom-flat-picker .rdp-dropdown option {
                background: #0A1628;
                color: #fff;
              }
              .custom-flat-picker .rdp-caption_dropdowns {
                display: flex;
                gap: 6px;
              }
              .custom-flat-picker .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                background-color: rgba(255,255,255,0.1);
                border-radius: 4px;
              }
              .custom-flat-picker .rdp-head_cell {
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                color: #8a94a3;
              }
              @media (max-width: 480px) {
                .custom-flat-picker .rdp {
                  --rdp-cell-size: 25px !important;
                  font-size: 10px !important;
                }
                .custom-flat-picker .rdp-day {
                  font-size: 10px !important;
                }
                .custom-flat-picker .rdp-head_cell {
                  font-size: 8px !important;
                }
              }
            `}</style>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d);
                setIsOpen(false);
              }}
              locale={ptBR}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={new Date().getFullYear() + 1}
              numberOfMonths={1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
