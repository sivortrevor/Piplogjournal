import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Loader2, Upload, AlertCircle, FileSpreadsheet, CheckCircle2, Database } from "lucide-react";
import { u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { c as calculatePnl, a as calculatePips, d as determineResult, b as detectOutcome, f as formatCurrency } from "./trade-utils-DspPNmfQ.js";
import { B as Button } from "./button-DWfIo_Ug.js";
import { C as Checkbox } from "./checkbox-Bd1q64ph.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-checkbox";
const HEADER_ALIASES = {
  pair: ["symbol", "pair", "instrument", "ticker", "item", "product"],
  side: ["type", "side", "direction", "action", "buy/sell", "buy_sell"],
  lot_size: ["lots", "size", "volume", "lot", "lot size", "quantity", "qty"],
  entry_price: ["open price", "openprice", "entry", "entry price", "price", "open"],
  exit_price: ["close price", "closeprice", "exit", "exit price", "close"],
  stop_loss: ["s / l", "sl", "stop loss", "stoploss", "stop"],
  take_profit: ["t / p", "tp", "take profit", "takeprofit", "target"],
  pnl: ["profit", "pnl", "p/l", "p&l", "net p/l", "net profit", "gross p/l"],
  commission: ["commission", "comm"],
  swap: ["swap", "rollover"],
  opened_at: ["open time", "opentime", "open_time", "entry time", "entry_time", "open date", "datetime", "date"],
  closed_at: ["close time", "closetime", "close_time", "exit time", "exit_time", "close date"]
};
function normaliseHeader(h) {
  return h.trim().toLowerCase().replace(/[._]/g, " ").replace(/\s+/g, " ");
}
function findColumn(headers, aliases) {
  const norm = headers.map(normaliseHeader);
  for (const alias of aliases) {
    const idx = norm.indexOf(alias);
    if (idx >= 0) return idx;
  }
  for (let i = 0; i < norm.length; i++) {
    for (const alias of aliases) {
      if (norm[i].includes(alias) || alias.includes(norm[i])) return i;
    }
  }
  return -1;
}
function parseCsvLine(line, delimiter) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === delimiter) {
        result.push(cur);
        cur = "";
      } else cur += c;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}
function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const tab = (firstLine.match(/\t/g) || []).length;
  const semi = (firstLine.match(/;/g) || []).length;
  const comma = (firstLine.match(/,/g) || []).length;
  if (tab >= comma && tab >= semi) return "	";
  if (semi > comma) return ";";
  return ",";
}
function parseDate(s) {
  if (!s) return null;
  const trimmed = s.trim();
  const mt = trimmed.match(
    /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/
  );
  if (mt) {
    const [, y, mo, d, h, mi, se] = mt;
    const dt = new Date(
      Date.UTC(+y, +mo - 1, +d, +h, +mi, se ? +se : 0)
    );
    return dt.toISOString();
  }
  const ct = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/
  );
  if (ct) {
    const [, d, mo, y, h, mi, se] = ct;
    const dt = new Date(
      Date.UTC(+y, +mo - 1, +d, +h, +mi, se ? +se : 0)
    );
    return dt.toISOString();
  }
  const native = Date.parse(trimmed);
  if (!isNaN(native)) return new Date(native).toISOString();
  return null;
}
function detectFormat(headers) {
  const hs = headers.map(normaliseHeader).join(" ");
  if (hs.includes("ticket") && hs.includes("s / l")) return "MetaTrader 4";
  if (hs.includes("position") && hs.includes("s / l")) return "MetaTrader 5";
  if (hs.includes("deal id") || hs.includes("entry time")) return "cTrader";
  return "Generic broker CSV";
}
function normaliseSide(raw) {
  const s = raw.trim().toLowerCase();
  if (s.startsWith("buy") || s === "long" || s === "b") return "buy";
  if (s.startsWith("sell") || s === "short" || s === "s") return "sell";
  return null;
}
function normalisePair(raw) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}
function num(s) {
  if (!s) return NaN;
  const cleaned = s.replace(/[\s$€£¥]/g, "").replace(/,/g, "");
  return parseFloat(cleaned);
}
function parseBrokerCsv(text) {
  const errors = [];
  const cleaned = text.replace(/^\uFEFF/, "");
  const allLines = cleaned.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (allLines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: "File is empty." }], detectedFormat: "—", headers: [] };
  }
  const delimiter = detectDelimiter(cleaned);
  let headerIdx = -1;
  let headers = [];
  for (let i = 0; i < Math.min(allLines.length, 12); i++) {
    const cols = parseCsvLine(allLines[i], delimiter);
    if (cols.length < 4) continue;
    const norm = cols.map(normaliseHeader).join(" ");
    let hits = 0;
    for (const aliases of Object.values(HEADER_ALIASES)) {
      if (aliases.some((a) => norm.includes(a))) hits++;
    }
    if (hits >= 3) {
      headerIdx = i;
      headers = cols;
      break;
    }
  }
  if (headerIdx === -1) {
    return {
      rows: [],
      errors: [{ row: 0, message: "Could not detect a header row. Make sure your CSV has columns like Symbol, Type, Open Price, Close Price, Profit." }],
      detectedFormat: "—",
      headers: []
    };
  }
  const idx = {
    pair: findColumn(headers, HEADER_ALIASES.pair),
    side: findColumn(headers, HEADER_ALIASES.side),
    lot: findColumn(headers, HEADER_ALIASES.lot_size),
    entry: findColumn(headers, HEADER_ALIASES.entry_price),
    exit: findColumn(headers, HEADER_ALIASES.exit_price),
    sl: findColumn(headers, HEADER_ALIASES.stop_loss),
    tp: findColumn(headers, HEADER_ALIASES.take_profit),
    pnl: findColumn(headers, HEADER_ALIASES.pnl),
    commission: findColumn(headers, HEADER_ALIASES.commission),
    swap: findColumn(headers, HEADER_ALIASES.swap),
    opened: findColumn(headers, HEADER_ALIASES.opened_at),
    closed: findColumn(headers, HEADER_ALIASES.closed_at)
  };
  const required = ["pair", "side", "entry", "opened"];
  const missing = required.filter((k) => idx[k] === -1);
  if (missing.length) {
    return {
      rows: [],
      errors: [
        {
          row: headerIdx + 1,
          message: `Missing required columns: ${missing.join(", ")}. Detected: ${headers.join(", ")}`
        }
      ],
      detectedFormat: detectFormat(headers),
      headers
    };
  }
  const rows = [];
  for (let i = headerIdx + 1; i < allLines.length; i++) {
    const cols = parseCsvLine(allLines[i], delimiter);
    if (cols.every((c) => !c.trim())) continue;
    if (cols.length < headers.length / 2) continue;
    const raw = {};
    headers.forEach((h, j) => raw[h] = cols[j] ?? "");
    const pair = normalisePair(cols[idx.pair] ?? "");
    const side = normaliseSide(cols[idx.side] ?? "");
    const entry = num(cols[idx.entry] ?? "");
    const opened = parseDate(cols[idx.opened] ?? "");
    if (!pair) {
      errors.push({ row: i + 1, message: "Missing pair" });
      continue;
    }
    if (!side) {
      continue;
    }
    if (!isFinite(entry)) {
      errors.push({ row: i + 1, message: "Invalid entry price" });
      continue;
    }
    if (!opened) {
      errors.push({ row: i + 1, message: "Invalid open time" });
      continue;
    }
    const lot = idx.lot >= 0 ? num(cols[idx.lot] ?? "") : 0;
    const exit = idx.exit >= 0 ? num(cols[idx.exit] ?? "") : NaN;
    const sl = idx.sl >= 0 ? num(cols[idx.sl] ?? "") : NaN;
    const tp = idx.tp >= 0 ? num(cols[idx.tp] ?? "") : NaN;
    let pnl = idx.pnl >= 0 ? num(cols[idx.pnl] ?? "") : NaN;
    const commission = idx.commission >= 0 ? num(cols[idx.commission] ?? "") : 0;
    const swap = idx.swap >= 0 ? num(cols[idx.swap] ?? "") : 0;
    const closed = idx.closed >= 0 ? parseDate(cols[idx.closed] ?? "") : null;
    if (isFinite(pnl)) {
      if (isFinite(commission)) pnl += commission;
      if (isFinite(swap)) pnl += swap;
    } else if (isFinite(exit) && lot) {
      pnl = calculatePnl({ pair, side, entry, exit, lotSize: lot });
    } else {
      pnl = NaN;
    }
    const pips = isFinite(exit) ? calculatePips({ pair, side, entry, exit }) : null;
    const finalPnl = isFinite(pnl) ? Math.round(pnl * 100) / 100 : null;
    const result = isFinite(exit) ? finalPnl != null ? determineResult(finalPnl) : detectOutcome({ side, entry, exit }) === "profit" ? "win" : detectOutcome({ side, entry, exit }) === "loss" ? "loss" : "breakeven" : "open";
    rows.push({
      pair,
      side,
      lot_size: isFinite(lot) ? lot : 0,
      entry_price: entry,
      exit_price: isFinite(exit) ? exit : null,
      stop_loss: isFinite(sl) ? sl : null,
      take_profit: isFinite(tp) ? tp : null,
      pnl: finalPnl,
      pips,
      result,
      opened_at: opened,
      closed_at: closed,
      _key: `${pair}|${opened}|${entry}|${side}|${isFinite(lot) ? lot : 0}`,
      _raw: raw,
      _row: i + 1
    });
  }
  return { rows, errors, detectedFormat: detectFormat(headers), headers };
}
function ImportPage() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [importing, setImporting] = useState(false);
  const [existingKeys, setExistingKeys] = useState(/* @__PURE__ */ new Set());
  const handleFile = async (file) => {
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const text = await file.text();
      const result = parseBrokerCsv(text);
      setParseResult(result);
      setSelected(new Set(result.rows.map((_, i) => i)));
      const {
        data: existing
      } = await supabase.from("trades").select("pair, opened_at, entry_price, side, lot_size");
      const keys = new Set((existing ?? []).map((t) => `${t.pair}|${new Date(t.opened_at).toISOString()}|${Number(t.entry_price)}|${t.side}|${Number(t.lot_size) || 0}`));
      setExistingKeys(keys);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read file";
      toast.error(msg);
    } finally {
      setParsing(false);
    }
  };
  const dedup = useMemo(() => {
    if (!parseResult) return {
      newRows: [],
      duplicateRows: []
    };
    const newRows = [];
    const duplicateRows = [];
    const seenInBatch = /* @__PURE__ */ new Set();
    for (const r of parseResult.rows) {
      if (existingKeys.has(r._key) || seenInBatch.has(r._key)) {
        duplicateRows.push(r);
      } else {
        newRows.push(r);
        seenInBatch.add(r._key);
      }
    }
    return {
      newRows,
      duplicateRows
    };
  }, [parseResult, existingKeys]);
  const summary = useMemo(() => {
    if (!parseResult) return null;
    const selectedRows = parseResult.rows.filter((_, i) => selected.has(i));
    const importable = selectedRows.filter((r) => !existingKeys.has(r._key));
    const totalPnl = importable.reduce((s, r) => s + (r.pnl || 0), 0);
    const wins = importable.filter((r) => r.result === "win").length;
    const losses = importable.filter((r) => r.result === "loss").length;
    return {
      count: importable.length,
      totalPnl,
      wins,
      losses
    };
  }, [parseResult, selected, existingKeys]);
  const handleImport = async () => {
    if (!user || !parseResult || !summary) return;
    if (summary.count === 0) {
      toast.error("No new trades selected");
      return;
    }
    setImporting(true);
    try {
      const toImport = parseResult.rows.filter((_, i) => selected.has(i)).filter((r) => !existingKeys.has(r._key)).map((r) => ({
        user_id: user.id,
        pair: r.pair,
        side: r.side,
        lot_size: r.lot_size,
        entry_price: r.entry_price,
        exit_price: r.exit_price,
        stop_loss: r.stop_loss,
        take_profit: r.take_profit,
        pnl: r.pnl,
        pips: r.pips,
        result: r.result,
        opened_at: r.opened_at,
        closed_at: r.closed_at,
        session: "other",
        confidence: 3,
        mistakes: []
      }));
      const BATCH = 200;
      let inserted = 0;
      for (let i = 0; i < toImport.length; i += BATCH) {
        const slice = toImport.slice(i, i + BATCH);
        const {
          error
        } = await supabase.from("trades").insert(slice);
        if (error) throw error;
        inserted += slice.length;
      }
      toast.success(`Imported ${inserted} trade${inserted === 1 ? "" : "s"} ✓`);
      navigate({
        to: "/app/trades"
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };
  const toggleAll = () => {
    if (!parseResult) return;
    if (selected.size === parseResult.rows.length) setSelected(/* @__PURE__ */ new Set());
    else setSelected(new Set(parseResult.rows.map((_, i) => i)));
  };
  return /* @__PURE__ */ jsxs("div", { className: "px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "mx-auto flex max-w-6xl items-center gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/app/profile", className: "flex h-10 w-10 items-center justify-center rounded-xl bg-surface", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight sm:text-3xl", style: {
          letterSpacing: "-0.025em"
        }, children: "Import trades" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Upload an MT4, MT5, cTrader or generic broker CSV." })
      ] })
    ] }),
    !parseResult ? /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-8 max-w-2xl", children: [
      /* @__PURE__ */ jsxs("label", { className: "surface-card flex h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-6 text-center transition hover:border-primary", children: [
        parsing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold", children: [
            "Reading ",
            fileName,
            "…"
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(Upload, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-base font-bold", children: "Drop a CSV file here" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or tap to browse — max 10MB" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "file", accept: ".csv,text/csv,application/vnd.ms-excel", className: "hidden", onChange: (e) => handleFile(e.target.files?.[0] ?? null), disabled: parsing })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "surface-card mt-4 rounded-2xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Tips" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-3 space-y-1.5 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "• Export from MetaTrader: ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Account History → Save as Report" }),
            " → choose CSV."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• cTrader: ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "History tab → Export → CSV" }),
            "."
          ] }),
          /* @__PURE__ */ jsx("li", { children: "• Trades are deduplicated by pair + open time + entry price + side + lot." }),
          /* @__PURE__ */ jsx("li", { children: "• Commissions and swaps are added into P/L automatically when present." })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "mx-auto mt-6 max-w-6xl space-y-4", children: parseResult.errors.length > 0 && parseResult.rows.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "surface-card rounded-2xl border border-destructive/30 p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 shrink-0 text-destructive" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold text-destructive", children: "Couldn't parse the file" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-xs text-muted-foreground", children: parseResult.errors.slice(0, 5).map((e, i) => /* @__PURE__ */ jsxs("li", { children: [
            "Row ",
            e.row,
            ": ",
            e.message
          ] }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
        setParseResult(null);
        setFileName("");
      }, className: "mt-4", children: "Try another file" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("section", { className: "surface-card rounded-3xl p-4 sm:p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: fileName }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
                parseResult.detectedFormat,
                " · ",
                parseResult.rows.length,
                " trades found"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
            setParseResult(null);
            setFileName("");
            setSelected(/* @__PURE__ */ new Set());
          }, className: "h-9 rounded-xl", children: "Different file" })
        ] }),
        summary && /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsx(Stat, { label: "Selected to import", value: String(summary.count) }),
          /* @__PURE__ */ jsx(Stat, { label: "Total P/L", value: formatCurrency(summary.totalPnl), tone: summary.totalPnl >= 0 ? "profit" : "loss" }),
          /* @__PURE__ */ jsx(Stat, { label: "Wins", value: String(summary.wins), tone: "profit" }),
          /* @__PURE__ */ jsx(Stat, { label: "Losses", value: String(summary.losses), tone: "loss" })
        ] }),
        dedup.duplicateRows.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2 rounded-xl bg-input/60 p-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary" }),
          "Skipping ",
          dedup.duplicateRows.length,
          " duplicate trade",
          dedup.duplicateRows.length === 1 ? "" : "s",
          " already in your journal."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "surface-card overflow-hidden rounded-2xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border p-3", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: toggleAll, className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground", children: [
            /* @__PURE__ */ jsx(Checkbox, { checked: selected.size === parseResult.rows.length, className: "h-4 w-4 pointer-events-none" }),
            selected.size === parseResult.rows.length ? "Deselect all" : "Select all"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            selected.size,
            " of ",
            parseResult.rows.length,
            " selected"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[420px] overflow-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ jsx("thead", { className: "sticky top-0 z-10 bg-input/95 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "w-10 px-3 py-2" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Pair" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Side" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Open" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Entry" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Exit" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Lot" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "P/L" }),
            /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-center", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: parseResult.rows.map((r, i) => {
            const isDup = existingKeys.has(r._key);
            const isSel = selected.has(i);
            return /* @__PURE__ */ jsxs("tr", { className: `border-t border-border/60 ${isDup ? "opacity-50" : "hover:bg-input/40"}`, children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx(Checkbox, { checked: isSel, disabled: isDup, onCheckedChange: (c) => {
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (c) next.add(i);
                  else next.delete(i);
                  return next;
                });
              }, className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold", children: r.pair }),
              /* @__PURE__ */ jsx("td", { className: `px-3 py-2 font-semibold uppercase ${r.side === "buy" ? "text-profit" : "text-loss"}`, children: r.side }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-muted-foreground", children: new Date(r.opened_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: r.entry_price }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: r.exit_price ?? "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right tabular-nums", children: r.lot_size || "—" }),
              /* @__PURE__ */ jsx("td", { className: `px-3 py-2 text-right font-bold tabular-nums ${r.pnl == null ? "text-muted-foreground" : r.pnl > 0 ? "text-profit" : r.pnl < 0 ? "text-loss" : ""}`, children: r.pnl == null ? "—" : formatCurrency(r.pnl) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: isDup ? /* @__PURE__ */ jsx("span", { className: "rounded-full bg-input px-2 py-0.5 text-[9px] font-bold uppercase text-muted-foreground", children: "Duplicate" }) : /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${r.result === "win" ? "bg-profit/15 text-profit" : r.result === "loss" ? "bg-loss/15 text-loss" : "bg-input text-muted-foreground"}`, children: r.result }) })
            ] }, i);
          }) })
        ] }) })
      ] }),
      parseResult.errors.length > 0 && /* @__PURE__ */ jsxs("details", { className: "surface-card rounded-2xl p-4 text-xs", children: [
        /* @__PURE__ */ jsxs("summary", { className: "cursor-pointer font-semibold text-muted-foreground", children: [
          parseResult.errors.length,
          " skipped row",
          parseResult.errors.length === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 text-muted-foreground", children: parseResult.errors.slice(0, 20).map((e, i) => /* @__PURE__ */ jsxs("li", { children: [
          "Row ",
          e.row,
          ": ",
          e.message
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "sticky bottom-24 lg:bottom-6", children: /* @__PURE__ */ jsx(Button, { type: "button", onClick: handleImport, disabled: importing || !summary || summary.count === 0, className: "h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
        background: "var(--gradient-primary)"
      }, children: importing ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Database, { className: "mr-2 h-4 w-4" }),
        "Import ",
        summary?.count ?? 0,
        " trade",
        summary?.count === 1 ? "" : "s"
      ] }) }) })
    ] }) })
  ] });
}
function Stat({
  label,
  value,
  tone
}) {
  const color = tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : "text-foreground";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-input/60 p-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-1 text-lg font-extrabold tracking-tight ${color}`, children: value })
  ] });
}
export {
  ImportPage as component
};
