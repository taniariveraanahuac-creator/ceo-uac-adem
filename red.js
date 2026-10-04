/* CEO León · conexión en vivo sin registro
   Sustituye las funciones de Claude (db, room, user) por una red directa entre
   dispositivos (WebRTC con PeerJS). La computadora del creador es el "servidor":
   guarda la partida y la reparte a los celulares. Nadie necesita cuenta ni correo.
   Requisito: la pestaña del creador debe quedar abierta durante todo el juego. */
(function () {
  "use strict";
  var PFX = "ceoleon-anahuac-cun-";          // prefijo único de los identificadores
  var LIVE_ID = PFX + "partida-activa";      // buzón donde el creador anuncia su código
  var OPTS = {
    debug: 0,
    config: { iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" }
    ] }
  };
  window.__ceoRole = window.__ceoRole || "";

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function codeFromPath(p) { var m = /^games\/([A-Z0-9]+)$/i.exec(p); return m ? m[1].toUpperCase() : ""; }
  function hashCode() { var m = /=([A-Za-z0-9]{4})/.exec(location.hash || ""); return m ? m[1].toUpperCase() : ""; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function newPeer(id) {
    return new Promise(function (res, rej) {
      var p = id ? new Peer(id, OPTS) : new Peer(OPTS), done = false;
      p.on("open", function () { if (!done) { done = true; res(p); } });
      p.on("error", function (e) { if (!done) { done = true; try { p.destroy(); } catch (x) {} rej(e); } });
      p.on("disconnected", function () { if (!p.destroyed) setTimeout(function () { try { p.reconnect(); } catch (x) {} }, 1500); });
      setTimeout(function () { if (!done) { done = true; rej(new Error("timeout")); } }, 15000);
    });
  }

  /* ================= CREADOR (servidor) ================= */
  var H = { peer: null, code: "", state: null, conns: [], pres: {}, myPres: {}, peerCbs: [], livePeer: null };
  function hostPeersList() {
    var l = [{ id: "host", presence: H.myPres, isMe: true, sameTab: true }];
    Object.keys(H.pres).forEach(function (id) { if (H.pres[id]) l.push({ id: id, presence: H.pres[id], isMe: false, sameTab: false }); });
    return l;
  }
  function hostSend(c, m) { try { if (c.open) c.send(m); } catch (e) {} }
  function hostBroadcastPeers() {
    var list = hostPeersList().map(function (p) { return { id: p.id, presence: p.presence }; });
    H.conns.forEach(function (c) { hostSend(c, { t: "peers", list: list }); });
    H.peerCbs.forEach(function (cb) { try { cb(); } catch (e) {} });
  }
  async function hostStart(code) {
    if (H.peer && H.code === code && !H.peer.destroyed) return;
    if (H.peer) { try { H.peer.destroy(); } catch (e) {} }
    H.code = code; H.conns = []; H.pres = {};
    H.peer = await newPeer(PFX + code);
    H.peer.on("connection", function (c) {
      c.on("open", function () {
        H.conns.push(c);
        if (H.state) hostSend(c, { t: "state", d: H.state });
        hostBroadcastPeers();
      });
      c.on("data", function (m) {
        if (!m || typeof m !== "object") return;
        if (m.t === "hello" && H.state) hostSend(c, { t: "state", d: H.state });
        if (m.t === "pres") { H.pres[c.peer] = m.p; hostBroadcastPeers(); }
      });
      c.on("close", function () { H.conns = H.conns.filter(function (x) { return x !== c; }); delete H.pres[c.peer]; hostBroadcastPeers(); });
      c.on("error", function () {});
    });
  }
  async function announceLive(code) {
    if (H.livePeer && !H.livePeer.destroyed) { H.liveCode = code; return; }
    H.liveCode = code;
    try {
      H.livePeer = await newPeer(LIVE_ID);
      H.livePeer.on("connection", function (c) {
        c.on("open", function () { hostSend(c, { t: "live", code: H.liveCode }); setTimeout(function () { try { c.close(); } catch (e) {} }, 1500); });
      });
    } catch (e) { /* otro creador ya ocupa el buzón: los equipos entran con QR o código */ }
  }

  /* ================= CELULAR (cliente) ================= */
  var C = { peer: null, code: "", conn: null, state: null, list: [], snapCbs: [], peerCbs: [], myPres: null, connecting: null };
  async function clientPeer() {
    if (C.peer && !C.peer.destroyed) return C.peer;
    C.peer = await newPeer(null);
    return C.peer;
  }
  function clientConnect(code) {
    if (C.code === code && C.conn && C.conn.open) return Promise.resolve(true);
    if (C.code === code && C.connecting) return C.connecting;
    if (C.conn && C.code !== code) { try { C.conn.close(); } catch (e) {} C.conn = null; C.state = null; }
    C.code = code;
    C.connecting = (async function () {
      var p = await clientPeer();
      return await new Promise(function (res) {
        var c = p.connect(PFX + code, { reliable: true }), ok = false;
        c.on("open", function () {
          ok = true; C.conn = c;
          c.send({ t: "hello" });
          if (C.myPres) c.send({ t: "pres", p: C.myPres });
          res(true);
        });
        c.on("data", function (m) {
          if (!m || typeof m !== "object") return;
          if (m.t === "state") { C.state = m.d; C.snapCbs.forEach(function (cb) { try { cb({ exists: true, data: function () { return C.state; } }); } catch (e) {} }); }
          if (m.t === "peers") { C.list = m.list || []; C.peerCbs.forEach(function (cb) { try { cb(); } catch (e) {} }); }
        });
        c.on("close", function () {
          if (C.conn === c) C.conn = null;
          if (C.code === code && (C.snapCbs.length || C.peerCbs.length)) setTimeout(function () { C.connecting = null; clientConnect(code); }, 3000);
        });
        c.on("error", function () {});
        setTimeout(function () { if (!ok) { try { c.close(); } catch (e) {} res(false); } }, 9000);
      });
    })().finally(function () { C.connecting = null; });
    return C.connecting;
  }
  async function clientGetState(code) {
    var ok = await clientConnect(code);
    if (!ok) return null;
    for (var i = 0; i < 40 && !C.state; i++) await wait(150);
    return C.state;
  }
  async function askLive() {
    var hc = hashCode(); if (hc) return hc;
    try {
      var p = await clientPeer();
      return await new Promise(function (res) {
        var c = p.connect(LIVE_ID), done = false;
        c.on("data", function (m) { if (!done && m && m.t === "live") { done = true; res(m.code); try { c.close(); } catch (e) {} } });
        c.on("error", function () {});
        setTimeout(function () { if (!done) { done = true; try { c.close(); } catch (e) {} res(""); } }, 6000);
      });
    } catch (e) { return ""; }
  }

  /* ================= API que espera el juego ================= */
  function snap(d) { return { exists: !!d, data: function () { return d; } }; }
  var db = {
    doc: function (path) {
      var code = codeFromPath(path), isLive = path === "live/actual";
      return {
        get: async function () {
          if (isLive) { var lc = await askLive(); return snap(lc ? { code: lc, ts: Date.now() } : null); }
          if (window.__ceoRole === "host") {
            if (H.code === code && H.state) return snap(H.state);
            var saved = store("ceoleon-g-" + code);
            if (!saved) return snap(null);
            H.state = JSON.parse(saved); await hostStart(code); return snap(H.state);
          }
          return snap(await clientGetState(code));
        },
        set: async function (obj) {
          if (isLive) { await announceLive(obj.code); return; }
          await hostStart(code);
          H.state = obj;
          store("ceoleon-g-" + code, JSON.stringify(obj));
          H.conns.forEach(function (c) { hostSend(c, { t: "state", d: obj }); });
        },
        onSnapshot: function (cb) {
          if (isLive) {
            var stop = false, last = "";
            (async function loop() {
              while (!stop) {
                var lc = await askLive();
                if (lc && lc !== last) { last = lc; cb(snap({ code: lc, ts: Date.now() })); }
                await wait(8000);
              }
            })();
            return function () { stop = true; };
          }
          C.snapCbs.push(cb);
          if (C.code === code && C.state) setTimeout(function () { cb(snap(C.state)); }, 0);
          clientConnect(code);
          return function () { C.snapCbs = C.snapCbs.filter(function (x) { return x !== cb; }); };
        }
      };
    }
  };

  var room = {
    join: async function (name) {
      var code = String(name).replace(/^ceo-/, "").toUpperCase();
      if (window.__ceoRole === "host") {
        await hostStart(code);
        H.myPres = {};
        return {
          presence: async function (o) { H.myPres = Object.assign({}, H.myPres, o); hostBroadcastPeers(); },
          onPeers: function (cb) { H.peerCbs.push(cb); return function () { H.peerCbs = H.peerCbs.filter(function (x) { return x !== cb; }); }; },
          peers: hostPeersList,
          leave: async function () { H.peerCbs = []; }
        };
      }
      var ok = await clientConnect(code);
      if (!ok) throw new Error("sin conexión con el creador");
      C.myPres = {};
      return {
        presence: async function (o) {
          C.myPres = Object.assign({}, C.myPres || {}, o);
          if (C.conn && C.conn.open) C.conn.send({ t: "pres", p: C.myPres });
          else throw new Error("sin conexión");
        },
        onPeers: function (cb) { C.peerCbs.push(cb); return function () { C.peerCbs = C.peerCbs.filter(function (x) { return x !== cb; }); }; },
        peers: function () {
          var me = C.peer && C.peer.id;
          return C.list.map(function (p) { return { id: p.id, presence: p.presence, isMe: p.id === me, sameTab: p.id === me }; });
        },
        leave: async function () {
          C.myPres = null; C.peerCbs = [];
          try { if (C.conn && C.conn.open) C.conn.send({ t: "pres", p: null }); } catch (e) {}
        }
      };
    }
  };

  var user = { canEdit: async function () { return true; } };

  window.claude = {
    use: async function (n) {
      if (typeof Peer !== "function") throw new Error("PeerJS no cargó");
      return { db: db, room: room, user: user }[n] || null;
    }
  };
})();
