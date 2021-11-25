//
// The authors of this file have waived all copyright and
// related or neighboring rights to the extent permitted by
// law as described by the CC0 1.0 Universal Public Domain
// Dedication. You should have received a copy of the full
// dedication along with this file, typically as a file
// named <CC0-1.0.txt>. If not, it may be available at
// <https://creativecommons.org/publicdomain/zero/1.0/>.
//

// https://github.com/quinngrier/qref

// TODO: Instead of using color: #000 in .qref_highlight, adjust the
//       color of every .qref_highlight node individually by adjusting
//       the existing color, if necessary, to give a minimum contrast.
//       Maybe convert RGB to HSL, adjust L up or down to satisfy the
//       minimum contrast (whichever of up or down will be a smaller
//       change), then convert back to RGB.

function qref(...args) {

  const [root] = args;

  const root_n = root.childNodes.length;

  //--------------------------------------------------------------------
  // get_viewport
  //--------------------------------------------------------------------
  //
  // The get_viewport function returns the "visible" rectangle of the
  // content of the root element, as well as how much content has been
  // scrolled off the left and top sides. The rectangle is relative to
  // the browser viewport, allowing it to be compared to any rectangle
  // returned by the getBoundingClientRect function. Since padding is
  // excluded, child elements of the root element can be absolutely
  // positioned using subtractions between these rectangles.
  //

  function get_viewport() {
    const root_bound = root.getBoundingClientRect();
    const style = window.getComputedStyle(root);
    const padding_left = parseFloat(style.paddingLeft);
    const padding_top = parseFloat(style.paddingTop);
    const padding_right = parseFloat(style.paddingRight);
    const padding_bottom = parseFloat(style.paddingBottom);
    const border_left = parseFloat(style.borderLeftWidth);
    const border_top = parseFloat(style.borderTopWidth);
    if (root === document.body) {
      const root_bound_width = root_bound.right - root_bound.left;
      const root_bound_height = root_bound.bottom - root_bound.top;
      const border_right = parseFloat(style.borderRightWidth);
      const border_bottom = parseFloat(style.borderBottomWidth);
      const html = document.documentElement;
      const html_bound = html.getBoundingClientRect();
      const html_client_width = html_bound.right - html_bound.left;
      const html_client_height = html.clientHeight;
      const space_left = root_bound.left + html.scrollLeft + border_left
                         + padding_left;
      const space_top =
          root_bound.top + html.scrollTop + border_top + padding_top;
      const space_right = html_client_width - root_bound_width
                          - (root_bound.left + html.scrollLeft)
                          + border_right + padding_right;
      const space_bottom = html_client_height - root_bound_height
                           - (root_bound.top + html.scrollTop)
                           + border_bottom + padding_bottom;
      const overlap_left = Math.max(space_left - html.scrollLeft, 0);
      const overlap_top = Math.max(space_top - html.scrollTop, 0);
      const overlap_right =
          Math.max(space_right
                       - (html.scrollWidth - html.scrollLeft
                          - html_client_width),
                   0);
      const overlap_bottom =
          Math.max(space_bottom
                       - (html.scrollHeight - html.scrollTop
                          - html_client_height),
                   0);
      const left = Math.max(space_left - html.scrollLeft, 0);
      const top = Math.max(space_top - html.scrollTop, 0);
      const width =
          Math.max(html_client_width - overlap_left - overlap_right, 0);
      const height =
          Math.max(html_client_height - overlap_top - overlap_bottom,
                   0);
      const right = left + width;
      const bottom = top + height;
      const scroll = {
        left: Math.max(html.scrollLeft - space_left, 0),
        top: Math.max(html.scrollTop - space_top, 0)
      };
      return {left, top, right, bottom, width, height, scroll};
    } else {
      const overlap_left = Math.max(padding_left - root.scrollLeft, 0);
      const overlap_top = Math.max(padding_top - root.scrollTop, 0);
      const overlap_right = Math.max(
          padding_right
              - (root.scrollWidth - root.scrollLeft - root.clientWidth),
          0);
      const overlap_bottom =
          Math.max(padding_bottom
                       - (root.scrollHeight - root.scrollTop
                          - root.clientHeight),
                   0);
      const left = root_bound.left + border_left + overlap_left;
      const top = root_bound.top + border_top + overlap_top;
      const width =
          Math.max(root.clientWidth - overlap_left - overlap_right, 0);
      const height =
          Math.max(root.clientHeight - overlap_top - overlap_bottom, 0);
      const right = left + width;
      const bottom = top + height;
      const scroll = {
        left: Math.max(root.scrollLeft - padding_left, 0),
        top: Math.max(root.scrollTop - padding_top, 0)
      };
      return {left, top, right, bottom, width, height, scroll};
    }
  }

  //--------------------------------------------------------------------

  {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `

      .qref_highlight {
        background: #FF9;
        color: #000;
      }

      .qref_link {
        position: absolute;
      }

      .qref_links {
        position: relative;
      }

      .qref_more_above,
      .qref_more_below {
        display: none;
        position: sticky;
      }

      .qref_link,
      .qref_link *,
      .qref_more_above,
      .qref_more_above *,
      .qref_more_below,
      .qref_more_below * {
        user-select: none;
      }

      .qref_link > a,
      .qref_more_above > a,
      .qref_more_below > a {
        background: #FF9;
        border: 1px dotted #777;
        color: #777;
        display: block;
        font-family: sans-serif;
        font-size: 12px;
        height: 18px;
        line-height: 18px;
        text-decoration: none;
        vertical-align: middle;
        white-space: nowrap;
      }

      .qref_link > a:hover,
      .qref_more_above > a:hover,
      .qref_more_below > a:hover {
        background: #FF0;
        border-color: #000;
        color: #000;
        cursor: pointer;
      }

      .qref_link > a {
        padding: 0 3px 0 1px;
      }

      .qref_link > a > svg,
      .qref_more_above > a > svg,
      .qref_more_below > a > svg {
        vertical-align: -4px;
      }

      .qref_more_above > a,
      .qref_more_below > a {
        padding: 0 3px;
        position: absolute;
        right: 0;
      }

      .qref_more_above,
      .qref_more_above > a {
        top: 0;
      }

      .qref_more_below,
      .qref_more_below > a {
        bottom: 0;
      }

    `;
    document.head.appendChild(style);
  }

  function is_char(node) {
    return node instanceof CharacterData;
  }

  function is_text(node) {
    return node.nodeType === Node.TEXT_NODE;
  }

  function is_element(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  function is_wrapper(node) {
    return is_element(node) && node.className === "qref_wrapper";
  }

  function is_highlight(node) {
    return is_element(node) && node.className === "qref_highlight";
  }

  //--------------------------------------------------------------------
  // node_length
  //--------------------------------------------------------------------

  function node_length(node) {
    return (is_char(node) ? node.textContent : node.childNodes).length;
  }

  //--------------------------------------------------------------------
  // assert_normalized
  //--------------------------------------------------------------------

  function assert_normalized(condition) {
    const message = "Unexpected unnormalized range boundary.";
    console.assert(condition, message);
  }

  //--------------------------------------------------------------------

  function scroll_range_into_view(range) {
    // Save the ranges.
    const old_ranges = [];
    for (const range of ranges) {
      old_ranges.push({
        start: {
          container: range.startContainer,
          offset: range.startOffset,
        },
        end: {
          container: range.endContainer,
          offset: range.endOffset,
        },
      });
    }

    const {container, offset} = (function() {
      if (is_char(range.startContainer)) {
        const container = range.startContainer;
        const offset = range.startOffset;
        assert_normalized(offset < container.textContent.length);
        return {container, offset};
      }
      const x = range.startContainer.childNodes;
      const i = range.startOffset;
      assert_normalized(i < x.length);
      const container = x[i];
      const offset = 0;
      return {container, offset};
    })();

    if (!is_char(container)) {
      container.scrollIntoView();
    } else if (offset == 0) {
      const span = document.createElement("span");
      const parent = container.parentNode;
      parent.insertBefore(span, container);
      span.scrollIntoView();
      parent.removeChild(span);
    } else {
      const span = document.createElement("span");
      const parent = container.parentNode;
      const s1 = container.textContent.substring(0, offset);
      const s2 = container.textContent.substring(offset);
      const x1 = document.createTextNode(s1);
      const x2 = document.createTextNode(s2);
      span.addChild(x2);
      parent.replaceChild(span, container);
      parent.insertBefore(x1, span);
      span.scrollIntoView();
      parent.removeChild(x1);
      parent.replaceChild(container, span);
    }

    // Restore the ranges.
    for (let i = 0; i < ranges.length; ++i) {
      const start = old_ranges[i].start;
      const end = old_ranges[i].end;
      ranges[i] = document.createRange();
      ranges[i].setStart(start.container, start.offset);
      ranges[i].setEnd(end.container, end.offset);
    }
  }

  function compute_address(container, offset) {
    const offsets = (function f(container, offset) {
      if (container === root) {
        return [offset];
      }
      const parent = container.parentNode;
      const parent_offset = (function() {
        let i = 0;
        while (parent.childNodes[i] !== container) {
          ++i;
        }
        return i;
      })();
      if (is_wrapper(container)) {
        if (offset == container.childNodes.length) {
          return f(parent, parent_offset + 1);
        }
        const offsets = f(parent, parent_offset);
        let n = 0;
        for (let i = 0; i < offset; ++i) {
          n += container.childNodes[i].textContent.length;
        }
        offsets.push(n);
        return offsets;
      } else if (is_highlight(container)) {
        if (offset == 1) {
          return f(parent, parent_offset + 1);
        }
        return f(parent, parent_offset);
      } else if (!is_text(container)) {
        if (offset == container.childNodes.length) {
          return f(parent, parent_offset + 1);
        }
        const offsets = f(parent, parent_offset);
        offsets.push(offset);
        return offsets;
      } else if (is_wrapper(parent) || is_highlight(parent)) {
        if (offset == container.textContent.length) {
          return f(parent, parent_offset + 1);
        }
        const offsets = f(parent, parent_offset);
        offsets[offsets.length - 1] += offset;
        return offsets;
      } else {
        if (offset == container.textContent.length) {
          return f(parent, parent_offset + 1);
        }
        const offsets = f(parent, parent_offset);
        offsets.push(offset);
        return offsets;
      }
    })(container, offset);

    // Adjust and clamp the offsets to the original root.childNodes.
    offsets[0] -= 2;
    if (offsets[0] < 0) {
      return [0];
    }
    if (offsets[0] > root_n) {
      return [root_n];
    }

    // Remove any trailing zero components.
    while (offsets.length > 0 && offsets[offsets.length - 1] == 0) {
      --offsets.length;
    }

    return offsets;
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

  function add_highlight(highlights, node, y) {
    if (!is_text(node) || y[0] == y[1]) {
      return;
    }
    {
      const xs = highlights.get(node);
      if (xs !== undefined) {
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
          xs.push(y);
          return;
        }
      }
    }
    {
      function f1(x) {
        return [
          "break-spaces",
          "pre",
          "pre-line",
          "pre-wrap",
        ].includes(x);
      }
      function f2(x) {
        return [
          "block",
          "list-item",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row",
          "table-row-group",
        ].includes(x);
      }
      function f3(x) {
        return is_element(x) && f2(window.getComputedStyle(x).display);
      }
      function f4(x) {
        return x !== null && f3(x);
      }
      if (/^\s*$/.test(node.textContent)
          && !f1(window.getComputedStyle(node.parentNode).whiteSpace)
          && (f4(node.previousSibling) || f4(node.nextSibling))) {
        return;
      }
    }
    highlights.set(node, [y]);
  }

  function get_highlights(highlights, range) {
    let highlight = false;
    function walk(node) {
      const is_start = node === range.startContainer;
      const is_end = node === range.endContainer;
      const i = range.startOffset;
      const j = range.endOffset;
      if (is_char(node)) {
        const n = node.textContent.length;
        if (is_start && is_end) {
          add_highlight(highlights, node, [i, j]);
        } else if (is_start) {
          add_highlight(highlights, node, [i, n]);
          highlight = true;
        } else if (is_end) {
          add_highlight(highlights, node, [0, j]);
          highlight = false;
        } else if (highlight) {
          add_highlight(highlights, node, [0, n]);
        }
      } else {
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
    }
    walk(range.commonAncestorContainer);
    return highlights;
  }

  //--------------------------------------------------------------------
  // Parse the query string and do the highlighting
  //--------------------------------------------------------------------

  function parse_address(text) {
    const msg = "Ignoring invalid qref address in query string: ";

    if (!/^(0|[1-9][0-9]{0,9})(\.(0|[1-9][0-9]{0,9}))*$/.test(text)) {
      console.warn(msg + JSON.stringify(text));
      return null;
    }

    const offsets = text.split(".").map(x => parseInt(x));
    let n = offsets.length;

    const valid = (function f(node, offsets, i) {
      if (is_char(node)) {
        return i == n - 1 && offsets[i] <= node.textContent.length;
      }
      if (offsets[i] > node.childNodes.length) {
        return false;
      }
      if (i == n - 1) {
        return true;
      }
      if (offsets[i] == node.childNodes.length) {
        return false;
      }
      return f(node.childNodes[offsets[i]], offsets, i + 1);
    })(root, offsets, 0);
    if (!valid) {
      console.warn(msg + JSON.stringify(text));
      return null;
    }

    // Move backwards through the offsets, normalizing as many
    // one-past-the-end components as possible. For example, if every
    // component of 1.2.3.4 is pointing at its last child except for the
    // last component, which is pointing one-past-the-end, this produces
    // 1.2.3.4 -> 1.2.4 -> 1.3 -> 2. Afterward, remove any trailing zero
    // components.
    const container = (function() {
      let node = root;
      for (let i = 0; i < n - 1; ++i) {
        node = node.childNodes[offsets[i]];
      }
      while (n > 1 && offsets[n - 1] == node_length(node)) {
        node = node.parentNode;
        ++offsets[--n - 1];
      }
      while (n > 1 && offsets[n - 1] == 0) {
        node = node.parentNode;
        --n;
      }
      offsets.length = n;
      return node;
    })();

    return {container, offset: offsets[n - 1], offsets};
  }

  function address_cmp(a, b) {
    return cmp_addr(a.offsets, b.offsets);
  }

  const address_pairs = [];

  const query_string =
      document.URL.replace(/^[^?]*\??/, "").replace(/#.*/, "");
  for (const chunk of query_string.split("&")) {
    const param = chunk.split("=", 2);
    if (param.length == 2 && decodeURIComponent(param[0]) == "qref") {
      const pairs = decodeURIComponent(param[1]).split("+");
      for (const pair of pairs.map(x => x.split("-", 2))) {
        if (pair.length == 2) {
          const start = parse_address(pair[0]);
          const end = parse_address(pair[1]);
          if (start !== null && end !== null) {
            const cmp = address_cmp(start, end);
            if (cmp < 0) {
              address_pairs.push([start, end]);
            } else if (cmp > 0) {
              address_pairs.push([end, start]);
            }
          }
        }
      }
    }
  }

  address_pairs.sort((x, y) => address_cmp(x[0], y[0])
                               || address_cmp(x[1], y[1]));

  for (let i = 0; i < address_pairs.length - 1;) {
    const x = address_pairs[i];
    const y = address_pairs[i + 1];
    if (address_cmp(x[0], y[1]) <= 0 && address_cmp(y[0], x[1]) <= 0) {
      if (address_cmp(y[0], x[0]) < 0) {
        x[0] = y[0];
      }
      if (address_cmp(y[1], x[1]) > 0) {
        x[1] = y[1];
      }
      address_pairs.splice(i + 1, 1);
    } else {
      ++i;
    }
  }

  const ranges = [];
  const highlights = new Map();
  for (const [start, end] of address_pairs) {
    const range = document.createRange();
    range.setStart(start.container, start.offset);
    range.setEnd(end.container, end.offset);
    ranges.push(range);
    get_highlights(highlights, range);
  }

  for (const [node, pairs] of highlights) {
    pairs.sort((x, y) => x[0] - y[0]);
    const parent = node.parentNode;
    const s = node.textContent;
    const n = s.length;
    let new_nodes = [];
    let k = 0;
    for (const [i, j] of pairs) {
      if (k < i) {
        new_nodes.push(document.createTextNode(s.substring(k, i)));
      }
      const highlight = document.createElement("span");
      highlight.className = "qref_highlight";
      highlight.textContent = s.substring(i, j);
      new_nodes.push(highlight);
      k = j;
    }
    if (k < n) {
      new_nodes.push(document.createTextNode(s.substring(k, n)));
    }

    // Compute the new starts and ends for the ranges.
    let starts = [];
    let ends = [];
    let node_offset = null;
    function foo(container, offset) {
      if (container === node) {
        let i = 0;
        let n = new_nodes[0].textContent.length;
        while (n <= offset) {
          ++i;
          assert_normalized(i < new_nodes.length);
          n += new_nodes[i].textContent.length;
        }
        container = new_nodes[i];
        if (!is_text(container)) {
          container = container.childNodes[0];
        }
        offset = container.textContent.length - (n - offset);
      }
      return {container, offset};
    }
    for (const range of ranges) {
      starts.push(foo(range.startContainer, range.startOffset));
      ends.push(foo(range.endContainer, range.endOffset));
    }

    const wrapper = document.createElement("span");
    wrapper.className = "qref_wrapper";
    for (let i = 0; i < new_nodes.length; ++i) {
      wrapper.appendChild(new_nodes[i]);
    }
    parent.replaceChild(wrapper, node);

    // Update the ranges.
    for (let i = 0; i < ranges.length; ++i) {
      ranges[i] = document.createRange();
      ranges[i].setStart(starts[i].container, starts[i].offset);
      ranges[i].setEnd(ends[i].container, ends[i].offset);
    }
  }

  if (ranges.length > 0) {
    scroll_range_into_view(ranges[0]);
  }

  //--------------------------------------------------------------------

  const more_above = document.createElement("div");
  more_above.className = "qref_more_above";
  more_above.innerHTML = `
    <a>
      <span>0</span> more
      <!-- https://icons.getbootstrap.com/icons/chevron-up/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
      </svg>
    </a>
  `;
  const more_above_n = more_above.children[0].children[0];
  root.insertBefore(more_above, root.firstChild);

  const more_below = document.createElement("div");
  more_below.className = "qref_more_below";
  more_below.innerHTML = `
    <a>
      <span>0</span> more
      <!-- https://icons.getbootstrap.com/icons/chevron-down/ -->
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>
    </a>
  `;
  const more_below_n = more_below.children[0].children[0];
  root.insertBefore(more_below, root.lastChild);

  const links = document.createElement("div");
  links.className = "qref_links";
  root.insertBefore(links, root.firstChild);

  let link_count = 0;
  function get_link(j) {
    const id = "qref_" + j;
    var link = document.getElementById(id);
    if (link === null) {
      link = document.createElement("div");
      link.id = id;
      link.className = "qref_link";
      link.innerHTML = `
        <a href="">
          <!-- https://icons.getbootstrap.com/icons/link-45deg/ -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
          </svg>Permalink
        </a>
      `;
      links.appendChild(link);
      ++link_count;
    }
    return link;
  }

  document.addEventListener("selectionchange", function(event) {
    const selection = window.getSelection();
    let pairs = [];
    let j = 0;
    for (let i = 0; i < selection.rangeCount; ++i) {
      const range = selection.getRangeAt(i);
      if (!root.contains(range.startContainer)
          || !root.contains(range.endContainer)) {
        continue;
      }
      const addr1 =
          compute_address(range.startContainer, range.startOffset);
      const addr2 =
          compute_address(range.endContainer, range.endOffset);
      if (cmp_addr(addr1, addr2) == 0) {
        continue;
      }
      const range_rects = range.getClientRects();
      if (range_rects.length == 0) {
        continue;
      }
      pairs.push([addr1, addr2]);
      const viewport = get_viewport();
      const range_left = range_rects[0].left;
      const range_top = range_rects[0].top;
      const link = get_link(j++);
      link.style.display = "block";
      const link_bound = link.getBoundingClientRect();
      const link_width = link_bound.right - link_bound.left;
      const link_height = link_bound.bottom - link_bound.top;
      const link_left =
          viewport.scroll.left
          + Math.max(Math.min(range_left - viewport.left,
                              viewport.width - link_width),
                     0);
      const link_top =
          viewport.scroll.top + range_top - viewport.top - link_height;
      link.style.left = `${link_left}px`;
      link.style.top = `${link_top}px`;
    }
    pairs.sort((x, y) => cmp_addr(x[0], y[0]));
    pairs = pairs.map(x => x.map(y => y.join(".")).join("-")).join("+");
    for (let i = 0; i < j; ++i) {
      const link = get_link(i);
      link.children[0].href = `?qref=${pairs}`;
    }
    for (; j < link_count; ++j) {
      get_link(j).style.display = "none";
    }
  });

  let more_above_range = null;
  let more_below_range = null;

  function update_more_buttons() {

    const viewport = get_viewport();

    const [above_count, below_count] = (function() {
      let above_count = 0;
      let below_count = 0;
      more_above_range = null;
      more_below_range = null;
      for (const range of ranges) {
        const bound = range.getBoundingClientRect();
        if (bound.bottom < viewport.top) {
          ++above_count;
          more_above_range = range;
        } else if (bound.top > viewport.bottom) {
          ++below_count;
          if (below_count == 1) {
            more_below_range = range;
          }
        }
      }
      return [above_count, below_count];
    })();

    let style = null;

    if (above_count > 0) {
      more_above_n.innerHTML = above_count;
      if (root !== document.body) {
        if (style === null) {
          style = window.getComputedStyle(root);
        }
        more_above.style.top = `-${style.paddingTop}`;
      }
      more_above.style.display = "block";
    } else {
      more_above.style.display = "none";
    }

    if (below_count > 0) {
      more_below_n.innerHTML = below_count;
      if (root !== document.body) {
        if (style === null) {
          style = window.getComputedStyle(root);
        }
        more_below.style.bottom = `-${style.paddingBottom}`;
      }
      more_below.style.display = "block";
    } else {
      more_below.style.display = "none";
    }
  }

  update_more_buttons();

  if (root === document.body) {
    document.addEventListener("scroll", update_more_buttons);
  } else {
    root.addEventListener("scroll", update_more_buttons);
  }
  window.addEventListener("resize", update_more_buttons);

  more_above.addEventListener("click", function() {
    // The button should be hidden and therefore impossible to click
    // when more_above_range is null, but we'll check anyway.
    if (more_above_range !== null) {
      scroll_range_into_view(more_above_range);
    }
  });

  more_below.addEventListener("click", function() {
    // The button should be hidden and therefore impossible to click
    // when more_below_range is null, but we'll check anyway.
    if (more_below_range !== null) {
      scroll_range_into_view(more_below_range);
    }
  });
}

//----------------------------------------------------------------------

{
  const root = window.qref_root_element;
  if (root !== null) {
    if (root === undefined) {
      qref(document.body);
    } else if (!(root instanceof HTMLElement)) {
      console.error("Invalid qref_root_element.");
    } else if (!document.body.contains(root)) {
      console.error("Invalid qref_root_element.");
    } else {
      qref(root);
    }
  }
}
