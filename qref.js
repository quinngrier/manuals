//
// The authors of this file have waived all copyright and
// related or neighboring rights to the extent permitted by
// law as described by the CC0 1.0 Universal Public Domain
// Dedication. You should have received a copy of the full
// dedication along with this file, typically as a file
// named <CC0-1.0.txt>. If not, it may be available at
// <https://creativecommons.org/publicdomain/zero/1.0/>.
//

{

const style = document.createElement("style");
style.type = "text/css";

style.innerHTML = `

  .qref {
    background: #FFFF99;
  }

  .qref_popup {
    position: absolute;
  }

  .qref_popup > a {
    background: #FFFF99;
    border-color: #BBBBBB;
    border-style: solid;
    border-width: 1px;
    color: #777777;
    display: inline-block;
    font-family: sans-serif;
    font-size: 12px;
    height: 20px;
    line-height: 20px;
    padding-bottom: 0px;
    padding-left: 1px;
    padding-right: 3px;
    padding-top: 0px;
    text-decoration: none;
    user-select: none;
    vertical-align: middle;
    white-space: nowrap;
    z-index: 999999999;
  }

  .qref_popup > a:hover {
    background: #FFFF00;
    border-color: #555555;
    color: #000000;
  }

  .qref_popup > a > svg {
    vertical-align: -4px;
  }

`;

document.head.appendChild(style);

function is_char(node) {
  return node instanceof CharacterData;
}

function is_text(node) {
  return node instanceof Text;
}

function is_qref(node) {
  return node instanceof HTMLElement && node.className == "qref";
}

function is_squishy(node) {
  return is_text(node) || is_qref(node);
}

function in_body(node) {
  return document.body.contains(node);
}

function get_offset(node) {
  let i = 0;
  let node_is_squishy = is_squishy(node);
  while (true) {
    const prev = node.previousSibling;
    if (prev === null) {
      return i;
    }
    const prev_is_squishy = is_squishy(prev);
    if (!node_is_squishy || !prev_is_squishy) {
      ++i;
    }
    node = prev;
    node_is_squishy = prev_is_squishy;
  }
}

function squish_left(node) {
  let squished = false;
  let length = 0;
  while (true) {
    const prev = node.previousSibling;
    if (is_text(prev)) {
      length += prev.nodeValue.length;
    } else if (is_qref(prev)) {
      squished = true;
      length += prev.childNodes[0].nodeValue.length;
    } else {
      return {squished: squished, length: length, node: node};
    }
    node = prev;
  }
}

function get_addr_2(node, offset) {
  if (node === document.body) {
    return [offset];
  }
  const parent = node.parentNode;
  if (is_text(node)) {
    if (is_qref(parent)) {
      const s = squish_left(parent);
      const addr = get_addr_2(parent.parentNode, get_offset(s.node));
      return addr.concat(s.length + offset);
    }
    const s = squish_left(node);
    if (s.squished) {
      const addr = get_addr_2(parent, get_offset(s.node));
      return addr.concat(s.length + offset);
    }
  }
  const addr = get_addr_2(parent, get_offset(node));
  return addr.concat([offset]);
}

function get_addr(node, offset) {
  if (!is_char(node)) {
    if (offset < node.childNodes.length) {
      offset = get_offset(node.childNodes[offset]);
    } else if (offset > 0) {
      offset = get_offset(node.childNodes[offset - 1]) + 1;
    }
  }
  return get_addr_2(node, offset);
}

function cmp_addr(addr1, addr2) {
  for (let i = 0; i < addr1.length && i < addr2.length; ++i) {
    const diff = addr1[i] - addr2[i];
    if (diff != 0) {
      return diff;
    }
  }
  return addr1.length - addr2.length;
}

function comes_before(node1, node2) {
  const addr1 = get_addr_2(node1.parentNode, get_offset(node1));
  const addr2 = get_addr_2(node2.parentNode, get_offset(node2));
  return cmp_addr(addr1, addr2) < 0;
}

let popup_count = 0;
function get_popup(j) {
  const id = "qref_" + j;
  var popup = document.getElementById(id);
  if (popup === null) {
    popup = document.body.appendChild(document.createElement("div"));
    popup.id = id;
    popup.className = "qref_popup";
    popup.innerHTML = `
      <a href="">
        <!-- https://icons.getbootstrap.com/icons/link-45deg/ -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
        </svg>Permalink
      </a>
    `;
    ++popup_count;
  }
  return popup;
}

document.addEventListener("selectionchange", function(event) {
  const selection = window.getSelection();
  let list = [];
  let j = 0;
  for (let i = 0; i < selection.rangeCount; ++i) {
    const range = selection.getRangeAt(i);
    if (!in_body(range.startContainer)) {
      continue;
    }
    if (!in_body(range.endContainer)) {
      continue;
    }
    const addr1 = get_addr(range.startContainer, range.startOffset);
    const addr2 = get_addr(range.endContainer, range.endOffset);
    if (cmp_addr(addr1, addr2) == 0) {
      continue;
    }
    const rects = range.getClientRects();
    if (rects.length == 0) {
      continue;
    }
    list.push([addr1, addr2]);
    let x = rects[0].x + window.scrollX;
    let y = rects[0].y + window.scrollY;
    const popup = get_popup(j++);
    popup.style.display = "block";
    const rect = popup.getBoundingClientRect();
    x = Math.min(x, document.body.scrollWidth - rect.width);
    x = Math.max(x, 0);
    y -= rect.height;
    y = Math.min(y, document.body.scrollHeight - rect.height);
    y = Math.max(y, 0);
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
  }
  list.sort((x, y) => cmp_addr(x[0], y[0]));
  list = list.map(x => x.map(y => y.join(".")).join("-")).join("+");
  for (let i = 0; i < j; ++i) {
    const popup = get_popup(i);
    popup.children[0].href = `?qref=${list}`;
  }
  for (; j < popup_count; ++j) {
    get_popup(j).style.display = "none";
  }
});

function parse_addr(text) {
  if (!text.match(/^(0|[1-9][0-9]{0,9})(\.(0|[1-9][0-9]{0,9}))*$/)) {
    return [];
  }
  return text.split(".").map(x => parseInt(x));
}

function get_range_position(addr, node) {
  if (node === undefined) {
    node = document.body;
  }
  const offset = addr[0];
  if (is_char(node)) {
    if (offset > node.nodeValue.length) {
      return null;
    }
  } else if (offset > node.childNodes.length) {
    return null;
  }
  if (addr.length == 1) {
    return {node: node, offset: offset};
  }
  if (is_char(node)) {
    return null;
  }
  return get_range_position(addr.slice(1), node.childNodes[offset]);
}

function add_highlight(highlights, node, y) {
  const xs = highlights.get(node);
  if (xs === undefined) {
    highlights.set(node, [y]);
  } else {
    absorb: while (true) {
      for (let i = 0; i < xs.length; ++i) {
        const x = xs[i];
        if (x[0] <= y[1] && y[0] <= x[1]) {
          y[0] = Math.min(y[0], x[0]);
          y[1] = Math.max(y[1], x[1]);
          xs.splice(i, 1);
          continue absorb;
        }
      }
      break;
    }
    xs.push(y);
  }
}

function get_highlights(highlights, range) {
  let highlight = false;
  function walk(node) {
    const is_start = node === range.startContainer;
    const is_end = node === range.endContainer;
    const i = range.startOffset;
    const j = range.endOffset;
    if (is_char(node)) {
      const n = node.nodeValue.length;
      if (is_start && is_end) {
        if (is_text(node)) {
          add_highlight(highlights, node, [i, j]);
        }
      } else if (is_start) {
        if (is_text(node)) {
          add_highlight(highlights, node, [i, n]);
        }
        highlight = true;
      } else if (is_end) {
        if (is_text(node)) {
          add_highlight(highlights, node, [0, j]);
        }
        highlight = false;
      } else if (is_text(node) && highlight) {
        add_highlight(highlights, node, [0, n]);
      }
    }
    for (let k = 0; k <= node.childNodes.length; ++k) {
      if (is_start && k == i) {
        highlight = true;
      }
      if (is_end && k == j) {
        highlight = false;
      }
      if (k < node.childNodes.length) {
        walk(node.childNodes[k]);
      }
    }
  }
  walk(range.commonAncestorContainer);
  return highlights;
}

const query = document.URL.replace(/^[^?]*\??/, "");
const highlights = new Map();
for (const param of query.split("&").map(x => x.split("=", 2))) {
  if (param.length == 2 && decodeURIComponent(param[0]) == "qref") {
    const list = decodeURIComponent(param[1]).split("+");
    for (const item of list.map(x => x.split("-", 2))) {
      if (item.length == 2) {
        const addr1 = parse_addr(item[0]);
        const addr2 = parse_addr(item[1]);
        if (addr1.length > 0 && addr2.length > 0) {
          const start = get_range_position(addr1);
          const end = get_range_position(addr2);
          if (start !== null && end !== null) {
            const range = document.createRange();
            range.setStart(start.node, start.offset);
            range.setEnd(end.node, end.offset);
            get_highlights(highlights, range);
          }
        }
      }
    }
  }
}

let first_node = null;
for (const [node, pairs] of highlights) {
  pairs.sort((x, y) => x[0] - y[0]);
  const parent = node.parentNode;
  const s = node.nodeValue;
  const n = s.length;
  let new_nodes = [];
  let k = 0;
  for (const [i, j] of pairs) {
    if (k < i) {
      new_nodes.push(document.createTextNode(s.substring(k, i)));
    }
    const qref = document.createElement("span");
    qref.className = "qref";
    qref.textContent = s.substring(i, j);
    new_nodes.push(qref);
    k = j;
  }
  if (k < n) {
    new_nodes.push(document.createTextNode(s.substring(k, n)));
  }
  let i = new_nodes.length - 1;
  parent.replaceChild(new_nodes[i], node);
  while (i-- > 0) {
    parent.insertBefore(new_nodes[i], new_nodes[i + 1]);
  }
  if (first_node === null || comes_before(new_nodes[0], first_node)) {
    first_node = new_nodes[0];
  }
}
if (first_node !== null) {
  if (is_text(first_node)) {
    first_node = first_node.parentNode;
  }
  first_node.scrollIntoView({block: "center"});
}

}
