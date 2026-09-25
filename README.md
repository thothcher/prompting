# Graph of Prompts

A presentation site about writing prompts that build real Angular and Next.js projects. Prepared for a lecture at IT Step Academy.

**Live site:** https://thothcher.github.io/prompting/

## What is inside

**Page 1: Prompts**

- **BLUEPRINTS**, the ten blocks a project prompt needs: Brief, Lens, Use cases, Environment, Patterns, Routes and data, Interface, Non-negotiables, Tests, Shape. It was built for this lecture from CRAFT, CO-STAR, RISEN and context engineering. It is a teaching tool, not an industry standard.
- A comparison of CRAFT, CO-STAR and RISEN with BLUEPRINTS, and six habits of good prompts.
- Ten prompts (five for Angular 22, five for Next.js 16.3), ordered from beginner to expert. Each prompt is split into its ten blocks. Click a block to see what it does, why it is written that way, and what the AI tends to do without it.

**Page 2: Mountain**

- Eleven one-sentence prompts, each asking an AI for a whole Angular or Next.js website: a blog, an admin dashboard, an online store, a team chat, a booking site, an insurance quote form, a SaaS landing site, a Kanban board, an AI chat, an e-learning site and a news site. A small slider switches between them.
- Every technical word in a prompt is a mountain peak in the range, and peak height shows how many concepts sit under the word.
- The selected word opens as a 3D mountain cut in half, drawn with three.js. Its four layers are Framework, Code, Browser and network, and Foundations, and every concept opens a short note. On phones, or without WebGL, a flat layered version is shown instead.
- As the 3D mountain scrolls into view, the camera circles it and stops facing the cut. Drag to turn it, Shift+drag to move it, and Ctrl+scroll (or pinch) to zoom. The buttons at its top right zoom in and out, turn it back to face you, and open a bigger view that fills the window.
- A word keeps the same Code, Browser and Foundations layers in every prompt. Only the Framework layer changes between Angular and Next.js. The library holds 35 words and about 490 concepts.

## Run it

There is nothing to install and no build step. Open the live site, or download this repository and double-click `index.html`.

The fonts load from Google Fonts. Without internet the page uses system fonts instead.

## Presenting

Turn on presenter mode with the projector button in the top bar or with Shift+P. The text gets larger and the top bar shows where you are. A presentation clicker (PageDown and PageUp) or the arrow keys then step through the whole lecture: the overview, the frameworks, each prompt block by block, then the mountain word by word and layer by layer.

| Key | Action |
|---|---|
| P / M | Prompts page / Mountain page |
| 1 to 9, 0 | Open prompt 01 to 10 (on the Mountain page, 1 to 6 choose a summit) |
| [ / ] | Previous or next prompt on the Mountain page |
| Left / Right arrow | Previous or next block, or previous or next summit |
| Esc | Close the open window, block or prompt, or the bigger 3D view |
| Shift+P | Presenter mode on or off |
| PageDown, Right arrow, Space | Next step (presenter mode) |
| PageUp, Left arrow | Previous step (presenter mode) |
| Home / End | First or last step (presenter mode) |
| B | Blank the screen; any key brings it back (presenter mode) |
| T | Light or dark theme |
| F | Fullscreen |
| ? | Show all shortcuts |

Deep links: `#p04` opens prompt 04, `#mountain` opens the Mountain page, and `#m03` opens mountain prompt 03.

In presenter mode the Mountain page runs prompt by prompt. First it lights up the words one at a time. Then it walks through each summit layer by layer, and finally the summary. After the summary it moves on to the next prompt.

## Edit the content

All text lives in three data files, and the pages are built from them.

| File | Contains |
|---|---|
| `js/data/framework.js` | The BLUEPRINTS blocks, the classic frameworks, the coverage table and the six habits |
| `js/data/prompts.js` | The ten prompts, each with ten blocks and their explanations |
| `js/data/mountain.js` | The eleven mountain prompts, and which words each one uses |
| `js/data/mountain-words.js` | The word library: the concepts under each word, with separate Angular and Next.js framework layers |

The prompts were written for Angular 22 and Next.js 16.3, checked in September 2026. When new versions come out, update the Environment block of each prompt first.

## Project structure

```
index.html            page shell
css/                  design tokens, base styles, shared components, one file per page
js/core.js            shared helpers
js/holo.js            the animated windows
js/prompts-view.js    page 1
js/mountain-view.js   page 2
js/mountain3d.js      the 3D mountain (three.js)
js/vendor/            three.js r149 (MIT license), loaded only on the Mountain page
js/presenter.js       presenter mode
js/app.js             page switching, theme and keyboard shortcuts
js/cursor.js          the trailing cursor reticle
js/data/              all the content
favicon.svg           tab icon
og-image.png          preview image shown when the link is shared
robots.txt            rules for search engines
sitemap.xml           page list for search engines
```

Plain HTML, CSS and JavaScript with no build tools. The only library is three.js for the 3D view. It is included in the repository, so the 3D view also works offline; the fonts still come from Google Fonts.
