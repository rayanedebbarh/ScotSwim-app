# Background music

Audio files in this folder are **deliberately not committed to the repo** —
see "Why the files aren't here" below. The playback code ships; the audio
stays local.

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

Use the **Clean/radio edit** of each — several have explicit standard
releases, and coaches use this app too.

## Why the files aren't here

These are commercial copyrighted recordings. The repo is public and is
published via GitHub Pages, so committing them would put them at a public
URL for anyone to download — that's distribution, not personal listening.
All ten filenames are therefore listed in `.gitignore`.

Consequences to know:

- **Locally** — drop the MP3s in this folder with the exact filenames above
  and music works fully.
- **On the published site** — no audio files exist, so the player tries each
  track once and settles into paused. Expected, not a bug.
- To have working audio on the public link, swap in royalty-free tracks that
  can legally be committed.

Note: `.gitignore` only affects files git isn't already tracking. If one of
these ever gets committed by accident, adding it here won't untrack it —
use `git rm --cached <file>`. Be aware that removing it also deletes the
file for anyone who later pulls that commit; they can restore it with
`git show <commit>:<path> > <path>`.

## Adding or changing tracks

1. Put the MP3 in this folder — lowercase, hyphens, no spaces.
2. Add an entry to `this.playlist` in `ScotSwim.dc.html`:
   ```js
   {id:'unique-id', title:'Track Title', artist:'Artist Name', src:'music/filename.mp3'}
   ```
   `id` must be unique; `title`/`artist` show in the now-playing line; `src`
   is relative to `ScotSwim.dc.html`.
3. Add the filename to `.gitignore` if it's another commercial track.

The playlist can be any length — the shuffle window scales automatically.
