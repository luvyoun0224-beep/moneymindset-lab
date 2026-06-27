import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const required = [
  "index.html",
  "posts/index.html",
  "about.html",
  "contact.html",
  "privacy.html",
  "disclaimer.html",
  "investing-method.html",
  "semiconductor-cycle.html",
  "space-economy-notes.html",
  "editorial-policy.html",
  "data/posts.json",
  "sitemap.xml",
  "robots.txt",
  "ads.txt"
];

const missing = [];
for (const file of required) {
  try {
    await fs.access(path.join(root, file));
  } catch {
    missing.push(file);
  }
}

if (missing.length) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const posts = JSON.parse(await fs.readFile(path.join(root, "data", "posts.json"), "utf8"));
if (!Array.isArray(posts.posts) || posts.posts.length < 10) {
  console.error("Expected at least 10 RSS posts.");
  process.exit(1);
}

const coreTextFiles = [
  "index.html",
  "posts/index.html",
  "about.html",
  "contact.html",
  "privacy.html",
  "disclaimer.html",
  "investing-method.html",
  "semiconductor-cycle.html",
  "space-economy-notes.html",
  "editorial-policy.html",
  "site.config.mjs",
  "data/posts.json",
  "README.md"
];

const generatedPostFiles = await listGeneratedPostFiles();
const textFiles = [...new Set([...coreTextFiles, ...generatedPostFiles])].sort();
const scannedFiles = await Promise.all(textFiles.map(readTextFile));

const cleanKoreanPhrases = [
  "주식투자",
  "반도체",
  "투자 기록",
  "주간 노트",
  "스폰서/협업 문의",
  "투자 방법",
  "편집 원칙",
  "반도체 사이클",
  "우주 경제",
  "AdSense 준비 영역",
  "개인정보처리방침",
  "투자 고지",
  "네이버 원문"
];

const forbiddenMonetizationPhrases = [
  "광고를 클릭",
  "광고를 눌러",
  "클릭해 주세요",
  "광고 눌러",
  "애드센스 수익 보장",
  "수익 보장",
  "심사 통과 보장"
];

const corruptionPatterns = [
  {
    name: "Unicode replacement character",
    regex: /\uFFFD/u
  },
  {
    name: "question-mark Korean mojibake",
    regex:
      /(?:\?[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]){2,}|(?:[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]\?){2,}/u
  },
  {
    name: "CJK compatibility mojibake",
    regex: /[\uf900-\ufaff]/u
  },
  {
    name: "Latin-1 UTF-8 mojibake",
    regex: /(?:[\u00e0-\u00ef][\u0080-\u00bf]{2}){2,}|(?:[\u00c2\u00c3][\u0080-\u00bf]){2,}/u
  }
];

const commonMojibakeFragments = [
  "?명봽",
  "?ъ옄",
  "?ㅼ씠踰",
  "?쒓뎅",
  "?섎떒",
  "媛쒖씤",
  "怨좎",
  "湲곕줉",
  "紐⑸",
  "諛섎룄"
];

const corruptionFailures = [];
for (const file of scannedFiles) {
  for (const pattern of corruptionPatterns) {
    const match = pattern.regex.exec(file.content);
    if (match) {
      corruptionFailures.push(
        `${file.relativePath}: ${pattern.name}: ${excerpt(file.content, match.index, match[0].length)}`
      );
    }
  }

  for (const fragment of commonMojibakeFragments) {
    const index = file.content.indexOf(fragment);
    if (index !== -1) {
      corruptionFailures.push(
        `${file.relativePath}: common mojibake fragment "${fragment}": ${excerpt(file.content, index, fragment.length)}`
      );
    }
  }
}

if (corruptionFailures.length) {
  console.error("Corrupted or malformed Korean text detected:");
  for (const failure of corruptionFailures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (corruptionFailures.length > 80) {
    console.error(`- ...and ${corruptionFailures.length - 80} more text-integrity failures.`);
  }
  process.exit(1);
}

const scannedCorpus = scannedFiles.map((file) => file.content).join("\n");
const missingCleanPhrases = cleanKoreanPhrases.filter((phrase) => !scannedCorpus.includes(phrase));
if (missingCleanPhrases.length) {
  console.error(`Missing clean Korean phrases: ${missingCleanPhrases.join(", ")}`);
  process.exit(1);
}

const monetizationFailures = [];
for (const file of scannedFiles.filter((item) => item.relativePath !== "data/posts.json")) {
  for (const phrase of forbiddenMonetizationPhrases) {
    const index = file.content.indexOf(phrase);
    if (index !== -1) {
      monetizationFailures.push(`${file.relativePath}: forbidden monetization phrase "${phrase}": ${excerpt(file.content, index, phrase.length)}`);
    }
  }
}

const index = await readTextFile("index.html");
if (!index.content.includes('id="weekly-note"')) {
  monetizationFailures.push("index.html: missing weekly-note conversion section.");
}

const generatedSamples = scannedFiles.filter((file) => file.relativePath.startsWith("posts/") && file.relativePath !== "posts/index.html");
if (!generatedSamples.every((file) => file.content.includes("AdSense 준비 영역") && file.content.includes("주간 노트") && file.content.includes("스폰서/협업 문의"))) {
  monetizationFailures.push("generated posts: expected AdSense placeholder, weekly note CTA, and sponsor contact link on every generated post.");
}

for (const legalPage of [
  "privacy.html",
  "disclaimer.html",
  "contact.html",
  "about.html",
  "investing-method.html",
  "semiconductor-cycle.html",
  "space-economy-notes.html",
  "editorial-policy.html"
]) {
  const page = scannedFiles.find((file) => file.relativePath === legalPage);
  if (page?.content.includes("ad-slot")) {
    monetizationFailures.push(`${legalPage}: evergreen, legal, and about pages should not contain ad slots.`);
  }
}

const evergreenLinks = [
  "investing-method.html",
  "semiconductor-cycle.html",
  "space-economy-notes.html",
  "editorial-policy.html"
];
for (const link of evergreenLinks) {
  if (!index.content.includes(link)) {
    monetizationFailures.push(`index.html: missing homepage link to ${link}.`);
  }
}

const adsTxt = await readTextFile("ads.txt");
const activeSellerRows = adsTxt.content
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && /google\.com,\s*pub-/i.test(line));
if (activeSellerRows.length) {
  monetizationFailures.push("ads.txt: add an active Google seller row only after AdSense approval.");
}

if (monetizationFailures.length) {
  console.error("Monetization safety check failed:");
  for (const failure of monetizationFailures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Site check passed with ${posts.posts.length} posts.`);

async function listGeneratedPostFiles() {
  const postDir = path.join(root, "posts");
  const postFiles = [];

  for (const post of posts.posts) {
    if (typeof post.localPath === "string" && post.localPath.trim()) {
      postFiles.push(path.join(post.localPath, "index.html"));
    }
  }

  for (const entry of await fs.readdir(postDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      postFiles.push(path.join("posts", entry.name, "index.html"));
    }
  }

  return postFiles.map(normalizeRelativePath);
}

async function readTextFile(relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  try {
    return {
      relativePath: normalizedPath,
      content: await fs.readFile(path.join(root, normalizedPath), "utf8")
    };
  } catch (error) {
    console.error(`Unable to read text file ${normalizedPath}: ${error.message}`);
    process.exit(1);
  }
}

function normalizeRelativePath(value) {
  return value.split(path.sep).join("/");
}

function excerpt(text, index, length) {
  const start = Math.max(0, index - 32);
  const end = Math.min(text.length, index + length + 32);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}
