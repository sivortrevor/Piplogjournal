import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { parseBrokerCsv, type ParsedRow, type ParseResult } from "@/lib/broker-import";
import { formatCurrency } from "@/lib/trade-utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/app/import")({
  head: () => ({ meta: [{ title: "Import Trades — PipLog" }] }),
  component: ImportPage,
});

function ImportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());

  const handleFile = async (file: File | null) => {
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
      // pre-select all valid rows
      setSelected(new Set(result.rows.map((_, i) => i)));

      // fetch existing trades to dedupe by composite key
      const { data: existing } = await supabase
        .from("trades")
        .select("pair, opened_at, entry_price, side, lot_size");
      const keys = new Set<string>(
        (existing ?? []).map(
          (t) =>
            `${t.pair}|${new Date(t.opened_at).toISOString()}|${Number(t.entry_price)}|${t.side}|${Number(t.lot_size) || 0}`,
        ),
      );
      setExistingKeys(keys);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read file";
      toast.error(msg);
    } finally {
      setParsing(false);
    }
  };

  const dedup = useMemo(() => {
    if (!parseResult) return { newRows: [] as ParsedRow[], duplicateRows: [] as ParsedRow[] };
    const newRows: ParsedRow[] = [];
    const duplicateRows: ParsedRow[] = [];
    const seenInBatch = new Set<string>();
    for (const r of parseResult.rows) {
      if (existingKeys.has(r._key) || seenInBatch.has(r._key)) {
        duplicateRows.push(r);
      } else {
        newRows.push(r);
        seenInBatch.add(r._key);
      }
    }
    return { newRows, duplicateRows };
  }, [parseResult, existingKeys]);

  const summary = useMemo(() => {
    if (!parseResult) return null;
    const selectedRows = parseResult.rows.filter((_, i) => selected.has(i));
    const importable = selectedRows.filter((r) => !existingKeys.has(r._key));
    const totalPnl = importable.reduce((s, r) => s + (r.pnl || 0), 0);
    const wins = importable.filter((r) => r.result === "win").length;
    const losses = importable.filter((r) => r.result === "loss").length;
    return { count: importable.length, totalPnl, wins, losses };
  }, [parseResult, selected, existingKeys]);

  const handleImport = async () => {
    if (!user || !parseResult || !summary) return;
    if (summary.count === 0) {
      toast.error("No new trades selected");
      return;
    }
    setImporting(true);
    try {
      const toImport = parseResult.rows
        .filter((_, i) => selected.has(i))
        .filter((r) => !existingKeys.has(r._key))
        .map((r) => ({
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
          mistakes: [],
        }));

      // Insert in batches of 200 to stay safely below limits
      const BATCH = 200;
      let inserted = 0;
      for (let i = 0; i < toImport.length; i += BATCH) {
        const slice = toImport.slice(i, i + BATCH);
        const { error } = await supabase.from("trades").insert(slice);
        if (error) throw error;
        inserted += slice.length;
      }

      toast.success(`Imported ${inserted} trade${inserted === 1 ? "" : "s"} ✓`);
      navigate({ to: "/app/trades" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const toggleAll = () => {
    if (!parseResult) return;
    if (selected.size === parseResult.rows.length) setSelected(new Set());
    else setSelected(new Set(parseResult.rows.map((_, i) => i)));
  };

  return (
    <div className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <header className="mx-auto flex max-w-6xl items-center gap-3">
        <Link
          to="/app/profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ letterSpacing: "-0.025em" }}>
            Import trades
          </h1>
          <p className="text-xs text-muted-foreground">
            Upload an MT4, MT5, cTrader or generic broker CSV.
          </p>
        </div>
      </header>

      {!parseResult ? (
        <div className="mx-auto mt-8 max-w-2xl">
          <label className="surface-card flex h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-6 text-center transition hover:border-primary">
            {parsing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-semibold">Reading {fileName}…</p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-bold">Drop a CSV file here</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or tap to browse — max 10MB
                  </p>
                </div>
              </>
            )}
            <input
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              disabled={parsing}
            />
          </label>

          <div className="surface-card mt-4 rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tips
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>• Export from MetaTrader: <span className="text-foreground">Account History → Save as Report</span> → choose CSV.</li>
              <li>• cTrader: <span className="text-foreground">History tab → Export → CSV</span>.</li>
              <li>• Trades are deduplicated by pair + open time + entry price + side + lot.</li>
              <li>• Commissions and swaps are added into P/L automatically when present.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-6xl space-y-4">
          {parseResult.errors.length > 0 && parseResult.rows.length === 0 ? (
            <div className="surface-card rounded-2xl border border-destructive/30 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-bold text-destructive">Couldn't parse the file</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {parseResult.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>Row {e.row}: {e.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setParseResult(null);
                  setFileName("");
                }}
                className="mt-4"
              >
                Try another file
              </Button>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <section className="surface-card rounded-3xl p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{fileName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {parseResult.detectedFormat} · {parseResult.rows.length} trades found
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setParseResult(null);
                      setFileName("");
                      setSelected(new Set());
                    }}
                    className="h-9 rounded-xl"
                  >
                    Different file
                  </Button>
                </div>

                {summary && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Selected to import" value={String(summary.count)} />
                    <Stat
                      label="Total P/L"
                      value={formatCurrency(summary.totalPnl)}
                      tone={summary.totalPnl >= 0 ? "profit" : "loss"}
                    />
                    <Stat label="Wins" value={String(summary.wins)} tone="profit" />
                    <Stat label="Losses" value={String(summary.losses)} tone="loss" />
                  </div>
                )}

                {dedup.duplicateRows.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-input/60 p-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Skipping {dedup.duplicateRows.length} duplicate trade{dedup.duplicateRows.length === 1 ? "" : "s"} already in your journal.
                  </div>
                )}
              </section>

              {/* Preview table */}
              <section className="surface-card overflow-hidden rounded-2xl">
                <div className="flex items-center justify-between border-b border-border p-3">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Checkbox
                      checked={selected.size === parseResult.rows.length}
                      className="h-4 w-4 pointer-events-none"
                    />
                    {selected.size === parseResult.rows.length ? "Deselect all" : "Select all"}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {selected.size} of {parseResult.rows.length} selected
                  </span>
                </div>

                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-input/95 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="w-10 px-3 py-2"></th>
                        <th className="px-3 py-2">Pair</th>
                        <th className="px-3 py-2">Side</th>
                        <th className="px-3 py-2">Open</th>
                        <th className="px-3 py-2 text-right">Entry</th>
                        <th className="px-3 py-2 text-right">Exit</th>
                        <th className="px-3 py-2 text-right">Lot</th>
                        <th className="px-3 py-2 text-right">P/L</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.rows.map((r, i) => {
                        const isDup = existingKeys.has(r._key);
                        const isSel = selected.has(i);
                        return (
                          <tr
                            key={i}
                            className={`border-t border-border/60 ${
                              isDup ? "opacity-50" : "hover:bg-input/40"
                            }`}
                          >
                            <td className="px-3 py-2">
                              <Checkbox
                                checked={isSel}
                                disabled={isDup}
                                onCheckedChange={(c) => {
                                  setSelected((prev) => {
                                    const next = new Set(prev);
                                    if (c) next.add(i);
                                    else next.delete(i);
                                    return next;
                                  });
                                }}
                                className="h-4 w-4"
                              />
                            </td>
                            <td className="px-3 py-2 font-bold">{r.pair}</td>
                            <td
                              className={`px-3 py-2 font-semibold uppercase ${
                                r.side === "buy" ? "text-profit" : "text-loss"
                              }`}
                            >
                              {r.side}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {new Date(r.opened_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.entry_price}</td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {r.exit_price ?? "—"}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {r.lot_size || "—"}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-bold tabular-nums ${
                                r.pnl == null
                                  ? "text-muted-foreground"
                                  : r.pnl > 0
                                    ? "text-profit"
                                    : r.pnl < 0
                                      ? "text-loss"
                                      : ""
                              }`}
                            >
                              {r.pnl == null ? "—" : formatCurrency(r.pnl)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {isDup ? (
                                <span className="rounded-full bg-input px-2 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                                  Duplicate
                                </span>
                              ) : (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                    r.result === "win"
                                      ? "bg-profit/15 text-profit"
                                      : r.result === "loss"
                                        ? "bg-loss/15 text-loss"
                                        : "bg-input text-muted-foreground"
                                  }`}
                                >
                                  {r.result}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {parseResult.errors.length > 0 && (
                <details className="surface-card rounded-2xl p-4 text-xs">
                  <summary className="cursor-pointer font-semibold text-muted-foreground">
                    {parseResult.errors.length} skipped row{parseResult.errors.length === 1 ? "" : "s"}
                  </summary>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {parseResult.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>Row {e.row}: {e.message}</li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Sticky import bar */}
              <div className="sticky bottom-24 lg:bottom-6">
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || !summary || summary.count === 0}
                  className="h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {importing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Import {summary?.count ?? 0} trade{summary?.count === 1 ? "" : "s"}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "profit" | "loss";
}) {
  const color = tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : "text-foreground";
  return (
    <div className="rounded-xl bg-input/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-lg font-extrabold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
