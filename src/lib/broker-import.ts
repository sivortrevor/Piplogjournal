// Broker CSV import parser — auto-detects column meaning from header names.
// Supports MT4/MT5/cTrader and generic broker exports.

import {
  calculatePips,
  calculatePnl,
  determineResult,
  detectOutcome,
} from "./trade-utils";

export interface ParsedRow {
  pair: string;
  side: "buy" | "sell";
  lot_size: number;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  pnl: number | null;
  pips: number | null;
  result: "win" | "loss" | "breakeven" | "open";
  opened_at: string; // ISO
  closed_at: string | null;
  // dedupe key
  _key: string;
  _raw: Record<string, string>;
  _row: number;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: { row: number; message: string }[];
  detectedFormat: string;
  headers: string[];
}

// Header alias dictionaries — case-insensitive matching
const HEADER_ALIASES: Record<string, string[]> = {
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
  closed_at: ["close time", "closetime", "close_time", "exit time", "exit_time", "close date"],
};

function normaliseHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[._]/g, " ").replace(/\s+/g, " ");
}

function findColumn(headers: string[], aliases: string[]): number {
  const norm = headers.map(normaliseHeader);
  for (const alias of aliases) {
    const idx = norm.indexOf(alias);
    if (idx >= 0) return idx;
  }
  // fuzzy contains
  for (let i = 0; i < norm.length; i++) {
    for (const alias of aliases) {
      if (norm[i].includes(alias) || alias.includes(norm[i])) return i;
    }
  }
  return -1;
}

// Simple but robust CSV line parser (handles quoted values + escaped quotes)
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
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

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const tab = (firstLine.match(/\t/g) || []).length;
  const semi = (firstLine.match(/;/g) || []).length;
  const comma = (firstLine.match(/,/g) || []).length;
  if (tab >= comma && tab >= semi) return "\t";
  if (semi > comma) return ";";
  return ",";
}

// Parse a date string into ISO. Handles MT4/MT5 "YYYY.MM.DD HH:MM:SS",
// cTrader "DD/MM/YYYY HH:MM:SS.ms", and ISO-ish formats.
function parseDate(s: string): string | null {
  if (!s) return null;
  const trimmed = s.trim();
  // YYYY.MM.DD HH:MM[:SS]
  const mt = trimmed.match(
    /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/,
  );
  if (mt) {
    const [, y, mo, d, h, mi, se] = mt;
    const dt = new Date(
      Date.UTC(+y, +mo - 1, +d, +h, +mi, se ? +se : 0),
    );
    return dt.toISOString();
  }
  // DD/MM/YYYY HH:MM[:SS]
  const ct = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/,
  );
  if (ct) {
    const [, d, mo, y, h, mi, se] = ct;
    const dt = new Date(
      Date.UTC(+y, +mo - 1, +d, +h, +mi, se ? +se : 0),
    );
    return dt.toISOString();
  }
  // Fallback to native Date parsing
  const native = Date.parse(trimmed);
  if (!isNaN(native)) return new Date(native).toISOString();
  return null;
}

function detectFormat(headers: string[]): string {
  const hs = headers.map(normaliseHeader).join(" ");
  if (hs.includes("ticket") && hs.includes("s / l")) return "MetaTrader 4";
  if (hs.includes("position") && hs.includes("s / l")) return "MetaTrader 5";
  if (hs.includes("deal id") || hs.includes("entry time")) return "cTrader";
  return "Generic broker CSV";
}

function normaliseSide(raw: string): "buy" | "sell" | null {
  const s = raw.trim().toLowerCase();
  if (s.startsWith("buy") || s === "long" || s === "b") return "buy";
  if (s.startsWith("sell") || s === "short" || s === "s") return "sell";
  return null;
}

function normalisePair(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

function num(s: string): number {
  if (!s) return NaN;
  // remove spaces, currency signs, commas-as-thousand
  const cleaned = s.replace(/[\s$€£¥]/g, "").replace(/,/g, "");
  return parseFloat(cleaned);
}

export function parseBrokerCsv(text: string): ParseResult {
  const errors: { row: number; message: string }[] = [];
  const cleaned = text.replace(/^\uFEFF/, "");

  // Some broker exports prepend a few report-info lines before the real header.
  // Split into lines and find the first line that looks like a header (contains
  // at least 3 of our known alias categories).
  const allLines = cleaned.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (allLines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: "File is empty." }], detectedFormat: "—", headers: [] };
  }

  const delimiter = detectDelimiter(cleaned);

  let headerIdx = -1;
  let headers: string[] = [];
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
      headers: [],
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
    closed: findColumn(headers, HEADER_ALIASES.closed_at),
  };

  const required = ["pair", "side", "entry", "opened"] as const;
  const missing = required.filter((k) => idx[k] === -1);
  if (missing.length) {
    return {
      rows: [],
      errors: [
        {
          row: headerIdx + 1,
          message: `Missing required columns: ${missing.join(", ")}. Detected: ${headers.join(", ")}`,
        },
      ],
      detectedFormat: detectFormat(headers),
      headers,
    };
  }

  const rows: ParsedRow[] = [];
  for (let i = headerIdx + 1; i < allLines.length; i++) {
    const cols = parseCsvLine(allLines[i], delimiter);
    if (cols.every((c) => !c.trim())) continue;
    if (cols.length < headers.length / 2) continue; // probably a footer summary line

    const raw: Record<string, string> = {};
    headers.forEach((h, j) => (raw[h] = cols[j] ?? ""));

    const pair = normalisePair(cols[idx.pair] ?? "");
    const side = normaliseSide(cols[idx.side] ?? "");
    const entry = num(cols[idx.entry] ?? "");
    const opened = parseDate(cols[idx.opened] ?? "");

    if (!pair) {
      errors.push({ row: i + 1, message: "Missing pair" });
      continue;
    }
    if (!side) {
      // Skip non-trade rows (e.g. balance, deposit lines in MT4 statements)
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
      // fallback: compute from prices
      pnl = calculatePnl({ pair, side, entry, exit, lotSize: lot });
    } else {
      pnl = NaN;
    }

    const pips = isFinite(exit) ? calculatePips({ pair, side, entry, exit }) : null;
    const finalPnl = isFinite(pnl) ? Math.round(pnl * 100) / 100 : null;
    const result = isFinite(exit)
      ? finalPnl != null
        ? determineResult(finalPnl)
        : detectOutcome({ side, entry, exit }) === "profit"
          ? "win"
          : detectOutcome({ side, entry, exit }) === "loss"
            ? "loss"
            : "breakeven"
      : "open";

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
      _row: i + 1,
    });
  }

  return { rows, errors, detectedFormat: detectFormat(headers), headers };
}
