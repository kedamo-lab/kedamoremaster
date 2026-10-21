# kedamo — the stars collide

UI direction follows the owner's supplied Discord profile: near-black surfaces,
ash and ivory, black roses, Japanese accents, gothic lettering, and passing ravens.
Existing social destinations, music files, and game content are preserved.

- Responsive layouts cover phones from 320px, tablets, and desktop.
- The floating header and player have corners rounded to about 25% of their height.
- Mobile playback buttons have 40–42px touch targets; the player accounts for safe-area insets.
- Passing ravens use CSS/SVG; mist, drifting ash, parallax, and a subtle film grain support the portrait.
- Motion is always enabled as explicitly requested by the owner, including when
  the browser reports reduced motion. There is no effects toggle.
- The engraving is separated into SVG layers: moving roses, breathing bird,
  turning head, moving feathers and opening beak. Animated petals and the word
  `кар` drift away and fade. A real caw plays only on a click/tap on the bird;
  recording attribution is in docs/raven-audio.md.
- Page transitions, card reveals, hover/tap feedback, vinyl and player motion
  use CSS and Framer Motion. No WebGL or animated video is required.
- Interface icons use the Solar library, imported individually. See THIRD_PARTY_NOTICES.md.
- Lyrics use matched LRC timestamps and the actual media clock. See docs/lyrics-sources.md.
- Game details use a native modal dialog for keyboard focus and Escape handling.

## Illustration

Saved asset: `public/art/roses-raven.png`.
Created with the built-in imagegen tool, with a transparent background.
The supplied profile was a visual reference; its screenshot is not distributed.

Generation prompt:

> Use case: stylized-concept. Asset type: decorative botanical artwork for a personal gothic monochrome website. Generate an exquisitely detailed Victorian steel engraving of a small arrangement of three black roses, curled dark leaves, sharp delicate thorn stems, and a single raven perched on one stem, head turned sideways. Entire arrangement fully visible, isolated on genuine transparent background. Vertical composition, roses mostly at bottom and left, raven sitting near the upper right, elegant airy silhouette, slightly asymmetrical. Ink-black and silver gray ONLY, delicate etched hatching and bright pale edges so this reads clearly both on charcoal and ivory. Dark romantic, melancholic, antique manga meets botanical engraving. No vase, no scene, no lettering, no border, no UI, no watermark, no shadows outside the objects. This is a standalone cutout illustration, not a screenshot or web mockup.

## Local checks

```sh
npm ci
npm run lint
npm test
npm run build
npm run dev
```
