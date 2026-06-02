#!/usr/bin/env node

import { createServer } from "node:http";
import { appendFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const prospectsFile = process.env.TENANTPROOF_OUTREACH_PROSPECTS || join(root, "docs", "outreach-prospects.json");
const trackerFile = process.env.TENANTPROOF_OUTREACH_TRACKER || join(root, "docs", "audit-outreach-tracker.csv");
const port = Number(process.env.PORT || 4173);

function send(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  response.end(body);
}

function csvCell(value = "") {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readTracker() {
  return readFile(trackerFile, "utf8");
}

function isRecorded(tracker, prospect) {
  return tracker.includes(`,${prospect.url},commented,`);
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new Error("Request body is too large");
  }
  return JSON.parse(body || "{}");
}

function trackerRow(prospect, action, notes) {
  const today = new Date().toISOString().slice(0, 10);
  const nextDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return [
    today,
    prospect.threadTitle,
    "TenantProof research audit",
    prospect.segment,
    prospect.source,
    prospect.url,
    action,
    "Check replies",
    nextDate,
    "",
    "",
    "",
    "",
    "",
    notes
  ].map(csvCell).join(",");
}

function html() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TenantProof Outreach Queue</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background:#07120f; color:#e7fff7; }
      * { box-sizing:border-box; }
      body { margin:0; }
      main { max-width:1080px; margin:0 auto; padding:42px 20px 72px; }
      h1 { margin:8px 0; font-size:clamp(2rem, 5vw, 4rem); letter-spacing:-.06em; }
      h2 { margin:0; font-size:1.25rem; }
      p { color:#b8d5cc; line-height:1.6; }
      .eyebrow { color:#66e2b7; font-weight:800; letter-spacing:.14em; text-transform:uppercase; font-size:.78rem; }
      .notice { border:1px solid #295b4b; border-radius:16px; padding:14px 16px; margin:24px 0; background:#0a1c17; }
      .summary { display:flex; flex-wrap:wrap; gap:10px; margin:18px 0 28px; }
      .pill { border:1px solid #295b4b; border-radius:999px; padding:8px 12px; color:#b8d5cc; }
      .queue { display:grid; gap:16px; }
      .card { border:1px solid #204a3e; border-radius:18px; padding:18px; background:#0a1c17; }
      .meta { color:#66e2b7; font-size:.86rem; margin:6px 0 10px; }
      textarea { width:100%; min-height:190px; resize:vertical; border:1px solid #295b4b; border-radius:12px; padding:12px; background:#04100d; color:#d5f8ed; font:inherit; line-height:1.5; }
      .actions { display:flex; flex-wrap:wrap; gap:9px; margin-top:12px; }
      button, a.button { cursor:pointer; border:0; border-radius:999px; padding:10px 14px; background:#66e2b7; color:#07120f; text-decoration:none; font-weight:800; font-size:.9rem; }
      button.secondary, a.secondary { background:transparent; color:#d5f8ed; border:1px solid #295b4b; }
      button:disabled { cursor:default; opacity:.55; }
      .done { opacity:.58; }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">TenantProof launch helper</div>
      <h1>Outreach review queue</h1>
      <p>Open a relevant public thread, read it first, adjust the draft if needed, then post manually. This dashboard does not sign in to Reddit or publish on your behalf.</p>
      <div class="notice"><strong>Today:</strong> comment on the first three threads only. Helpful and specific beats volume.</div>
      <div class="summary">
        <span class="pill" id="queue-count">Loading queue...</span>
        <span class="pill" id="tracker-count">Loading tracker...</span>
      </div>
      <section class="queue" id="queue"></section>
    </main>
    <script>
      async function api(path, options) {
        const response = await fetch(path, options);
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      }

      async function record(prospect, button, textarea) {
        button.disabled = true;
        const result = await api("/api/record", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: prospect.id, action: "commented", notes: "Public comment posted after manual review", comment: textarea.value })
        });
        button.textContent = result.duplicate ? "Already recorded" : "Recorded";
        button.closest(".card").classList.add("done");
        await refreshSummary();
      }

      async function copy(textarea, button) {
        await navigator.clipboard.writeText(textarea.value);
        const original = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => button.textContent = original, 1200);
      }

      async function refreshSummary() {
        const data = await api("/api/summary");
        document.querySelector("#queue-count").textContent = data.prospectCount + " reviewed prospects";
        document.querySelector("#tracker-count").textContent = data.trackerEntries + " tracked outreach actions";
        for (const card of document.querySelectorAll(".card")) {
          if (!data.recordedIds.includes(card.dataset.id)) continue;
          card.classList.add("done");
          const button = card.querySelector(".record");
          button.disabled = true;
          button.textContent = "Already recorded";
        }
      }

      async function start() {
        const prospects = await api("/api/prospects");
        const queue = document.querySelector("#queue");
        for (const prospect of prospects) {
          const card = document.createElement("article");
          card.className = "card";
          card.dataset.id = prospect.id;
          card.innerHTML = \`
            <h2>\${prospect.priority}. \${prospect.title}</h2>
            <div class="meta">\${prospect.source} · \${prospect.segment}</div>
            <p><strong>Why it fits:</strong> \${prospect.why}</p>
            <textarea aria-label="Draft comment"></textarea>
            <div class="actions">
              <a class="button secondary" href="\${prospect.url}" target="_blank" rel="noreferrer">Open thread</a>
              <button class="secondary copy">Copy comment</button>
              <button class="record">Mark as commented</button>
            </div>\`;
          const textarea = card.querySelector("textarea");
          textarea.value = prospect.comment;
          card.querySelector(".copy").addEventListener("click", event => copy(textarea, event.currentTarget));
          card.querySelector(".record").addEventListener("click", event => record(prospect, event.currentTarget, textarea));
          queue.append(card);
        }
        await refreshSummary();
      }

      start().catch(error => {
        document.querySelector("#queue").textContent = "Dashboard error: " + error.message;
      });
    </script>
  </body>
</html>`;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    if (request.method === "GET" && url.pathname === "/") {
      return send(response, 200, html(), "text/html; charset=utf-8");
    }
    if (request.method === "GET" && url.pathname === "/api/prospects") {
      return send(response, 200, JSON.stringify(await readJson(prospectsFile)), "application/json");
    }
    if (request.method === "GET" && url.pathname === "/api/summary") {
      const [prospects, tracker] = await Promise.all([readJson(prospectsFile), readTracker()]);
      const trackerEntries = Math.max(0, tracker.trim().split("\n").length - 1);
      const recordedIds = prospects.filter(prospect => isRecorded(tracker, prospect)).map(prospect => prospect.id);
      return send(response, 200, JSON.stringify({ prospectCount: prospects.length, trackerEntries, recordedIds }), "application/json");
    }
    if (request.method === "POST" && url.pathname === "/api/record") {
      const body = await readBody(request);
      const prospects = await readJson(prospectsFile);
      const prospect = prospects.find(item => item.id === body.id);
      if (!prospect) return send(response, 404, "Unknown prospect");
      if (body.action !== "commented") return send(response, 400, "Unsupported action");
      const tracker = await readTracker();
      if (isRecorded(tracker, prospect)) {
        return send(response, 200, JSON.stringify({ ok: true, duplicate: true }), "application/json");
      }
      await appendFile(trackerFile, `${trackerRow(prospect, body.action, body.notes)}\n`);
      return send(response, 200, JSON.stringify({ ok: true }), "application/json");
    }
    return send(response, 404, "Not found");
  } catch (error) {
    return send(response, 500, error.message);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TenantProof outreach dashboard: http://127.0.0.1:${port}`);
  console.log("Press Ctrl+C to stop it.");
});
