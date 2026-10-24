# Folder interaction references

The folder experiment lives only on `portfolio-copy-2026-10-24`. The original portfolio and logo reveal are preserved.

## Applied tools

- **Motion 14.6.0**: locally served browser runtime for bounded folder opening/closing and a short stagger of project previews. Native animation remains a fallback. The runtime license and provenance are in `assets/vendor`.
- **UI/UX Pro Max**: published guidance at https://github.com/nextlevelbuilder/ui-ux-pro-max-skill. Ran its local UX search for `rapid accordion animation interrupted`; the relevant result was “Cancellable State Transitions.” State and ARIA update immediately, old motion is cancelled on new intent, and inline styles are cleared. Reduced-motion preferences bypass animation. Folder headers remain large tap targets and metadata is at least 12 px.
- **21st.dev**: accordion collection at https://21st.dev/community/components/s/accordion. Applied the single-open accordion pattern, labelled regions, a plus/minus indicator, explicit expanded state, visible keyboard focus, and independent interactive content inside each panel. This is a native HTML adaptation, not an installed React component or a connected 21st plugin.

## Boundaries

The only layout animation is the height of one folder panel, because its contents must push the remaining folders down. Project entry uses transform/opacity. All original video URLs, photo galleries, keyboard controls, and reduced-motion behavior remain available. No paid services or account credentials are needed.

## Folder continuity

Opening retains the cabinet width, raised tabs, individual folder tones and overlapping covers. Only the selected folder grows to contain its original media. Other folders remain layered above and below it; the interaction does not replace the cabinet with flat accordion rows. Collapsed buttons have bounded hit areas so neighboring tabs remain usable.

## Touch

A quick tap opens a collection. A 320 ms touch/pen hold previews its prints and consumes that gesture’s click. Moving more than 12 px or a native pointer cancellation clears the hold; vertical scrolling and pinch zoom stay native. Keyboard activation remains immediate. The touch hint explains both actions.

## Short viewports

At widths up to 650 px or heights up to 700 px, an open cabinet occupies a fixed viewer below the sticky header, with a Back to portfolio control. The underlying page retains its position, is inert, and does not scroll until the cabinet closes. All five tabs remain visible. The selected folder contains a horizontal snap strip with every item, previous/next 44 px controls and an item count. Portrait media uses contain instead of cropping. Photo strips expose all 19/12 photos; normal desktop gallery limits are restored on resize. The rest of the portfolio remains a regular vertically scrolling page.

## Direct swipe handling

Compact strips follow horizontal pointer movement directly. A 24 px drag or a short, quick flick advances one item; smaller movements settle back in 160–260 ms. Horizontal intent locks after 6 px, pointer capture keeps the drag continuous, and the drag’s click is consumed before a video/photo viewer can open. A new tap clears that guard immediately. Vertical movement remains native; cancellation returns to the starting item. Arrows use the same measured card positions, rapid input replaces prior settling, keyboard arrows work, and reduced motion snaps instantly. A 24 px edge of the next card makes swiping discoverable.

## Continuous opening

Before opening, capture every folder’s viewport position. After the expanded layout settles, animate each shell from that position over 520 ms, with the selected frame revealing its full height through a clip. The media fades in after the cover starts moving. This makes the surrounding folders travel with the expansion instead of instantly turning into rows; no image is stretched vertically. Reduced motion skips the transition, and changing intent cancels it.
