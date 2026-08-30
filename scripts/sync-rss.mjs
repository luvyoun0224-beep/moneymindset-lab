import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../site.config.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const ADS_TXT = `google.com, pub-5456414339006405, DIRECT, f08c47fec0942fa0
`;

const ensureDir = async (dir) => {
  await fs.mkdir(path.join(root, dir), { recursive: true });
};

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripTags = (value) =>
  decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const pick = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match) return "";
  return match[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
};

const slugify = (link, index) => {
  const id = link.match(/\/(\d{8,})(?:\?|$)/)?.[1];
  return `${String(index + 1).padStart(2, "0")}-${id || "investment-note"}`;
};

const topicFor = (title, category, summary) => {
  const text = `${title} ${category} ${summary}`;
  if (/스페이스|우주|SpaceX|레드와이어|플래닛랩스|Planet Labs|위성/i.test(text)) return config.categories.find((c) => c.id === "space-economy");
  if (/S-OIL|에쓰오일|정유|유가/i.test(text)) return config.categories.find((c) => c.id === "macro");
  if (/마이크론|하이닉스|삼성전자|삼성전기|엔비디아|브로드컴|마벨|반도체|HBM|메모리|하드디스크|데이터센터/i.test(text)) {
    return config.categories.find((c) => c.id === "semiconductors");
  }
  if (/AI|인공지능|팔란티어|앤트로픽|xAI|바이오/i.test(text)) return config.categories.find((c) => c.id === "stock-investing");
  if (/환율|FOMC|금리|나스닥|S&P|정부|세금|코스피|종전|이란/i.test(text)) return config.categories.find((c) => c.id === "macro");
  if (/우리나라|한국|국민성장|코스피|상장/i.test(text)) return config.categories.find((c) => c.id === "korea-market");
  return config.categories[0];
};

const pageShell = ({ title, description, body, canonical }) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="noindex,follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="stylesheet" href="../../styles.css" />
    <link rel="stylesheet" href="../../homepage-v2.css" />
    <link rel="stylesheet" href="../../article-v2.css" />
    <script src="https://unpkg.com/@phosphor-icons/web@2.1.2"></script>
  </head>
  <body class="article-v2">
    <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="../../index.html" aria-label="JasonJedi Research 홈"><strong>JasonJedi Research</strong><span>기술 → 해자 → 창업자 → 성장률 → 현금흐름</span></a>
      <nav class="main-nav" id="article-nav" aria-label="주요 메뉴">
        <a href="../../#latest">최신 분석</a><a href="../../#companies">기업</a><a href="../../#industries">산업</a><a href="../../investing-method.html">투자 가이드</a><a href="../../posts/">전체 기록</a><a href="../../#about">소개</a>
      </nav>
      <div class="header-actions"><button class="icon-button menu-toggle" id="article-menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false"><i class="ph ph-list" aria-hidden="true"></i></button></div>
    </header>
    <main>${body}</main>
    <footer class="site-footer">
      <strong>JasonJedi Research</strong>
      <nav aria-label="법적 안내"><a href="../../about.html">소개</a><a href="../../contact.html">문의</a><a href="../../privacy.html">개인정보처리방침</a><a href="../../disclaimer.html">투자 면책</a></nav>
      <small>Independent educational investment research. Not investment advice.</small>
    </footer>
    </div>
    <script src="../../article.js"></script>
  </body>
</html>`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const topicFrames = {
  "stock-investing": {
    why:
      "주식투자 글은 단일 기업 뉴스보다 자금과 기대가 어디로 이동하는지를 보는 데 가치가 있습니다. 기업 실적, 산업 사이클, 매크로 변화를 함께 보면 다음 투자 가설을 더 차분하게 세울 수 있습니다.",
    checkpoints: [
      "AI 수요가 매출, 수주, 설비투자 중 어느 지표로 확인되는지 본다.",
      "GPU, 전력, 데이터센터, 저장장치, 소프트웨어 중 병목이 어디로 옮겨가는지 분리한다.",
      "기대가 이미 주가와 밸류에이션에 반영됐는지 다음 실적 추정치와 함께 점검한다."
    ]
  },
  semiconductors: {
    why:
      "반도체 글은 AI 투자 사이클이 실제 공급망 숫자로 이어지는지 확인하는 출발점입니다. 메모리, HBM, 파운드리, 장비, 데이터센터 수요를 나누어 보면 단기 뉴스와 구조적 변화를 구분하기 쉽습니다.",
    checkpoints: [
      "매출 성장과 마진 개선이 가격 상승, 물량 증가, 제품 믹스 중 어디에서 나왔는지 본다.",
      "HBM, 메모리, 데이터센터 부품처럼 병목이 되는 제품군의 공급 가능성을 확인한다.",
      "업황 회복 기대와 이미 올라간 주가 사이의 간격을 밸류에이션으로 다시 점검한다."
    ]
  },
  "space-economy": {
    why:
      "우주 경제 글은 상장 이벤트나 개별 뉴스보다 자금이 어떤 주식투자로 이동하는지 보는 데 의미가 있습니다. 위성, 발사체, 통신, 국방, AI 데이터센터와 연결되는 지점을 확인해야 합니다.",
    checkpoints: [
      "뉴스가 실제 매출화 가능한 계약인지, 아직 기대와 스토리 단계인지 구분한다.",
      "우주 주식투자가 통신, 국방, 데이터센터, 물류 중 어느 시장과 연결되는지 본다.",
      "상장 직후 수급과 장기 산업 가치를 분리해 추격매수 위험을 점검한다."
    ]
  },
  macro: {
    why:
      "매크로 글은 금리, 환율, 정책, 세금 같은 외부 변수가 성장주 밸류에이션을 어떻게 바꾸는지 확인하는 장치입니다. 시장 방향보다 투자 가정의 민감도를 점검하는 데 초점을 둡니다.",
    checkpoints: [
      "금리, 환율, 정책 변수 중 이번 이슈의 직접 원인이 무엇인지 분리한다.",
      "성장주 할인율, 외화 투자 비용, 섹터 수급에 미치는 영향을 따로 본다.",
      "정책 발언과 실제 시행 가능성을 구분하고 포트폴리오 노출을 점검한다."
    ]
  },
  "korea-market": {
    why:
      "한국 시장 글은 국내 이슈를 미국주식 투자자의 비교 관점으로 다시 보는 데 목적이 있습니다. 정책, 수급, 상장 이벤트가 기업의 장기 경쟁력과 같은 방향인지 확인해야 합니다.",
    checkpoints: [
      "정책 또는 거래소 이슈가 기업 펀더멘털 변화인지, 절차적 이벤트인지 구분한다.",
      "국내 수급 반응과 글로벌 동종 기업의 밸류에이션 차이를 비교한다.",
      "단기 테마보다 실적, 지배구조, 주주환원, 해외 매출 노출을 함께 점검한다."
    ]
  }
};

const defaultFrame = {
  why:
    "이 글은 투자자가 특정 뉴스보다 그 뉴스가 만든 질문을 정리해 볼 수 있도록 돕는 요약 노트입니다. 원문을 읽기 전에 핵심 가정과 확인할 지표를 먼저 분리하는 데 목적이 있습니다.",
  checkpoints: [
    "뉴스의 직접 원인과 시장이 반응한 이유를 분리한다.",
    "관련 기업의 실적, 수요, 밸류에이션, 정책 리스크를 함께 점검한다.",
    "원문에서 제시한 사실과 자신의 투자 가정이 어디서 만나는지 확인한다."
  ]
};

const frameFor = (post) => topicFrames[post.topicId] ?? defaultFrame;

const listItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

const response = await fetch(config.rssUrl, {
  headers: { "user-agent": "JasonJediInvestingSite/0.1" }
});

if (!response.ok) {
  throw new Error(`RSS fetch failed: ${response.status}`);
}

const xml = await response.text();
const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

const posts = itemMatches.slice(0, 50).map((match, index) => {
  const item = match[1];
  const title = stripTags(pick(item, "title"));
  const rawDescription = pick(item, "description");
  const fullSummary = stripTags(rawDescription);
  const summary = fullSummary.length > 190
    ? `${fullSummary.slice(0, 190).replace(/\s+\S*$/, "").trim()}…`
    : fullSummary;
  const category = stripTags(pick(item, "category")) || "투자 노트";
  const link = decodeEntities(stripTags(pick(item, "link")));
  const pubDate = stripTags(pick(item, "pubDate"));
  const isoDate = new Date(pubDate).toISOString();
  const topic = topicFor(title, category, summary);
  const slug = slugify(link, index);
  return {
    title,
    category,
    topicId: topic.id,
    topicLabel: topic.label,
    summary,
    sourceUrl: link,
    isoDate,
    slug,
    localPath: `posts/${slug}/`
  };
});

await ensureDir("data");
await ensureDir("posts");

for (const entry of await fs.readdir(path.join(root, "posts"), { withFileTypes: true })) {
  if (entry.name === "index.html") continue;
  await fs.rm(path.join(root, "posts", entry.name), { recursive: true, force: true });
}

await fs.writeFile(
  path.join(root, "data", "posts.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: config.rssUrl,
      categories: config.categories,
      posts
    },
    null,
    2
  ),
  "utf8"
);

for (const post of posts) {
  const postDir = path.join(root, "posts", post.slug);
  await fs.mkdir(postDir, { recursive: true });
  const frame = frameFor(post);
  const body = `
    <article class="post-body">
      <section class="article-hero">
        <div class="article-hero-copy">
        <p class="micro-label"><span></span>NAVER BRIEF · ${escapeHtml(post.topicLabel)} · ${new Intl.DateTimeFormat("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(new Date(post.isoDate))}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p>${escapeHtml(post.summary)}</p>
        </div>
        <aside class="article-meta" aria-label="글 메타데이터">
          <div><span>FRAMEWORK</span><strong>FACT / SCENARIO / JUDGMENT</strong></div>
          <div><span>TOPIC</span><strong>${escapeHtml(post.topicLabel)}</strong></div>
          <div><span>READING RULE</span><strong>공식 자료와 반대 논리를 함께 확인합니다.</strong></div>
        </aside>
      </section>
      <section class="content-page">
        <h2>핵심 요약</h2>
        <p>
          이 페이지는 네이버 블로그 원문 전문을 복제하지 않고, RSS 제목과 요약을 바탕으로 투자자가 먼저 확인할 맥락을 정리한 안내 페이지입니다.
          전체 문장과 세부 근거는 네이버 원문에서 확인할 수 있습니다.
        </p>
        <p class="callout">${escapeHtml(post.summary)}</p>
        <h2>왜 중요한가</h2>
        <p>${escapeHtml(frame.why)}</p>
        <h2>투자자가 볼 체크포인트</h2>
        <ul>
          ${listItems(frame.checkpoints)}
        </ul>
        <p>
          이 요약은 ${escapeHtml(post.topicLabel)} 관점의 읽기 길잡이입니다. 인용이나 세부 판단이 필요하면 원문을 기준으로 확인하세요.
        </p>
        <aside class="reader-cta" aria-labelledby="reader-cta-${escapeHtml(post.slug)}">
          <div>
            <p class="eyebrow">주간 노트</p>
            <h2 id="reader-cta-${escapeHtml(post.slug)}">이 글처럼 시장을 복기하는 노트를 계속 받아보세요.</h2>
            <p>
              광고는 글 흐름을 해치지 않는 위치에만 준비하고, 더 깊은 업데이트는 이메일 문의와 블로그 원문으로 이어집니다.
            </p>
            <div class="cta-actions">
              <a class="button secondary" href="mailto:luvyoun0224@gmail.com?subject=Jason%20Jedi%20Weekly%20Note">주간 노트 문의</a>
              <a class="text-link" href="../../contact.html">스폰서/협업 문의</a>
            </div>
          </div>
        </aside>
        <nav class="related-notes" aria-label="관련 기록">
          <a class="text-link" href="../../posts/">전체 기록 보기</a>
          <a class="text-link" href="../../#industries">투자 주제 지도</a>
        </nav>
        <p class="journey-return"><a class="text-link" href="../../posts/">전체 기록으로 돌아가기</a></p>
        <p><a class="button primary" href="${escapeHtml(post.sourceUrl)}" target="_blank" rel="noopener">네이버 원문 보기</a></p>
      </section>
    </article>
  `;
  await fs.writeFile(
    path.join(postDir, "index.html"),
    pageShell({
      title: `네이버 브리프: ${post.title} | JasonJedi Research`,
      description: post.summary,
      canonical: `${config.siteUrl}/${post.localPath}`,
      body
    }),
    "utf8"
  );
}

const urls = [
  "",
  "about.html",
  "contact.html",
  "privacy.html",
  "disclaimer.html",
  "investing-method.html",
  "semiconductor-cycle.html",
  "space-economy-notes.html",
  "editorial-policy.html",
  "research/",
  "research/broadcom-ai-infrastructure/",
  "research/planet-labs-contract-economics/"
  ,"research/palantir-rule-of-40-valuation/"
  ,"research/us-jobs-report-growth-stocks-2026-09/"
];

await fs.writeFile(
  path.join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${config.siteUrl}/${url}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`,
  "utf8"
);

await fs.writeFile(
  path.join(root, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${config.siteUrl}/sitemap.xml
`,
  "utf8"
);

await fs.writeFile(
  path.join(root, "ads.txt"),
  ADS_TXT,
  "utf8"
);

console.log(`Synced ${posts.length} posts from ${config.rssUrl}`);
