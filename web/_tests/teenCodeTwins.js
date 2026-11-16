// Same script as Teen Code; it reads the module id from the URL.
{ const t = document.createElement("script"); t.src = "_tests/teenCode.js?" + Date.now(); document.body.appendChild(t); }
