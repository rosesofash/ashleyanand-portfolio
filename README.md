# Ashley Anand — portfolio

A plain HTML, CSS and JavaScript version of the Framer site. No build step and no libraries.

## Preview it on your laptop

1. Open this folder in VS Code (File → Open Folder).
2. Install the free **Live Server** extension (Extensions panel, search "Live Server", by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**. The page reloads every time you save.

## What's where

| File | What it is |
| --- | --- |
| `index.html` | Home: hero title, project cards, tools ticker, contact |
| `about.html` | About page |
| `wealthsimple-case-study.html` | Wealthsimple case study |
| `a11yson.html` | A11yson case study |
| `css/style.css` | All the styling. Colours and fonts are at the very top under `:root` |
| `js/main.js` | Hero video play/pause, draggable tools ticker, carousels, back-to-top, phone nav |
| `assets/` | Images (WebP), title SVGs, the hero video, your cursor and your resume (`Ashley-Anandakumar-Resume.pdf`; replace that file to update it everywhere). Tool logos are built into `index.html` |

The phone layout kicks in below 810px wide, the same breakpoint Framer used.

## Fonts

The site loads **Futura PT** from your Adobe Fonts web project (`msm8fcd`), using the CSS name `futura-pt`. When you publish, add your site's address to that web project's domain list in Adobe Fonts, or it won't load there. Until Futura loads, the site shows **Jost**, a free look-alike.

## Hero video

`assets/video/title-desktop.mp4` plays automatically and loops. Pressing pause swaps in `assets/img/title-desktop.svg`, lined up in the same spot. To replace the animation, export a new MP4 at 1920 × 1080 on a white background and keep the same file name.

## Adding the AquaSonic case study later

1. Copy `wealthsimple-case-study.html`, rename it `aquasonic.html`, and replace the text and images.
2. In `index.html`, find the AquaSonic card, change `<div class="project">` to `<a class="project" href="aquasonic.html">` (and its closing `</div>` to `</a>`), and delete the "Coming soon" label.

## Publishing for free

- **Netlify Drop**: go to app.netlify.com/drop and drag this whole folder onto the page.
- **GitHub Pages**: push the folder to a GitHub repo, then Settings → Pages → deploy from the main branch.
