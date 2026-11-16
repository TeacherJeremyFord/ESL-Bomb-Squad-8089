/* ===== MANUAL KIT: version, codebook cycle, print mode =====
 * Loaded right after React, before the modules.
 *
 * VERSION  - bump by hand when you release a new build to students (YY.MM.DD, like the old file names).
 * CYCLE    - the codebook cycle. Every module that uses a sync number (ORDER NUMBER, HOUSE NUMBER…) only
 *            ever shows one of the CODEBOOK_SIZE numbers of the current cycle, and the printed manual
 *            lists all of them. Change CYCLE (any word) to get a new set of rounds, then reprint.
 *            The two devices never talk to each other: the bomb picks a number, the Expert finds it in
 *            the paper manual (or types it into the on-screen manual).
 * The MANUAL CODE (8 characters, e.g. 7F3A-91C2) is not stored anywhere: the game works it out from the
 * full text of the printed manual. Any change to a rule, a table or the codebook gives a new code, so a
 * printout only goes with a game that shows the same code.
 */
(() => {
  const VERSION = "26.11.16";
  const CYCLE = "A";
  const CODEBOOK_SIZE = 10;

  // cyrb53: small, fast, good-enough string hash (no crypto.subtle: the game is served over plain http).
  const hash = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // The cycle's numbers for one module: CODEBOOK_SIZE different 4-digit numbers, odd and even taking turns
  // (Teen Code reads the parity), sorted so the printed list is easy to search.
  const books = {};
  const codebook = (moduleId) => {
    if (books[moduleId]) return books[moduleId];
    const r = rng(hash(CYCLE + "|" + moduleId) % 2147483647), out = new Set();
    while (out.size < CODEBOOK_SIZE) { const n = 1000 + 2 * Math.floor(r() * 4500) + (out.size % 2); out.add(n); }
    return (books[moduleId] = [...out].sort((a, b) => a - b));
  };
  // A random number from the codebook; `ok` narrows it (Teen Code: odd = Twins).
  const pick = (moduleId, ok = () => true) => { const c = codebook(moduleId).filter(ok); return c[Math.floor(Math.random() * c.length)]; };

  const code = (text) => { const h = hash(text).toString(16).toUpperCase().padStart(14, "0").slice(-8); return h.slice(0, 4) + "-" + h.slice(4); };

  window.MANUAL = {
    VERSION, CYCLE, CODEBOOK_SIZE, codebook, pick, hash, code,
    Print: React.createContext(false), // true while rendering the printable manual
  };
})();
