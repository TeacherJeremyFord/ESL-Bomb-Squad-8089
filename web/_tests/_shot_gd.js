// Greeting Door screenshot: press the right greeting just before the shot, so the door is half open.
setTimeout(() => { const T = EXTRA_MODULES.find(m => m.id === new URLSearchParams(location.search).get("m"))._test;
  [...document.querySelectorAll("#d .gd-btn")].find(b => b.textContent === T.doors[T.stage].greeting).click(); }, 3150);
