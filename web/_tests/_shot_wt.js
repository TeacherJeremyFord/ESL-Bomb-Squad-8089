// World Tour screenshot: two right places, so the pins, the route and the plane show.
setTimeout(async () => { const T = EXTRA_MODULES.find(m => m.id === "worldTour")._test, D = document.getElementById("d");
  for (const id of T.list.slice(0, 2)) { D.querySelector(`g[data-place="${id}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); await new Promise(r => setTimeout(r, 30)); } }, 300);
