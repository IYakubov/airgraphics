# AirShape Design

A Figma-style design tool you control with your hands, in one HTML file (`index.html`).

- **Hands** → *This computer's camera* or *Phone as camera* (scan the QR code, tap **Start camera**).
- Gestures: index finger = Select · two L-hands = Frame · thumb+index ring = Ellipse · German three = Triangle · crossed index fingers "+" = Rectangle · 👎 = Undo · pinch = draw/select/drag · fist = pan · two fists = zoom.
- After a gesture picks a tool, open your hand, then pinch to act.
- Mouse & keyboard work too (V F R O Y T H, Space-drag, Ctrl+scroll, Ctrl+Z/D).

`server.js` serves the page and runs the `/ws` pairing channel for **phone as camera** (`npm start`, uses the `ws` package).
The phone and computer pair through the server; video goes directly over WebRTC when possible and automatically falls back to frames relayed through the server when a direct link can't be made (different networks, client-isolated Wi-Fi). Phone camera needs https.
