# Peizhi Chen

A quiet personal site: who I am, previous projects, a small pixel-art walk through that story, and a map of cities visited plus a visitor count.

The page is white and meant to be read. The game sits in the page. It is not a full-screen game you have to finish before the résumé is available.

## Edit the words

| File | What it changes |
| --- | --- |
| `src/content/profile.ts` | Name, bio, education, skills, links |
| `src/content/projects.ts` | Project cards. Only entries with `listed: true` appear in Projects |
| `src/content/resume.ts` | Research and industry cards |
| `src/content/panels.ts` | Notes that open from the three markers in the pixel walk |
| `src/content/places.ts` | Visited cities. Add a city with `lat` and `lng`. Names stay hidden until hover |
| `src/content/gallery.ts` | Where the Gallery page reads photographs. The pictures themselves live in the `gallery` repository |

The copy on the site comes from the latest CV in `public/assets/peizhi-chen-cv.pdf` and original GitHub repositories under [chenpeizhi66](https://github.com/chenpeizhi66). A card gets a repository link only when that repository exists.

## Gallery

Gallery is a separate page at `/gallery/`. It is not a section on the home page. The only way in is the Gallery link at the top right.

Photographs live in the public repository [chenpeizhi66/gallery](https://github.com/chenpeizhi66/gallery), inside `photos/`. Adding a picture there is enough. The page reads that folder. Optional titles go in `photos/captions.json`.

## Run it locally

Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:43123/

```bash
npm run typecheck
npm run build
npm run preview
```

## Publish on GitHub Pages

`https://chenpeizhi66.github.io/` is the account site. GitHub only serves that address from a public repository named exactly `chenpeizhi66.github.io`. A repository with any other name, including `peizhichen.github.io`, is a project site and is served at `https://chenpeizhi66.github.io/<repository>/`.

1. On GitHub, signed in as **chenpeizhi66**, create a **public** repository named `chenpeizhi66.github.io`. Leave it empty: no README, no .gitignore, no license.
2. Push this project’s `main` branch to that repository.
3. Open the new repository → **Settings** → **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**. The workflow already in `.github/workflows/deploy.yml` builds `dist/` and publishes it. Skip GitHub’s starter templates.
5. Open the **Actions** tab and wait until “Deploy site to GitHub Pages” succeeds. The first deploy can take a few minutes. Then open `https://chenpeizhi66.github.io/`.

`vite.config.ts` uses `base: '/'` for that user-site URL.

If the site instead lives at `https://chenpeizhi66.github.io/REPOSITORY/`, change `base` to `'/REPOSITORY/'` and change the home link in `public/404.html` to `/REPOSITORY/`.

## Visitor count

The map section asks `https://tally.yuki.sh` for unique visitors and page views. If that host does not answer within a few seconds, the page uses `https://abacus.jasoncameron.dev` for a page-view count instead. One browser tab counts once per session.

The site has no server of its own, so the number has to live somewhere else. To turn the counter off, remove the `loadVisitors` call in `src/main.ts`.

## Map

`public/assets/world.svg` is generated from Natural Earth 110m land data (public domain) through the `world-atlas` package (ISC). Rebuild it with:

```bash
npm run map
```

Pin positions use the same equirectangular projection as that file.

## Game

Phaser 4 draws one looping scene on a round earth. The walk passes Dalian, Pittsburgh, and Shenzhen, with cross roads between them, and walking off either end comes back around to the start. A or D moves. E reads the marker you are standing beside. Left, Right, Jump, and Read buttons sit under the scene so the same walk works on a phone.

The skyline is original pixel art in `src/game/cityscape.ts`. Labels are drawn as pixels, and the canvas scales by whole numbers so the type stays sharp. There is no audio.

## Check before you call it done

- The landing text is readable without starting the game.
- The character walks, jumps, and does not fall through the ground.
- Each of the three markers opens its note.
- Pause, Esc, and Restart work.
- The map shows a red dot for each visited city, and the city name appears on hover.
- The visitor line shows a number, or a clear unavailable message if the counter is down.
- `npm run typecheck` and `npm run build` succeed.
