# Peizhi Chen

A quiet personal site: who I am, previous projects, a small pixel-art walk through that story, and a map of where I studied plus a visitor count.

The page is white and meant to be read. The game sits in the page. It is not a full-screen game you have to finish before the résumé is available.

## Edit the words

| File | What it changes |
| --- | --- |
| `src/content/profile.ts` | Name, bio, education, work, skills, links |
| `src/content/projects.ts` | Project cards |
| `src/content/panels.ts` | Chapters that open from the pixel walk |
| `src/content/places.ts` | Map pins. Add a city with `lat` and `lng` |

The copy on the site comes from the public homepage, CV page, and original GitHub repositories under [chenpeizhi66](https://github.com/chenpeizhi66). It does not invent degrees, jobs, or travel.

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

For a personal site at `https://USERNAME.github.io/`:

1. Create a public repository named `USERNAME.github.io`.
2. Push this project to the `main` branch.
3. In the repository, open Settings → Pages.
4. Under Build and deployment, choose **GitHub Actions**.
5. The workflow in `.github/workflows/deploy.yml` builds `dist/` and publishes it.

`vite.config.ts` uses `base: '/'` for that user-site URL.

If the site instead lives at `https://USERNAME.github.io/REPOSITORY/`, change `base` to `'/REPOSITORY/'` and change the home link in `public/404.html` to `/REPOSITORY/`.

## Visitor count

The map section asks `https://tally.yuki.sh` for a count. Unique visitors are distinct IP addresses. Page views count openings. One browser tab counts once per session.

The site has no server of its own, so the number has to live somewhere else. To turn the counter off, remove the `loadVisitors` call in `src/main.ts`.

## Map

`public/assets/world.svg` is generated from Natural Earth 110m land data (public domain) through the `world-atlas` package (ISC). Rebuild it with:

```bash
npm run map
```

Pin positions use the same equirectangular projection as that file.

## Game

Phaser 4 draws one side-scrolling scene: Dalian, the CRRC internship, Carnegie Mellon, and software projects. Move with A/D or the arrows, jump with Space, W, or up, and read a marker with E or Enter. Esc pauses. Restart puts the character back at the start. Left, Right, Jump, and Read buttons sit under the scene so the same walk works on a phone.

Pixel art in `src/game/art.ts` is original. There is no audio.

## Check before you call it done

- The landing text is readable without starting the game.
- The character walks, jumps, and does not fall through the ground.
- Each of the four markers opens a chapter, and the chapter buttons do the same.
- Pause, Esc, and Restart work.
- The map shows Dalian and Pittsburgh.
- The visitor line shows a number, or a clear unavailable message if the counter is down.
- `npm run typecheck` and `npm run build` succeed.
