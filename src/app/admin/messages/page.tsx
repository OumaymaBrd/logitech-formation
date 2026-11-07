"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  listContactMessages,
  setContactMessageStatus,
  type ContactMessage,
} from "@/lib/messages";
import { useI18n } from "@/i18n/LanguageProvider";

const PAGE_SIZE = 5;

export default function AdminMessagesPage() {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  function formatDate(ts?: number) {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleString(locale === "ar" ? "ar-MA" : "fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await listContactMessages();
      setMessages(list);
      setPage(1);
      const unread = list.filter((m) => m.status === "new");
      if (unread.length > 0) {
        await Promise.all(
          unread.map((m) => setContactMessageStatus(m.id, "read"))
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.status === "new" ? { ...m, status: "read" } : m
          )
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger les messages"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return messages.slice(start, start + PAGE_SIZE);
  }, [messages, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-950">
            {t.admin.messagesTitle}
          </h1>
          <p className="mt-1 text-sm text-brand-950/60">
            {t.admin.messagesSubtitle}
            {messages.length > 0
              ? ` ${messages.length} ${
                  messages.length > 1
                    ? t.admin.messagesCountPlural
                    : t.admin.messagesCount
                }.`
              : ""}
          </p>
        </div>
        <Button type="button" variant="ghost" className="gap-2" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          {t.admin.refresh}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-brand-950/50">{t.admin.loading}</p>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-100 bg-white py-14 text-center shadow-soft">
          <Mail className="mx-auto h-8 w-8 text-brand-700/40" />
          <p className="mt-3 text-sm text-brand-950/55">{t.admin.noMessages}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageItems.map((m) => (
              <article
                key={m.id}
                className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card transition hover:border-brand-200 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
                        {(m.fullName || "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-brand-950">
                          {m.fullName || "—"}
                        </p>
                        <p className="truncate text-sm text-brand-950/55">
                          {m.email || "—"}
                        </p>
                        {m.phone ? (
                          <p className="truncate text-sm text-brand-950/55">
                            {m.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-brand-950/75">
                      {m.message || "—"}
                    </p>
                    <p className="text-xs text-brand-950/40">
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => setSelected(m)}
                  >
                    {t.admin.viewDetails}
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-xs text-brand-950/45">
              {t.admin.pageOf} {page} / {totalPages} · {PAGE_SIZE}{" "}
              {t.admin.perPage}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-700 disabled:opacity-40"
              >
                {t.admin.prev}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-xl text-sm font-bold ${
                    page === n
                      ? "bg-brand-700 text-white"
                      : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-700 disabled:opacity-40"
              >
                {t.admin.next}
              </button>
            </div>
          </div>
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-brand-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-brand-950">
                  {t.admin.detailTitle}
                </h2>
                <p className="mt-0.5 text-xs text-brand-950/45">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-brand-950/50 hover:bg-brand-50 hover:text-brand-950"
                aria-label={t.admin.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="space-y-5 px-5 py-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {t.admin.fullName}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-brand-950">
                  {selected.fullName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {t.admin.email}
                </dt>
                <dd className="mt-1.5 break-all text-sm font-medium text-brand-950">
                  {selected.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {t.admin.phone}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-brand-950">
                  {selected.phone || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {t.admin.message}
                </dt>
                <dd className="mt-1.5 whitespace-pre-wrap rounded-xl bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-950">
                  {selected.message || "—"}
                </dd>
              </div>
            </dl>

            <div className="border-t border-brand-100 px-5 py-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setSelected(null)}
              >
                {t.admin.close}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
