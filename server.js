// AirShape Design server: static files + /ws pairing channel for "phone as camera".
// The phone and computer join a room; signaling messages (WebRTC offer/answer/ICE) are passed between them,
// and if a direct WebRTC link can't be made, the phone's JPEG frames are relayed to the computer.
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const ROOT = __dirname, PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const PUBLIC = new Set(['/index.html']);

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/health') { res.writeHead(200); return res.end('ok'); }
  if (p === '/' || !path.extname(p)) p = '/index.html';
  if (!PUBLIC.has(p)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(ROOT, p), (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4 * 1024 * 1024 });
const rooms = new Map();                       // room -> { host, phone }
const send = (ws, m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };

wss.on('connection', ws => {
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', (data, isBinary) => {
    const r = rooms.get(ws.room);
    if (isBinary) {                            // relayed camera frame: phone -> host, drop if host is backed up
      if (r && ws.role === 'phone' && r.host && r.host.readyState === 1 && r.host.bufferedAmount < 1.5e6) r.host.send(data, { binary: true });
      return;
    }
    let m; try { m = JSON.parse(data); } catch { return; }
    if (m.t === 'ping') return;
    if (m.t === 'host' && typeof m.room === 'string') {
      ws.role = 'host'; ws.room = m.room;
      const room = rooms.get(m.room) || { host: null, phone: null };
      if (room.host && room.host !== ws) room.host.close();
      room.host = ws; rooms.set(m.room, room);
      return;
    }
    if (m.t === 'join' && typeof m.room === 'string') {
      const room = rooms.get(m.room);
      if (!room || !room.host) return send(ws, { t: 'nohost' });
      ws.role = 'phone'; ws.room = m.room;
      if (room.phone && room.phone !== ws) room.phone.close();
      room.phone = ws;
      send(room.host, { t: 'joined' }); send(ws, { t: 'ok' });
      return;
    }
    if (!r) return;
    send(ws.role === 'host' ? r.phone : r.host, m);   // offer / answer / ice / relay / stop
  });
  ws.on('close', () => {
    const r = rooms.get(ws.room); if (!r) return;
    if (r[ws.role] === ws) {
      r[ws.role] = null;
      send(ws.role === 'host' ? r.phone : r.host, { t: 'left' });
    }
    if (!r.host && !r.phone) rooms.delete(ws.room);
  });
});
setInterval(() => wss.clients.forEach(ws => { if (!ws.alive) return ws.terminate(); ws.alive = false; ws.ping(); }), 25000);

server.listen(PORT, () => console.log('AirShape Design on port ' + PORT));
