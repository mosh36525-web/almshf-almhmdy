"use client";

import { useState, useEffect, useRef, use } from "react";
import { getSurahById, type SurahData } from "@/lib/quran";

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  const surahId = Number(resolved.id);

  const [surah, setSurah] = useState<SurahData | null>(null);

  // العناصر الأساسية
  const [reciter, setReciter] = useState("ar.alafasy");
  const [lastAyah, setLastAyah] = useState<number | null>(null);

  // الصوت
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  // الإعدادات (Modal)
  const [modalOpen, setModalOpen] = useState(false);

  // حجم الخط
  const [fontSize, setFontSize] = useState(24);

  // شريط التقدم
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // تشغيل من آية إلى آية
  const [startAyah, setStartAyah] = useState(0);
  const [endAyah, setEndAyah] = useState(0);

  useEffect(() => {
    (async () => {
      const data = await getSurahById(surahId);
      setSurah(data);

      const savedReciter = localStorage.getItem("reciter");
      const savedFont = localStorage.getItem("fontSize");
      const savedLastAyah = localStorage.getItem(`lastAyah_${surahId}`);
      const savedVolume = localStorage.getItem("volume");
      const savedSpeed = localStorage.getItem("speed");

      if (savedReciter) setReciter(savedReciter);
      if (savedFont) setFontSize(Number(savedFont));
      if (savedLastAyah) setLastAyah(Number(savedLastAyah));
      if (savedVolume) setVolume(Number(savedVolume));
      if (savedSpeed) setSpeed(Number(savedSpeed));
    })();

    return () => stopAudio();
  }, [surahId]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setProgress(0);
    setDuration(0);
  };

  const applyAudioSettings = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
    audioRef.current.playbackRate = speed;
  };

  const playNewAudio = async (url: string, ayahIndex?: number) => {
    stopAudio();

    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = muted ? 0 : volume;
    audio.playbackRate = speed;
    audioRef.current = audio;

    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setProgress(audio.currentTime);

    audio.onended = () => {
      if (startAyah !== null && endAyah !== null) {
        if (ayahIndex !== undefined && ayahIndex < endAyah) {
          return playAyah(ayahIndex + 1);
        }
      }
    };

    try {
      await audio.play();
    } catch {}
  };

  const playSurah = () => {
    playNewAudio(`https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahId}.mp3`);
  };

  const playAyah = (index: number) => {
    if (!surah) return;
    stopAudio();

    const ayah = surah.ayahs[index];
    const audio = new Audio(
      `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayah.number}.mp3`
    );

    audio.volume = muted ? 0 : volume;
    audio.playbackRate = speed;

    audioRef.current = audio;
    audio.play();

    localStorage.setItem(`lastAyah_${surahId}`, index.toString());
    setLastAyah(index);
  };

  const resumeLastAyah = () => {
    if (lastAyah !== null) playAyah(lastAyah);
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
  };

  const handleSeekBar = (e: any) => {
    const newTime = Number(e.target.value);
    setProgress(newTime);
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  return (
    <div className="space-y-4">

      {/* الشريط العلوي */}
      <div className="w-full bg-slate-800/70 border border-slate-700 rounded-xl p-3 flex flex-wrap gap-3 items-center">

        {/* اختيار القارئ */}
        <select
          value={reciter}
          onChange={(e) => {
            setReciter(e.target.value);
            localStorage.setItem("reciter", e.target.value);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded"
        >
          <option value="ar.alafasy">العفاسي</option>
          <option value="ar.husary">الحصري</option>
          <option value="ar.minshawi">المنشاوي</option>
          <option value="ar.abdulbasit">عبد الباسط</option>
        </select>

        {/* تشغيل السورة */}
        <button
          onClick={playSurah}
          className="bg-emerald-600 px-4 py-2 rounded text-white"
        >
          ▶ تشغيل السورة
        </button>

        {/* الرجوع للآية الأخيرة */}
        {lastAyah !== null && (
          <button
            onClick={resumeLastAyah}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            🔁 الرجوع للآية الأخيرة ({lastAyah + 1})
          </button>
        )}

        {/* زر الإيقاف */}
        <button
          onClick={stopAudio}
          className="bg-red-600 px-4 py-2 rounded text-white"
        >
          ⏹ إيقاف
        </button>

        {/* زر الإعدادات */}
        <button
          onClick={() => setModalOpen(true)}
          className="bg-slate-700 px-4 py-2 rounded text-white ml-auto"
        >
          ⋮
        </button>
      </div>

      {/* Modal مع Scroll */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-4 rounded-xl w-64 max-h-[80vh] overflow-y-auto space-y-3 border border-slate-700">

            <h2 className="text-white text-lg font-bold mb-2">الإعدادات المتقدمة</h2>

            {/* الصوت */}
            <div>
              <p className="text-slate-300 mb-1 text-sm">الصوت</p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  localStorage.setItem("volume", v.toString());
                  applyAudioSettings();
                }}
                className="w-full accent-emerald-500 h-2 rounded-lg bg-slate-700"
              />

              <button
                onClick={() => {
                  setMuted(!muted);
                  applyAudioSettings();
                }}
                className={`w-full py-2 rounded text-white mt-2 text-sm ${
                  muted ? "bg-red-600" : "bg-slate-600"
                }`}
              >
                {muted ? "🔇 كتم الصوت" : "🔊 تشغيل الصوت"}
              </button>
            </div>

            {/* سرعة التشغيل */}
            <div>
              <p className="text-slate-300 mb-1 text-sm">سرعة التشغيل</p>
              <select
                value={speed}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setSpeed(s);
                  localStorage.setItem("speed", s.toString());
                  applyAudioSettings();
                }}
                className="bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded w-full text-sm"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            {/* تقديم وتأخير */}
            <div className="flex gap-2">
              <button
                onClick={() => seek(-5)}
                className="bg-slate-700 w-full py-2 rounded text-white text-sm"
              >
                ⏪ -5s
              </button>

              <button
                onClick={() => seek(5)}
                className="bg-slate-700 w-full py-2 rounded text-white text-sm"
              >
                ⏩ +5s
              </button>
            </div>

            {/* شريط التقدم */}
            <div>
              <p className="text-slate-300 mb-1 text-sm">شريط التقدم</p>
              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={handleSeekBar}
                className="w-full accent-blue-500 h-2 rounded-lg bg-slate-700"
              />
            </div>

            {/* تكبير وتصغير الخط */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newSize = fontSize + 2;
                  setFontSize(newSize);
                  localStorage.setItem("fontSize", newSize.toString());
                }}
                className="bg-slate-700 w-full py-2 rounded text-white text-sm"
              >
                ➕ تكبير الخط
              </button>

              <button
                onClick={() => {
                  const newSize = Math.max(14, fontSize - 2);
                  setFontSize(newSize);
                  localStorage.setItem("fontSize", newSize.toString());
                }}
                className="bg-slate-700 w-full py-2 rounded text-white text-sm"
              >
                ➖ تصغير الخط
              </button>
            </div>

            {/* تشغيل من آية */}
            <div>
              <p className="text-slate-300 mb-1 text-sm">تشغيل من آية</p>
              <input
                type="number"
                min="1"
                max={surah?.ayahs?.length || 1}
                value={startAyah + 1}
                onChange={(e) => setStartAyah(Number(e.target.value) - 1)}
                className="bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded w-full text-sm"
              />

              <button
                onClick={() => playAyah(startAyah)}
                className="bg-emerald-600 w-full py-2 rounded text-white mt-2 text-sm"
              >
                ▶ تشغيل
              </button>
            </div>

            {/* تكرار من آية إلى آية */}
            <div>
              <p className="text-slate-300 mb-1 text-sm">تكرار من آية إلى آية</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={surah?.ayahs?.length || 1}
                  value={startAyah + 1}
                  onChange={(e) => setStartAyah(Number(e.target.value) - 1)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded w-full text-sm"
                />
                <input
                  type="number"
                  min="1"
                  max={surah?.ayahs?.length || 1}
                  value={endAyah + 1}
                  onChange={(e) => setEndAyah(Number(e.target.value) - 1)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 p-2 rounded w-full text-sm"
                />
              </div>

              <button
                onClick={() => playAyah(startAyah)}
                className="bg-blue-600 w-full py-2 rounded text-white mt-2 text-sm"
              >
                🔁 بدء التكرار
              </button>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="bg-red-600 w-full py-2 rounded text-white text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* الآيات — الشكل الجديد */}
      <div
        className="border border-slate-700 rounded-xl p-4 bg-slate-900/70 space-y-4 max-h-[75vh] overflow-y-auto"
        style={{ fontSize: `${fontSize}px` }}
      >
        {surah?.ayahs?.map((ayah, index) => (
          <div
            key={ayah.number}
            className="flex items-center justify-between gap-4 bg-slate-800/50 border border-slate-700 p-3 rounded-lg"
          >
            <p className="flex-1 leading-relaxed">{ayah.text}</p>

            <button
              onClick={() => playAyah(index)}
              className="bg-emerald-600 px-3 py-1 rounded text-white text-sm whitespace-nowrap"
            >
              ▶ آية {index + 1}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
