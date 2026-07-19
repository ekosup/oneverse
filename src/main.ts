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

let verses: Verse[] = [];
let topics: Topic[] = [];

// ─── Load data ───
async function load(): Promise<void> {
  try {
    const [v, t] = await Promise.all([
      fetch("./data/verses.json").then(r => { if (!r.ok) throw new Error(`verses: ${r.status}`); return r.json(); }),
      fetch("./data/topics.json").then(r => { if (!r.ok) throw new Error(`topics: ${r.status}`); return r.json(); }),
    ]);
    verses = v;
    topics = t;
    route();
  } catch (e) {
    document.getElementById("app")!.innerHTML = `
      <div class="container" style="text-align:center;padding-top:4rem;">
        <p style="font-size:1.5rem;color:#8B7E6E;">Gagal memuat data 😔</p>
        <p style="color:#B0A090;margin-top:0.5rem;">Periksa koneksi dan muat ulang.</p>
      </div>`;
  }
}

// ─── Router ───
function route(): void {
  const hash = location.hash || "#home";
  const app = document.getElementById("app")!;

  if (hash === "#home") renderHome(app);
  else if (hash === "#topics") renderTopics(app);
  else if (hash.startsWith("#topic/")) renderTopicDetail(app, decodeURIComponent(hash.slice(7)));
  else if (hash.startsWith("#verse/")) renderVerseDetail(app, Number(hash.slice(7)));
  else renderHome(app);

  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

window.addEventListener("hashchange", route);

// ─── Helpers ───
function formatDate(d: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getDailyVerse(): Verse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return verses[(now.getFullYear() * 1000 + dayOfYear) % verses.length];
}

function toast(msg: string): void {
  let el = document.querySelector(".toast") as HTMLElement | null;
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el!.classList.remove("show"), 2000);
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
  toast("Disalin ✓");
}

function buildVerseText(v: Verse): string {
  return `${v.arabic}\n\n"${v.translation}"\n\n— QS. ${v.surah} ${v.ayah}`;
}

// ─── SVG icons (inline, no deps) ───
const Icons = {
  copy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  random: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
  topics: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
};

// ═══════════════════════════════════════════
// PAGE: Home — Daily Verse
// ═══════════════════════════════════════════
function renderHome(app: HTMLElement): void {
  const v = getDailyVerse();
  app.innerHTML = `
    <div class="container">
      <nav class="nav">
        <a href="#home" class="nav-brand">OneVerse</a>
        <a href="#topics" class="nav-link">${Icons.topics} <span>Topik</span></a>
      </nav>
      <header class="header">
        <time class="date">${formatDate(new Date())}</time>
      </header>
      <main class="card verse-card" id="verse-card">
        <div class="verse-ref">QS. ${v.surah} ${v.ayah}</div>
        <p class="verse-arabic">${v.arabic}</p>
        <p class="verse-translation">${v.translation}</p>
        <div class="verse-topics">
          ${v.topics.map(t => `<a href="#topic/${encodeURIComponent(t.toLowerCase().replace(/\\s+/g, '-'))}" class="topic-tag">${t}</a>`).join("")}
        </div>
      </main>
      <footer class="actions">
        <button class="btn" id="btn-copy">${Icons.copy} <span>Salin</span></button>
        <button class="btn" id="btn-share">${Icons.share} <span>Bagikan</span></button>
        <button class="btn" id="btn-random">${Icons.random} <span>Acak</span></button>
      </footer>
    </div>`;

  document.getElementById("btn-copy")!.addEventListener("click", () => copyText(buildVerseText(v)));
  document.getElementById("btn-share")!.addEventListener("click", () => {
    if ("share" in navigator) {
      navigator.share({ title: `Daily Quran — QS. ${v.surah}`, text: buildVerseText(v) });
    }
  });
  document.getElementById("btn-random")!.addEventListener("click", () => {
    const idx = Math.floor(Math.random() * verses.length);
    const card = document.getElementById("verse-card")!;
    card.classList.add("switching");
    setTimeout(() => {
      location.hash = `#verse/${verses[idx].id}`;
    }, 200);
  });
  (document.getElementById("btn-share")! as HTMLElement).style.display = "share" in navigator ? "" : "none";
}

// ═══════════════════════════════════════════
// PAGE: Browse Topics
// ═══════════════════════════════════════════
function renderTopics(app: HTMLElement): void {
  app.innerHTML = `
    <div class="container">
      <nav class="nav">
        <a href="#home" class="nav-back">${Icons.back} <span>Kembali</span></a>
        <span class="nav-title">Topik</span>
      </nav>
      <div class="topics-grid">
        ${topics.map(t => `
          <a href="#topic/${t.slug}" class="topic-card">
            <span class="topic-accent"></span>
            <span class="topic-name">${t.nameId}</span>
            <span class="topic-count">${t.count} ayat</span>
          </a>
        `).join("")}
      </div>
    </div>`;
}

// ═══════════════════════════════════════════
// PAGE: Topic Detail — list verses + random
// ═══════════════════════════════════════════
function renderTopicDetail(app: HTMLElement, slug: string): void {
  const topic = topics.find(t => t.slug === slug);
  if (!topic) { renderTopics(app); return; }

  const topicVerses = verses.filter(v => v.topics.includes(topic.name));

  const randomFromTopic = () => {
    if (topicVerses.length === 0) return;
    const v = topicVerses[Math.floor(Math.random() * topicVerses.length)];
    location.hash = `#verse/${v.id}`;
  };

  app.innerHTML = `
    <div class="container">
      <nav class="nav">
        <a href="#topics" class="nav-back">${Icons.back} <span>Topik</span></a>
        <span class="nav-title">${topic.nameId}</span>
      </nav>
      <div class="topic-header">
        <p class="topic-subtitle">${topic.count} ayat tentang ${topic.nameId.toLowerCase()}</p>
        <button class="btn" id="btn-random-topic">${Icons.random} <span>Ayat Acak</span></button>
      </div>
      <div class="verse-list">
        ${topicVerses.map(v => `
          <a href="#verse/${v.id}" class="verse-list-item">
            <div class="verse-list-ref">QS. ${v.surah} ${v.ayah}</div>
            <p class="verse-list-arabic">${v.arabic.length > 120 ? v.arabic.slice(0, 120) + '…' : v.arabic}</p>
            <p class="verse-list-translation">${v.translation.length > 150 ? v.translation.slice(0, 150) + '…' : v.translation}</p>
          </a>
        `).join("")}
      </div>
    </div>`;

  document.getElementById("btn-random-topic")!.addEventListener("click", randomFromTopic);
}

// ═══════════════════════════════════════════
// PAGE: Verse Detail
// ═══════════════════════════════════════════
function renderVerseDetail(app: HTMLElement, id: number): void {
  const v = verses.find(x => x.id === id);
  if (!v) { renderHome(app); return; }

  const relatedTopics = topics.filter(t => v.topics.includes(t.name));

  app.innerHTML = `
    <div class="container">
      <nav class="nav">
        <a href="#home" class="nav-back">${Icons.back} <span>Kembali</span></a>
        <span class="nav-title">QS. ${v.surah}</span>
      </nav>
      <main class="card verse-card">
        <div class="verse-ref">QS. ${v.surah} ${v.ayah}</div>
        <p class="verse-arabic">${v.arabic}</p>
        <p class="verse-translation">${v.translation}</p>
        <div class="verse-topics">
          ${v.topics.map(t => `<a href="#topic/${encodeURIComponent(t.toLowerCase().replace(/\\s+/g, '-'))}" class="topic-tag">${t}</a>`).join("")}
        </div>
      </main>
      <footer class="actions">
        <button class="btn" id="btn-copy">${Icons.copy} <span>Salin</span></button>
        <button class="btn" id="btn-share">${Icons.share} <span>Bagikan</span></button>
        <button class="btn" id="btn-random">${Icons.random} <span>Acak</span></button>
      </footer>
    </div>`;

  document.getElementById("btn-copy")!.addEventListener("click", () => copyText(buildVerseText(v)));
  document.getElementById("btn-share")!.addEventListener("click", () => {
    if ("share" in navigator) {
      navigator.share({ title: `Daily Quran — QS. ${v.surah}`, text: buildVerseText(v) });
    }
  });
  document.getElementById("btn-random")!.addEventListener("click", () => {
    const idx = Math.floor(Math.random() * verses.length);
    location.hash = `#verse/${verses[idx].id}`;
  });
  (document.getElementById("btn-share")! as HTMLElement).style.display = "share" in navigator ? "" : "none";
}

// ─── Start ───
load();
