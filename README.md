# Better Discography

Better Discography is a Spicetify extension that improves Spotify’s artist discography pages by adding a more detailed filter for release types.

## Features

- **Filters discography by any desired combination of release types** including separation of singles and EPs (finally).
  - Compilations
  - Albums
  - EPs
  - Singles
- **Supports both list and grid view.**
- **This is a VISUAL-ONLY filter.** Playback is unaffected, so excluded releases will still appear in the queue.
- **Filters are saved to current session.** Your active filters will apply to all artist pages and only auto-reset when you restart the app.
- **Removes Spotify’s built‑in filters.**
- **Lightweight** with near-instant filtering.

## Installation (Manual)

1. Make sure you have **[Spicetify](https://spicetify.app/)** installed and working.
2. Download `better-discography.js` from the latest release.
3. Place the file into your Spicetify extensions folder:

    **Windows**
    
    `%appdata%\spicetify\Extensions`
    
    **macOS / Linux**
    
    `~/.config/spicetify/Extensions`

4. Open a console load the extension via Spicetify:

    `spicetify config extensions better-discography.js`

5. Apply your changes:

    `spicetify apply`

## Updating

Replace the old `better-discography.js` with the new one, then run `spicetify apply`.