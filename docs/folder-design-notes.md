# Folder interaction

The experiment lives only on `portfolio-copy-2026-10-24`. The original portfolio, AS PRIME reveal and all media are preserved.

## In-page expansion

Every folder uses the same normal-flow stack when closed or open. The stepped closed geometry is unchanged. Only folder-shell height animates: 400 ms opening, 300 ms closing with one easing curve. The media's dimensions and padding stay constant. There are no simultaneous transforms on other folders, per-thumbnail staggers or scripted scroll compensation. Subsequent folders and page content move through the resulting layout change. The panel establishes layout containment.

Pointer intent and idle time warm the first visible thumbnails with async decoding. Rapid input cancels/replaces current height animation; reduced motion settles immediately. Inline height is cleared at completion, so view-more galleries retain natural height. Navigation scroll starts after expansion completes. There is no fixed full-screen viewer or page scroll lock.

## Responsive layouts

PC shows the full collection grid inside the expanded folder. At widths up to 650 px or heights up to 700 px, the folder grows to contain a 230–360 px touch strip, navigation controls and every media item. Later folders move below it and the page scrolls normally. The compact strip retains all 19 fashion and 12 food photos, while desktop restores its original gallery view-more behavior.

## Touch and keyboard

Tap opens. A 320 ms touch/pen hold previews the prints; moving more than 12 px cancels it so vertical page scrolling remains native. On touch/pen devices, horizontal strips use native browser scrolling, momentum and CSS scroll snap, with touch-action:auto so diagonal thumb gestures can resolve correctly. Custom pointer capture, preventDefault and release snapping apply only to mouse dragging. A touch pointer cancellation does not reset the strip to its starting item. Native scrolling cancels the media click when a finger pans; mouse drags keep their explicit click guard. Arrows and keyboard navigation retain the measured positions and reduced-motion behavior. The next card peeks into view to signal swiping.

## Tools and guidance

- Motion 14.6.0 is self-hosted for media entry; its MIT license and provenance are in `assets/vendor`.
- UI/UX Pro Max published guidance informed cancellable state transitions, touch targets, contrast and reduced motion: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.
- 21st.dev accordion patterns informed single-open state, labelled regions, plus/minus controls and focus visibility: https://21st.dev/community/components/s/accordion. This is a native adaptation, not an installed React component.

## Compact portfolio variant

The large hero section and replay control are removed. The exact original SVG and montage now live in the top-left header mark, which stays legible while the montage runs on load and replays whenever the logo is pressed. Work follows the header immediately. The heading is a concise Portfolio h1, navigation is Work/Contact, and the contact area contains just its heading and two contact actions. All 22 films, 31 photos, folders, players and responsive interactions are preserved.
