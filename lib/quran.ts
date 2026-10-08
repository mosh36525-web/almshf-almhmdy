export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
};

export type SurahData = {
  number: number;
  name: string;
  englishName: string;
  ayahs: {
    number: number; // global ayah id
    text: string;
  }[];
};

const API_BASE = "https://api.alquran.cloud/v1";

export async function getSurahList(): Promise<SurahMeta[]> {
  const res = await fetch(`${API_BASE}/surah`);
  const json = await res.json();
  return json.data;
}

export async function getSurahById(id: number): Promise<SurahData> {
  const res = await fetch(`${API_BASE}/surah/${id}`);
  const json = await res.json();
  return {
    number: json.data.number,
    name: json.data.name,
    englishName: json.data.englishName,
    ayahs: json.data.ayahs.map((a: any) => ({
      number: a.number,
      text: a.text,
    })),
  };
}
