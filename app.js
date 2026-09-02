const formatDate = (value, long = false) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", long
    ? { year: "numeric", month: "long", day: "numeric" }
    : { year: "numeric", month: "short", day: "numeric" }).format(date);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const archivePostCard = (post) => `
  <article class="article-card" data-category="${escapeHtml(post.topicId)}">
    <div class="article-meta"><span class="pill">${escapeHtml(post.topicLabel)}</span><span>${escapeHtml(formatDate(post.isoDate))}</span></div>
    <h3><a href="${escapeHtml(post.localPath)}">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.summary)}</p>
  </article>`;

const featuredPostCard = (post) => `
  <article class="featured-note-card">
    <div class="article-meta"><span class="pill">${escapeHtml(post.topicLabel)}</span><span>${escapeHtml(formatDate(post.isoDate))}</span></div>
    <h3><a href="${escapeHtml(post.localPath)}">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.summary)}</p><a class="text-link" href="${escapeHtml(post.localPath)}">기록 이어보기</a>
  </article>`;

const homePostCard = (post) => `
  <a class="company-item" href="${escapeHtml(post.localPath)}" data-search="${escapeHtml(`${post.title} ${post.topicLabel} ${post.summary}`.toLowerCase())}">
    <span>${escapeHtml(post.topicLabel.toUpperCase())}</span>
    <h3>${escapeHtml(post.title)}</h3>
    <p>${escapeHtml(post.summary)}</p>
    <footer><small>${escapeHtml(formatDate(post.isoDate))}</small><i class="ph ph-arrow-right" aria-hidden="true"></i></footer>
  </a>`;

const archiveTopicCard = (category, index) => `
  <article class="topic-card"><span class="lane-number">${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(category.label)}</strong><p>${escapeHtml(category.description)}</p></article>`;

const homeTopicCard = (category, index) => `
  <a class="company-item topic-item" href="posts/" data-search="${escapeHtml(`${category.label} ${category.description}`.toLowerCase())}">
    <span>TRACK ${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(category.label)}</h3><p>${escapeHtml(category.description)}</p>
    <footer><small>RESEARCH LANE</small><i class="ph ph-arrow-right" aria-hidden="true"></i></footer>
  </a>`;

const emptyState = (message) => `<p class="article-card empty-state">${escapeHtml(message)}</p>`;

const questionDetails = {
  ai: { title: "엔비디아의 독주는 언제까지 지속될까?", copy: "GPU 수요만 보는 대신 데이터센터 네트워크와 전력·냉각까지 연결해 AI 인프라의 다음 병목을 추적합니다." },
  space: { title: "위성 데이터의 상업화는 어디까지 왔나?", copy: "수주 총액보다 반복 매출, 백로그의 질, 현금흐름 전환 속도를 중심으로 우주 데이터 기업을 비교합니다." },
  bio: { title: "혁신 신약의 가치, 임상 신호로 판단할 수 있을까?", copy: "한 번의 임상 발표보다 재현성, 규제 경로, 상업화 비용까지 함께 읽는 체크리스트를 제공합니다." }
};

const compactSummary = (summary) => {
  const sentences = String(summary ?? "").match(/[^.!?]+[.!?]+/g);
  if (sentences?.length) return sentences.slice(0, 2).join(" ").trim();
  return summary.length > 128 ? `${summary.slice(0, 128).trim()}…` : summary;
};

async function loadPosts() {
  const response = await fetch(`data/posts.json?ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("posts.json load failed");
  return response.json();
}

async function loadResearch() {
  const response = await fetch(`data/research.json?ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("research.json load failed");
  return response.json();
}

const researchAsPost = (article) => ({
  title: article.homeTitle ?? article.title,
  summary: article.summary,
  topicLabel: article.category,
  topicId: article.type,
  isoDate: article.publishedAt ?? article.published,
  localPath: article.localPath,
  focus: article.focus,
  readTime: article.readTime,
  heroImage: article.heroImage,
  heroAlt: article.heroAlt,
  analystNote: article.analystNote
});

const selectLatestResearch = (articles = []) =>
  articles
    .map((article, index) => ({ article, index }))
    .filter(({ article }) => article.type === "research")
    .sort((a, b) => {
      const aTime = new Date(a.article.publishedAt ?? a.article.published).getTime() || 0;
      const bTime = new Date(b.article.publishedAt ?? b.article.published).getTime() || 0;
      return bTime - aTime || a.index - b.index;
    })
    .map(({ article }) => article)[0];

const latestLabel = (value) => {
  const parts = new Intl.DateTimeFormat("en-CA", { month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const month = parts.find((part) => part.type === "month")?.value ?? "--";
  const day = parts.find((part) => part.type === "day")?.value ?? "--";
  return `LATEST · ${month}.${day}`;
};

function initHomeInteractions(posts) {
  const menu = document.querySelector("#main-nav");
  const menuToggle = document.querySelector("#menu-toggle");
  const searchPanel = document.querySelector("#search-panel");
  const searchToggle = document.querySelector("#search-toggle");
  const searchInput = document.querySelector("#site-search");
  const latestPosts = document.querySelector("#latest-posts");
  const drawer = document.querySelector("#drawer-backdrop");

  menuToggle?.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    menuToggle.innerHTML = `<i class="ph ph-${open ? "x" : "list"}" aria-hidden="true"></i>`;
  });

  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "메뉴 열기");
  }));

  searchToggle?.addEventListener("click", () => {
    const willOpen = searchPanel.hidden;
    searchPanel.hidden = !willOpen;
    searchToggle.setAttribute("aria-expanded", String(willOpen));
    searchToggle.setAttribute("aria-label", willOpen ? "검색 닫기" : "검색 열기");
    searchToggle.innerHTML = `<i class="ph ph-${willOpen ? "x" : "magnifying-glass"}" aria-hidden="true"></i>`;
    if (willOpen) searchInput.focus();
    else {
      searchInput.value = "";
      latestPosts.innerHTML = posts.slice(0, 4).map(homePostCard).join("");
    }
  });

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const matches = query ? posts.filter((post) => `${post.title} ${post.topicLabel} ${post.summary}`.toLowerCase().includes(query)).slice(0, 4) : posts.slice(0, 4);
    latestPosts.innerHTML = matches.length ? matches.map(homePostCard).join("") : emptyState("일치하는 리서치가 없습니다.");
  });

  document.querySelectorAll(".analysis-trigger").forEach((button) => button.addEventListener("click", () => {
    const detail = questionDetails[button.dataset.question];
    document.querySelector("#drawer-title").textContent = detail.title;
    document.querySelector("#drawer-copy").textContent = detail.copy;
    drawer.hidden = false;
    drawer.querySelector("#drawer-close").focus();
  }));

  const closeDrawer = () => { drawer.hidden = true; };
  document.querySelector("#drawer-close")?.addEventListener("click", closeDrawer);
  drawer?.addEventListener("click", (event) => { if (event.target === drawer) closeDrawer(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && drawer && !drawer.hidden) closeDrawer(); });

  document.querySelector("#weekly-note")?.addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector("#newsletter-status").hidden = false;
    event.currentTarget.querySelector(".email-row").hidden = true;
  });
}

async function main() {
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const topicGrid = document.querySelector("#topic-grid");
  const featuredPost = document.querySelector("#featured-post");
  const latestPosts = document.querySelector("#latest-posts");
  if (!topicGrid && !featuredPost && !latestPosts) return;

  const { posts = [], categories = [] } = await loadPosts();
  const isHomeV2 = document.body.classList.contains("home-v2");

  if (isHomeV2) {
    const { articles = [] } = await loadResearch();
    const researchPosts = articles.map(researchAsPost);
    const latestResearch = selectLatestResearch(articles);
    const featured = latestResearch ? researchAsPost(latestResearch) : null;
    if (featured) {
      document.querySelector("#featured-title").textContent = featured.title;
      document.querySelector("#featured-summary").textContent = compactSummary(featured.summary);
      document.querySelector("#featured-link").href = featured.localPath;
      document.querySelector("#featured-date").textContent = formatDate(featured.isoDate, true);
      document.querySelector("#featured-focus").textContent = featured.focus;
      const readTime = document.querySelector("#featured-read-time");
      if (readTime) readTime.textContent = featured.readTime;
      const featuredImage = document.querySelector("#featured-image");
      if (featuredImage && featured.heroImage) {
        featuredImage.src = featured.heroImage;
        featuredImage.alt = featured.heroAlt ?? featured.title;
      }
      const featuredCase = document.querySelector("#featured-case");
      if (featuredCase) featuredCase.textContent = latestLabel(featured.isoDate);
      const analystNote = document.querySelector("#featured-analyst-note");
      if (analystNote) analystNote.textContent = featured.analystNote ?? featured.summary;
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && featured.heroImage) ogImage.content = new URL(featured.heroImage, window.location.href).href;
    }
    latestPosts.innerHTML = researchPosts.length ? researchPosts.slice(0, 4).map(homePostCard).join("") : emptyState("표시할 심층 리서치가 아직 없습니다.");
    topicGrid.innerHTML = categories.length ? categories.slice(0, 4).map(homeTopicCard).join("") : emptyState("리서치 지도를 불러올 수 없습니다.");
    initHomeInteractions(researchPosts);
    return;
  }

  if (topicGrid) topicGrid.innerHTML = categories.length ? categories.map(archiveTopicCard).join("") : emptyState("리서치 레인을 불러올 수 없습니다.");
  if (featuredPost) featuredPost.innerHTML = posts[0] ? featuredPostCard(posts[0]) : emptyState("표시할 최신 노트가 아직 없습니다.");
  if (latestPosts) {
    const notes = posts.length > 1 ? posts.slice(1, 7) : posts.slice(0, 6);
    latestPosts.innerHTML = notes.length ? notes.map(archivePostCard).join("") : emptyState("표시할 최근 노트가 아직 없습니다.");
  }
}

main().catch((error) => {
  console.error(error);
  const message = "전체 기록을 불러오지 못했습니다. 잠시 뒤 다시 확인해 주세요.";
  for (const selector of ["#featured-post", "#latest-posts"]) {
    const target = document.querySelector(selector);
    if (target) target.innerHTML = emptyState(message);
  }
});
