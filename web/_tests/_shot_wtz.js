// World Tour zoomed screenshot: two right places, then zoom in twice on the middle.
setTimeout(async () => { const T = EXTRA_MODULES.find(m => m.id === "worldTour")._test, D = document.getElementById("d"), s = (ms) => new Promise(r => setTimeout(r, ms));
  for (const id of T.list.slice(0, 2)) { D.querySelector(`g[data-place="${id}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); await s(30); }
  const b = D.querySelectorAll(".wt-zoom button"); b[0].click(); await s(30); b[0].click(); }, 300);
