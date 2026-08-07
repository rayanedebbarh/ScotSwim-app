# Background music

Playback shuffles through every track in `this.playlist` (defined in the
`Component` constructor in `ScotSwim.dc.html`) in random order, plays all
of them once, then reshuffles and repeats — so it's not a fixed sequence
and nothing gets skipped over a session.

## Starter placeholder tracks

Drop MP3 files in here using these filenames and they're picked up with
no code changes:

| File | Track |
| --- | --- |
| `01-fight-song.mp3` | Fight Song |
| `02-dive-in.mp3` | Dive In |
| `03-maroon-wave.mp3` | Maroon Wave |
| `04-lane-nine.mp3` | Lane Nine |

## Adding your own tracks (any number)

1. Put the MP3 file in this `music/` folder. Keep the filename simple —
   lowercase, no spaces (use `-`), e.g. `05-scots-anthem.mp3`.
2. In `ScotSwim.dc.html`, find `this.playlist=[...]` in the `Component`
   constructor and add one entry per track:
   ```js
   {id:'scots-anthem', title:'Scots Anthem', artist:'Your Artist', src:'music/05-scots-anthem.mp3'}
   ```
   `id` just needs to be unique; `title`/`artist` aren't shown in the UI
   today but are there for a future "now playing" display; `src` is the
   path relative to `ScotSwim.dc.html`.
3. Remove any of the 4 starter entries you don't want. The playlist array
   can be any length — the shuffle logic adapts automatically.

Until a track's file actually exists, the player skips it automatically
(see `advanceTrack()`/`reshuffleOrder()` in the Component script) instead
of erroring — so it's safe to list tracks before the files are in place.
