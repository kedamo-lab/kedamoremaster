import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findActiveLyricIndex } from '../src/utils/lyrics.ts';
import { tracks } from '../src/data/tracks.ts';

const cues = [
  { time: 4.2, text: 'first' },
  { time: 7.8, text: 'second' },
  { time: 10.1, text: '' },
  { time: 16, text: 'third' },
];

test('does not highlight a vocal line during the intro', () => {
  assert.equal(findActiveLyricIndex(cues, 0), -1);
  assert.equal(findActiveLyricIndex(cues, 4.199), -1);
});
test('switches at the actual cue boundary without distributing time evenly', () => {
  assert.equal(findActiveLyricIndex(cues, 4.2), 0);
  assert.equal(findActiveLyricIndex(cues, 7.799), 0);
  assert.equal(findActiveLyricIndex(cues, 7.8), 1);
});
test('clears the active phrase for an instrumental gap', () => {
  assert.equal(cues[findActiveLyricIndex(cues, 12)].text, '');
  assert.equal(findActiveLyricIndex(cues, 16), 3);
});
test('handles seeks backwards, missing cues, and invalid media time', () => {
  assert.equal(findActiveLyricIndex(cues, 20), 3);
  assert.equal(findActiveLyricIndex(cues, 5), 0);
  assert.equal(findActiveLyricIndex([], 20), -1);
  assert.equal(findActiveLyricIndex(cues, NaN), -1);
});

const firstVocals: Record<string, number> = {
  'for-her': 23.6,
  snakelike: 21.6,
  lovesick: 6.27,
  sky: 13.93,
  'taking-over-me': 8.77,
};

for (const track of tracks) {
  test(`${track.title}: real vocal onset, ordered cues, and an empty outro`, () => {
    const lines = track.syncedLyrics!;
    assert.ok(lines.length > 10);
    assert.deepEqual(lines[0], { time: 0, text: '' });
    assert.equal(lines.find(line => line.text.trim())?.time, firstVocals[track.id]);
    assert.equal(lines.at(-1)?.text, '');
    for (let i = 1; i < lines.length; i++) {
      assert.ok(Number.isFinite(lines[i].time) && lines[i].time > lines[i - 1].time);
    }
    const onset = firstVocals[track.id];
    assert.equal(lines[findActiveLyricIndex(lines, onset - .001)].text, '');
    assert.ok(lines[findActiveLyricIndex(lines, onset)].text.trim());
    assert.equal(lines[findActiveLyricIndex(lines, 10000)].text, '');
  });
}
