# Logic Lab — Circuit Studio

A lightweight, open-source digital logic workbench built with Vue 3. Place logic gates, connect signals, toggle inputs, and explore the resulting **truth table / tableau de vérité**—right in the browser.

> This is an independent, focused logic-circuit editor inspired by schematic workflows. It is not affiliated with or a replacement for NI Multisim, and intentionally does not include Multisim's advanced analog, PCB, or instrumentation tools.

## Features

- **Schematic editor:** drag components from the library, click to add, and drag to move them on a dotted grid.
- **Digital components:** interactive inputs, VCC (logic HIGH), GND (logic LOW), LED outputs, and AND, OR, NOT, XOR, NAND, NOR, and XNOR gates.
- **Pin-to-pin wiring:** click an output pin, then a destination input pin. Existing input connections are replaced cleanly.
- **Live logic simulation:** toggle an input and immediately see active wires, LED state, and the matching truth-table row update.
- **Truth table:** generated from the circuit, with up to eight input variables; copy results as CSV.
- **English / French UI:** switch between English and French from the top bar.
- **Local-first persistence:** circuits and workspace layout autosave to browser `localStorage`. Export a portable project as JSON.
- **Workspace controls:** resizable component library, inspector, and truth-table panel; zoom, grid snapping, undo/redo, duplicate, delete, and keyboard shortcuts.
- **Responsive layout:** desktop sidebars and mobile slide-in component/inspector panels.

Unconnected gate inputs are treated as LOW. The truth-table generator shows the first eight input switches; any additional sources retain their current switch state.

## Run locally

```bash
npm install
npm run dev
```

For a production build and local preview:

```bash
npm run build
npm run preview
```

Run the logic-engine tests with:

```bash
npm test
```

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |
| `Delete` / `Backspace` | Delete selected component or wire |
| `/` | Focus component search |
| `Esc` | Cancel wire placement / close help |

## Open source

Created by **Nour Yahyaoui**.

- GitHub: [nour-yahyaoui](https://github.com/nour-yahyaoui)
- Repository: [Nour-yahyaoui/multisim-pro](https://github.com/Nour-yahyaoui/multisim-pro)
- License: [MIT](LICENSE)
