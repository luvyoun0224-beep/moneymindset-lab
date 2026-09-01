import fs from "node:fs/promises";
import path from "node:path";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const publishedTime = (article) => {
  const value = article.publishedAt ?? article.published;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const selectLatestResearch = (articles = []) =>
  articles
    .map((article, index) => ({ article, index }))
    .filter(({ article }) => article.type === "research")
    .sort((a, b) => publishedTime(b.article) - publishedTime(a.article) || a.index - b.index)
    .map(({ article }) => article)[0];

const formatLongDate = (value) =>
  new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));

const formatLatestLabel = (value) => {
  const parts = new Intl.DateTimeFormat("en-CA", { month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const month = parts.find((part) => part.type === "month")?.value ?? "--";
  const day = parts.find((part) => part.type === "day")?.value ?? "--";
  return `LATEST · ${month}.${day}`;
};

const replace = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) throw new Error(`Homepage featured marker is missing: ${label}`);
  return html.replace(pattern, replacement);
};

export async function syncFeaturedHomepage(root, researchData) {
  const latest = selectLatestResearch(researchData.articles);
  if (!latest) throw new Error("No research article is available for the homepage feature.");
  if (!latest.heroImage) throw new Error(`Latest research is missing heroImage: ${latest.id}`);

  const indexPath = path.join(root, "index.html");
  let html = await fs.readFile(indexPath, "utf8");
  const title = latest.homeTitle ?? latest.title;
  const summary = latest.summary;
  const alt = latest.heroAlt ?? title;
  const analystNote = latest.analystNote ?? summary;
  const published = latest.publishedAt ?? latest.published;
  const absoluteHero = new URL(latest.heroImage, "https://moneymindset-lab.com/").href;

  html = replace(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(absoluteHero)}" />`, "og:image");
  html = replace(html, /<h1 id="featured-title">[\s\S]*?<\/h1>/, `<h1 id="featured-title">${escapeHtml(title)}</h1>`, "featured-title");
  html = replace(html, /<p class="featured-summary" id="featured-summary">[\s\S]*?<\/p>/, `<p class="featured-summary" id="featured-summary">${escapeHtml(summary)}</p>`, "featured-summary");
  html = replace(html, /(<a class="text-link" id="featured-link" href=")[^"]*(")/, `$1${escapeHtml(latest.localPath)}$2`, "featured-link");
  html = replace(html, /<img id="featured-image"[\s\S]*?\/>/, `<img id="featured-image" src="${escapeHtml(latest.heroImage)}" alt="${escapeHtml(alt)}" />`, "featured-image");
  html = replace(html, /<figcaption id="featured-case">[\s\S]*?<\/figcaption>/, `<figcaption id="featured-case">${escapeHtml(formatLatestLabel(published))}</figcaption>`, "featured-case");
  html = replace(html, /<strong id="featured-date">[\s\S]*?<\/strong>/, `<strong id="featured-date">${escapeHtml(formatLongDate(published))}</strong>`, "featured-date");
  html = replace(html, /<strong id="featured-focus">[\s\S]*?<\/strong>/, `<strong id="featured-focus">${escapeHtml(latest.focus)}</strong>`, "featured-focus");
  html = replace(html, /<strong id="featured-analyst-note">[\s\S]*?<\/strong>/, `<strong id="featured-analyst-note">${escapeHtml(analystNote)}</strong>`, "featured-analyst-note");
  html = replace(html, /<strong id="featured-read-time">[\s\S]*?<\/strong>/, `<strong id="featured-read-time">${escapeHtml(latest.readTime)}</strong>`, "featured-read-time");

  await fs.writeFile(indexPath, html, "utf8");
  return latest;
}
