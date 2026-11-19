/* ============================================================
   MLP PLAYGROUND — 手写前向 / 反向传播 + Canvas 可视化
   ============================================================ */

/* ---------------- utils ---------------- */
const $ = (sel, root) => (root || document).querySelector(sel);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rnd) {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const sigmoid = z => 1 / (1 + Math.exp(-z));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

/* ---------------- datasets ---------------- */
function normalize(points) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach(p => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });
  const padX = (maxX - minX) * 0.08 || 0.1;
  const padY = (maxY - minY) * 0.08 || 0.1;
  const spanX = (maxX - minX) + padX * 2;
  const spanY = (maxY - minY) + padY * 2;
  const s = 2 / Math.max(spanX, spanY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return points.map(p => ({
    x: (p.x - cx) * s,
    y: (p.y - cy) * s,
    label: p.label
  }));
}

const DATASETS = {
  xor: {
    label: "异或",
    build() {
      const rnd = mulberry32(42);
      const pts = [];
      for (let i = 0; i < 260; i++) {
        const x = rnd() * 2 - 1;
        const y = rnd() * 2 - 1;
        pts.push({ x, y, label: (x > 0) !== (y > 0) ? 1 : 0 });
      }
      return normalize(pts);
    }
  },
  moons: {
    label: "双月",
    build() {
      const rnd = mulberry32(7);
      const pts = [];
      const half = 130;
      for (let i = 0; i < half; i++) {
        const t = (Math.PI * i) / (half - 1);
        pts.push({ x: Math.cos(t) + gauss(rnd) * 0.075, y: Math.sin(t) + gauss(rnd) * 0.075, label: 0 });
      }
      for (let i = 0; i < half; i++) {
        const t = (Math.PI * i) / (half - 1);
        pts.push({ x: 1 - Math.cos(t) + gauss(rnd) * 0.075, y: 0.45 - Math.sin(t) + gauss(rnd) * 0.075, label: 1 });
      }
      return normalize(pts);
    }
  },
  circles: {
    label: "圆环",
    build() {
      const rnd = mulberry32(11);
      const pts = [];
      for (let i = 0; i < 130; i++) {
        const t = rnd() * Math.PI * 2;
        const r = 0.32 + rnd() * 0.09;
        pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r, label: 0 });
      }
      for (let i = 0; i < 130; i++) {
        const t = rnd() * Math.PI * 2;
        const r = 0.86 + rnd() * 0.09;
        pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r, label: 1 });
      }
      return normalize(pts);
    }
  },
  spiral: {
    label: "螺旋",
    build() {
      const rnd = mulberry32(3);
      const pts = [];
      for (let arm = 0; arm < 2; arm++) {
        for (let i = 0; i < 130; i++) {
          const f = i / 129;
          const r = 0.15 + f * 0.95;
          const t = f * Math.PI * 2.4 + arm * Math.PI;
          pts.push({
            x: Math.cos(t) * r + gauss(rnd) * 0.035,
            y: Math.sin(t) * r + gauss(rnd) * 0.035,
            label: arm
          });
        }
      }
      return normalize(pts);
    }
  }
};

/* ---------------- model ---------------- */
function activate(kind, z) {
  return kind === "relu" ? Math.max(0, z) : Math.tanh(z);
}

function activateD(kind, a) {
  return kind === "relu" ? (a > 0 ? 1 : 0) : 1 - a * a;
}

function createNet(sizes, act, seed) {
  const rnd = mulberry32(seed >>> 0);
  const W = [], B = [];
  for (let l = 1; l < sizes.length; l++) {
    const fanIn = sizes[l - 1], fanOut = sizes[l];
    const scale = Math.sqrt(2 / (fanIn + fanOut));
    const w = new Float64Array(fanIn * fanOut);
    for (let k = 0; k < w.length; k++) w[k] = gauss(rnd) * scale;
    W.push(w);
    B.push(new Float64Array(fanOut));
  }
  return { sizes: sizes.slice(), act, W, B };
}

function forward(net, x1, x2) {
  const acts = [new Float64Array([x1, x2])];
  let a = acts[0];
  for (let l = 0; l < net.W.length; l++) {
    const W = net.W[l], B = net.B[l];
    const m = a.length, n = B.length;
    const out = new Float64Array(n);
    const isOut = l === net.W.length - 1;
    for (let j = 0; j < n; j++) {
      let s = B[j];
      const base = j * m;
      for (let i = 0; i < m; i++) s += W[base + i] * a[i];
      out[j] = isOut ? sigmoid(s) : activate(net.act, s);
    }
    acts.push(out);
    a = out;
  }
  return acts;
}

function predict(net, x1, x2) {
  let a = [x1, x2];
  for (let l = 0; l < net.W.length; l++) {
    const W = net.W[l], B = net.B[l];
    const m = a.length, n = B.length;
    const out = new Float64Array(n);
    const isOut = l === net.W.length - 1;
    for (let j = 0; j < n; j++) {
      let s = B[j];
      const base = j * m;
      for (let i = 0; i < m; i++) s += W[base + i] * a[i];
      out[j] = isOut ? sigmoid(s) : activate(net.act, s);
    }
    a = out;
  }
  return a[0];
}

function trainEpoch(net, data, lr, l2, batchSize) {
  const order = data.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }

  const bs = batchSize > 0 ? batchSize : data.length;
  const eps = 1e-7;
  let lossSum = 0, correct = 0;

  for (let start = 0; start < data.length; start += bs) {
    const end = Math.min(start + bs, data.length);
    const dW = net.W.map(w => new Float64Array(w.length));
    const dB = net.B.map(b => new Float64Array(b.length));

    for (let k = start; k < end; k++) {
      const p = data[order[k]];
      const acts = forward(net, p.x, p.y);
      const out = acts[acts.length - 1][0];

      const pr = clamp(out, eps, 1 - eps);
      lossSum += -(p.label * Math.log(pr) + (1 - p.label) * Math.log(1 - pr));
      if ((out > 0.5 ? 1 : 0) === p.label) correct++;

      let delta = new Float64Array([out - p.label]);
      const L = net.W.length;

      for (let l = L - 1; l >= 0; l--) {
        const m = acts[l].length, n = net.B[l].length;
        const W = net.W[l], gW = dW[l], gB = dB[l];

        for (let j = 0; j < n; j++) {
          const dj = delta[j];
          if (dj === 0) continue;
          const base = j * m;
          for (let i = 0; i < m; i++) gW[base + i] += dj * acts[l][i];
          gB[j] += dj;
        }

        if (l > 0) {
          const prev = new Float64Array(m);
          for (let i = 0; i < m; i++) {
            let s = 0;
            for (let j = 0; j < n; j++) s += W[j * m + i] * delta[j];
            prev[i] = s * activateD(net.act, acts[l][i]);
          }
          delta = prev;
        }
      }
    }

    const b = end - start;
    for (let l = 0; l < net.W.length; l++) {
      const w = net.W[l], g = dW[l];
      for (let k = 0; k < w.length; k++) w[k] -= lr * (g[k] / b + l2 * w[k]);
      const bb = net.B[l], gb = dB[l];
      for (let k = 0; k < bb.length; k++) bb[k] -= lr * (gb[k] / b);
    }
  }

  return { loss: lossSum / data.length, acc: correct / data.length };
}

function exactAccuracy(net, data) {
  let ok = 0;
  for (const p of data) {
    if ((predict(net, p.x, p.y) > 0.5 ? 1 : 0) === p.label) ok++;
  }
  return ok / data.length;
}

function countParams(net) {
  let n = 0;
  net.W.forEach(w => (n += w.length));
  net.B.forEach(b => (n += b.length));
  return n;
}

/* ---------------- state ---------------- */
const BATCH_OPTIONS = [0, 32, 16, 8];
const EPOCH_OPTIONS = [300, 600, 1500];

const state = {
  dataset: "moons",
  layers: 2,
  width: 8,
  act: "tanh",
  lr: 0.3,
  l2: 0,
  batchIdx: 0,
  epochsIdx: 1,
  epoch: 0,
  data: [],
  net: null,
  history: [],
  running: false,
  startedAt: 0,
  elapsed: 0,
  raf: 0,
  frame: 0
};

function maxEpochs() {
  return EPOCH_OPTIONS[state.epochsIdx];
}

function buildSizes() {
  const sizes = [2];
  for (let i = 0; i < state.layers; i++) sizes.push(state.width);
  sizes.push(1);
  return sizes;
}

/* ---------------- canvas ---------------- */
function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

let boundaryBuf = null;
let boundaryBufCtx = null;
const BOUNDARY_GRID = 88;

function drawBoundary() {
  const { ctx, w, h } = fitCanvas($("#boundary"));
  const G = BOUNDARY_GRID;

  if (!boundaryBuf) {
    boundaryBuf = document.createElement("canvas");
    boundaryBuf.width = G;
    boundaryBuf.height = G;
    boundaryBufCtx = boundaryBuf.getContext("2d");
  }

  const img = boundaryBufCtx.createImageData(G, G);
  const paper = [246, 245, 240];
  const softA = [255, 226, 214];
  const softB = [226, 225, 255];

  for (let gy = 0; gy < G; gy++) {
    const y = 1.15 - (2.3 * (gy + 0.5)) / G;
    for (let gx = 0; gx < G; gx++) {
      const x = -1.15 + (2.3 * (gx + 0.5)) / G;
      const p = predict(state.net, x, y);
      const t = Math.pow(Math.abs(p - 0.5) * 2, 0.75);
      const c = mix(paper, p > 0.5 ? softB : softA, t);
      const idx = (gy * G + gx) * 4;
      img.data[idx] = c[0];
      img.data[idx + 1] = c[1];
      img.data[idx + 2] = c[2];
      img.data[idx + 3] = 255;
    }
  }
  boundaryBufCtx.putImageData(img, 0, 0);

  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(boundaryBuf, 0, 0, w, h);

  const toX = v => ((v + 1.15) / 2.3) * w;
  const toY = v => ((1.15 - v) / 2.3) * h;

  ctx.strokeStyle = "rgba(20,19,15,.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(toX(0), 0); ctx.lineTo(toX(0), h);
  ctx.moveTo(0, toY(0)); ctx.lineTo(w, toY(0));
  ctx.stroke();

  state.data.forEach(p => {
    const x = toX(p.x), y = toY(p.y);
    ctx.beginPath();
    ctx.arc(x, y, 3.3, 0, Math.PI * 2);
    ctx.fillStyle = p.label === 1 ? "#3d3aff" : "#ff6a3d";
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(20,19,15,.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

function drawCurve() {
  const { ctx, w, h } = fitCanvas($("#curve"));
  ctx.clearRect(0, 0, w, h);

  const padL = 34, padR = 34, padT = 14, padB = 22;
  const pw = w - padL - padR;
  const ph = h - padT - padB;

  ctx.strokeStyle = "rgba(20,19,15,.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = padT + (ph * i) / 3;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + pw, y);
    ctx.stroke();
  }

  const maxE = maxEpochs();
  const hist = state.history;

  ctx.font = "9px ui-monospace, monospace";
  ctx.fillStyle = "#8b8578";

  if (!hist.length) {
    ctx.textAlign = "center";
    ctx.fillText("等待训练…", padL + pw / 2, padT + ph / 2);
    return;
  }

  let maxLoss = 0.35;
  hist.forEach(p => { if (p.loss > maxLoss) maxLoss = p.loss; });
  maxLoss = Math.min(1.6, maxLoss * 1.08);

  const xOf = e => padL + (pw * e) / maxE;
  const yLoss = v => padT + ph * (1 - clamp(v / maxLoss, 0, 1));
  const yAcc = v => padT + ph * (1 - clamp(v, 0, 1));

  // loss area
  ctx.beginPath();
  hist.forEach((p, i) => {
    const x = xOf(p.e), y = yLoss(p.loss);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(xOf(hist[hist.length - 1].e), padT + ph);
  ctx.lineTo(xOf(hist[0].e), padT + ph);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, padT + ph);
  grad.addColorStop(0, "rgba(61,58,255,.16)");
  grad.addColorStop(1, "rgba(61,58,255,.01)");
  ctx.fillStyle = grad;
  ctx.fill();

  // loss line
  const step = Math.max(1, Math.floor(hist.length / 400));
  ctx.beginPath();
  for (let i = 0; i < hist.length; i += step) {
    const p = hist[i];
    const x = xOf(p.e), y = yLoss(p.loss);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  const lastP = hist[hist.length - 1];
  ctx.lineTo(xOf(lastP.e), yLoss(lastP.loss));
  ctx.strokeStyle = "#3d3aff";
  ctx.lineWidth = 1.6;
  ctx.lineJoin = "round";
  ctx.stroke();

  // accuracy line
  ctx.beginPath();
  for (let i = 0; i < hist.length; i += step) {
    const p = hist[i];
    const x = xOf(p.e), y = yAcc(p.acc);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.lineTo(xOf(lastP.e), yAcc(lastP.acc));
  ctx.strokeStyle = "#ff6a3d";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // axis labels
  ctx.fillStyle = "#8b8578";
  ctx.textAlign = "right";
  ctx.fillText(maxLoss.toFixed(2), padL - 5, padT + 4);
  ctx.fillText("0", padL - 5, padT + ph);
  ctx.textAlign = "left";
  ctx.fillText("100%", padL + pw + 5, padT + 4);
  ctx.fillText("0%", padL + pw + 5, padT + ph);

  ctx.textAlign = "left";
  ctx.fillText("epoch 0", padL, h - 6);
  ctx.textAlign = "right";
  ctx.fillText("epoch " + maxE, padL + pw, h - 6);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ff6a3d";
  ctx.fillText("acc", padL + pw, padT - 3);
  ctx.fillStyle = "#3d3aff";
  ctx.textAlign = "left";
  ctx.fillText("loss", padL, padT - 3);
}

function drawNet() {
  const { ctx, w, h } = fitCanvas($("#netcanvas"));
  ctx.clearRect(0, 0, w, h);

  const net = state.net;
  const sizes = net.sizes;
  const padX = 26, padTop = 18, padBottom = 30;
  const cols = sizes.length;
  const xOf = i => padX + ((w - padX * 2) * i) / (cols - 1);

  const maxN = Math.max.apply(null, sizes);
  const usable = h - padTop - padBottom;
  const gap = usable / Math.max(1, maxN - 1);
  const r = clamp(gap * 0.34, 2.6, 8);

  const yOf = (i, n) => {
    const total = (n - 1) * gap;
    const top = padTop + (usable - total) / 2;
    return top + i * gap;
  };

  // edges
  for (let l = 0; l < net.W.length; l++) {
    const W = net.W[l];
    const m = sizes[l], n = sizes[l + 1];
    const x1 = xOf(l), x2 = xOf(l + 1);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < m; i++) {
        const wv = W[j * m + i];
        const mag = Math.min(1, Math.abs(wv) / 1.4);
        ctx.strokeStyle = wv >= 0
          ? "rgba(61,58,255," + (0.05 + mag * 0.42).toFixed(3) + ")"
          : "rgba(255,106,61," + (0.05 + mag * 0.42).toFixed(3) + ")";
        ctx.lineWidth = 0.5 + mag * 0.9;
        ctx.beginPath();
        ctx.moveTo(x1, yOf(i, m));
        ctx.lineTo(x2, yOf(j, n));
        ctx.stroke();
      }
    }
  }

  // nodes
  for (let l = 0; l < cols; l++) {
    const n = sizes[l];
    for (let i = 0; i < n; i++) {
      const x = xOf(l), y = yOf(i, n);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (l === 0) {
        ctx.fillStyle = "#14130f";
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#14130f";
      } else if (l === cols - 1) {
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#3d3aff";
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(20,19,15,.35)";
      }
      ctx.fill();
      ctx.stroke();
    }
  }

  // labels
  ctx.font = "9px ui-monospace, monospace";
  ctx.fillStyle = "#8b8578";
  ctx.textAlign = "center";
  sizes.forEach((n, i) => {
    ctx.fillText(String(n), xOf(i), h - 9);
  });
}

function drawAll(withBoundary) {
  if (withBoundary !== false) drawBoundary();
  drawCurve();
  drawNet();
  updateStats();
}

/* ---------------- stats ---------------- */
function updateStats() {
  const hist = state.history;
  const last = hist[hist.length - 1];
  const acc = state.net ? exactAccuracy(state.net, state.data) : 0;

  $("#statParams").textContent = state.net ? countParams(state.net).toLocaleString("en-US") : "—";
  $("#statEpoch").textContent = state.epoch + " / " + maxEpochs();
  $("#statLoss").textContent = last ? last.loss.toFixed(3) : "—";
  $("#statAcc").textContent = state.net ? (acc * 100).toFixed(1) + "%" : "—";
  $("#statTime").textContent = (state.elapsed / 1000).toFixed(1) + "s";

  $("#progressBar").style.width = (100 * state.epoch / maxEpochs()).toFixed(1) + "%";
}

function setPill(text, cls) {
  const pill = $("#statePill");
  pill.textContent = text;
  pill.className = "state-pill mono" + (cls ? " " + cls : "");
}

/* ---------------- training loop ---------------- */
function stopLoop() {
  state.running = false;
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = 0;
}

function resetRun(autoStart) {
  stopLoop();
  state.epoch = 0;
  state.history = [];
  state.elapsed = 0;
  state.startedAt = 0;
  state.frame = 0;
  state.data = DATASETS[state.dataset].build();
  state.net = createNet(buildSizes(), state.act, (Math.random() * 1e9) | 0);
  setPill(autoStart ? "训练中" : "就绪", autoStart ? "is-running" : "");
  $("#trainLabel").textContent = autoStart ? "暂停训练" : "开始训练";
  drawAll(true);
  if (autoStart) startTraining();
}

function startTraining() {
  if (state.epoch >= maxEpochs()) {
    resetRun(false);
  }
  if (!state.net) resetRun(false);

  state.running = true;
  state.startedAt = performance.now() - state.elapsed;
  setPill("训练中", "is-running");
  $("#trainLabel").textContent = "暂停训练";
  state.raf = requestAnimationFrame(loop);
}

function pauseTraining() {
  stopLoop();
  state.elapsed = performance.now() - state.startedAt;
  setPill("已暂停", "is-paused");
  $("#trainLabel").textContent = "继续训练";
  updateStats();
}

function finishTraining() {
  stopLoop();
  state.elapsed = performance.now() - state.startedAt;
  setPill("已完成", "is-done");
  $("#trainLabel").textContent = "重新训练";
  updateStats();
}

function loop() {
  if (!state.running) return;

  const t0 = performance.now();
  while (performance.now() - t0 < 10 && state.epoch < maxEpochs()) {
    const r = trainEpoch(state.net, state.data, state.lr, state.l2, BATCH_OPTIONS[state.batchIdx]);
    state.epoch++;
    state.history.push({ e: state.epoch, loss: r.loss, acc: r.acc });
  }

  state.elapsed = performance.now() - state.startedAt;
  state.frame++;

  if (state.epoch >= maxEpochs()) {
    finishTraining();
    drawAll(true);
    return;
  }

  drawAll(state.frame % 2 === 0 || state.epoch < 3);
  state.raf = requestAnimationFrame(loop);
}

/* ---------------- controls ---------------- */
function buildDatasetChips() {
  const wrap = $("#datasetChips");
  wrap.innerHTML = "";
  Object.keys(DATASETS).forEach(key => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-sm";
    btn.textContent = DATASETS[key].label;
    btn.setAttribute("aria-pressed", String(state.dataset === key));
    btn.addEventListener("click", () => {
      state.dataset = key;
      buildDatasetChips();
      resetRun(true);
    });
    wrap.append(btn);
  });
}

function buildActSegments() {
  const wrap = $("#actSeg");
  wrap.innerHTML = "";
  [["tanh", "tanh"], ["relu", "ReLU"]].forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.setAttribute("aria-pressed", String(state.act === key));
    btn.addEventListener("click", () => {
      state.act = key;
      buildActSegments();
      $("#formula").textContent = key === "tanh"
        ? "h = tanh(W₁x + b₁) → ŷ = σ(W₂h + b₂)"
        : "h = ReLU(W₁x + b₁) → ŷ = σ(W₂h + b₂)";
      resetRun(true);
    });
    wrap.append(btn);
  });
}

function syncLabels() {
  $("#layersVal").textContent = state.layers + " 层";
  $("#widthVal").textContent = state.width;
  $("#lrVal").textContent = state.lr.toFixed(state.lr < 0.01 ? 4 : 3);
  $("#l2Val").textContent = state.l2.toFixed(4);
  $("#batchVal").textContent = BATCH_OPTIONS[state.batchIdx] === 0 ? "全量" : BATCH_OPTIONS[state.batchIdx];
  $("#epochsVal").textContent = maxEpochs();
}

function debounce(fn, ms) {
  let t = 0;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

const restart = debounce(() => resetRun(true), 160);

function bindControls() {
  $("#layers").addEventListener("input", e => {
    state.layers = +e.target.value;
    syncLabels();
    restart();
  });

  $("#width").addEventListener("input", e => {
    state.width = +e.target.value;
    syncLabels();
    restart();
  });

  $("#lr").addEventListener("input", e => {
    const t = +e.target.value / 1000;
    state.lr = Math.pow(10, -3 + 3 * t);
    syncLabels();
    restart();
  });

  $("#l2").addEventListener("input", e => {
    state.l2 = +e.target.value / 10000;
    syncLabels();
    restart();
  });

  $("#batch").addEventListener("input", e => {
    state.batchIdx = +e.target.value;
    syncLabels();
    restart();
  });

  $("#epochs").addEventListener("input", e => {
    state.epochsIdx = +e.target.value;
    syncLabels();
    restart();
  });

  $("#trainBtn").addEventListener("click", () => {
    if (state.running) {
      pauseTraining();
    } else if (state.epoch >= maxEpochs()) {
      resetRun(true);
    } else if (state.epoch > 0) {
      startTraining();
    } else {
      startTraining();
    }
  });

  $("#resetBtn").addEventListener("click", () => resetRun(true));

  window.addEventListener("resize", debounce(() => drawAll(true), 140));
}

function runSynchronously() {
  const t0 = performance.now();
  while (state.epoch < maxEpochs() && performance.now() - t0 < 3000) {
    const r = trainEpoch(state.net, state.data, state.lr, state.l2, BATCH_OPTIONS[state.batchIdx]);
    state.epoch++;
    state.history.push({ e: state.epoch, loss: r.loss, acc: r.acc });
  }
  state.elapsed = performance.now() - t0;
  state.startedAt = performance.now() - state.elapsed;
  if (state.epoch >= maxEpochs()) finishTraining(); 
  drawAll(true);
}

/* ---------------- init ---------------- */
function init() {
  // 学习率滑块的初始位置 = 0.3
  $("#lr").value = String(Math.round(((Math.log10(0.3) + 3) / 3) * 1000));

  buildDatasetChips();
  buildActSegments();
  syncLabels();
  bindControls();

  state.net = createNet(buildSizes(), state.act, (Math.random() * 1e9) | 0);
  state.data = DATASETS[state.dataset].build();
  drawAll(true);
  setPill("就绪", "");

  if (/[?&]fast/.test(location.search)) {
    runSynchronously();
    return;
  }
  startTraining();
}

document.addEventListener("DOMContentLoaded", init);
