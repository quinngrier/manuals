//
// The authors of this file have waived all copyright and
// related or neighboring rights to the extent permitted by
// law as described by the CC0 1.0 Universal Public Domain
// Dedication. You should have received a copy of the full
// dedication along with this file, typically as a file
// named <CC0-1.0.txt>. If not, it may be available at
// <https://creativecommons.org/publicdomain/zero/1.0/>.
//

//
// This script adds a notification banner to a page to inform the user
// they're looking at an archived manual that may no longer be current,
// which might otherwise not be obvious. If they click the OK button,
// the notification banner will be hidden site-wide for a while.
//

const storage_key = "qma_notification_ok_time";
const timeout_ms = 1 * 24 * 60 * 60 * 1000;

function should_show(v) {
  if (v === undefined) {
    v = localStorage.getItem(storage_key);
  }
  if (v === null) {
    return true;
  }
  const t = parseInt(v);
  if (!Number.isSafeInteger(t) || Date.now() - t > timeout_ms) {
    localStorage.removeItem(storage_key);
    return true;
  }
  return false;
}

const revert = document.createElement("div");
const div = document.createElement("div");
const span = document.createElement("span");
const button = document.createElement("button");

Object.assign(revert.style, {
  all: "initial",
});

Object.assign(div.style, {
  alignItems: "center",
  backgroundColor: "#ff9",
  borderBottom: "0.3em solid",
  color: "#111",
  display: should_show() ? "flex" : "none",
  fontFamily: "sans-serif",
  fontSize: "16px",
  gap: "1em",
  justifyContent: "center",
  left: "0",
  lineHeight: "1.3",
  padding: "1em",
  position: "fixed",
  right: "0",
  top: "0",
  zIndex: "999999999",
});

Object.assign(span.style, {
  maxWidth: "30em",
});

Object.assign(button.style, {
  padding: "0.3em 1em",
});

span.innerHTML = `
  This is an archived copy of this specific version of this manual.
`.trim();

button.textContent = "OK";

button.addEventListener("click", () => {
  localStorage.setItem(storage_key, Date.now());
  div.style.display = "none";
});

window.addEventListener("storage", (event) => {
  if (event.storageArea !== localStorage) {
    return;
  }
  const k = event.key;
  if (k !== null && k !== storage_key) {
    return;
  }
  const v = event.newValue;
  if (k !== null && v !== null && !should_show(v)) {
    div.style.display = "none";
  } else {
    div.style.display = "flex";
  }
});

div.appendChild(span);
div.appendChild(button);
revert.appendChild(div);
document.body.appendChild(revert);
