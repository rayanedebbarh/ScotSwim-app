# Background music

Playback shuffles through every track in `this.playlist` (defined in the
`Component` constructor in `ScotSwim.dc.html`) in random order, plays all
of them once, then reshuffles and repeats — so it's not a fixed sequence
and nothing gets skipped over a session.

## Team-picked playlist (awaiting files)

The code already references these 6 tracks by filename — drop the actual
MP3 in here with the matching name and it plays automatically, no code
changes needed. **Use the Clean/radio-edit version of each** (several of
these have explicit-tagged standard releases) so the audio is safe for
the whole team, coaches included.

| File | Track | Artist |
| --- | --- | --- |
| `01-turn-down-for-what.mp3` | Turn Down for What | DJ Snake & Lil Jon |
| `02-nuevayol.mp3` | Nuevayol | Bad Bunny |
| `03-squabble-up.mp3` | Squabble Up | Kendrick Lamar |
| `04-all-the-stars.mp3` | All the Stars | Kendrick Lamar & SZA |
| `05-pepas.mp3` | Pepas | Farruko |
| `06-xo-tour-llif3.mp3` | XO Tour Llif3 | Lil Uzi Vert |

Also make sure whoever supplies these files actually holds the rights to
use them this way — a personal purchase (e.g. an iTunes download) covers
personal listening, not looping playback inside an app for a team. Worth
a quick check before this goes further than local testing.

## Adding/changing tracks (any number)

1. Put the MP3 file in this `music/` folder. Keep the filename simple —
   lowercase, no spaces (use `-`).
2. In `ScotSwim.dc.html`, find `this.playlist=[...]` in the `Component`
   constructor and add/edit one entry per track:
   ```js
   {id:'unique-id', title:'Track Title', artist:'Artist Name', src:'music/filename.mp3'}
   ```
   `id` just needs to be unique; `title`/`artist` aren't shown in the UI
   today but are there for a future "now playing" display; `src` is the
   path relative to `ScotSwim.dc.html`.
3. The playlist array can be any length — the shuffle logic adapts
   automatically, no other code changes needed.

Until a track's file actually exists, the player skips it automatically
(see `advanceTrack()`/`reshuffleOrder()` in the Component script) instead
of erroring — so it's safe to list tracks before the files are in place.
