/* Mairetini site scripts: no dependencies. */

/* ============ EDIT YOUR DETAILS HERE ============ */
const CONFIG = {
  email: "",      // e.g. "mairrmdd@gmail.com"  -> shows an Email button and sends form requests by email
  phone: "",      // e.g. "+63 951 085 4202"    -> shows a Call button
  facebook: "",   // e.g. "https://www.facebook.com/profile.php?id=61595537555949" -> shows a Facebook button
  messenger: "",  // e.g. "https://business.facebook.com/latest/inbox/all/?nav_ref=manage_page_ap_plus_inbox_message_button&asset_id=1404159369448207"          -> shows a Messenger button
  // Real websites built by your developer. Leave empty to show the concept previews.
  // Example: { title: "Cafe Aria", type: "Cafe website", url: "https://example.com" }
  samples: []
};
/* ================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

$("#year").textContent = new Date().getFullYear();

/* ---------- nav: stuck state, progress bar, back-to-top ---------- */
const nav = $("#nav"), bar = $("#progress"), toTop = $("#toTop");
function onScroll() {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle("stuck", y > 20);
  bar.style.transform = `scaleX(${h > 0 ? Math.min(y / h, 1) : 0})`;
  toTop.classList.toggle("show", y > 700);
  updateSteps();
}
addEventListener("scroll", onScroll, { passive: true });
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

/* mobile menu */
const burger = $("#burger"), menu = $("#menu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* active link on scroll */
const links = $$(".links a[href^='#']:not(.btn)");
const secObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => secObs.observe(s));

/* ---------- reveal on scroll ---------- */
const revObs = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } });
}, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
$$(".reveal").forEach(el => revObs.observe(el));

/* ---------- marquee: duplicate for a seamless loop ---------- */
const track = $("#track");
track.innerHTML += track.innerHTML;

/* ---------- hero logo tilt ---------- */
const tilt = $("#tilt");
if (tilt && !reduce && matchMedia("(pointer: fine)").matches) {
  const hero = $(".hero");
  hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translate(${x * 10}px, ${y * 10}px)`;
  });
  hero.addEventListener("mouseleave", () => { tilt.style.transform = ""; });
}

/* ---------- process line fills as you scroll ---------- */
const stepsEl = $("#steps"), stepEls = $$(".step", stepsEl);
function updateSteps() {
  const r = stepsEl.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, (innerHeight * 0.72 - r.top) / (r.height + 40)));
  stepsEl.style.setProperty("--p", p.toFixed(3));
  stepEls.forEach((s, i) => s.classList.toggle("on", p >= i / stepEls.length + 0.04));
}

/* ---------- packages / work cards pre-select the form ---------- */
$$("[data-pick]").forEach(a => a.addEventListener("click", () => {
  const sel = $("#f-need"), v = a.dataset.pick;
  if ([...sel.options].some(o => o.value === v)) sel.value = v;
}));

/* ---------- FAQ accordion ---------- */
$$(".qa").forEach(qa => {
  const b = $("button", qa);
  b.addEventListener("click", () => {
    const open = !qa.classList.contains("open");
    $$(".qa.open").forEach(o => { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); });
    qa.classList.toggle("open", open);
    b.setAttribute("aria-expanded", open);
  });
});

/* ---------- real samples (optional) ---------- */
if (CONFIG.samples.length) {
  $("#work-grid").innerHTML = CONFIG.samples.map((s, i) => `
    <a class="shot reveal in" href="${esc(s.url)}" target="_blank" rel="noopener" style="--d:${i * 0.1}s">
      <div class="browser port"><div class="bar"><i></i><i></i><i></i><em>${esc(s.url.replace(/^https?:\/\//, ""))}</em></div>
        <div class="view"><div class="page"><div class="m-hero">${esc(s.title)}<small>${esc(s.type || "Website")}</small></div>
        <div class="m-row"><div class="m-tile"></div><div class="m-tile"></div><div class="m-tile"></div></div><div class="m-line"></div><div class="m-line s"></div></div></div></div>
      <div class="cap"><div><b>${esc(s.title)}</b><br><span>Visit the live site</span></div><span class="tag">Live</span></div>
    </a>`).join("");
  $("#work-note").textContent = "These are real websites built by our developer. Tap one to visit it.";
  $("#work-sub").textContent = "Real websites built by our developer.";
}

/* ---------- contact channels + form ---------- */
const chan = $("#channels");
[
  [CONFIG.messenger, "Messenger", v => v],
  [CONFIG.facebook, "Facebook", v => v],
  [CONFIG.email, "Email", v => "mailto:" + v],
  [CONFIG.phone, "Call or text", v => "tel:" + v.replace(/\s+/g, "")]
].forEach(([val, label, href]) => {
  if (!val) return;
  const a = document.createElement("a");
  a.textContent = label; a.href = href(val);
  if (/^https?:/.test(a.href)) { a.target = "_blank"; a.rel = "noopener"; }
  chan.appendChild(a);
});
if (!chan.children.length) chan.remove();

$("#quoteForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, st = $("#status"), btn = $("button[type=submit]", form);
  const name = $("#f-name").value.trim(), biz = $("#f-biz").value.trim(),
        need = $("#f-need").value, msg = $("#f-msg").value.trim();
  const body = `Hi Mairetini! I'd like a free quote.\n\nName: ${name}\nBusiness: ${biz || "-"}\nInterested in: ${need}\n\n${msg}`;
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = "Sending...";
  st.style.color = ""; st.textContent = "";
  try {
    // Netlify Forms: the form is detected at deploy time and submissions appear in your Netlify dashboard.
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    });
    if (!res.ok) throw new Error("Form request failed: " + res.status);
    form.reset();
    btn.textContent = "Sent \u2713";
    st.textContent = "Thank you! We got your request and will reply soon.";
    setTimeout(() => { btn.disabled = false; btn.textContent = label; }, 4000);
  } catch (err) {
    // Fallback (for example when previewing locally): email or copy the request instead.
    btn.disabled = false; btn.textContent = label;
    if (CONFIG.email) {
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Quote request: " + need)}&body=${encodeURIComponent(body)}`;
      st.textContent = "Opening your email app...";
      return;
    }
    try { await navigator.clipboard.writeText(body); st.textContent = "We couldn't send it automatically. Your request is copied. Please paste it in a message to us."; }
    catch { st.textContent = "We couldn't send it automatically. Please message us on Facebook with these details."; }
    const dest = CONFIG.messenger || CONFIG.facebook;
    if (dest) window.open(dest, "_blank", "noopener");
  }
});
onScroll();
