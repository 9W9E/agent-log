/* ============================================================
   AGENT / LOG — app
   ============================================================ */

const CATEGORIES = {
  core:     { label: "编排",        color: "#3d3aff", soft: "#e9e8ff", ink: "#2b28d6" },
  research: { label: "研究与规划",  color: "#0e8f7e", soft: "#e2f5f1", ink: "#0a6d60" },
  docs:     { label: "文档与演示",  color: "#c98216", soft: "#fbf0dc", ink: "#9b6208" },
  data:     { label: "数据与表格",  color: "#3f8f2f", soft: "#e8f5e2", ink: "#2f6d23" },
  dev:      { label: "网站与应用",  color: "#1f6feb", soft: "#e4efff", ink: "#1656b8" },
  auto:     { label: "自动化",      color: "#8b4bd8", soft: "#f1e8fc", ink: "#6d33b3" },
  media:    { label: "多媒体",      color: "#d6357a", soft: "#fde8f1", ink: "#ad2461" },
  comms:    { label: "通讯与知识",  color: "#5a6572", soft: "#eceff2", ink: "#414b56" }
};

const AGENTS = [
  {
    id: "workbuddy",
    name: "WorkBuddy 主 Agent",
    en: "workbuddy / core",
    cat: "core",
    badge: "主",
    desc: "拆任务、调工具、把结果写成文件，全程自己判断下一步。",
    caps: ["把一句话需求拆成可执行的步骤", "调用本地文件、命令与外部服务", "把中间结果整理成可交付的成品"],
    tags: ["编排", "工具调用", "交付"]
  },
  {
    id: "explore",
    name: "Explore",
    en: "explore / codebase",
    cat: "research",
    badge: "探",
    desc: "在陌生代码库里快速找到文件、符号和调用关系。",
    caps: ["按关键字与命名习惯定位代码", "梳理模块之间的依赖", "在几轮搜索内给出可信答案"],
    tags: ["代码检索", "只读", "快速"]
  },
  {
    id: "plan",
    name: "Plan 架构师",
    en: "plan / architect",
    cat: "research",
    badge: "规",
    desc: "先想清楚再动手，输出分步实施方案与取舍分析。",
    caps: ["拆解实现路径与依赖顺序", "标出关键文件与风险点", "对比多种技术方案的代价"],
    tags: ["方案", "架构", "只读"]
  },
  {
    id: "generalist",
    name: "通用研究员",
    en: "general-purpose",
    cat: "research",
    badge: "研",
    desc: "多轮检索、交叉验证，把散落的信息汇总成一份报告。",
    caps: ["并行发起多路检索", "交叉验证不同来源", "输出带结论的调研摘要"],
    tags: ["调研", "多步", "汇总"]
  },
  {
    id: "pptx",
    name: "PPT 设计师",
    en: "workbuddy-pptx",
    cat: "docs",
    badge: "演",
    desc: "从主题或大纲生成完整演示文稿，也能读懂并修改已有 PPT。",
    caps: ["按主题生成整套幻灯片", "解析现有 PPT 的结构与内容", "单页改标题、增删页、换版式"],
    tags: ["PPT", "汇报", "排版"]
  },
  {
    id: "docx",
    name: "Word 文档专家",
    en: "workbuddy-docx",
    cat: "docs",
    badge: "文",
    desc: "研报、论文、公文、合同，以及已有文档的排版美化。",
    caps: ["长文档结构化写作", "按模板生成专业版式", "把 HTML 高保真转成 docx"],
    tags: ["长文", "公文", "美化"]
  },
  {
    id: "sheetagent",
    name: "表格分析师",
    en: "workbuddy-sheetagent",
    cat: "data",
    badge: "析",
    desc: "清洗、透视、排序、筛选，给既有表格补公式和图表。",
    caps: ["读懂现有 xlsx / csv 的结构", "批量清洗与透视汇总", "构造并写入公式、生成图表"],
    tags: ["Excel", "清洗", "透视"]
  },
  {
    id: "sheetgen",
    name: "建表助手",
    en: "workbuddy-sheet-generation",
    cat: "data",
    badge: "表",
    desc: "从零生成一份新的工作簿，可直接拿去做台账或周报。",
    caps: ["按需求设计表头与字段", "写入示例数据与格式", "一次产出可用的 xlsx"],
    tags: ["新建", "台账", "xlsx"]
  },
  {
    id: "webdev",
    name: "网站开发",
    en: "site / build",
    cat: "dev",
    badge: "站",
    desc: "从零写静态站点或小应用，响应式、可交互、能预览。",
    caps: ["设计信息结构与视觉风格", "手写 HTML / CSS / JS", "本地起服务并实时预览"],
    tags: ["前端", "静态站", "响应式"]
  },
  {
    id: "cloud",
    name: "云服务后端",
    en: "cloud-service",
    cat: "dev",
    badge: "云",
    desc: "数据库、登录注册、文件存储、模型调用，开箱即用的托管后端。",
    caps: ["建表与权限（RLS）配置", "邮箱 / 短信 / 微信登录", "文件存储与大模型调用"],
    tags: ["数据库", "登录", "存储"]
  },
  {
    id: "sites",
    name: "一键发布",
    en: "sites / deploy",
    cat: "dev",
    badge: "发",
    desc: "把本地项目推上线，拿到一个可以分享的链接。",
    caps: ["静态站点与 Node / Python 服务", "生成公开访问链接", "随时下线已发布内容"],
    tags: ["上线", "分享", "部署"]
  },
  {
    id: "browser",
    name: "浏览器操作员",
    en: "agent-browser",
    cat: "auto",
    badge: "浏",
    desc: "真的打开浏览器：点击、填表、截图、跑一遍流程。",
    caps: ["打开页面并提取正文", "点击元素、填写表单", "截图与端到端流程验证"],
    tags: ["自动化", "截图", "测试"]
  },
  {
    id: "imagegen",
    name: "图像生成",
    en: "imagegen",
    cat: "media",
    badge: "图",
    desc: "用文字描述生成图片，也能基于参考图做改造。",
    caps: ["文生图与图生图", "控制风格、构图与比例", "批量产出配图素材"],
    tags: ["配图", "海报", "素材"]
  },
  {
    id: "videogen",
    name: "视频生成",
    en: "videogen",
    cat: "media",
    badge: "影",
    desc: "文字或一张图变成几秒钟的短片。",
    caps: ["文生视频 / 图生视频", "运镜与风格描述", "直接输出 mp4 文件"],
    tags: ["短视频", "动效", "mp4"]
  },
  {
    id: "imageedit",
    name: "图片处理",
    en: "buddy-image-processing",
    cat: "media",
    badge: "修",
    desc: "去文字水印、修图、人像美化、抠图与画质增强。",
    caps: ["去除文字与水印", "老照片修复与增强", "人像美化与背景抠除"],
    tags: ["修图", "抠图", "增强"]
  },
  {
    id: "mail",
    name: "Agent Mail",
    en: "agent-mail",
    cat: "comms",
    badge: "邮",
    desc: "一个属于 Agent 的邮箱，收发邮件、读附件。",
    caps: ["发送与回复邮件", "搜索与归档历史邮件", "附件上传与下载"],
    tags: ["邮件", "附件", "通知"]
  },
  {
    id: "library",
    name: "资料库",
    en: "library / knowledge",
    cat: "comms",
    badge: "库",
    desc: "云端工作台与知识库：文档、表格、页面都能沉淀和检索。",
    caps: ["创建与整理云端文档", "跨库检索已有资料", "分享链接与协作"],
    tags: ["知识库", "云端", "沉淀"]
  },
  {
    id: "experts",
    name: "专家中心",
    en: "expert center",
    cat: "research",
    badge: "专",
    desc: "一百多位领域专家：投资、法律、市场、数据、招聘、教育。",
    caps: ["按行业调用专家方法论", "多角色协作的专家团队", "给出专业判断而不是泛泛而谈"],
    tags: ["行业专家", "方法论", "咨询"]
  }
];

const STORE_KEY = "agentlog.records.v1";
const INSTANT = /[?&]instant/.test(location.search);

/* 记录截止日：只展示这一刻之前产生的使用记录，之后录入的不再显示 */
const LOG_CUTOFF = new Date("2026-10-18T23:59:59+08:00").getTime();
const CUTOFF_LABEL = "2026.10.18";

/* 站内自带的真实记录：做这个网站这件事本身 */
const SEED_RECORDS = [
  {
    id: "seed-build-agent-log",
    agentId: "webdev",
    name: "网站开发",
    cat: "dev",
    ts: new Date("2026-10-18T17:58:00+08:00").getTime(),
    note: "用 Agent 从零搭出这个「Agent 使用日志」站点：18 个 Agent 名录、分类筛选与搜索、使用记录、JSON 导出"
  }
];

const state = {
  filter: "all",
  query: "",
  records: loadRecords(),
  activeAgent: null
};

/* ------------------------------------------------------------
   storage
   ------------------------------------------------------------ */
function loadRecords() {
  let list = [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed;
  } catch (err) {
    list = [];
  }

  const ids = new Set(list.map(r => r.id));
  SEED_RECORDS.forEach(seed => {
    if (!ids.has(seed.id)) list.push(seed);
  });

  return list.sort((a, b) => b.ts - a.ts);
}

function saveRecords() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state.records));
  } catch (err) {
    /* 隐私模式下静默失败，页面仍可使用 */
  }
}

/* 只统计截止日之内的记录 */
function visibleRecords() {
  return state.records
    .filter(r => Number(r.ts) <= LOG_CUTOFF)
    .sort((a, b) => b.ts - a.ts);
}

function isSealed() {
  return Date.now() > LOG_CUTOFF;
}

/* ------------------------------------------------------------
   helpers
   ------------------------------------------------------------ */
const $ = (sel, root) => (root || document).querySelector(sel);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function catOf(key) {
  return CATEGORIES[key] || CATEGORIES.core;
}

function countFor(agentId) {
  return visibleRecords().filter(r => r.agentId === agentId).length;
}

function formatDay(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return mm + "." + dd;
}

function formatTime(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/* ------------------------------------------------------------
   counters
   ------------------------------------------------------------ */
function animateCount(node, target, duration) {
  if (!node) return;
  if (INSTANT) {
    node.textContent = String(target);
    return;
  }
  const start = performance.now();
  const from = 0;
  const dur = duration || 900;

  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = Math.round(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateStats() {
  const records = visibleRecords();
  const total = records.length;
  const node = $("#statRecords");
  if (node) {
    node.dataset.count = String(total);
    animateCount(node, total, 500);
  }
  const tail = $("#consoleTail");
  if (tail) {
    tail.textContent = total === 0
      ? "0 records — 尚无调用"
      : total + " records — 最近 " + formatDay(records[0].ts);
  }
}

/* ------------------------------------------------------------
   filters
   ------------------------------------------------------------ */
function renderFilters() {
  const wrap = $("#filters");
  wrap.innerHTML = "";

  const entries = [["all", { label: "全部" }]].concat(
    Object.keys(CATEGORIES).map(key => [key, CATEGORIES[key]])
  );

  entries.forEach(([key, meta]) => {
    const count = key === "all"
      ? AGENTS.length
      : AGENTS.filter(a => a.cat === key).length;

    const btn = el("button", "chip");
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(state.filter === key));
    btn.dataset.filter = key;
    btn.append(el("span", "", meta.label));
    btn.append(el("span", "n", String(count)));

    btn.addEventListener("click", () => {
      state.filter = key;
      renderFilters();
      renderGrid();
    });

    wrap.append(btn);
  });
}

/* ------------------------------------------------------------
   grid
   ------------------------------------------------------------ */
function matches(agent) {
  if (state.filter !== "all" && agent.cat !== state.filter) return false;

  const q = state.query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    agent.name,
    agent.en,
    agent.desc,
    agent.tags.join(" "),
    catOf(agent.cat).label,
    agent.caps.join(" ")
  ].join(" ").toLowerCase();

  return haystack.includes(q);
}

function buildCard(agent, index) {
  const cat = catOf(agent.cat);
  const used = countFor(agent.id);

  const card = el("article", "card");
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", agent.name + "，查看详情");
  card.style.setProperty("--cat", cat.color);
  card.style.setProperty("--cat-soft", cat.soft);
  card.style.setProperty("--cat-ink", cat.ink);
  card.style.animationDelay = Math.min(index * 40, 320) + "ms";

  const top = el("div", "card-top");
  top.append(el("div", "badge", agent.badge));
  top.append(el("span", "card-cat", cat.label.toUpperCase()));
  card.append(top);

  const titleWrap = el("div");
  titleWrap.append(el("h3", "", agent.name));
  titleWrap.append(el("p", "card-en", agent.en));
  card.append(titleWrap);

  card.append(el("p", "card-desc", agent.desc));

  const tags = el("div", "tags");
  agent.tags.forEach(t => tags.append(el("span", "tag", t)));
  card.append(tags);

  const foot = el("div", "card-foot");
  const usage = el("span", "usage" + (used === 0 ? " idle" : ""));
  usage.append(document.createTextNode(used === 0 ? "调用 " : "调用 "));
  usage.append(el("b", "", used === 0 ? "0" : String(used)));
  usage.append(document.createTextNode(used === 0 ? " 次 · 待命" : " 次"));
  foot.append(usage);

  const quick = el("button", "quick");
  quick.type = "button";
  quick.innerHTML =
    '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3v10M3 8h10"/></svg>';
  quick.append(document.createTextNode("记录一次"));
  if (isSealed()) {
    quick.textContent = "已截止";
    quick.disabled = true;
    quick.title = "记录已于 " + CUTOFF_LABEL + " 截止，不再收录";
  }
  quick.addEventListener("click", ev => {
    ev.stopPropagation();
    addRecord(agent);
  });
  foot.append(quick);

  card.append(foot);

  card.addEventListener("click", () => openModal(agent.id));
  card.addEventListener("keydown", ev => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      openModal(agent.id);
    }
  });

  return card;
}

function renderGrid() {
  const grid = $("#grid");
  const list = AGENTS.filter(matches);
  grid.innerHTML = "";

  list.forEach((agent, i) => grid.append(buildCard(agent, i)));

  const empty = $("#gridEmpty");
  empty.hidden = list.length !== 0;
  grid.hidden = list.length === 0;

  $("#resultCount").textContent = String(list.length);
}

/* ------------------------------------------------------------
   timeline
   ------------------------------------------------------------ */
function renderTimeline() {
  const list = $("#timeline");
  const empty = $("#logEmpty");
  list.innerHTML = "";

  const records = visibleRecords();

  if (records.length === 0) {
    list.hidden = true;
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  list.hidden = false;

  records.forEach(record => {
    const agent = AGENTS.find(a => a.id === record.agentId);
    const cat = catOf(record.cat || (agent && agent.cat));

    const li = el("li", "tl-item");

    const time = el("div", "tl-time");
    time.append(el("b", "", formatDay(record.ts)));
    time.append(document.createTextNode(formatTime(record.ts)));
    li.append(time);

    const body = el("div", "tl-body");
    const title = el("div", "tl-title");
    title.append(el("strong", "", record.name));
    title.append(el("span", "tl-cat", cat.label));
    body.append(title);
    body.append(el("p", "tl-note", record.note || "手动记录的一次调用"));
    li.append(body);

    const del = el("button", "tl-del", "删除");
    del.type = "button";
    del.setAttribute("aria-label", "删除这条记录");
    del.addEventListener("click", () => removeRecord(record.id));
    li.append(del);

    list.append(li);
  });
}

/* ------------------------------------------------------------
   records
   ------------------------------------------------------------ */
function addRecord(agent, silent) {
  if (isSealed()) {
    toast("记录已于 " + CUTOFF_LABEL + " 截止，不再收录新的使用记录");
    return;
  }

  const record = {
    id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    agentId: agent.id,
    name: agent.name,
    cat: agent.cat,
    ts: Date.now(),
    note: "手动记录的一次调用"
  };

  state.records.unshift(record);
  saveRecords();
  renderTimeline();
  renderGrid();
  updateStats();
  if (state.activeAgent) renderModalRecords(agent.id);

  if (!silent) toast("已记录：" + agent.name);
}

function removeRecord(id) {
  state.records = state.records.filter(r => r.id !== id);
  saveRecords();
  renderTimeline();
  renderGrid();
  updateStats();
  if (state.activeAgent) renderModalRecords(state.activeAgent);
  toast("已删除一条记录");
}

function clearRecords() {
  state.records = [];
  saveRecords();
  renderTimeline();
  renderGrid();
  updateStats();
  if (state.activeAgent) renderModalRecords(state.activeAgent);
  toast("使用记录已清空");
}

/* ------------------------------------------------------------
   modal
   ------------------------------------------------------------ */
function openModal(agentId) {
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) return;

  const cat = catOf(agent.cat);
  state.activeAgent = agentId;

  $("#modalBadge").textContent = agent.badge;
  $("#modalBadge").style.background = cat.soft;
  $("#modalBadge").style.color = cat.ink;
  $("#modalCat").textContent = cat.label;
  $("#modalCat").style.color = cat.color;
  $("#modalTitle").textContent = agent.name;
  $("#modalEn").textContent = agent.en;
  $("#modalDesc").textContent = agent.desc;
  $("#modalId").textContent = "id: " + agent.id;
  $("#modalRun").dataset.agent = agent.id;

  const caps = $("#modalCaps");
  caps.innerHTML = "";
  agent.caps.forEach(c => caps.append(el("li", "", c)));

  renderModalRecords(agentId);

  const modal = $("#modal");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("#modalClose").focus();
}

function renderModalRecords(agentId) {
  const agent = AGENTS.find(a => a.id === agentId);
  const mine = visibleRecords().filter(r => r.agentId === agentId);
  const node = $("#modalRecords");

  if (mine.length === 0) {
    node.textContent = isSealed()
      ? "截至 " + CUTOFF_LABEL + "，它没有被调用过。"
      : "还没有记录。点下面的按钮，给 " + (agent ? agent.name : "它") + " 记上第一次。";
    return;
  }

  const last = mine[0];
  node.innerHTML = "";
  node.append(document.createTextNode("共 "));
  node.append(el("b", "", String(mine.length)));
  node.append(document.createTextNode(" 次 · 最近一次 " + formatDay(last.ts) + " " + formatTime(last.ts)));
}

function closeModal() {
  $("#modal").hidden = true;
  document.body.style.overflow = "";
  state.activeAgent = null;
}

/* ------------------------------------------------------------
   export
   ------------------------------------------------------------ */
function exportRecords() {
  const records = visibleRecords();
  const payload = {
    exportedAt: new Date().toISOString(),
    cutoff: new Date(LOG_CUTOFF).toISOString(),
    total: records.length,
    agents: AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      category: catOf(a.cat).label,
      calls: countFor(a.id)
    })),
    records: records
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "agent-log-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  toast(records.length === 0 ? "已导出（当前 0 条记录）" : "已导出 " + records.length + " 条记录");
}

/* ------------------------------------------------------------
   toast
   ------------------------------------------------------------ */
let toastTimer = null;
function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 2200);
}

/* ------------------------------------------------------------
   reveal on scroll
   ------------------------------------------------------------ */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (INSTANT || !("IntersectionObserver" in window)) {
    items.forEach(n => n.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });

  items.forEach(n => io.observe(n));
}

/* ------------------------------------------------------------
   init
   ------------------------------------------------------------ */
function init() {
  if (INSTANT) document.documentElement.classList.add("instant");
  if (/[?&]demo/.test(location.search)) seedDemo();
  renderFilters();
  renderGrid();
  renderTimeline();
  updateStats();
  initReveal();

  const sealed = isSealed();
  document.body.classList.toggle("sealed", sealed);

  const cutoffBadge = $("#cutoffBadge");
  if (cutoffBadge) {
    cutoffBadge.textContent = sealed
      ? "已封存 · 截至 " + CUTOFF_LABEL
      : "记录截至 " + CUTOFF_LABEL;
  }

  const runBtn = $("#modalRun");
  if (sealed && runBtn) {
    runBtn.textContent = "记录已截止";
    runBtn.disabled = true;
  }

  document.querySelectorAll(".stat-num[data-count]").forEach(node => {
    animateCount(node, Number(node.dataset.count) || 0, 1000);
  });

  const listTrigger = $("#consoleList");
  if (listTrigger) {
    listTrigger.textContent = "18 agents · core / research / docs / data / dev / auto / media / comms";
  }

  $("#searchInput").addEventListener("input", ev => {
    state.query = ev.target.value;
    renderGrid();
  });

  $("#exportBtn").addEventListener("click", exportRecords);

  const clearBtn = $("#clearBtn");
  let armed = false;
  let armTimer = null;
  clearBtn.addEventListener("click", () => {
    if (visibleRecords().length === 0) {
      toast("本来就没有记录");
      return;
    }
    if (!armed) {
      armed = true;
      clearBtn.textContent = "确认清空？";
      clearBtn.style.borderColor = "var(--coral)";
      clearBtn.style.color = "var(--coral)";
      armTimer = setTimeout(disarm, 3200);
      return;
    }
    clearTimeout(armTimer);
    disarm();
    clearRecords();
  });

  function disarm() {
    armed = false;
    clearBtn.textContent = "清空";
    clearBtn.style.borderColor = "";
    clearBtn.style.color = "";
  }

  $("#modalClose").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", ev => {
    if (ev.target.dataset.close !== undefined) closeModal();
  });

  $("#modalRun").addEventListener("click", () => {
    const agent = AGENTS.find(a => a.id === $("#modalRun").dataset.agent);
    if (agent) addRecord(agent);
  });

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && !$("#modal").hidden) closeModal();
  });

  const modalParam = location.search.match(/[?&]modal=([\w-]+)/);
  if (modalParam) openModal(modalParam[1]);

  $("#aboutDate").textContent = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ".");
}

/* 仅用于 ?demo 调试预览：追加示例记录，不写入存储 */
function seedDemo() {
  const now = Date.now();
  const H = 3600 * 1000;
  const demo = [
    { id: "demo2", agentId: "explore", name: "Explore", cat: "research", ts: now - 9 * H, note: "手动记录的一次调用" },
    { id: "demo3", agentId: "pptx", name: "PPT 设计师", cat: "docs", ts: now - 27 * H, note: "手动记录的一次调用" },
    { id: "demo4", agentId: "sheetagent", name: "表格分析师", cat: "data", ts: now - 50 * H, note: "手动记录的一次调用" }
  ];
  const ids = new Set(state.records.map(r => r.id));
  demo.forEach(item => {
    if (!ids.has(item.id)) state.records.push(item);
  });
  state.records.sort((a, b) => b.ts - a.ts);
}

document.addEventListener("DOMContentLoaded", init);
