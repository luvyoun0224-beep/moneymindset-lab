const menu = document.querySelector("#article-nav");
const toggle = document.querySelector("#article-menu-toggle");

toggle?.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  toggle.innerHTML = `<i class="ph ph-${open ? "x" : "list"}" aria-hidden="true"></i>`;
});

menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menu.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "메뉴 열기");
}));
