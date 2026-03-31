# Eisenhower Matrix for Obsidian

Visualize your tasks as draggable dots on a continuous urgency/importance scatter plot — not just four discrete quadrants.

![Obsidian](https://img.shields.io/badge/Obsidian-v0.15.0+-purple)

## Features

- **Continuous coordinates** — tasks live at precise (urgency, importance) positions, not just "Q1/Q2/Q3/Q4"
- **Scatter plot visualization** — gradient heatmap background with color-coded dots (blue → red by priority)
- **Drag and drop** — freely reposition tasks with live coordinate feedback
- **Three-layer interaction** — dots only by default → hover for tooltip → click for detail panel
- **Detail panel** — rename, mark done/undone, delete
- **Customizable** — dot size, axis labels, quadrant labels, hide completed tasks

## Installation

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/NickZhuxy/obsidian-eisenhower-matrix/releases)
2. Create a folder `obsidian-eisenhower-matrix` in your vault's `.obsidian/plugins/` directory
3. Copy the three files into that folder
4. Enable the plugin in Settings → Community plugins

### From source

```bash
git clone https://github.com/NickZhuxy/obsidian-eisenhower-matrix.git
cd obsidian-eisenhower-matrix
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/obsidian-eisenhower-matrix/`.

## Usage

1. Click the scatter chart icon in the ribbon, or run **Open Eisenhower Matrix** from the command palette
2. **Double-click** anywhere on the canvas to create a new task
3. **Drag** dots to reposition them
4. **Click** a dot to open the detail panel (rename, complete, delete)

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Dot size | 16px | Size of task dots |
| Show axis labels | On | Display "URGENCY" and "IMPORTANCE" labels |
| Show quadrant labels | On | Display "DO FIRST", "SCHEDULE", etc. |
| Hide completed | Off | Hide done tasks from the canvas |

## Development

```bash
npm install
npm run dev      # watch mode
npm run build    # production build
npm test         # run tests
```

## License

MIT
