"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, UserPlus, Users } from "lucide-react";
import { InscriptionsChart, type ChartPoint } from "./InscriptionsChart";
import { Button } from "@/components/ui/Button";
import { listCourses } from "@/lib/courses";
import { listUsers, type AppUser } from "@/lib/users";
import type { Course } from "@/lib/types";
import { useI18n } from "@/i18n/LanguageProvider";
import { useTranslated } from "@/components/TranslatedText";

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function initials(u: AppUser) {
  const a = (u.firstName?.[0] || u.email?.[0] || "?").toUpperCase();
  const b = (u.lastName?.[0] || "").toUpperCase();
  return `${a}${b}`;
}

function displayName(u: AppUser) {
  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return name || u.email || "Utilisateur";
}

function PopularTitle({ title }: { title: string }) {
  const translated = useTranslated(title);
  return (
    <span className="truncate text-sm font-medium text-brand-950">
      {translated}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, u] = await Promise.all([
          listCourses({ publishedOnly: false, fallbackStatic: false }),
          listUsers(),
        ]);
        if (!cancelled) {
          setCourses(c);
          setUsers(u);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clients = useMemo(
    () => users.filter((u) => u.role === "client"),
    [users]
  );

  const accepted = clients.filter((u) => u.status === "accepted");
  const pending = clients.filter((u) => u.status === "pending");
  const published = courses.filter((c) => c.published);
  const todayStart = startOfDay();
  const todayCount = clients.filter(
    (u) => u.createdAt && u.createdAt >= todayStart
  ).length;

  const chartData = useMemo(() => {
    const months = t.admin.months;
    const now = new Date();
    const points: ChartPoint[] = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const count = clients.filter((u) => {
        if (!u.createdAt) return false;
        const c = new Date(u.createdAt);
        return `${c.getFullYear()}-${c.getMonth()}` === key;
      }).length;
      points.push({ mois: months[d.getMonth()], inscriptions: count });
    }
    return points;
  }, [clients, t.admin.months]);

  const popular = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of clients) {
      if (!u.formationSlug) continue;
      counts.set(u.formationSlug, (counts.get(u.formationSlug) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([slug, inscrits]) => {
        const course = courses.find((c) => c.slug === slug);
        return {
          slug,
          title: course?.title || slug,
          inscrits,
        };
      })
      .sort((a, b) => b.inscrits - a.inscrits)
      .slice(0, 4);
  }, [clients, courses]);

  const recent = useMemo(() => clients.slice(0, 5), [clients]);

  const stats = [
    {
      icon: Users,
      label: t.admin.statAccepted,
      value: loading ? "…" : String(accepted.length),
    },
    {
      icon: BookOpen,
      label: t.admin.statActive,
      value: loading ? "…" : String(published.length),
    },
    {
      icon: UserPlus,
      label: t.admin.statToday,
      value: loading ? "…" : String(todayCount),
    },
    {
      icon: Clock,
      label: t.admin.statPending,
      value: loading ? "…" : String(pending.length),
    },
  ];

  function formatDate(ts?: number) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-950 sm:text-2xl">
            {t.admin.dashTitle}
          </h1>
          <p className="mt-1 text-sm text-brand-950/60">{t.admin.dashSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/ajout-cours" variant="primary">
            {t.admin.addCourse}
          </Button>
          <Button href="/admin/utilisateurs" variant="ghost">
            {t.admin.users}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-brand-950">{value}</p>
            <p className="mt-0.5 text-xs text-brand-950/50">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft sm:p-6">
        <h2 className="mb-4 text-base font-bold text-brand-950 sm:text-lg">
          {t.admin.chartTitle}
        </h2>
        {loading ? (
          <p className="py-16 text-center text-sm text-brand-950/50">
            {t.admin.loading}
          </p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <InscriptionsChart data={chartData} />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-brand-950">
              {t.admin.popularTitle}
            </h2>
            <Link
              href="/admin/formations"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              {t.admin.seeAll}
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-brand-950/50">{t.admin.loading}</p>
          ) : popular.length === 0 ? (
            <p className="text-sm text-brand-950/50">{t.admin.noPopular}</p>
          ) : (
            <ul className="space-y-3">
              {popular.map((f) => (
                <li
                  key={f.slug}
                  className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 px-3 py-2.5"
                >
                  <PopularTitle title={f.title} />
                  <span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                    {f.inscrits}{" "}
                    {f.inscrits > 1
                      ? t.admin.enrolledPlural
                      : t.admin.enrolled}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-brand-950">
              {t.admin.recentTitle}
            </h2>
            <Link
              href="/admin/utilisateurs"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              {t.admin.manage}
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-brand-950/50">{t.admin.loading}</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-brand-950/50">{t.admin.noRecent}</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((u) => (
                <li key={u.uid} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                    {initials(u)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-950">
                      {displayName(u)}
                    </p>
                    <p className="truncate text-xs text-brand-950/50">
                      {u.formationSlug || t.admin.noFormation} · {u.status}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-brand-950/40">
                    {formatDate(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
