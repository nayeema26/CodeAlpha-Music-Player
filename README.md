# Tunezo — Music Player

A burgundy-themed music player built with **HTML, CSS and vanilla JavaScript**. No frameworks, no build step, no backend. Open it with Live Server and it works.

## Features

- Play, pause, resume, next and previous
- Song title, artist and duration shown for every song
- Progress bar with seeking, plus current time and total time
- Volume control and mute / unmute

**Bonus features**
- Playlists organised by artist, with a sidebar to switch between them
- Autoplay: the next song starts automatically (can be switched off)
- Repeat modes: off, repeat playlist, repeat one song
- Shuffle
- Search across songs and artists
- Song list in list view or card view
- Keeps your volume, repeat, shuffle, autoplay and layout choices between visits
- Works with keyboard shortcuts and hardware media keys
- Responsive layout for desktop, tablet and phone

## Tech used

- HTML5
- CSS3 (custom properties, grid, flexbox, container queries)
- Vanilla JavaScript (ES6+), using the built-in `<audio>` element
- All artwork and icons are drawn with CSS and inline SVG, so there are no image files

## Project structure

```
CodeAlpha_MusicPlayer/
├── index.html
├── style.css
├── script.js
└── audio/            (optional: your own audio files)
```

## How to run

1. Download or clone this repository.
2. Open the folder in **VS Code**.
3. Install the **Live Server** extension if you don't have it.
4. Right-click `index.html` and choose **Open with Live Server**.

You can also open `index.html` directly in a browser.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / pause |
| `←` / `→` | Seek back / forward 5 seconds |
| `↑` / `↓` | Volume up / down |
| `N` | Next song |
| `P` | Previous song |
| `M` | Mute / unmute |
| `L` | Cycle repeat mode |
| `S` | Shuffle on / off |
| `/` | Jump to search |

## About the audio

Songs by these artists are copyrighted, so they are not included in this repository. By default every song plays a royalty-free demo track from [SoundHelix](https://www.soundhelix.com), which needs an internet connection. If that can't be reached, the player generates a short demo tone in the browser so the controls still work offline.

### Adding your own audio files

1. Create a folder named `audio` next to `index.html` and put your mp3 files in it.
2. Name each file `<artist>-<song>.mp3` in lowercase with hyphens, for example `zayn-malik-pillowtalk.mp3`.
3. In `script.js`, under `CONFIG`, set:
   ```js
   useLocalFiles: true,
   ```

A song whose file isn't found still plays its demo track, so you can add songs gradually. To point one song at a differently named file, add `file: "other-name.mp3"` to that song in the `LIBRARY` list in `script.js`. If your files are not mp3, change `localAudioExtension` in `CONFIG`.

Only use audio you have the right to use. To keep audio out of your repository, add this line to a `.gitignore` file:

```
audio/
```

## Customising

- **Songs and playlists:** edit the `LIBRARY` list at the top of `script.js`.
- **Colours:** change the variables at the top of `style.css` (`--burgundy`, `--claret`, `--brass` and so on).
- **App name:** search for "Claret" in `index.html` and `script.js`.

## Credits

- Demo audio: [SoundHelix](https://www.soundhelix.com)

🌐 Live Demo:
https://nayeema26.github.io/CodeAlpha-Music-Player/

👩‍💻 Internship Project
CodeAlpha – Frontend Development Internship

Task: Music Player
