# Folder interaction

The experiment lives only on `portfolio-copy-2026-10-24`. The original portfolio, AS PRIME reveal and all media are preserved.

## In-page expansion

Every folder remains in normal document flow on PC and mobile. Opening animates the actual panel height and padding from zero to the measured natural size over 520 ms. Later folders, the cabinet caption, contact section and footer are pushed downward by the same layout animation. Closing reverses it over 360 ms. A short transform transition reconciles the stacked cabinet positions; media entry fades/staggers after opening starts. There is no fixed full-screen viewer, page scroll lock or obscured-content inert state.

Rapid input cancels prior animations and clears owned inline styles. Semantic expanded state changes immediately. Reduced motion opens/closes directly. Once opening finishes, height is automatic so galleries can resize naturally.

## Responsive layouts

PC shows the full collection grid inside the expanded folder. At widths up to 650 px or heights up to 700 px, the folder grows to contain a 230–360 px touch strip, navigation controls and every media item. Later folders move below it and the page scrolls normally. The compact strip retains all 19 fashion and 12 food photos, while desktop restores its original gallery view-more behavior.

## Touch and keyboard

Tap opens. A 320 ms touch/pen hold previews the prints; moving more than 12 px cancels it so vertical page scrolling remains native. Horizontal strips follow the finger after 6 px of horizontal intent. A 24 px drag or quick flick advances one item, smaller gestures settle back, and a drag cannot accidentally open the player. New taps remain immediate. Arrows use measured item positions; keyboard arrows move focus to the visible card. Reduced motion settles instantly. The next card peeks into view to signal swiping.

## Tools and guidance

- Motion 14.6.0 is self-hosted for media entry; its MIT license and provenance are in `assets/vendor`.
- UI/UX Pro Max published guidance informed cancellable state transitions, touch targets, contrast and reduced motion: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.
- 21st.dev accordion patterns informed single-open state, labelled regions, plus/minus controls and focus visibility: https://21st.dev/community/components/s/accordion. This is a native adaptation, not an installed React component.
