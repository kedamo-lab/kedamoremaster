# Lyric timing sources

`src/data/tracks.ts` contains line-level LRC cues matched to the bundled MP3
recordings. The former evenly spaced timing arrays have been replaced.
Playback renders the timed cue text directly; it does not infer a line from
playback percentage or from the position of the plain-text lyric archive.

| Track | MP3 duration, seconds | LRC recording duration | First vocal cue | Timing source |
| --- | ---: | ---: | ---: | --- |
| For Her | 174.680272 | 174.680 | 23.60 | [LRCLIB 9489397](https://lrclib.net/api/get/9489397) |
| Snakelike (The Stars Collide) | 163.200000 | 163.280 | 21.60 | [LRCLIB 18672981](https://lrclib.net/api/get/18672981) |
| lovesick | 205.662041 | 206.000 | 6.27 | [LRCLIB 10740721](https://lrclib.net/api/get/10740721) |
| Sky (Falling For You) | 174.680816 | 174.634 | 13.93 | [LRCLIB 24709055](https://lrclib.net/api/get/24709055) |
| Taking Over Me | 152.633469 | 152.600 | 8.77 | [LRCLIB 15723303](https://lrclib.net/api/get/15723303) |

Durations were read locally with `ffprobe`; source recordings differ by at most
0.338 seconds. These are published community LRC cues, not uniform estimates or
new forced-alignment output. Their line-level precision depends on the source
annotation; a frame-by-frame listening audit was not performed.

Empty cues at time zero, instrumental breaks, the source's vocal outro, and the
MP3's end keep an earlier phrase from remaining highlighted during silence.
The final cue uses the local duration rounded to milliseconds. Source line
grouping and repeated choruses are retained, including the additional repeated
chorus in lovesick. Punctuation and Cyrillic lookalikes in English words were
normalized using the existing lyric text.
