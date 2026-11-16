#!/usr/bin/env node
/* ESL Bomb Squad play-tester. INTERNAL TESTING ONLY, not part of the game.

   Two copies of a local model (default: wd-thinking on llamaForge) play the game the way a pair of
   students does: the DEFUSER sees only the bomb, the EXPERT sees only the manual, and they can only
   talk. The script drives a headless Chrome, turns each screen into text for the model, carries out
   the model's presses, and writes a report of what happened and what the players found confusing.

   No npm packages: Node 22+ (built-in fetch and WebSocket) and google-chrome.
   Usage: node tools/playtest/playtest.mjs --help                                            */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, "../../web");

/* ---------- options ---------- */
const REPORTS = path.join(HERE, "reports"), PIDFILE = path.join(HERE, "run.pid");
let argv = process.argv.slice(2);
const CMD = ["start", "stop", "status", "resume", "log"].includes(argv[0]) ? argv.shift() : "";
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const runDirs = () => fs.existsSync(REPORTS) ? fs.readdirSync(REPORTS).map((d) => path.join(REPORTS, d)).filter((d) => fs.existsSync(path.join(d, "state.json"))).sort() : [];
const alive = () => { const pid = Number(readJson(PIDFILE, {}).pid); if (!pid) return 0; try { process.kill(pid, 0); return pid; } catch { return 0; } };
/* --resume [folder]: carry on a run that was stopped. Its options come from the run itself. */
let RESUME = null;
{ const i = argv.indexOf("--resume");
  if (i >= 0) { const given = argv[i + 1] && !argv[i + 1].startsWith("--") ? path.resolve(argv[i + 1]) : null;
    const dir = given || runDirs().filter((d) => !readJson(path.join(d, "state.json"), {}).finished).pop();
    if (!dir || !fs.existsSync(path.join(dir, "state.json"))) { console.error("There is no stopped run to carry on. Start a new one."); process.exit(2); }
    RESUME = { dir, state: readJson(path.join(dir, "state.json"), {}) }; argv = [...RESUME.state.argv, "--out", dir]; } }
const opt = (name, dflt) => { const i = argv.indexOf("--" + name); return i < 0 ? dflt : (argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true); };
if (argv.includes("--help") || argv.includes("-h")) {
  console.log(`ESL Bomb Squad play-tester (internal)

  start [options]        run in the background (it keeps going after you close the terminal)
  stop                   stop the background run (the bomb being played is thrown away)
  resume                 carry on the last stopped run in the background: finished bombs are kept,
                         and the bomb that was being played starts again from its beginning
  status                 show how far the run has got
  log                    follow the talk of the background run (Ctrl-C stops watching, not the run)
  (no word)              run here in this terminal; Ctrl-C stops it; --resume carries on a stopped run

  --list                 list module names and missions, then stop
  --modules a,b,c        test these modules, each alone on its own bomb (names or parts of names)
  --all                  test every module, each alone on its own bomb   (default)
  --bomb a,b,c           one bomb carrying these modules together
  --mission 3            play campaign mission 3 (or 1,2,5)
  --missions             play all campaign missions
  --fun                  turn Fun mode on
  --timer 600            free-play timer in seconds: 120 180 300 420 600 (default 600)
  --repeat 2             play every bomb this many times (each bomb is random, so more is surer)
  --talk 5               game seconds charged for each thing a player says (default 5)
  --turns 24             most Defuser turns per module on the bomb (default 24)
  --model wd-thinking    model name                (or env PLAYTEST_MODEL)
  --api URL              OpenAI-style base URL     (or env PLAYTEST_API, default http://localhost:1234/v1)
  --out DIR              report folder (default tools/playtest/reports/<time>)
  --peek                 only print what each player would see at the start (no model calls);
                         add --do '[{"click":1},{"watch":3000}]' to try actions by hand
  --quiet                do not print the talk as it happens`);
  process.exit(0);
}
const API = opt("api", process.env.PLAYTEST_API || "http://localhost:1234/v1");
const MODEL = opt("model", process.env.PLAYTEST_MODEL || "wd-thinking");
const TALK_S = Number(opt("talk", 5));
const TURNS = Number(opt("turns", 24));
const REPEAT = Math.max(1, Number(opt("repeat", 1)) || 1);
const TIMER = Number(opt("timer", 600));
const FUN = !!opt("fun", false);
const QUIET = !!opt("quiet", false);
const stamp = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().replace("T", "_").replace(/:/g, "-").slice(0, 19); /* local time */
const OUT = path.resolve(opt("out", path.join(REPORTS, stamp)));
const say = (...a) => { if (!QUIET) console.log(...a); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- static server for web/ ---------- */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".jsx": "text/plain; charset=utf-8", ".css": "text/css", ".png": "image/png", ".json": "application/json" };
const startServer = () => new Promise((resolve) => {
  const srv = http.createServer((req, res) => {
    const p = path.normalize(path.join(WEB, decodeURIComponent(req.url.split("?")[0])));
    if (!p.startsWith(WEB)) { res.writeHead(403).end(); return; }
    fs.readFile(p.endsWith(path.sep) ? p + "index.html" : p, (err, data) => {
      if (err) { res.writeHead(404).end("not found"); return; }
      res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream", "cache-control": "no-store" }).end(data);
    });
  });
  srv.listen(0, "127.0.0.1", () => resolve(srv));
});

/* ---------- Chrome over the DevTools protocol ---------- */
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Set();
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
      if (m.id) { const p = this.pending.get(m.id); if (!p) return; this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else for (const h of this.handlers) h(m); }); }
  send(method, params = {}, sessionId) { const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params, sessionId })); }); }
  waitFor(pred, ms) { return new Promise((res) => { const h = (m) => { if (pred(m)) { this.handlers.delete(h); clearTimeout(t); res(true); } };
    const t = setTimeout(() => { this.handlers.delete(h); res(false); }, ms); this.handlers.add(h); }); }
}
const within = (p, ms, what) => Promise.race([p, sleep(ms).then(() => { throw new Error("timed out: " + what); })]);

const launchChrome = async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "eslbomb-playtest-"));
  const bin = process.env.CHROME || "google-chrome";
  const proc = spawn(bin, ["--headless=new", "--remote-debugging-port=0", "--user-data-dir=" + dir, "--no-first-run", "--disable-gpu", "--mute-audio", "--window-size=1200,1600", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const url = await within(new Promise((res, rej) => { let buf = "";
    proc.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) res(m[1]); });
    proc.on("exit", () => rej(new Error("Chrome exited: " + buf.slice(-300)))); }), 20000, "Chrome start");
  const ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", () => rej(new Error("cannot reach Chrome"))); });
  return { cdp: new CDP(ws), close: () => { try { ws.close(); } catch {} proc.kill(); setTimeout(() => fs.rmSync(dir, { recursive: true, force: true }), 500); } };
};

/* Runs inside the page. Turns what is on screen into text and numbers every thing that can be pressed. */
const PAGE_HELPERS = String.raw`(() => {
  const SKIP = new Set(["STYLE","SCRIPT","LINK","NOSCRIPT","META","HEAD"]);
  const rgb = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ""); if (!m) return null; const p = m[1].split(/[ ,\/]+/).map(Number); return (p.length > 3 && p[3] < 0.5) ? null : p; };
  const colorName = (s, allowWhite) => { const c = rgb(s); if (!c) return null; const [r,g,b] = c.map(v => v/255), mx = Math.max(r,g,b), mn = Math.min(r,g,b), l = (mx+mn)/2, d = mx-mn;
    if (d < 0.18) return allowWhite && l > 0.85 ? "white" : null;
    let h = mx === r ? ((g-b)/d)%6 : mx === g ? (b-r)/d+2 : (r-g)/d+4; h = (h*60+360)%360;
    if (h < 15 || h >= 345) return l > 0.72 ? "pink" : "red"; if (h < 45) return l < 0.38 ? "brown" : "orange"; if (h < 70) return "yellow"; if (h < 165) return "green";
    if (h < 195) return "light blue"; if (h < 255) return "blue"; if (h < 290) return "purple"; return "pink"; };
  const bgOf = (el, allowWhite) => { const cs = getComputedStyle(el); return colorName(cs.backgroundColor, allowWhite) || (cs.backgroundImage.includes("gradient") ? colorName(cs.backgroundImage, allowWhite) : null); };
  const vis = (el) => { const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const pressable = (el) => { if (["BUTTON","INPUT","SELECT","TEXTAREA","A"].includes(el.tagName)) return true;
    return getComputedStyle(el).cursor === "pointer" && !(el.parentElement && getComputedStyle(el.parentElement).cursor === "pointer"); };
  /* Every picture in the game is drawn by a PX.something(recipe) call. Remember each recipe, so a
     picture can be described by exactly what was drawn, with no change to the game. */
  const PIC = window.__ptPics || (window.__ptPics = new Map());
  const val = (v) => v == null ? "none" : Array.isArray(v) ? "(" + v.map(val).join("; ") + ")" : typeof v === "object" ? Object.entries(v).filter(([k, x]) => x != null && typeof x !== "function" && k !== "id" && k !== "sick" && !(typeof x === "number" && !Number.isInteger(x))).map(([k, x]) => k + "=" + val(x)).join(", ") : String(v);
  if (window.PX && !PX.__pt) { PX.__pt = true;
    for (const k of Object.keys(PX)) { const f = PX[k]; if (typeof f !== "function" || ["sprite","mirror","blob","render","shapes","paint"].includes(k)) continue;
      const w = function (...a) { const r = f.apply(this, a); const u = typeof r === "string" ? r : r && typeof r.url === "string" ? r.url : ""; if (u.startsWith("data:")) PIC.set(u, { name: k, args: a.map(val) }); return r; };
      PX[k] = Object.assign(w, f); } }
  const picture = (img) => { let d = img.alt || ""; const p = PIC.get(img.getAttribute("src"));
    if (p) { const low = d.toLowerCase(); const args = p.args.filter(a => a !== "");
      if (!args.length ? !d : !args.every(a => low.includes(a.toLowerCase()))) d = (d ? d + " — " : "") + p.name + (args.length ? ": " + args.join(", ") : ""); }
    return d ? " [picture: " + d + "] " : " [picture with no description] "; };
  /* Sounds: the game's own sound effects by name, and any other beep a module makes. */
  const HEARD = window.__ptHeard || (window.__ptHeard = []);
  if (window.SFX && !SFX.__pt) { SFX.__pt = true; let inside = 0, last = 0;
    const NAMES = { strike: "a low buzz (the strike sound)", defuse: "a short happy tune (a module is defused)", win: "a winning tune", boom: "an explosion", unlockFinale: "an unlocking sound", alarm: "an alarm clock ringing", needy: "three warning buzzes", lights: "a low hum", ok: "a short high beep" };
    for (const k of Object.keys(SFX)) { const f = SFX[k]; if (typeof f !== "function" || ["unlock","isMuted","setMuted"].includes(k)) continue;
      SFX[k] = (...a) => { if (NAMES[k] && HEARD[HEARD.length - 1] !== NAMES[k]) HEARD.push(NAMES[k]); inside++; try { return f(...a); } finally { inside--; } }; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) { const make = AC.prototype.createOscillator; AC.prototype.createOscillator = function () { if (!inside && Date.now() - last > 400) { last = Date.now(); HEARD.push("a beep from a module"); } return make.apply(this, arguments); }; } }
  const heard = () => HEARD.splice(0);
  let hide = "";
  const hidden = (el) => SKIP.has(el.tagName) || (hide && el.matches(hide)) || !vis(el);
  const text = (node) => { if (node.nodeType === 3) return node.textContent; if (node.nodeType !== 1 || hidden(node)) return "";
    if (node.tagName === "IMG") return picture(node);
    if (node.tagName === "BR") return " "; const d = getComputedStyle(node).display;
    const t = [...node.childNodes].map(text).join(""); return d.startsWith("inline") && d !== "inline-block" && d !== "inline-flex" ? t : " " + t + " "; };
  const clean = (s) => s.replace(/\s+/g, " ").trim();
  const hasPressable = (el) => [...el.querySelectorAll("*")].some(c => !hidden(c) && pressable(c));
  const inlineOnly = (el) => [...el.querySelectorAll("*")].every(c => { const d = getComputedStyle(c).display; return d.startsWith("inline") || d === "contents" || d === "none"; });
  const flags = (el) => { const out = []; const cls = typeof el.className === "string" ? el.className : "";
    for (const w of ["active","selected","pressed","cut","done","locked","correct","wrong","on","off","open","lit"]) if (new RegExp("(^|[\\s-])" + w + "($|\\s)").test(cls)) out.push(w);
    if (el.disabled) out.push("cannot press"); return out; };
  const snap = (hideSel) => { hide = hideSel || ""; let n = 0, modules = 0;
    document.querySelectorAll("[data-pt]").forEach(e => e.removeAttribute("data-pt"));
    /* walk() gives a list of items; an item is a line of text or a group of items. Short groups are
       joined into one line, so things that sit together on screen stay together in the text. */
    const pack = (items, force) => { items = items.filter(Boolean); if (!items.length) return []; if (items.length === 1 && !force) return items;
      if (!force && items.every(i => typeof i === "string") && items.join(" · ").length <= 130) return [items.join(" · ")]; return [{ group: items }]; };
    const walk = (node) => {
      if (node.nodeType === 3) { const t = clean(node.textContent); return t ? [t] : []; }
      if (node.nodeType !== 1 || hidden(node)) return [];
      const el = node, tag = el.tagName, cl = el.classList;
      if (cl.contains("timer-display")) return ["Clock: " + clean(text(el))];
      if (cl.contains("strikes-display")) return ["Strikes so far: " + el.querySelectorAll(".strike-indicator.active").length + " of 3"];
      if (tag === "IMG" && !pressable(el)) return [clean(text(el))];
      if (pressable(el) && !hasPressable(el)) { el.setAttribute("data-pt", ++n);
        const kind = tag === "INPUT" ? (el.type === "range" ? "slider" : "text box") : tag === "SELECT" ? "choice list" : tag === "IMG" ? "picture" : /^H[1-6]$/.test(tag) ? "section title" : "button";
        const bits = [kind]; const t = clean(text(el)); if (t) bits.push(JSON.stringify(t)); if (el.getAttribute("aria-label")) bits.push("(" + el.getAttribute("aria-label") + ")");
        if (tag === "INPUT" || tag === "TEXTAREA") { bits.push("value=" + JSON.stringify(el.value)); if (el.type === "range") bits.push("min=" + el.min, "max=" + el.max); if (el.placeholder) bits.push("hint=" + JSON.stringify(el.placeholder)); }
        if (tag === "SELECT") bits.push("value=" + JSON.stringify(el.value), "choices=" + JSON.stringify([...el.options].map(o => o.textContent)));
        const c = kind === "button" || kind === "picture" ? (bgOf(el, true) || colorName(getComputedStyle(el).borderTopColor, false)) : null; if (c) bits.push("color=" + c);
        const f = flags(el); if (f.length) bits.push("(" + f.join(", ") + ")");
        return ["[#" + n + " " + bits.join(" ") + "]"]; }
      if (tag === "TR" && !hasPressable(el)) return [[...el.children].map(c => clean(text(c))).join(" | ")];
      if (!el.children.length || (!hasPressable(el) && inlineOnly(el))) { const t = clean(text(el));
        if (t) return [(/^H[1-6]$/.test(tag) ? "## " : "") + t + (flags(el).length && t.length < 40 ? " (" + flags(el).join(", ") + ")" : "")];
        const r = el.getBoundingClientRect(), c = bgOf(el, true);
        if (c && r.width >= 6 && r.width <= 220 && r.height >= 6 && r.height <= 220) return ["(" + c + (parseFloat(getComputedStyle(el).borderTopLeftRadius) >= Math.min(r.width, r.height) * 0.4 ? " light" : " block") + (flags(el).length ? ", " + flags(el).join(", ") : "") + ")"];
        return []; }
      const kids = [...el.childNodes].flatMap(walk);
      if (cl.contains("bomb-container")) { const c = colorName(getComputedStyle(el).borderTopColor, true); return pack(["THE BOMB" + (c ? " (the bomb's color is " + c + ")" : ""), ...kids], true); }
      if (cl.contains("module-wrapper")) { modules++; return pack(["--- MODULE " + modules + (cl.contains("success") ? " (DEFUSED)" : cl.contains("locked-module") ? " (LOCKED)" : "") + " ---", ...kids], true); }
      if (tag === "TABLE" || tag === "TBODY" || tag === "THEAD" || tag === "UL" || tag === "OL") return kids.length > 1 ? [{ group: kids }] : kids;
      return pack(kids); };
    const out = []; const render = (items, d) => { for (const i of items) { if (typeof i === "string") out.push("  ".repeat(d) + i); else render(i.group, d + 1); } };
    render(walk(document.body), -1 < 0 ? 0 : 0);
    const min = Math.min(...out.map(l => l.search(/\S/)), 99);
    return out.map(l => l.slice(min)).join("\n"); };
  const el = (n) => document.querySelector('[data-pt="' + n + '"]');
  const point = (n) => { const e = el(n); if (!e) return null; e.scrollIntoView({ block: "center", inline: "center" }); const r = e.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2;
    const top = document.elementFromPoint(x, y); const ok = !!top && (top === e || e.contains(top) || top.contains(e));
    return { x, y, ok, cover: ok ? "" : (top ? top.tagName.toLowerCase() + "." + String(top.className).split(" ")[0] : "nothing"), disabled: !!e.disabled }; };
  const setValue = (n, v) => { const e = el(n); if (!e) return "no such thing #" + n; if (e.disabled) return "it cannot be changed now";
    const proto = e.tagName === "SELECT" ? HTMLSelectElement.prototype : e.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    if (e.tagName === "SELECT") { const o = [...e.options].find(o => o.value === String(v) || o.textContent.trim() === String(v)); if (!o) return "no such choice"; v = o.value; }
    e.focus(); Object.getOwnPropertyDescriptor(proto, "value").set.call(e, String(v));
    e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); return "ok"; };
  const clickText = (sel, re) => { const e = [...document.querySelectorAll(sel)].find(x => new RegExp(re, "i").test(x.textContent)); if (!e) return false; e.click(); return true; };
  let downOn = null;
  const mouse = (type, x, y) => { const t = document.elementFromPoint(x, y); if (!t) return;
    const o = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, buttons: type === "mousePressed" ? 1 : 0, pointerId: 1, pointerType: "mouse", isPrimary: true, view: window };
    if (type === "mousePressed") { downOn = t; t.dispatchEvent(new PointerEvent("pointerdown", o)); t.dispatchEvent(new MouseEvent("mousedown", o)); if (t.focus) t.focus(); }
    else { t.dispatchEvent(new PointerEvent("pointerup", o)); t.dispatchEvent(new MouseEvent("mouseup", o));
      if (downOn && (downOn === t || downOn.contains(t) || t.contains(downOn))) { const c = downOn.contains(t) ? downOn : t; const b = c.closest("button,a,input,select,label") || c; if (!b.disabled) b.dispatchEvent(new MouseEvent("click", o)); }
      downOn = null; } };
  window.__pt = { snap, point, setValue, clickText, mouse, heard };
  return true; })()`;

class Tab {
  constructor(cdp, sessionId, name) { this.cdp = cdp; this.sid = sessionId; this.name = name; this.virtual = false; this.errors = [];
    cdp.handlers.add((m) => { if (m.sessionId !== sessionId) return;
      if (m.method === "Runtime.exceptionThrown") this.errors.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").split("\n")[0]);
      if (m.method === "Log.entryAdded" && m.params.entry.level === "error" && !/favicon|fonts\.g/.test(m.params.entry.url || "")) this.errors.push(m.params.entry.text + " " + (m.params.entry.url || "")); }); }
  static async open(cdp, url, name) {
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const t = new Tab(cdp, sessionId, name); t.targetId = targetId;
    for (const d of ["Page", "Runtime", "Log"]) await t.send(d + ".enable");
    await t.send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 1600, deviceScaleFactor: 1, mobile: false });
    await t.goto(url); return t; }
  send(method, params) { return this.cdp.send(method, params, this.sid); }
  async close() { await this.cdp.send("Target.closeTarget", { targetId: this.targetId }).catch(() => {}); }
  async goto(url) {
    const loaded = this.cdp.waitFor((m) => m.sessionId === this.sid && m.method === "Page.loadEventFired", 30000);
    await this.send("Page.navigate", { url }); await loaded;
    for (let i = 0; i < 100; i++) { if (await this.eval(`!!document.querySelector(".menu-screen")`)) return; await sleep(200); }
    throw new Error("the game did not load (" + this.errors.join("; ") + ")"); }
  async eval(expression) { const r = await within(this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }), 15000, "page script");
    if (r.exceptionDetails) throw new Error("page script failed: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; }
  async helpers() { if (!(await this.eval(`!!window.__pt`))) await this.eval(PAGE_HELPERS); }
  async snap(hide) { await this.helpers(); return this.eval(`__pt.snap(${JSON.stringify(hide)})`); }
  /* Game time. Once frozen, the page clock only moves when pass() is called, so the bomb's timer
     counts talking and pressing, not how long the model takes to think. */
  async freeze() { await this.send("Emulation.setVirtualTimePolicy", { policy: "pause" }); this.virtual = true; }
  async pass(ms) { if (!this.virtual) return sleep(ms);
    const done = this.cdp.waitFor((m) => m.sessionId === this.sid && m.method === "Emulation.virtualTimeBudgetExpired", 15000);
    await this.send("Emulation.setVirtualTimePolicy", { policy: "advance", budget: ms }); if (!(await done)) throw new Error("game clock did not move"); }
  /* Let game time pass a second at a time and note what appears or goes on the screen meanwhile. */
  async watch(ms, hide, changes) { const norm = (t) => t.split("\n").map((l) => l.replace(/#\d+ /g, "").trim()).filter((l) => l && !l.startsWith("Clock:"));
    let before = norm(await this.snap(hide)); let t = 0;
    while (t < ms) { const step = Math.min(1000, ms - t); await this.pass(step); t += step;
      const now = norm(await this.snap(hide)); const a = [...now], b = [...before];
      for (const l of before) { const i = a.indexOf(l); if (i >= 0) a.splice(i, 1); } for (const l of now) { const i = b.indexOf(l); if (i >= 0) b.splice(i, 1); }
      for (const l of b) changes.push(`gone: ${l}`); for (const l of a) changes.push(`new: ${l}`); before = now; }
    if (changes.length > 40) changes.splice(0, changes.length - 40); }
  async heard() { await this.helpers(); return this.eval(`__pt.heard()`); }
  /* Presses are made inside the page, on whatever is on top at that point (so a covered button is
     not pressed). Chrome's own mouse events do not finish on a tab with a frozen clock or in the background. */
  async mouse(type, x, y) { if (type === "mouseMoved") return; await this.eval(`__pt.mouse(${JSON.stringify(type)}, ${x}, ${y})`); }
  /* one action from a player; returns a short note the player sees next turn */
  async act(a) {
    await this.helpers();
    const n = a.click ?? a.hold ?? a.type ?? a.set;
    if (a.wait != null) { await this.pass(Math.min(Math.max(Number(a.wait) || 0, 100), 20000)); return `waited ${a.wait} ms`; }
    if (n == null) return "unknown action " + JSON.stringify(a);
    if (a.type != null || a.set != null) { const r = await this.eval(`__pt.setValue(${Number(n)}, ${JSON.stringify(a.type != null ? (a.text ?? "") : a.value)})`); await this.pass(300); return `#${n}: ${r}`; }
    const p = await this.eval(`__pt.point(${Number(n)})`);
    if (!p) return `#${n}: there is no such thing on the screen now`;
    await this.mouse("mouseMoved", p.x, p.y); await this.mouse("mousePressed", p.x, p.y);
    await this.pass(a.hold != null ? Math.min(Math.max(Number(a.ms) || 1000, 100), 30000) : 60);
    await this.mouse("mouseReleased", p.x, p.y); await this.pass(700);
    return `#${n}: ${a.hold != null ? "held" : "pressed"}` + (p.disabled ? " (but it cannot be pressed now)" : "") + (p.ok ? "" : ` (something is on top of it: ${p.cover})`); }
  async shot(file) { try { const r = await within(this.send("Page.captureScreenshot", { format: "png" }), 4000, "screenshot"); fs.writeFileSync(file, Buffer.from(r.data, "base64")); } catch {} }
}

/* ---------- the model ---------- */
let calls = 0, callMs = 0, empties = 0;
const ask = async (system, user, tries = 3) => {
  let last = "";
  for (let i = 0; i < tries; i++) {
    const t0 = Date.now();
    try {
      const res = await fetch(API + "/chat/completions", { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(600000),
        body: JSON.stringify({ model: MODEL, temperature: 0.3, max_tokens: 14000, messages: [{ role: "system", content: system }, { role: "user", content: user + (i ? "\n\nYour last reply was empty or was not one valid JSON object. Think for a short time only, then reply with ONLY the JSON object." : "") }] }) });
      if (!res.ok) throw new Error("model server said " + res.status + " " + (await res.text()).slice(0, 200));
      const text = ((await res.json()).choices?.[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/g, "");
      calls++; callMs += Date.now() - t0; last = text;
      const a = text.indexOf("{"), b = text.lastIndexOf("}");
      if (a >= 0 && b > a) return JSON.parse(text.slice(a, b + 1));
      empties++;
    } catch (e) { last = String(e.message || e); if (/fetch failed|ECONNREFUSED/.test(last + (e.cause?.code || ""))) { if (i === tries - 1) throw new Error(`cannot reach the model at ${API} (${last})`); await sleep(5000); } }
  }
  return { say: "", actions: [], notes: "", problem: "", _bad: last.slice(0, 300) };
};

const RULES = `You are helping to TEST a classroom game called ESL Bomb Squad. Two students play: the DEFUSER sees a bomb with small puzzle modules on it, and the EXPERT has the manual. They cannot see each other's screen. They can only talk in English. A wrong press is a strike; three strikes or a clock at 0:00 and the bomb explodes.
Play honestly: use ONLY what your own screen shows and what your partner tells you. Never invent what the other screen says. Talk like a careful student: short, plain sentences. Decide quickly: do not think for long.
Your screen is given as text. A line like [#7 button "CUT" color=red] is something you can use; 7 is its number. [picture: cat] is a picture of a cat. A longer one such as [picture: monster: eyes=3, arms=robot, color=green] lists what the picture shows; say it in plain English, the way a child who sees the picture would. You can hear: the sounds you hear are listed for you. Things joined by " · " on one line sit together on the screen, and indented lines belong to the line above them. (green light) is a small colored light.`;
const REPLY = (who, extra) => `Reply with ONE JSON object and nothing else:
{"say": "what you say to the ${who === "DEFUSER" ? "Expert" : "Defuser"} now, or \\"\\" to say nothing",
 "actions": [ ... ],
 "notes": "your pencil-and-paper notes. You will get them back next turn, so keep everything you still need.",
 "problem": "\\"\\" or one sentence about something broken, unclear or confusing in the GAME or the MANUAL (not about your partner)"}
Actions you can use, in order: {"click": N}   {"type": N, "text": "abc"}   {"set": N, "value": 5} for a slider or choice list   {"hold": N, "ms": 2000}   {"wait": 1000}${extra}
The numbers change every turn, so only use numbers from the screen shown in this message.`;
const DEFUSER = `${RULES}

You are the DEFUSER. You see the bomb. You do not have the manual and you do not know the rules of any module, so tell the Expert what you see, answer their questions, and do what they tell you. Do not press things to see what happens.
${REPLY("DEFUSER", `   {"give_up": "why"}
Use give_up only when a module cannot be played from this text at all (for example a picture you must describe has no description). Say exactly what you could not see.
Some modules move on their own: "WHAT CHANGED ON THE BOMB" lists what appeared or went while you were talking or waiting. Use {"wait": ms} to let time pass and watch.`)}`;
const EXPERT = `${RULES}

You are the EXPERT. You see the manual. You cannot see the bomb, so ask the Defuser what you need to know, read the right part of the manual, and tell them exactly what to do. The manual has one section for each module: click a section title to open it. Some sections have boxes and buttons for you to use.
${REPLY("EXPERT", "")}`;

const HIDE_BOMB = ".test-tools,.mute-btn,.manual-toggle,.manual-overlay,.back-btn,.module-status-indicator,.confetti-bg,.explosion-bg";
const HIDE_MANUAL = ".back-btn";
const bombState = (tab) => tab.eval(`(() => { const over = document.querySelector(".game-over-screen"); const t = document.querySelector(".timer-display");
  return { over: !!over, win: !!over && over.classList.contains("win"), title: over ? over.querySelector("h1").textContent : "",
    time: t ? t.childNodes[0].textContent + ":" + t.childNodes[2].textContent : "", strikes: document.querySelectorAll(".strike-indicator.active").length,
    modules: [...document.querySelectorAll(".module-wrapper")].map(m => m.classList.contains("success") ? "defused" : m.classList.contains("locked-module") ? "locked" : "active"), playing: !!document.querySelector(".bomb-container") }; })()`);

/* ---------- setting a bomb up (done by script, not by the model) ---------- */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const catalog = async (tab) => {
  await tab.helpers();
  await tab.eval(`__pt.clickText(".menu-btn", "FREE PLAY")`); await sleep(300);
  const modules = await tab.eval(`[...document.querySelectorAll(".module-toggle")].map(b => ({ name: b.querySelector(".toggle-name").textContent, level: b.querySelector(".toggle-diff").textContent }))`);
  await tab.eval(`__pt.clickText(".back-btn", "Back")`); await sleep(200);
  await tab.eval(`__pt.clickText(".menu-btn", "MISSIONS")`); await sleep(300);
  const missions = await tab.eval(`[...document.querySelectorAll(".mission-card")].map(b => ({ num: b.querySelector(".mission-num").textContent, name: b.querySelector(".mission-name").textContent, meta: b.querySelector(".mission-meta").textContent }))`);
  await tab.eval(`__pt.clickText(".back-btn", "Back")`); await sleep(200);
  return { modules, missions };
};
const pick = (list, want) => { const w = slug(want); const hit = list.filter((m) => slug(m.name) === w); const part = list.filter((m) => slug(m.name).includes(w));
  if (hit.length === 1) return hit[0]; if (part.length === 1) return part[0];
  throw new Error(`"${want}" matches ${part.length ? part.map((m) => m.name).join(", ") : "no module"}. Use --list to see the names.`); };
const startFreePlay = async (tab, names) => {
  await tab.eval(`__pt.clickText(".menu-btn", "FREE PLAY")`); await sleep(300);
  const ok = await tab.eval(`(() => { const want = ${JSON.stringify(names)}; const tog = [...document.querySelectorAll(".module-toggle")]; const nm = (b) => b.querySelector(".toggle-name").textContent;
    tog.filter(b => want.includes(nm(b)) && !b.classList.contains("active")).forEach(b => b.click()); return true; })()`);
  await sleep(200);
  await tab.eval(`(() => { const want = ${JSON.stringify(names)}; [...document.querySelectorAll(".module-toggle")].filter(b => !want.includes(b.querySelector(".toggle-name").textContent) && b.classList.contains("active")).forEach(b => b.click());
    const s = document.querySelector(".module-slider"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(s, ${names.length}); s.dispatchEvent(new Event("input", { bubbles: true })); })()`);
  await sleep(200);
  const mm = Math.floor(TIMER / 60) + ":" + String(TIMER % 60).padStart(2, "0");
  await tab.eval(`(() => { const b = [...document.querySelectorAll(".timer-btn")]; const find = (t) => b.find(x => x.textContent.trim() === t); (find(${JSON.stringify(mm)}) || find("10:00")).click();
    b.find(x => /^ALL OPEN$/.test(x.textContent.trim())); const fun = [...document.querySelectorAll(".setting-group")].find(g => g.querySelector("label").textContent === "FUN MODE"); fun.querySelectorAll("button")[${FUN ? 1 : 0}].click(); })()`);
  await sleep(200);
  const got = await tab.eval(`({ n: document.querySelector(".setting-group .module-slider").value, sel: [...document.querySelectorAll(".module-toggle.active .toggle-name")].map(e => e.textContent) })`);
  if (Number(got.n) !== names.length || got.sel.length !== names.length) throw new Error("could not set the bomb up: " + JSON.stringify(got));
  await tab.eval(`document.querySelector(".start-game-btn").click()`);
  return ok;
};
const startMission = async (tab, num) => {
  await tab.eval(`__pt.clickText(".menu-btn", "MISSIONS")`); await sleep(300);
  if (FUN) { await tab.eval(`__pt.clickText(".fun-row button", "FUN MODE: OFF")`); await sleep(100); }
  const ok = await tab.eval(`(() => { const c = [...document.querySelectorAll(".mission-card")].find(b => b.querySelector(".mission-num").textContent.trim() === ${JSON.stringify(String(num))}); if (!c) return false; c.click(); return true; })()`);
  if (!ok) throw new Error("there is no mission " + num);
};

/* ---------- the manual pages, for the referee ---------- */
const letters = (t) => t.replace(/[^A-Za-z ]/g, "").trim().toLowerCase();
const emojiOf = (t) => (t.trim().match(/^[^A-Za-z0-9\s#]+/) || [""])[0].replace(/️/g, "");
/* find the manual section for a module heading: same name, or same picture and same first letters */
const matchSection = (titles, heading) => { const h = letters(heading), e = emojiOf(heading);
  return titles.find((t) => letters(t) === h) || titles.filter((t) => emojiOf(t) === e && letters(t).slice(0, 3) === h.slice(0, 3)).sort((x, y) => Math.abs(letters(x).length - h.length) - Math.abs(letters(y).length - h.length))[0]
    || titles.find((t) => letters(t).slice(0, 5) === h.slice(0, 5)) || null; };
const readSection = async (book, title) => {
  await book.helpers();
  const ok = await book.eval(`(() => { const h = [...document.querySelectorAll(".manual-section h2")].find(h => h.textContent.replace(/[▶▼]\s*$/, "").trim() === ${JSON.stringify(title)}); if (!h) return false; if (!/▼\s*$/.test(h.textContent)) h.click(); return true; })()`);
  if (!ok) return ""; await sleep(250);
  const lines = (await book.snap(HIDE_MANUAL)).split("\n"); const i = lines.findIndex((l) => l.includes("section title") && l.includes("▼"));
  if (i < 0) return ""; let j = i + 1; while (j < lines.length && !lines[j].includes('section title "')) j++;
  return title + "\n" + lines.slice(i + 1, j).join("\n"); };

const REFEREE = `You are the REFEREE for a test of a classroom game, ESL Bomb Squad. Two players are testing it: the DEFUSER sees the bomb, the EXPERT sees the manual, and they can only talk. You are shown BOTH screens and the talk. Your job is to find out whether the GAME and its MANUAL are correct, so work carefully and check the manual's rule against the Defuser's screen step by step.
Reply with ONE JSON object and nothing else:
{"correct_action": "what the manual says should have been done for the screen shown BEFORE the action (say 'cannot tell' if the screens do not show enough)",
 "cause": one of "game_wrong", "manual_unclear", "expert_mistake", "defuser_mistake", "could_not_see", "time", "unsure",
 "explain": "one or two sentences giving the evidence"}
Causes:
 game_wrong = the players did exactly what the manual says for this screen and the game still gave a strike (or did the right thing and nothing happened). This means a fault in the game or in the manual.
 manual_unclear = the manual can fairly be read two ways, leaves a case out, or uses words that do not match what is on the bomb.
 expert_mistake = the Expert misread the manual, did the sum wrong, or gave an order the manual does not support.
 defuser_mistake = the Defuser described the screen wrongly, or pressed something different from what the Expert said.
 could_not_see = the text of the Defuser's screen is missing something a real player would see or hear, so the players could not have known.
 time = they ran out of time or turns although what they did was right.
 unsure = you cannot decide; say what is missing.`;

/* ---------- one bomb, played by the two models ---------- */
const playBomb = async ({ label, bomb, manual, book, setup, moduleCount, dir }) => {
  const problems = [], talk = [], rulings = [], changes = []; const t0 = Date.now(), calls0 = calls, empty0 = empties;
  const live = path.join(dir, "transcript.md"); fs.writeFileSync(live, `# ${label}\n\n(in progress)\n\n`);
  const log = { lines: [], push(s) { this.lines.push(s); fs.appendFileSync(live, s + "\n\n"); }, join(x) { return this.lines.join(x); } };
  const note = (who, s) => { log.push(`**${who}:** ${s}`); say(`  ${who}: ${s}`); };
  await bomb.helpers(); await manual.goto(manual.base); await manual.helpers();
  await manual.eval(`__pt.clickText(".menu-btn", "EXPERT MANUAL")`);
  await setup(bomb); await sleep(400);
  await bomb.freeze(); await bomb.pass(4600); /* the 3-2-1-GO countdown */
  let st = await bombState(bomb);
  if (!st.playing) throw new Error("the bomb did not start");
  await bomb.heard(); /* drop the countdown sounds */
  if (opt("peek")) { /* show what the players would see, without calling the model */
    console.log("\n===== DEFUSER SCREEN =====\n" + await bomb.snap(HIDE_BOMB));
    if (opt("do")) { for (const a of JSON.parse(opt("do"))) console.log("  do " + JSON.stringify(a) + " → " + (a.watch ? (await bomb.watch(a.watch, HIDE_BOMB, changes), "watched") : await bomb.act(a)));
      console.log("\n===== AFTER =====\n" + await bomb.snap(HIDE_BOMB) + "\nchanges: " + JSON.stringify(changes) + "\nheard: " + JSON.stringify(await bomb.heard()) + "\nstate: " + JSON.stringify(await bombState(bomb))); }
    const titles = await book.eval(`[...document.querySelectorAll(".manual-section h2")].map(h => h.textContent.replace(/[▶▼]\\s*$/, "").trim())`);
    for (const h of (await bomb.snap(HIDE_BOMB)).split("\n").filter((l) => l.trim().startsWith("## ")).map((l) => l.trim().slice(3).split(" · ")[0])) { const t = matchSection(titles, h);
      console.log(`\n===== MANUAL SECTION for "${h}" → ${t || "NOT FOUND"} =====\n` + (t ? await readSection(book, t) : "")); }
    return null; }
  const startTime = st.time; const maxTurns = TURNS * Math.max(1, moduleCount);
  /* the right manual pages for the modules on this bomb, read on a third tab the players never see */
  const pages = new Map();
  const loadPages = async (screen) => { const titles = await book.eval(`[...document.querySelectorAll(".manual-section h2")].map(h => h.textContent.replace(/[▶▼]\\s*$/, "").trim())`);
    for (const h of screen.split("\n").filter((l) => l.trim().startsWith("## ")).map((l) => l.trim().slice(3).split(" · ")[0])) { if (pages.has(h)) continue; const t = matchSection(titles, h); pages.set(h, t ? await readSection(book, t) : ""); } };
  const bombRules = await readSection(book, "💣 The Bomb").catch(() => "");
  const referee = async (what, before, after, actions, eScreen) => { await loadPages(before);
    const r = await ask(REFEREE, `WHAT HAPPENED: ${what}\n\nDEFUSER'S SCREEN BEFORE:\n${before}\n\nWHAT THE DEFUSER DID:\n${actions || "(nothing)"}\n\nDEFUSER'S SCREEN AFTER:\n${after}\n\nTHE MANUAL PAGES FOR THE MODULES ON THIS BOMB:\n${[...pages.values()].filter(Boolean).join("\n\n") || "(not found)"}\n\nTHE EXPERT'S OWN SCREEN (what the Expert had open):\n${eScreen || "(not looked at yet)"}\n\nTHE TALK:\n${talk.slice(-16).join("\n") || "(none)"}`);
    const ruling = { what, cause: String(r.cause || "unsure"), correct: String(r.correct_action || ""), explain: String(r.explain || r._bad || ""), did: actions };
    rulings.push(ruling); log.push(`> **REFEREE** on "${what}": **${ruling.cause}**. ${ruling.explain} _Correct action: ${ruling.correct}_`); say(`    REFEREE: ${ruling.cause}. ${ruling.explain}`); return ruling; };
  let dNotes = "", eNotes = "", dResult = "", eResult = "", gaveUp = null, turns = 0, bad = 0, idle = 0, stop = "", lastE = "";
  const recent = () => (talk.length ? talk.slice(-14).join("\n") : "(nobody has spoken yet)");
  const talkTime = () => bomb.watch(TALK_S * 1000, HIDE_BOMB, changes);
  while (!st.over) {
    if (++turns > maxTurns) { stop = `stopped after ${maxTurns} turns`; break; }
    const dScreen = await bomb.snap(HIDE_BOMB); const sounds = await bomb.heard(); const seen = changes.splice(0);
    if (turns === 1) fs.writeFileSync(path.join(dir, "first-screen-defuser.txt"), dScreen);
    const d = await ask(DEFUSER, `YOUR SCREEN (the bomb):\n${dScreen}\n\nWHAT CHANGED ON THE BOMB SINCE YOUR LAST LOOK:\n${seen.length ? seen.join("\n") : "(nothing)"}\n\nSOUNDS YOU HEARD:\n${sounds.length ? sounds.join(", ") : "(none)"}\n\nTHE TALK SO FAR:\n${recent()}\n\nYOUR NOTES:\n${dNotes || "(empty)"}\n\nWHAT HAPPENED WITH YOUR LAST ACTIONS:\n${dResult || "(none)"}`);
    if (d._bad) { bad++; log.push(`_Defuser gave an unreadable reply: ${d._bad}_`); if (bad >= 5) { stop = "the model kept giving unreadable replies"; break; } }
    dNotes = String(d.notes ?? dNotes); if (d.problem) { problems.push("Defuser: " + d.problem); log.push(`> Defuser noticed: ${d.problem}`); }
    const res = [], did = []; const before = st;
    for (const a of (Array.isArray(d.actions) ? d.actions : []).slice(0, 10)) {
      if (a.give_up != null) { gaveUp = String(a.give_up); break; }
      const r = a.wait != null && Number(a.wait) >= 1000 ? (await bomb.watch(Math.min(Number(a.wait), 30000), HIDE_BOMB, changes), `waited ${a.wait} ms`) : await bomb.act(a);
      res.push(r); did.push(`${JSON.stringify(a)} → ${r}`); log.push(`- Defuser does \`${JSON.stringify(a)}\` → ${r}`);
      st = await bombState(bomb); if (st.over || st.strikes > before.strikes) break; /* stop at a strike, so the referee sees exactly what caused it */ }
    if (gaveUp) { note("DEFUSER", `(gives up) ${gaveUp}`); stop = "the Defuser gave up"; }
    else if (d.say) { talk.push("Defuser: " + d.say); note("DEFUSER", d.say); if (!st.over) await talkTime(); }
    st = await bombState(bomb);
    const news = []; if (st.strikes > before.strikes) news.push(`STRIKE! (${st.strikes} of 3)`);
    st.modules.forEach((m, i) => { if (m === "defused" && before.modules[i] !== "defused") news.push(`Module ${i + 1} is DEFUSED.`); if (m === "active" && before.modules[i] === "locked") news.push(`Module ${i + 1} is now UNLOCKED.`); });
    if (news.length) { log.push(`- _${news.join(" ")}_`); say("    " + news.join(" ")); }
    if (st.strikes > before.strikes) await referee(`a strike (${st.strikes} of 3)`, dScreen, st.over ? "(the bomb exploded)" : await bomb.snap(HIDE_BOMB), did.join("\n"), lastE);
    if (gaveUp) break;
    dResult = [...res, ...news].join("\n");
    if (st.over) break;
    if (!d.say && !res.length) { if (++idle >= 3) { stop = "the Defuser did nothing three turns running"; break; } } else idle = 0;
    if (!d.say) continue; /* nothing said, so the Expert has nothing new to answer */
    const eScreen = await manual.snap(HIDE_MANUAL);
    const e = await ask(EXPERT, `YOUR SCREEN (the manual):\n${eScreen}\n\nTHE TALK SO FAR:\n${recent()}\n\nYOUR NOTES:\n${eNotes || "(empty)"}\n\nWHAT HAPPENED WITH YOUR LAST ACTIONS:\n${eResult || "(none)"}`);
    if (e._bad) { bad++; log.push(`_Expert gave an unreadable reply: ${e._bad}_`); }
    eNotes = String(e.notes ?? eNotes); if (e.problem) { problems.push("Expert: " + e.problem); log.push(`> Expert noticed: ${e.problem}`); }
    const eres = [];
    for (const a of (Array.isArray(e.actions) ? e.actions : []).slice(0, 12)) { if (a.give_up != null) continue; eres.push(await manual.act(a)); log.push(`- Expert does \`${JSON.stringify(a)}\` → ${eres[eres.length - 1]}`); }
    eResult = eres.join("\n"); lastE = await manual.snap(HIDE_MANUAL);
    if (e.say) { talk.push("Expert: " + e.say); note("EXPERT", e.say); await talkTime(); }
    else if (eres.length) talk.push("Expert: (is reading the manual)");
    st = await bombState(bomb);
  }
  await bomb.pass(1500).catch(() => {}); st = await bombState(bomb);
  await bomb.shot(path.join(dir, "end.png"));
  const outcome = st.over ? (st.win ? "DEFUSED" : "EXPLODED") : gaveUp ? "GAVE UP" : "NOT FINISHED";
  const endScreen = await bomb.snap(HIDE_BOMB).catch(() => "");
  if (outcome === "GAVE UP" || outcome === "NOT FINISHED") await referee(outcome === "GAVE UP" ? `the Defuser gave up: ${gaveUp}` : `the players did not finish (${stop})`, endScreen, endScreen, "", lastE);
  else if (outcome === "EXPLODED" && st.strikes < 3) await referee("the clock ran out", endScreen, endScreen, "", lastE);
  /* ask both players what they thought */
  const debrief = async (sys, who, notes) => { const r = await ask(sys, `The game is over. Result: ${outcome}${stop ? " (" + stop + ")" : ""}. Strikes: ${st.strikes}.\n\nTHE TALK:\n${talk.slice(-30).join("\n") || "(none)"}\n\nYOUR NOTES:\n${notes || "(empty)"}\n\nYou were the ${who}. For the game's makers, reply with ONE JSON object: {"verdict": "clear" or "ok" or "confusing" or "unplayable", "issues": ["up to 4 short sentences about anything broken, unclear or confusing in the game or manual; an empty list if all was fine"]}`);
    return { verdict: String(r.verdict || "?"), issues: Array.isArray(r.issues) ? r.issues.map(String) : [] }; };
  const dv = await debrief(DEFUSER, "DEFUSER", dNotes), ev = await debrief(EXPERT, "EXPERT", eNotes);
  const pageErrors = [...new Set([...bomb.errors.splice(0), ...manual.errors.splice(0)])];
  const result = { label, outcome, stop, gaveUp, strikes: st.strikes, turns, clock: `${startTime} → ${st.time || "end"}`, modules: st.modules, defuser: dv, expert: ev, rulings, problems: [...new Set(problems)], pageErrors, resultTitle: st.title,
    minutes: Number(((Date.now() - t0) / 60000).toFixed(1)), calls: calls - calls0, noAnswer: empties - empty0, manualFound: [...pages].map(([h, t]) => `${h}: ${t ? "found" : "NOT FOUND"}`) };
  fs.writeFileSync(live, `# ${label}\n\nResult: **${outcome}**${stop ? ` (${stop})` : ""} · strikes ${st.strikes} · ${turns} turns · clock ${result.clock} · ${result.minutes} minutes\n\n${log.join("\n\n")}\n`);
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(result, null, 2));
  return result;
};

/* ---------- report ---------- */
const CAUSE = { game_wrong: "POSSIBLE GAME FAULT", manual_unclear: "MANUAL UNCLEAR", expert_mistake: "Expert's mistake", defuser_mistake: "Defuser's mistake", could_not_see: "Tester could not see or hear it", time: "Ran out of time", unsure: "Referee unsure" };
const writeReport = (results, tot, failed) => {
  const mins = tot.minutes.toFixed(1); const calls = tot.calls;
  const icon = (r) => r.outcome === "DEFUSED" ? "✅" : r.outcome === "EXPLODED" ? "💥" : r.outcome === "GAVE UP" ? "🚫" : "⏳";
  const rel = (r) => path.relative(OUT, path.join(r.dir, "transcript.md"));
  let md = `# ESL Bomb Squad play-test\n\n${new Date().toString()}\n\nModel **${MODEL}** at ${API} · ${results.length} bombs played · ${calls} model calls (about ${calls ? (tot.minutes * 60 / calls).toFixed(0) : 0} s each) · ${mins} minutes\n\n`;
  md += `Two copies of the model play as Defuser and Expert. A third copy is the referee: after every strike it reads both screens and the right manual page and rules on the cause. The referee is a model too, so treat a ruling as a pointer to the transcript, not as proof.\n\n`;
  const all = results.flatMap((r) => (r.rulings || []).map((x) => ({ ...x, r })));
  const pick = (c) => all.filter((x) => x.cause === c);
  const errs = results.filter((r) => r.pageErrors.length);
  md += `## Look at these first\n\n`;
  const top = [...pick("game_wrong"), ...pick("manual_unclear"), ...pick("could_not_see"), ...pick("unsure")];
  if (!top.length && !errs.length && !failed.length) md += `Nothing: no page errors, and the referee blamed no strike on the game or the manual.\n`;
  for (const x of top) md += `- **${CAUSE[x.cause]}** in ${x.r.label}: ${x.explain} Correct action per the manual: ${x.correct || "?"} (\`${rel(x.r)}\`)\n`;
  for (const r of errs) md += `- **PAGE ERROR** in ${r.label}: ${r.pageErrors.join("; ")}\n`;
  for (const f of failed) md += `- **TESTER ERROR** in ${f.label}: ${f.error}\n`;
  md += `\n## Every bomb\n\n| | Bomb | Result | Strikes | Referee | Defuser says | Expert says | Turns | Clock | Min |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of results) md += `| ${icon(r)} | ${r.label} | ${r.outcome}${r.stop ? "<br>" + r.stop : ""} | ${r.strikes} | ${(r.rulings || []).map((x) => CAUSE[x.cause] || x.cause).join("<br>") || "—"} | ${r.defuser.verdict} | ${r.expert.verdict} | ${r.turns} | ${r.clock} | ${r.minutes ?? ""} |\n`;
  for (const f of failed) md += `| ⚠️ | ${f.label} | TESTER ERROR | | ${f.error} | | | | | |\n`;
  md += `\n## Details\n`;
  for (const r of results) { const items = [...(r.rulings || []).map((x) => `Referee on ${x.what}: **${CAUSE[x.cause] || x.cause}**. ${x.explain}`), ...r.defuser.issues.map((s) => "Defuser: " + s), ...r.expert.issues.map((s) => "Expert: " + s), ...r.problems.map((s) => "During play, " + s), ...r.pageErrors.map((s) => "PAGE ERROR: " + s),
      ...(r.manualFound || []).filter((m) => m.endsWith("NOT FOUND")).map((m) => "Tester could not find the manual page for " + m), ...(r.noAnswer ? [`The model gave no usable answer ${r.noAnswer} time(s) and was asked again.`] : [])];
    md += `\n### ${icon(r)} ${r.label}\n\n${items.length ? items.map((s) => "- " + s).join("\n") : "- Nothing reported."}\n\nTranscript: \`${rel(r)}\`\n`; }
  md += `\n## How to read this\n\n- The bomb's clock is game time: it stands still while the model thinks. Each thing said costs ${TALK_S} s.\n- The players read the screen as text. A picture is described by what was drawn (for example eyes, arms and color). They hear the game's sounds by name.\n- DEFUSED shows the module can be solved from the manual by talk alone, for that one random bomb. Use --repeat for more.\n`;
  fs.writeFileSync(path.join(OUT, "report.md"), md);
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ model: MODEL, api: API, minutes: Number(mins), calls, results, failed }, null, 2));
};

/* ---------- start / stop / status / resume ---------- */
const statusText = () => { const dirs = runDirs(); const dir = dirs[dirs.length - 1]; const pid = alive();
  if (!dir) return "No runs yet.";
  const st = readJson(path.join(dir, "state.json"), {}); const done = st.done || [], jobs = st.jobs || [];
  const tally = {}; for (const d of done) { const r = readJson(path.join(dir, d.dir, "result.json"), {}); tally[r.outcome || "?"] = (tally[r.outcome || "?"] || 0) + 1; }
  return [`${pid ? "RUNNING (pid " + pid + ")" : st.finished ? "FINISHED" : "STOPPED (not finished: use resume)"}  ${dir}`,
    `${done.length} of ${jobs.length} bombs played` + (done.length ? ": " + Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(", ") : ""),
    pid && st.current ? `Now playing: ${st.current}` : !st.finished && jobs[done.length] ? `Next: ${jobs.find((j) => !done.some((d) => d.label === j))}` : "",
    `Report: ${path.join(dir, "report.md")}`].filter(Boolean).join("\n"); };
const background = (args) => { if (alive()) { console.log("A run is already going.\n" + statusText()); process.exit(1); }
  fs.mkdirSync(REPORTS, { recursive: true }); const logFile = path.join(REPORTS, "run.log"); const fd = fs.openSync(logFile, "a");
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), ...args], { detached: true, stdio: ["ignore", fd, fd] }); child.unref();
  fs.writeFileSync(PIDFILE, JSON.stringify({ pid: child.pid, started: new Date().toISOString() }));
  console.log(`Started in the background (pid ${child.pid}).\n  status: node tools/playtest/playtest.mjs status\n  watch:  node tools/playtest/playtest.mjs log\n  stop:   node tools/playtest/playtest.mjs stop`); process.exit(0); };
if (CMD === "start") background(argv.filter((a) => a !== "--resume"));
if (CMD === "resume") background(["--resume", ...(argv[0] && !argv[0].startsWith("--") ? [argv[0]] : [])]);
if (CMD === "status") { console.log(statusText()); process.exit(0); }
if (CMD === "stop") { const pid = alive(); if (!pid) { console.log("Nothing is running.\n" + statusText()); process.exit(0); }
  process.kill(pid, "SIGTERM"); for (let i = 0; i < 50 && alive(); i++) await sleep(200);
  if (alive()) process.kill(pid, "SIGKILL"); fs.rmSync(PIDFILE, { force: true }); console.log("Stopped.\n" + statusText()); process.exit(0); }
if (CMD === "log") { const f = path.join(REPORTS, "run.log"); if (!fs.existsSync(f)) { console.log("No log yet."); process.exit(0); }
  const t = spawn("tail", ["-n", "40", "-f", f], { stdio: "inherit" }); await new Promise((r) => t.on("exit", r)); process.exit(0); }

/* ---------- main ---------- */
const main = async () => {
  const srv = await startServer(); const base = `http://127.0.0.1:${srv.address().port}/index.html?test`;
  const chrome = await launchChrome(); const started = Date.now(); const results = [], failed = [];
  const finish = (code) => { chrome.close(); srv.close(); if (Number(readJson(PIDFILE, {}).pid) === process.pid) fs.rmSync(PIDFILE, { force: true }); process.exit(code); };
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => { console.log(`\nStopped (${sig}). Carry on later with: node tools/playtest/playtest.mjs resume`); finish(130); });
  try {
    const first = await Tab.open(chrome.cdp, base, "bomb");
    const cat = await catalog(first); await first.close();
    if (opt("list")) { console.log("MODULES\n" + cat.modules.map((m) => `  ${m.level}  ${m.name}`).join("\n") + "\n\nMISSIONS\n" + cat.missions.map((m) => `  ${m.num}  ${m.name}  (${m.meta})`).join("\n")); return finish(0); }
    /* is the model there? */
    const ping = opt("peek") ? {} : await ask("Reply with JSON only.", `Reply with {"ok": true}`, 2);
    if (ping._bad) throw new Error(`the model "${MODEL}" at ${API} did not answer properly: ${ping._bad}`);
    const manual = await Tab.open(chrome.cdp, base, "manual"); manual.base = base;
    const book = await Tab.open(chrome.cdp, base, "book"); await book.helpers(); await book.eval(`__pt.clickText(".menu-btn", "EXPERT MANUAL")`); await sleep(300);
    const jobs = [];
    const list = (v) => String(v).split(",").map((s) => s.trim()).filter(Boolean);
    if (opt("bomb")) { const names = list(opt("bomb")).map((w) => pick(cat.modules, w).name); jobs.push({ label: "Bomb: " + names.join(" + "), moduleCount: names.length, setup: (t) => startFreePlay(t, names) }); }
    const missionNums = opt("missions") ? cat.missions.map((m) => m.num) : opt("mission") ? list(opt("mission")) : [];
    for (const n of missionNums) { const m = cat.missions.find((x) => x.num.trim() === String(n)); if (!m) throw new Error("there is no mission " + n);
      jobs.push({ label: `Mission ${m.num}: ${m.name}`, moduleCount: parseInt(m.meta) || 3, setup: (t) => startMission(t, m.num.trim()) }); }
    const solo = opt("modules") ? list(opt("modules")).map((w) => pick(cat.modules, w)) : (opt("all") || !jobs.length) ? cat.modules : [];
    for (const m of solo) jobs.push({ label: `${m.name} (${m.level})`, moduleCount: 1, setup: (t) => startFreePlay(t, [m.name]) });
    if (REPEAT > 1) { const one = jobs.splice(0); for (let r = 1; r <= REPEAT; r++) for (const j of one) jobs.push({ ...j, label: `${j.label} · run ${r}` }); }
    fs.mkdirSync(OUT, { recursive: true });
    /* state.json is what lets a stopped run carry on: the options, the list of bombs, and which are done */
    const stateFile = path.join(OUT, "state.json");
    const state = RESUME ? RESUME.state : { argv: argv.filter((a, i) => a !== "--out" && argv[i - 1] !== "--out"), jobs: jobs.map((j) => j.label), done: [], finished: false, minutes: 0, calls: 0 };
    const save = () => { state.minutesNow = state.minutes + (Date.now() - started) / 60000; state.callsNow = state.calls + calls; if (!opt("peek")) fs.writeFileSync(stateFile, JSON.stringify(state, null, 2)); };
    if (RESUME) { for (const d of state.done) { const r = readJson(path.join(OUT, d.dir, "result.json"), null); if (r) { r.dir = path.join(OUT, d.dir); results.push(r); } else if (d.error) failed.push({ label: d.label, error: d.error }); }
      state.minutes = state.minutesNow || 0; state.calls = state.callsNow || 0; console.log(`\n=== Carrying on ${OUT}: ${state.done.length} of ${state.jobs.length} bombs already played ===`); }
    const totals = () => ({ minutes: state.minutes + (Date.now() - started) / 60000, calls: state.calls + calls });
    console.log(`Play-test: ${jobs.length} bomb(s), model ${MODEL}. Report: ${path.join(OUT, "report.md")}`);
    for (const [i, job] of jobs.entries()) {
      if (state.done.some((d) => d.label === job.label)) continue;
      const name = String(i + 1).padStart(2, "0") + "-" + slug(job.label).slice(0, 40); const dir = path.join(OUT, name);
      fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      console.log(`\n[${i + 1}/${jobs.length}] ${job.label}   (${new Date().toTimeString().slice(0, 5)})`);
      state.current = job.label; save();
      let bomb = await Tab.open(chrome.cdp, base, "bomb");
      try { let r;
        try { r = await playBomb({ ...job, bomb, manual, book, dir }); }
        catch (e) { if (/cannot reach the model/.test(String(e.message))) throw e; console.log("  (tester error: " + (e.message || e) + ". Trying this bomb once more.)");
          await bomb.close(); bomb = await Tab.open(chrome.cdp, base, "bomb"); r = await playBomb({ ...job, bomb, manual, book, dir }); } if (r) { r.dir = dir; results.push(r); state.done.push({ label: job.label, dir: name });
        console.log(`  => ${r.outcome}${r.stop ? " (" + r.stop + ")" : ""}, ${r.strikes} strike(s), ${r.turns} turns, Defuser: ${r.defuser.verdict}, Expert: ${r.expert.verdict}`); } }
      catch (e) { const error = String(e.message || e); console.log("  => TESTER ERROR: " + error);
        if (/cannot reach the model/.test(error)) { writeReport(results, totals(), failed); console.log("The model cannot be reached, so the run stops here. Carry on later with: resume"); return finish(2); }
        failed.push({ label: job.label, error }); state.done.push({ label: job.label, dir: name, error }); }
      await bomb.close(); state.current = null; save();
      if (!opt("peek")) writeReport(results, totals(), failed); /* rewritten after every bomb, so a stopped run still leaves a report */
    }
    if (opt("peek")) return finish(0);
    state.finished = true; save();
    console.log(`\nDone. ${results.filter((r) => r.outcome === "DEFUSED").length}/${jobs.length} defused. Report: ${path.join(OUT, "report.md")}`);
    finish(failed.length ? 1 : 0);
  } catch (e) { console.error("Play-test stopped: " + (e.message || e)); finish(2); }
};
main();
