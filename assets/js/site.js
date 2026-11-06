/* Wallyford Community Council: small site helpers.
   1. Mobile menu
   2. Next meeting and Torchlight Parade dates
   3. "You said, we did" tracker, read from a published Google Sheet (CSV)
   4. "Coming up" list of events
   5. Back to top button
   6. Community Speedwatch results, read from a published Google Sheet (CSV)
*/
(function () {
  "use strict";

  var cfg = window.WCC || {};

  /* ---------------- 1. Mobile menu ---------------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  /* ---------------- 2. Dates ---------------- */

  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  var fmtLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  var fmtShort = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

  function lastWeekday(year, month, weekday) {
    var d = new Date(year, month + 1, 0);
    while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
    return d;
  }

  function firstWeekday(year, month, weekday) {
    var d = new Date(year, month, 1);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    return d;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // Last Wednesday of the month, 6.30pm, no meetings in July or December.
  function nextMeeting(now) {
    for (var i = 0; i < 14; i++) {
      var d = lastWeekday(now.getFullYear(), now.getMonth() + i, 3);
      if (d.getMonth() === 6 || d.getMonth() === 11) continue;
      var finished = new Date(d);
      finished.setHours(21, 0, 0, 0);
      if (finished >= now) return d;
    }
    return null;
  }

  // First Friday of December.
  function nextParade(now) {
    var d = firstWeekday(now.getFullYear(), 11, 5);
    var finished = new Date(d);
    finished.setHours(22, 0, 0, 0);
    if (finished < now) d = firstWeekday(now.getFullYear() + 1, 11, 5);
    return d;
  }

  function fillDates(selector, date, now) {
    if (!date) return;
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var prefix = nodes[i].getAttribute("data-prefix") || "";
      nodes[i].textContent = prefix + (sameDay(date, now) ? "Tonight, " + fmtLong.format(date) : fmtLong.format(date));
    }
  }

  function initDates() {
    var now = new Date();
    fillDates("[data-next-meeting]", nextMeeting(now), now);
    fillDates("[data-parade-date]", nextParade(now), now);
  }

  /* ---------------- 3. You said, we did ---------------- */

  // Column headings in the Google Sheet -> field names used here.
  // Matching ignores case, spaces and punctuation, so column order can change.
  var COLUMNS = {
    ref: "ref",
    dateraised: "raised",
    raisedat: "via",
    topic: "topic",
    yousaid: "said",
    wedid: "did",
    status: "status",
    lastupdated: "updated",
    showonwebsite: "show"
  };

  function parseCSV(text) {
    var rows = [], row = [], field = "", inQuotes = false;
    text = text.replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field); field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else {
        field += c;
      }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function parseDate(s) {
    if (!s) return null;
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      var y = +m[3];
      if (y < 100) y += 2000;
      return new Date(y, +m[2] - 1, +m[1]);
    }
    m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})$/);
    if (m) {
      var mi = MONTHS.indexOf(m[2].toLowerCase());
      if (mi > -1) return new Date(+m[3], mi, +m[1]);
    }
    return null;
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function toItems(rows) {
    if (!rows.length) return [];
    var keys = rows[0].map(function (h) {
      return COLUMNS[h.toLowerCase().replace(/[^a-z]/g, "")] || null;
    });
    var hasShow = keys.indexOf("show") !== -1;
    var items = [];
    for (var r = 1; r < rows.length; r++) {
      var o = {};
      for (var k = 0; k < keys.length; k++) {
        if (keys[k]) o[keys[k]] = (rows[r][k] || "").trim();
      }
      if (!o.said) continue;
      if (hasShow && !/^(true|yes|y|1|x)$/i.test(o.show || "")) continue;
      o.status = o.status || "New";
      o.statusKey = slug(o.status);
      o.group = (o.statusKey === "done" || o.statusKey === "closed") ? "done" : "open";
      o.raisedDate = parseDate(o.raised);
      o.updatedDate = parseDate(o.updated) || o.raisedDate;
      o.row = r;
      items.push(o);
    }
    return items.sort(byRecent);
  }

  // Most recently updated first. Same date: the row further down the
  // sheet (usually the newer entry) comes first.
  function byRecent(a, b) {
    var t = (b.updatedDate ? b.updatedDate.getTime() : 0) - (a.updatedDate ? a.updatedDate.getTime() : 0);
    return t || (b.row - a.row);
  }

  // Full list: ongoing items first, then done/closed, each most recent first.
  function byGroupThenRecent(a, b) {
    if (a.group !== b.group) return a.group === "open" ? -1 : 1;
    return byRecent(a, b);
  }

  function make(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderItem(o) {
    var art = make("article", "ysd-item");

    var meta = make("div", "ysd-meta");
    meta.appendChild(make("span", "status status-" + o.statusKey, o.status));
    if (o.topic) meta.appendChild(make("span", "topic", o.topic));
    var raised = [];
    if (o.raisedDate) raised.push("Raised " + fmtShort.format(o.raisedDate));
    if (o.via) raised.push(o.via);
    if (raised.length) meta.appendChild(make("span", null, raised.join(" · ")));
    if (o.updatedDate) meta.appendChild(make("span", "ysd-updated", "Updated " + fmtShort.format(o.updatedDate)));
    art.appendChild(meta);

    var body = make("div", "ysd-body");
    var said = make("div", "ysd-col");
    said.appendChild(make("h3", null, "You said"));
    said.appendChild(make("p", "ysd-said", o.said));
    var did = make("div", "ysd-col");
    did.appendChild(make("h3", null, "We did"));
    // A line starting "You can help:" is shown as its own highlighted note.
    var parts = (o.did || "We've logged this and will post an update soon.").split(/\n?\s*You can help:\s*/i);
    did.appendChild(make("p", "ysd-did", parts[0].trim()));
    if (parts[1]) {
      var help = make("p", "ysd-help");
      help.appendChild(make("strong", null, "You can help: "));
      help.appendChild(document.createTextNode(parts.slice(1).join(" ").trim()));
      did.appendChild(help);
    }
    body.appendChild(said);
    body.appendChild(did);
    art.appendChild(body);
    return art;
  }

  function showNotice(el, kind, html) {
    if (!el) return;
    el.innerHTML = "";
    var box = make("div", "notice" + (kind === "warn" ? " notice-warn" : ""));
    var p = document.createElement("p");
    p.innerHTML = html;
    box.appendChild(p);
    el.appendChild(box);
  }

  function setupFullList(items, list) {
    var toolbar = document.getElementById("ysd-toolbar");
    var summary = document.getElementById("ysd-summary");
    var topicSelect = document.getElementById("ysd-topic");
    var search = document.getElementById("ysd-search");
    var chips = toolbar ? toolbar.querySelectorAll(".chip") : [];
    var state = { group: "all", topic: "", q: "" };

    if (!items.length) {
      list.innerHTML = "";
      list.appendChild(make("p", "ysd-empty", "Nothing to show yet. Check back soon."));
      return;
    }

    var topics = [];
    items.forEach(function (o) { if (o.topic && topics.indexOf(o.topic) === -1) topics.push(o.topic); });
    topics.sort().forEach(function (t) {
      var opt = make("option", null, t);
      opt.value = t;
      topicSelect.appendChild(opt);
    });
    if (toolbar) toolbar.hidden = false;

    function render() {
      var q = state.q.toLowerCase();
      var shown = items.slice().sort(byGroupThenRecent).filter(function (o) {
        if (state.group !== "all" && o.group !== state.group) return false;
        if (state.topic && o.topic !== state.topic) return false;
        if (q) {
          var hay = [o.said, o.did, o.topic, o.ref, o.status].join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
      list.innerHTML = "";
      shown.forEach(function (o) { list.appendChild(renderItem(o)); });
      if (!shown.length) list.appendChild(make("p", "ysd-empty", "Nothing matches that. Try a different search or filter."));

      var open = items.filter(function (o) { return o.group === "open"; }).length;
      var done = items.length - open;
      summary.textContent = (shown.length === items.length ? items.length + " items" : "Showing " + shown.length + " of " + items.length + " items") +
        ": " + open + " ongoing, " + done + " done.";
    }

    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener("click", function () {
        state.group = chip.getAttribute("data-status");
        Array.prototype.forEach.call(chips, function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        render();
      });
    });
    topicSelect.addEventListener("change", function () { state.topic = topicSelect.value; render(); });
    search.addEventListener("input", function () { state.q = search.value.trim(); render(); });

    render();
  }

  function renderLatest(items, box) {
    box.innerHTML = "";
    if (!items.length) {
      box.appendChild(make("p", "ysd-empty", "No updates yet. Check back soon."));
      return;
    }
    items.slice(0, 3).forEach(function (o) { box.appendChild(renderItem(o)); });
  }

  function initTracker() {
    var list = document.getElementById("ysd-list");
    var latest = document.getElementById("ysd-latest");
    var target = list || latest;
    if (!target) return;
    var notice = document.getElementById(list ? "ysd-notice" : "ysd-latest-notice");

    var live = !!(cfg.trackerUrl && String(cfg.trackerUrl).trim());
    if (!live && !cfg.draft) {
      // Not connected and not in draft mode: don't show example data to the public.
      target.innerHTML = "";
      target.appendChild(make("p", "ysd-empty", "Updates will appear here soon."));
      return;
    }

    var url = live ? String(cfg.trackerUrl).trim() : cfg.sampleUrl;
    target.setAttribute("aria-busy", "true");
    target.innerHTML = "";
    target.appendChild(make("p", "ysd-empty", "Loading updates…"));

    fetch(url, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        if (/^\s*</.test(text)) throw new Error("Expected CSV, got HTML");
        var items = toItems(parseCSV(text));
        if (!live) {
          showNotice(notice, "info",
            "<strong>Preview.</strong> These entries are copied from our action tracker. Once the tracker sheet is connected, this list will update from it automatically.");
        }
        if (list) setupFullList(items, list); else renderLatest(items, latest);
      })
      .catch(function () {
        target.innerHTML = "";
        showNotice(notice, "warn",
          "Sorry, we couldn't load the latest updates just now. Please try again later.");
      })
      .then(function () { target.removeAttribute("aria-busy"); });
  }

  /* ---------------- 4. Coming up ---------------- */

  function atTime(d, h, m) {
    var x = new Date(d);
    x.setHours(h, m || 0, 0, 0);
    return x;
  }

  // Regular events, worked out for a given year.
  function regularEvents(year) {
    var list = [];
    var link = function (path) { return (cfg.base || "/") + path; };
    for (var m = 0; m < 12; m++) {
      if (m === 6 || m === 11) continue;
      list.push({
        date: lastWeekday(year, m, 3), ends: 21,
        title: "Community council meeting",
        time: "6.30pm", place: "Assembly Hall, Wallyford Learning Campus (Leisure entrance)",
        link: link("council/#meetings")
      });
    }
    // Remembrance Sunday is the second Sunday in November.
    var firstSunday = firstWeekday(year, 10, 0);
    list.push({
      date: new Date(year, 10, firstSunday.getDate() + 7), ends: 13,
      title: "Remembrance Sunday",
      time: "10am service at Wallyford Community Church, 10.50am wreath laying",
      place: "War memorial, foot of St Clement's Crescent",
      link: link("wallyford/#remembering")
    });
    list.push({
      date: new Date(year, 10, 11), ends: 12,
      title: "Armistice Day service",
      time: "10.45am", place: "Crookston War Memorial, Inveresk Cemetery",
      link: link("wallyford/#remembering")
    });
    list.push({
      date: firstWeekday(year, 11, 5), ends: 22,
      title: "Torchlight Parade and Christmas lights switch-on",
      time: "6.30pm", place: "Starts at the Miners' Charitable Society Club car park",
      link: link("council/#torchlight-parade")
    });
    list.push({
      date: firstWeekday(year, 5, 6), ends: 18,
      title: "Wallyford Gala Day",
      time: "", place: "",
      link: ""
    });
    list.push({
      date: new Date(year, 8, 10), ends: 15,
      title: "Battle of Pinkie commemoration",
      time: "1pm", place: "Pinkie Cleugh memorial stone, off Salters Road",
      link: link("wallyford/#pinkie")
    });
    return list;
  }

  function oneOffEvents() {
    var raw = Array.isArray(cfg.events) ? cfg.events : [];
    return raw.map(function (e) {
      var d = parseDate(String(e.date || ""));
      if (!d) return null;
      return { date: d, ends: 23, title: e.title || "", time: e.time || "", place: e.place || "", link: e.link || "" };
    }).filter(function (e) { return e && e.title; });
  }

  function initComingUp() {
    var box = document.getElementById("coming-up");
    if (!box) return;
    var now = new Date();
    var all = regularEvents(now.getFullYear())
      .concat(regularEvents(now.getFullYear() + 1))
      .concat(oneOffEvents())
      .filter(function (e) { return atTime(e.date, e.ends) >= now; })
      .sort(function (a, b) { return a.date - b.date; })
      .slice(0, +(box.getAttribute("data-count") || 4));
    if (!all.length) return;

    var dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
    var monFmt = new Intl.DateTimeFormat("en-GB", { month: "short" });
    var list = make("ul", "events");
    all.forEach(function (e) {
      var li = make("li", "event");
      var inner = e.link ? make("a", "event-inner") : make("div", "event-inner");
      if (e.link) inner.href = e.link;
      var badge = make("span", "event-date");
      badge.appendChild(make("span", "event-day", sameDay(e.date, now) ? "Today" : dayFmt.format(e.date)));
      badge.appendChild(make("span", "event-num", String(e.date.getDate())));
      badge.appendChild(make("span", "event-mon", monFmt.format(e.date)));
      var text = make("span", "event-text");
      text.appendChild(make("span", "event-title", e.title));
      var detail = [e.time, e.place].filter(Boolean).join(" \u00b7 ");
      if (detail) text.appendChild(make("span", "event-detail", detail));
      inner.appendChild(badge);
      inner.appendChild(text);
      li.appendChild(inner);
      list.appendChild(li);
    });
    box.innerHTML = "";
    box.appendChild(list);
  }

  /* ---------------- 5. Back to top ---------------- */

  function initToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle("is-visible", window.scrollY > 1200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- 6. Community Speedwatch ---------------- */

  // Column headings in the Speedwatch results sheet -> field names used here.
  // Matching ignores case, spaces and punctuation, like the tracker.
  var CSW_COLUMNS = {
    date: "date",
    area: "area",
    location: "location",
    speedlimit: "limit",
    speedlimitmph: "limit",
    vehicleschecked: "checked",
    overthelimit: "over",
    noteforwebsite: "note",
    showonwebsite: "show"
  };

  var fmtNum = new Intl.NumberFormat("en-GB");
  var fmtMonthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
  var fmtDayMonthYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function toCount(s) {
    var n = parseInt(String(s || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? null : n;
  }

  function toSessions(rows) {
    if (!rows.length) return [];
    var keys = rows[0].map(function (h) {
      return CSW_COLUMNS[h.toLowerCase().replace(/[^a-z]/g, "")] || null;
    });
    var hasShow = keys.indexOf("show") !== -1;
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var o = {};
      for (var k = 0; k < keys.length; k++) {
        if (keys[k]) o[keys[k]] = (rows[r][k] || "").trim();
      }
      if (hasShow && !/^(true|yes|y|1|x)$/i.test(o.show || "")) continue;
      var date = parseDate(o.date);
      var checked = toCount(o.checked);
      if (!date || !checked) continue;
      out.push({
        date: date,
        area: o.area || "",
        location: o.location || "",
        limit: toCount(o.limit),
        checked: checked,
        over: Math.min(toCount(o.over) || 0, checked),
        note: o.note || "",
        row: r
      });
    }
    // Newest first. Same date: the row further down the sheet first.
    return out.sort(function (a, b) { return (b.date - a.date) || (b.row - a.row); });
  }

  // A rolling-digit counter, like a car's odometer.
  function Odometer(minDigits) {
    this.min = minDigits;
    this.value = 0;
    this.strips = []; // strips[0] is the units digit
    this.el = make("span", "odometer");
    this.el.setAttribute("aria-hidden", "true");
    this.render(0);
  }

  Odometer.prototype.size = function (digits) {
    while (this.strips.length < digits) {
      var cell = make("span", "odo-cell");
      var strip = make("span", "odo-strip");
      // 0-9 then 0 again, so 9 can roll smoothly round to 0.
      for (var d = 0; d <= 10; d++) strip.appendChild(make("span", null, String(d % 10)));
      cell.appendChild(strip);
      this.el.insertBefore(cell, this.el.firstChild);
      this.strips.push(strip);
    }
    while (this.strips.length > digits) {
      this.el.removeChild(this.strips.pop().parentNode);
    }
  };

  // v can be fractional mid-animation: each digit turns only while the
  // digit to its right rolls from 9 to 0, as on a real odometer.
  Odometer.prototype.render = function (v) {
    v = Math.max(0, v);
    var whole = Math.floor(v);
    this.size(Math.max(this.min, String(whole).length));
    for (var i = 0; i < this.strips.length; i++) {
      var p = Math.pow(10, i);
      var pos = Math.floor(v / p) % 10;
      var rest = v % p;
      if (rest > p - 1) pos += rest - (p - 1);
      this.strips[i].style.transform = "translateY(" + (-pos * 100 / 11) + "%)";
      this.strips[i].parentNode.classList.toggle("is-lead", i > 0 && whole < p);
    }
    this.value = v;
  };

  // Keep every digit turning, like a slot machine, while we wait for results.
  // Each digit gets its own speed (slower to the left) and a random start.
  Odometer.prototype.spin = function () {
    this.el.classList.add("is-spinning");
    for (var i = 0; i < this.strips.length; i++) {
      var strip = this.strips[i];
      var dur = 1.4 + i * 1.6 + Math.random() * 0.6;
      strip.style.transform = "";
      strip.style.animationDuration = dur.toFixed(2) + "s";
      strip.style.animationDelay = (-Math.random() * dur).toFixed(2) + "s";
      strip.parentNode.classList.remove("is-lead");
    }
  };

  // Calls frame(e) with e easing from 0 to 1 over ms milliseconds.
  function tween(ms, frame) {
    var job = { stopped: false };
    if (reduceMotion || ms <= 0 || !window.requestAnimationFrame) { frame(1); return job; }
    var start = null;
    function step(t) {
      if (job.stopped) return;
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / ms);
      frame(k === 1 ? 1 : 1 - Math.pow(1 - k, 3));
      if (k < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
    return job;
  }

  var CSW_NO_RESULTS = "No results yet. The counters will settle on real numbers once the first Speedwatch results are in.";

  function counter(label, odo, sub, cls) {
    var box = make("div", "csw-counter" + (cls ? " " + cls : ""));
    box.appendChild(make("p", "csw-counter-label", label));
    box.appendChild(odo.el);
    var value = make("span", "visually-hidden");
    box.appendChild(value);
    if (sub) box.appendChild(make("p", "csw-counter-sub", sub));
    return { el: box, value: value };
  }

  // The instrument panel with spinning counters, shown while results load
  // and while there are no results yet.
  function cswWaiting(message) {
    var panel = make("div", "csw-panel csw-waiting");
    panel.appendChild(make("p", "csw-scope", "Waiting for results"));
    var counters = make("div", "csw-counters");
    var checkedOdo = new Odometer(5);
    var overOdo = new Odometer(4);
    var checkedBox = counter("Vehicles checked", checkedOdo, null);
    var overBox = counter("Over the limit", overOdo, "Details passed to Police Scotland to follow up.", "csw-counter-over");
    checkedBox.value.textContent = "waiting for results";
    overBox.value.textContent = "waiting for results";
    counters.appendChild(checkedBox.el);
    counters.appendChild(overBox.el);
    panel.appendChild(counters);
    panel.appendChild(make("p", "csw-waiting-text", message));
    checkedOdo.spin();
    overOdo.spin();
    return panel;
  }

  function renderSpeedwatch(sessions, box) {
    box.innerHTML = "";
    if (!sessions.length) { box.appendChild(cswWaiting(CSW_NO_RESULTS)); return; }

    var areas = [];
    sessions.forEach(function (s) { if (s.area && areas.indexOf(s.area) === -1) areas.push(s.area); });
    areas.sort();
    var state = { area: "", showAll: false };

    // Area filter, only when there's more than one area to choose from.
    if (areas.length > 1) {
      var filter = make("div", "csw-filter");
      var flabel = make("span", "visually-hidden", "Show results for");
      flabel.id = "csw-area-label";
      var chips = make("div", "chips");
      chips.setAttribute("role", "group");
      chips.setAttribute("aria-labelledby", "csw-area-label");
      [""].concat(areas).forEach(function (a) {
        var chip = make("button", "chip", a || "All areas");
        chip.type = "button";
        chip.setAttribute("aria-pressed", String(a === state.area));
        chip.addEventListener("click", function () {
          state.area = a;
          state.showAll = false;
          Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
          update(true, true);
        });
        chips.appendChild(chip);
      });
      filter.appendChild(flabel);
      filter.appendChild(chips);
      box.appendChild(filter);
    }

    // The instrument panel.
    var panel = make("div", "csw-panel");
    var scope = make("p", "csw-scope");
    panel.appendChild(scope);

    var checkedOdo = new Odometer(5);
    var overOdo = new Odometer(4);
    var counters = make("div", "csw-counters");
    var checkedBox = counter("Vehicles checked", checkedOdo, null);
    var overBox = counter("Over the limit", overOdo, "Details passed to Police Scotland to follow up.", "csw-counter-over");
    counters.appendChild(checkedBox.el);
    counters.appendChild(overBox.el);
    panel.appendChild(counters);

    var meter = make("div", "csw-meter");
    var meterHead = make("div", "csw-meter-head");
    meterHead.appendChild(make("span", "csw-meter-label", "Kept to the limit"));
    var pctEl = make("span", "csw-meter-value", "0%");
    meterHead.appendChild(pctEl);
    meter.appendChild(meterHead);
    var track = make("div", "csw-meter-track");
    track.setAttribute("aria-hidden", "true");
    var fill = make("span", "csw-meter-fill");
    track.appendChild(fill);
    meter.appendChild(track);
    meter.appendChild(make("p", "csw-thanks", "Thank you to everyone who keeps to the limit."));
    panel.appendChild(meter);

    var latest = make("p", "csw-latest");
    panel.appendChild(latest);
    box.appendChild(panel);

    var announce = make("p", "visually-hidden");
    announce.setAttribute("aria-live", "polite");
    box.appendChild(announce);

    // Recent sessions table.
    var recent = make("div", "csw-recent");
    recent.appendChild(make("h3", null, "Recent sessions"));
    var scroll = make("div", "table-scroll");
    var table = make("table", "csw-table");
    table.appendChild(make("caption", "visually-hidden", "Speedwatch sessions, newest first"));
    var thead = make("thead");
    var hr = make("tr");
    [["Date", "csw-col-date"], ["Where", ""], ["Checked", "num"], ["Over the limit", "num"]].forEach(function (h) {
      var th = make("th", h[1] || null, h[0]);
      th.scope = "col";
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = make("tbody");
    table.appendChild(tbody);
    scroll.appendChild(table);
    recent.appendChild(scroll);
    var moreBtn = make("button", "btn btn-dark csw-more");
    moreBtn.type = "button";
    moreBtn.addEventListener("click", function () { state.showAll = !state.showAll; update(false, false); });
    recent.appendChild(moreBtn);
    box.appendChild(recent);

    var PAGE = 6;
    var job = null;
    var shownPct = 0;

    function renderTable(list) {
      tbody.innerHTML = "";
      var rows = state.showAll ? list : list.slice(0, PAGE);
      rows.forEach(function (s) {
        var tr = make("tr");
        tr.appendChild(make("td", "csw-date csw-col-date", fmtShort.format(s.date)));
        var where = make("td");
        where.appendChild(make("span", "csw-where", s.location || s.area || "Speedwatch session"));
        var bits = [];
        if (s.area && s.location) bits.push(s.area);
        if (s.limit) bits.push(s.limit + " mph limit");
        // On phones the date column is hidden and the date shows here instead.
        var detail = make("span", "csw-detail");
        detail.appendChild(make("span", "csw-when", fmtShort.format(s.date) + (bits.length ? " · " : "")));
        detail.appendChild(document.createTextNode(bits.join(" · ")));
        where.appendChild(detail);
        if (s.note) where.appendChild(make("span", "csw-note", s.note));
        tr.appendChild(where);
        tr.appendChild(make("td", "num", fmtNum.format(s.checked)));
        tr.appendChild(make("td", "num", fmtNum.format(s.over)));
        tbody.appendChild(tr);
      });
      moreBtn.hidden = list.length <= PAGE;
      moreBtn.textContent = state.showAll ? "Show fewer" : "Show all " + list.length + " sessions";
    }

    function update(animate, speak) {
      var list = state.area ? sessions.filter(function (s) { return s.area === state.area; }) : sessions;
      var checked = 0, over = 0;
      list.forEach(function (s) { checked += s.checked; over += s.over; });
      // Never round up to 100% if anyone at all was over the limit.
      var pct = over ? Math.min(99, Math.round((checked - over) / checked * 100)) : 100;

      var first = list[list.length - 1];
      var newest = list[0];
      var where = state.area || (areas.length > 1 ? "All areas" : areas[0] || "");
      scope.textContent = (where ? where + " · " : "") + "Since " + fmtMonthYear.format(first.date);

      var place = [newest.location, state.area ? "" : newest.area].filter(Boolean).join(", ");
      latest.textContent = list.length + (list.length === 1 ? " session" : " sessions") +
        " so far. Latest: " + fmtDayMonthYear.format(newest.date) + (place ? ", " + place : "") + ".";

      checkedBox.value.textContent = fmtNum.format(checked);
      overBox.value.textContent = fmtNum.format(over);

      var from = { c: checkedOdo.value, o: overOdo.value, p: shownPct };
      if (job) job.stopped = true;
      job = tween(animate ? 1800 : 0, function (e) {
        checkedOdo.render(from.c + (checked - from.c) * e);
        overOdo.render(from.o + (over - from.o) * e);
        shownPct = from.p + (pct - from.p) * e;
        pctEl.textContent = Math.round(shownPct) + "%";
        fill.style.width = shownPct + "%";
      });

      if (speak) {
        announce.textContent = (where || "Results") + ": " + fmtNum.format(checked) + " vehicles checked, " +
          fmtNum.format(over) + " over the limit, " + pct + "% kept to the limit.";
      }
      renderTable(list);
    }

    // Show the table and text straight away, and roll the counters up
    // from zero when the panel scrolls into view.
    var started = false;
    function begin() {
      if (started) return;
      started = true;
      update(true, false);
    }
    update(false, false);
    checkedOdo.render(0);
    overOdo.render(0);
    shownPct = 0;
    pctEl.textContent = "0%";
    fill.style.width = "0%";
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) { io.disconnect(); begin(); }
      }, { threshold: 0.35 });
      io.observe(panel);
    } else {
      begin();
    }
  }

  function initSpeedwatch() {
    var box = document.getElementById("csw-results");
    if (!box) return;
    var notice = document.getElementById("csw-notice");

    var live = !!(cfg.speedwatchUrl && String(cfg.speedwatchUrl).trim());
    if (!live && !cfg.draft) {
      // Not connected and not in draft mode: don't show example figures to the public.
      box.innerHTML = "";
      box.appendChild(cswWaiting(CSW_NO_RESULTS));
      return;
    }

    var url = live ? String(cfg.speedwatchUrl).trim() : cfg.speedwatchSampleUrl;
    box.setAttribute("aria-busy", "true");
    box.innerHTML = "";
    box.appendChild(cswWaiting("Loading the latest results…"));

    fetch(url, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        if (/^\s*</.test(text)) throw new Error("Expected CSV, got HTML");
        var sessions = toSessions(parseCSV(text));
        if (!live) {
          showNotice(notice, "info",
            "<strong>Example figures only.</strong> These aren't real results. Once the Speedwatch results sheet is connected, real figures will show here and update automatically.");
        }
        renderSpeedwatch(sessions, box);
      })
      .catch(function () {
        box.innerHTML = "";
        showNotice(notice, "warn",
          "Sorry, we couldn't load the latest Speedwatch results just now. Please try again later.");
      })
      .then(function () { box.removeAttribute("aria-busy"); });
  }

  /* ---------------- Start ---------------- */

  function start() {
    initNav();
    initDates();
    initTracker();
    initComingUp();
    initToTop();
    initSpeedwatch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
