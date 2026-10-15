# Blockcraft

A Minecraft-style voxel game that runs in the browser. No build step, no image assets: every texture is generated in code.

## Structure
| File | Language | Purpose |
|---|---|---|
| `index.html` | HTML | Page shell and script loading |
| `css/style.css` | CSS | HUD, hotbar, menus, inventory GUI |
| `js/engine.js` | JavaScript | Terrain, textures, rendering, physics, break/place |
| `js/inventory.js` | JavaScript | Inventory, hotbar, creative palette, crafting |
| `js/menu.js` | JavaScript | Title screen, game modes, pause menu |

## Game modes
- **Survival**: break blocks to collect them, place from your hotbar, craft in the 2x2 grid.
- **Creative**: infinite blocks from a palette, fly with F.

## Controls
WASD move · Space jump · Shift sprint · Left/Right click break/place · 1-9 or wheel hotbar · E inventory · F fly (creative, C = down)

## Crafting recipes
Log → 4 Planks · 4 Planks → Crafting Table · Stone → Cobblestone · 4 Cobblestone → 4 Bricks

## Run / host
Open `index.html` (needs internet for the Three.js CDN). For GitHub Pages: Settings → Pages → main branch, root.
