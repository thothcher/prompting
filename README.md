# Graph of Prompts

A presentation site about writing prompts that build real Angular and Next.js projects. Prepared for a lecture at IT Step Academy.

**Live site:** https://thothcher.github.io/prompting/

## What is inside

**Page 1: Prompts**

- **BLUEPRINTS**, the ten blocks a project prompt needs: Brief, Lens, Use cases, Environment, Patterns, Routes and data, Interface, Non-negotiables, Tests, Shape. It was built for this lecture from CRAFT, CO-STAR, RISEN and context engineering. It is a teaching tool, not an industry standard.
- A comparison of CRAFT, CO-STAR and RISEN with BLUEPRINTS, and six habits of good prompts.
- Ten prompts (five for Angular 22, five for Next.js 16.3), ordered from beginner to expert. Each prompt is split into its ten blocks. Click a block to see what it does, why it is written that way, and what the AI tends to do without it.

**Page 2: Mountain**

- One easy prompt with six technical words: auth, API, routing, render, SEO, responsive. Each word is a mountain peak, and each mountain opens into four layers: Framework, Code, Browser and network, Foundations. There are 104 concepts in total, each with a short note.

## Run it

There is nothing to install and no build step. Open the live site, or download this repository and double-click `index.html`.

The fonts load from Google Fonts. Without internet the page uses system fonts instead.

## Presenting

Turn on presenter mode with the projector button in the top bar or with Shift+P. The text gets larger and the top bar shows where you are. A presentation clicker (PageDown and PageUp) or the arrow keys then step through the whole lecture: the overview, the frameworks, each prompt block by block, then the mountain word by word and layer by layer.

| Key | Action |
|---|---|
| P / M | Prompts page / Mountain page |
| 1 to 9, 0 | Open prompt 01 to 10 (on the Mountain page, 1 to 6 choose a summit) |
| Left / Right arrow | Previous or next block, or previous or next summit |
| Esc | Close the open window, block or prompt |
| Shift+P | Presenter mode on or off |
| PageDown, Right arrow, Space | Next step (presenter mode) |
| PageUp, Left arrow | Previous step (presenter mode) |
| Home / End | First or last step (presenter mode) |
| B | Blank the screen; any key brings it back (presenter mode) |
| T | Light or dark theme |
| F | Fullscreen |
| ? | Show all shortcuts |

Deep links: `#p04` opens prompt 04, `#mountain` opens the Mountain page.

## Edit the content

All text lives in three data files, and the pages are built from them.

| File | Contains |
|---|---|
| `js/data/framework.js` | The BLUEPRINTS blocks, the classic frameworks, the coverage table and the six habits |
| `js/data/prompts.js` | The ten prompts, each with ten blocks and their explanations |
| `js/data/mountain.js` | The easy prompt, the four layers and the concepts under each word |

The prompts were written for Angular 22 and Next.js 16.3, checked in September 2026. When new versions come out, update the Environment block of each prompt first.

## Project structure

```
index.html            page shell
css/                  design tokens, base styles, shared components, one file per page
js/core.js            shared helpers
js/holo.js            the animated windows
js/prompts-view.js    page 1
js/mountain-view.js   page 2
js/presenter.js       presenter mode
js/app.js             page switching, theme and keyboard shortcuts
js/data/              all the content
```

Plain HTML, CSS and JavaScript, with no libraries and no build tools.
