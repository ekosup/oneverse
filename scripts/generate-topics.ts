import { readFileSync, writeFileSync } from "node:fs";

interface Verse {
  id: number;
  surah: string;
  surahNumber: number;
  ayah: string;
  arabic: string;
  translation: string;
  topics: string[];
}

interface Topic {
  slug: string;
  name: string;
  nameId: string;
  count: number;
}

const NAME_ID: Record<string, string> = {
  Faith: "Keimanan", Worship: "Ibadah", Patience: "Kesabaran",
  Gratitude: "Syukur", Sustenance: "Rezeki", Hope: "Harapan",
  Forgiveness: "Ampunan", Repentance: "Taubat", Knowledge: "Ilmu",
  Charity: "Sedekah", Family: "Keluarga", Marriage: "Pernikahan",
  Parents: "Orang Tua", Children: "Anak", Leadership: "Kepemimpinan",
  Justice: "Keadilan", Honesty: "Kejujuran", Death: "Kematian",
  Hereafter: "Akhirat", Paradise: "Surga", Hell: "Neraka",
  Prayer: "Doa", Hardship: "Kesulitan", Success: "Kesuksesan",
  Humility: "Kerendahan Hati", Strength: "Kekuatan", Peace: "Kedamaian",
  Time: "Waktu", Guidance: "Hidayah", Love: "Cinta", Mercy: "Rahmat",
};

const raw = JSON.parse(readFileSync("public/data/verses.json", "utf-8")) as Verse[];

const countMap: Record<string, number> = {};
for (const v of raw) {
  for (const t of v.topics) {
    countMap[t] = (countMap[t] || 0) + 1;
  }
}

const topics: Topic[] = Object.entries(countMap)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    nameId: NAME_ID[name] || name,
    count,
  }));

writeFileSync("public/data/topics.json", JSON.stringify(topics, null, 2));
console.log(`Generated topics.json with ${topics.length} topics`);
