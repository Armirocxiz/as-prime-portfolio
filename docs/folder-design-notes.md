# Folder interaction references

The folder experiment lives only on `portfolio-copy-2026-10-24`. The original portfolio and logo reveal are preserved.

## Applied tools

- **Motion 14.6.0**: locally served browser runtime for bounded folder opening/closing and a short stagger of project previews. Native animation remains a fallback. The runtime license and provenance are in `assets/vendor`.
- **UI/UX Pro Max**: published guidance at https://github.com/nextlevelbuilder/ui-ux-pro-max-skill. Ran its local UX search for `rapid accordion animation interrupted`; the relevant result was “Cancellable State Transitions.” State and ARIA update immediately, old motion is cancelled on new intent, and inline styles are cleared. Reduced-motion preferences bypass animation. Folder headers remain large tap targets and metadata is at least 12 px.
- **21st.dev**: accordion collection at https://21st.dev/community/components/s/accordion. Applied the single-open accordion pattern, labelled regions, a plus/minus indicator, explicit expanded state, visible keyboard focus, and independent interactive content inside each panel. This is a native HTML adaptation, not an installed React component or a connected 21st plugin.

## Boundaries

The only layout animation is the height of one folder panel, because its contents must push the remaining folders down. Project entry uses transform/opacity. All original video URLs, photo galleries, keyboard controls, and reduced-motion behavior remain available. No paid services or account credentials are needed.
