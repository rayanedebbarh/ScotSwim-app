# Background music

Audio files in this folder are royalty-free tracks and are committed to the
repo, so playback works both locally and on the published GitHub Pages site.

## How playback works

Defined by `this.playlist` in the `Component` constructor in
`ScotSwim.dc.html`.

- Starts automatically on login. The login click is what satisfies the
  browser's autoplay policy, so playback is armed from that handler.
- Keeps playing across every screen and tab — one `<audio>` element lives on
  the component instance, so navigating never restarts it.
- Picks tracks at random, excluding the last `playlist.length - 1` played, so
  every track plays once before any repeat.
- A new session won't open on whatever played last (`musicPrefs.lastTrackId`).
- Play/pause and volume persist in `localStorage` under
  `scotswim.music.prefs`.
- If a track fails to load it moves on; if every track fails back-to-back it
  stops and shows paused rather than cycling forever.

Controls live in the hamburger menu: play/pause, skip, volume, and the
now-playing title (which scrolls when too long to fit).

## Current playlist

| File | Track | Artist |
| --- | --- | --- |
| `01-turn-down-for-what.mp3` | Turn Down for What | DJ Snake & Lil Jon |
| `02-nuevayol.mp3` | Nuevayol | Bad Bunny |
| `03-squabble-up.mp3` | Squabble Up | Kendrick Lamar |
| `04-all-the-stars.mp3` | All the Stars | Kendrick Lamar & SZA |
| `05-pepas.mp3` | Pepas | Farruko |
| `06-xo-tour-llif3.mp3` | XO Tour Llif3 | Lil Uzi Vert |
| `07-panda-desiigner.mp3` | Panda | Desiigner |
| `08-sicko-mode.mp3` | Sicko Mode | Travis Scott |
| `09-temperature.mp3` | Temperature | Sean Paul |
| `10-in-da-club.mp3` | In da Club | 50 Cent |

Title/artist labels in `this.playlist` match the vibe of the track being
replaced, not necessarily the original commercial recording — the actual
audio committed here is a royalty-free/licensed substitute.

## Adding or changing tracks

1. Put the MP3 in this folder — lowercase, hyphens, no spaces. Only use
   royalty-free or properly licensed audio; this repo is public and
   published via GitHub Pages, so committing a track here makes it publicly
   downloadable — that's distribution, not personal listening.
2. Add an entry to `this.playlist` in `ScotSwim.dc.html`:
   ```js
   {id:'unique-id', title:'Track Title', artist:'Artist Name', src:'music/filename.mp3'}
   ```
   `id` must be unique; `title`/`artist` show in the now-playing line; `src`
   is relative to `ScotSwim.dc.html`.

The playlist can be any length — the shuffle window scales automatically.
