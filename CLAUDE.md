# josephcosentino.me

Hugo site using the Congo theme, managed via devbox/just.

## Dev server

- Start: `just start` (runs `devbox services start`, which launches `hugo server --disableFastRender` via process-compose)
- Stop: `just stop`
- Serves at http://localhost:1313/

Hugo's live reload is unreliable here (stale/cached partials have been observed). Don't rely on it: after each change, cycle the server (`just stop && just start`) before checking the page, rather than trusting hot-reload to pick it up.

When making visual/content changes, proactively start the server yourself and open http://localhost:1313/ (or the relevant page) so it can be checked in-browser — don't wait to be asked. Leave the server running between iterations; cycle it on each change as above.

Open pages with the plain shell `open` command (e.g. `open http://localhost:1313/`), not the claude-in-chrome browser automation tool — it's too slow for iterative visual debugging here. Only reach for claude-in-chrome if the user explicitly asks for automated browser interaction (clicking, reading DOM state, screenshots for review, etc).
