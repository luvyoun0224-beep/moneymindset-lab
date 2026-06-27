const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const postCard = (post) => `
  <article class="article-card" data-category="${escapeHtml(post.topicId)}">
    <div class="article-meta">
      <span class="pill">${escapeHtml(post.topicLabel)}</span>
      <span>${escapeHtml(formatDate(post.isoDate))}</span>
    </div>
    <h3><a href="${escapeHtml(post.localPath)}">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.summary)}</p>
  </article>
`;

const featuredPostCard = (post) => `
  <article class="featured-note-card">
    <div class="article-meta">
      <span class="pill">${escapeHtml(post.topicLabel)}</span>
      <span>${escapeHtml(formatDate(post.isoDate))}</span>
    </div>
    <h3><a href="${escapeHtml(post.localPath)}">${escapeHtml(post.title)}</a></h3>
    <p>${escapeHtml(post.summary)}</p>
    <a class="text-link" href="${escapeHtml(post.localPath)}">기록 이어보기</a>
  </article>
`;

const topicCard = (category, index) => `
  <article class="topic-card">
    <span class="lane-number">${String(index + 1).padStart(2, "0")}</span>
    <strong>${escapeHtml(category.label)}</strong>
    <p>${escapeHtml(category.description)}</p>
  </article>
`;

const emptyState = (message) => `<p class="article-card empty-state">${escapeHtml(message)}</p>`;

async function loadPosts() {
  const response = await fetch("data/posts.json");
  if (!response.ok) throw new Error("posts.json load failed");
  return response.json();
}

async function main() {
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const topicGrid = document.querySelector("#topic-grid");
  const featuredPost = document.querySelector("#featured-post");
  const latestPosts = document.querySelector("#latest-posts");

  if (!topicGrid && !featuredPost && !latestPosts) return;

  const { posts = [], categories = [] } = await loadPosts();

  if (topicGrid) {
    topicGrid.innerHTML = categories.length
      ? categories.map(topicCard).join("")
      : emptyState("리서치 레인을 불러올 수 없습니다.");
  }

  if (featuredPost) {
    featuredPost.innerHTML = posts[0]
      ? featuredPostCard(posts[0])
      : emptyState("표시할 최신 노트가 아직 없습니다.");
  }

  if (latestPosts) {
    const notes = posts.length > 1 ? posts.slice(1, 7) : posts.slice(0, 6);
    latestPosts.innerHTML = notes.length
      ? notes.map(postCard).join("")
      : emptyState("표시할 최근 노트가 아직 없습니다.");
  }
}

main().catch((error) => {
  console.error(error);
  const featuredPost = document.querySelector("#featured-post");
  const latestPosts = document.querySelector("#latest-posts");
  const message = "전체 기록을 불러오지 못했습니다. 잠시 뒤 다시 확인해 주세요.";

  if (featuredPost) {
    featuredPost.innerHTML = emptyState(message);
  }

  if (latestPosts) {
    latestPosts.innerHTML = emptyState(message);
  }
});
