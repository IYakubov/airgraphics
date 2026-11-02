# AirShape Design

A Figma-style design tool you control with your hands, in one HTML file (`index.html`).

- **Hands** → *This computer's camera* or *Phone as camera* (scan the QR code, tap **Start camera**).
- Gestures: index finger = Select · two L-hands = Frame · thumb+index ring = Ellipse · German three = Triangle · crossed index fingers "+" = Rectangle · 👎 = Undo · pinch = draw/select/drag · fist = pan · two fists = zoom.
- After a gesture picks a tool, open your hand, then pinch to act.
- Mouse & keyboard work too (V F R O Y T H, Space-drag, Ctrl+scroll, Ctrl+Z/D).

`server.js` is a tiny dependency-free static server used for hosting on Railway (`npm start`). Phone camera needs the page served over https.
