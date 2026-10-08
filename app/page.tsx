"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSurahList, type SurahMeta } from "@/lib/quran";

export default function HomePage() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getSurahList();
      setSurahs(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="text-slate-300">جارِ تحميل السور...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-emerald-400">السور القرآنية</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {surahs.map((surah) => (
          <Link
            key={surah.number}
            href={`/surah/${surah.number}`}
            className="group border border-slate-700 rounded-xl p-4 bg-slate-800/60 hover:bg-slate-700/70 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col gap-2"
          >
            <span className="text-xs text-slate-400">
              سورة رقم {surah.number}
            </span>

            <span className="text-lg font-semibold text-slate-100 group-hover:text-emerald-300">
              {surah.name}
            </span>

            <span className="text-slate-500 text-xs group-hover:text-slate-300">
              عدد الآيات: {surah.numberOfAyahs}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
