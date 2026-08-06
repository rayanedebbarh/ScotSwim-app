# Background music

Drop MP3 files in here using the filenames below and the ambient hype
playlist in `ScotSwim.dc.html` (the `this.playlist` array in the
`Component` constructor) will pick them up automatically — no other code
changes needed.

| File | Track |
| --- | --- |
| `01-fight-song.mp3` | Fight Song |
| `02-dive-in.mp3` | Dive In |
| `03-maroon-wave.mp3` | Maroon Wave |
| `04-lane-nine.mp3` | Lane Nine |

To add, remove, reorder, or rename tracks, edit the `playlist` array
directly — each entry is `{ id, title, artist, src }`, where `src` is the
path to the file relative to `ScotSwim.dc.html` (e.g. `music/05-new-track.mp3`).

Until real files are dropped in, the player skips missing/broken tracks
automatically and just stays paused — see `advanceTrack()` in the
Component script.
