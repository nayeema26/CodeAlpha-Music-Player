/* ==========================================================================
   Tunezo — music player
   script.js  (vanilla JavaScript, no libraries, no build step)

   1. Config
   2. Library data (one playlist per artist)
   3. Derived data and helpers
   4. Player state and DOM references
   5. Audio sources (local file -> online demo -> offline demo tone)
   6. Playback (queue, play/pause, next/previous, repeat, shuffle, seek, volume)
   7. Rendering (sidebar, header, artist shelf, song cards/list, player bar)
   8. Events (mouse, keyboard, media keys)
   9. Start-up
   ========================================================================== */
"use strict";


/* ==========================================================================
   1. CONFIG
   ========================================================================== */
const CONFIG = {
  // Placeholder audio: royalty-free demo tracks from SoundHelix (soundhelix.com).
  // Real songs by these artists are copyrighted, so they can't be bundled.
  // Every song rotates through these 17 demo files until you add your own.
  demoTrackUrl: (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`,
  demoTrackCount: 17,

  // To use your own audio: put the file next to index.html (or in a folder),
  // then add  file: "yourfile.mp3"  to that song in LIBRARY below.
  // If you use a folder, set it here, e.g.  "audio/"
  localAudioFolder: "",

  storageKey: "claret.player.v2",   // bumped so the new list default applies to earlier visitors
  seekStepSeconds: 5,        // arrow-key seek
  restartAfterSeconds: 3,    // "previous" restarts the song if it is past this point
};


/* ==========================================================================
   2. LIBRARY DATA
   A song is either a plain title string, or an object:
     { title: "Song", artist: "Credit line if different", file: "local-file.mp3" }
   Use ft("Title", "Artist credit") for songs credited to someone else.
   ========================================================================== */
const ft = (title, artist) => ({ title, artist });

const LIBRARY = [
  { id: "zayn-malik", name: "Zayn Malik", songs: [
    "Pillowtalk", "Dusk Till Dawn (ft. Sia)", "I Don't Wanna Live Forever (with Taylor Swift)", "Let Me",
    "Like I Would", "Still Got Time (ft. PARTYNEXTDOOR)", "Sour Diesel", "It's You", "BeFoUR", "Entertainer",
    "Wrong (ft. Kehlani)", "Flames", "Vibez", "Better", "Tightrope",
  ]},
  { id: "selena-gomez", name: "Selena Gomez", songs: [
    "Lose You to Love Me", "Come & Get It", "Hands to Myself", "Good for You", "Same Old Love",
    "Wolves (with Marshmello)", "Love You Like a Love Song", "Bad Liar", "Back to You",
    "It Ain't Me (with Kygo)", "Look at Her Now", "Rare", "Kill Em with Kindness", "Slow Down",
    "Naturally", "Single Soon", "Calm Down (with Rema)",
  ]},
  { id: "taylor-swift", name: "Taylor Swift", songs: [
    "Love Story", "You Belong with Me", "Shake It Off", "Blank Space", "Style", "Bad Blood", "Delicate",
    "Look What You Made Me Do", "Lover", "Cardigan", "Willow", "All Too Well", "Anti-Hero", "Cruel Summer",
    "ME! (ft. Brendon Urie)", "We Are Never Ever Getting Back Together", "I Knew You Were Trouble",
  ]},
  { id: "the-chainsmokers", name: "The Chainsmokers", songs: [
    "Closer (ft. Halsey)", "Don't Let Me Down (ft. Daya)", "Roses (ft. ROZES)", "Something Just Like This (with Coldplay)",
    "Paris", "Sick Boy", "All We Know (ft. Phoebe Ryan)", "Setting Fires (ft. XYLØ)", "This Feeling (ft. Kelsea Ballerini)",
    "Call You Mine (ft. Bebe Rexha)", "Takeaway (with Illenium)", "Who Do You Love (with 5 Seconds of Summer)",
    "Everybody Hates Me", "#SELFIE", "Kanye", "Young", "Beach House",
  ]},
  { id: "one-direction", name: "One Direction", songs: [
    "What Makes You Beautiful", "Story of My Life", "Best Song Ever", "Drag Me Down", "Live While We're Young",
    "One Thing", "Little Things", "Night Changes", "Steal My Girl", "Perfect", "History", "Kiss You", "You & I",
    "Gotta Be You", "One Way or Another (Teenage Kicks)", "Midnight Memories", "Fireproof", "Infinity",
  ]},
  { id: "camila-cabello", name: "Camila Cabello", songs: [
    "Havana (ft. Young Thug)", "Señorita (with Shawn Mendes)", "Never Be the Same", "Crying in the Club", "Liar",
    "Living Proof", "Bad Things (with Machine Gun Kelly)", "Consequences", "Don't Go Yet", "My Oh My (ft. DaBaby)",
    "Shameless", "First Man", "Easy", "Bam Bam (ft. Ed Sheeran)", "I Have Questions", "Real Friends",
  ]},
  { id: "anne-marie", name: "Anne-Marie", songs: [
    "2002", "Ciao Adios", "FRIENDS (with Marshmello)", ft("Rockabye", "Clean Bandit ft. Sean Paul & Anne-Marie"),
    "Alarm", "Perfect to Me", "Birthday", "Then", "Don't Play (with KSI & Digital Farm Animals)",
    "Kiss My (Uh Oh) (with Little Mix)", "Our Song (with Niall Horan)", "Unhealthy (ft. Shania Twain)",
    "Bad Girlfriend", "To Be Young (ft. Doja Cat)", "Trigger", "Psycho (ft. Aitch)",
  ]},
  { id: "alan-walker", name: "Alan Walker", songs: [
    "Faded", "Alone", "Sing Me to Sleep", "The Spectre", "Darkside (ft. Au/Ra & Tomine Harket)",
    "On My Way (with Sabrina Carpenter & Farruko)", "Different World (ft. Sofia Carson, K-391 & CORSAK)",
    "Lily (ft. K-391 & Emelie Hollow)", "All Falls Down (ft. Noah Cyrus)", "Alone, Pt. II (with Ava Max)",
    "Play (with K-391)", "Ignite (with K-391)", "Lost Control (ft. Sorana)", "Diamond Heart (ft. Sophia Somajo)",
    "Hero (with Sasha Alex Sloan)", "Heading Home (with Ruben)", "Tired (ft. Gavin James)",
  ]},
  { id: "dua-lipa", name: "Dua Lipa", songs: [
    "New Rules", "IDGAF", "Don't Start Now", "Levitating", "Physical", "Break My Heart", "Be the One",
    "Blow Your Mind (Mwah)", ft("One Kiss", "Calvin Harris & Dua Lipa"), ft("Electricity", "Silk City & Dua Lipa"),
    "Cool", "Houdini", "Dance the Night", "Training Season", "Illusion", "Love Again", "Hallucinate",
    ft("Scared to Be Lonely", "Martin Garrix & Dua Lipa"),
  ]},
  { id: "hayley-williams", name: "Hayley Williams", songs: [
    "Simmer", "Leave It Alone", "Cinnamon", "Dead Horse", "Sugar on the Rim", "Why We Ever", "Over Yet",
    "Watch Me While I Bloom", "My Friend", "Wait On",
    ft("Misery Business", "Paramore"), ft("Still Into You", "Paramore"), ft("Ain't It Fun", "Paramore"),
    ft("The Only Exception", "Paramore"), ft("Hard Times", "Paramore"),
    ft("Airplanes", "B.o.B ft. Hayley Williams"), ft("Stay the Night", "Zedd ft. Hayley Williams"),
  ]},
  { id: "shawn-mendes", name: "Shawn Mendes", songs: [
    "Stitches", "Treat You Better", "Mercy", "There's Nothing Holdin' Me Back", "In My Blood",
    "Señorita (with Camila Cabello)", "If I Can't Have You", "Lost in Japan", "Youth (ft. Khalid)",
    "Life of the Party", "Ruin", "Imagination", "Wonder", "Monster (with Justin Bieber)", "It'll Be Okay",
    "Nervous", "Kid in My Room", "Call My Friends",
  ]},
  { id: "charlie-puth", name: "Charlie Puth", songs: [
    "Attention", "We Don't Talk Anymore (ft. Selena Gomez)", ft("See You Again", "Wiz Khalifa ft. Charlie Puth"),
    "One Call Away", "Marvin Gaye (ft. Meghan Trainor)", "How Long", "Light Switch", "Dangerously",
    "Left and Right (ft. Jung Kook)", "Cheating on You", "The Way I Am", "Done for Me (ft. Kehlani)",
    "I Don't Think That I Like Her", "Girlfriend", "Mother", "Loser",
  ]},
];


/* ==========================================================================
   3. DERIVED DATA AND HELPERS
   ========================================================================== */
// First letter of a song title, used as the italic capital on its cover
function firstLetter(title) {
  return (title.match(/[A-Za-z0-9\u00C0-\u024F]/) || [title[0]])[0].toUpperCase();
}

// Single capital shown on an artist's cover ("The Chainsmokers" -> C)
function artistLetter(name) {
  return name.replace(/^the\s+/i, "").charAt(0).toUpperCase();
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmtTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function icon(name, extraClass = "") {
  return `<svg class="i ${extraClass}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

const EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

// Turn LIBRARY into playlists with fully-formed track objects
let trackCounter = 0;
const ARTISTS = LIBRARY.map((entry, index) => {
  const tracks = entry.songs.map((song, i) => {
    const s = typeof song === "string" ? { title: song } : song;
    const n = trackCounter++;
    return {
      id: `${entry.id}-${i + 1}`,
      title: s.title,
      artist: s.artist || entry.name,
      playlistId: entry.id,
      playlistName: entry.name,
      file: s.file || null,
      demoNo: (n % CONFIG.demoTrackCount) + 1,       // which demo file stands in for this song
      seed: n + 1,                                   // seeds the offline demo tone
      letter: firstLetter(s.title),
    };
  });
  return { ...entry, tracks, letter: artistLetter(entry.name) };
});

const ALL_TRACKS = ARTISTS.flatMap((a) => a.tracks);
const TRACK_BY_ID = new Map(ALL_TRACKS.map((t) => [t.id, t]));
const ARTIST_BY_ID = new Map(ARTISTS.map((a) => [a.id, a]));
const ALL_VIEW = { id: "all", name: "All songs", letter: "A", tracks: ALL_TRACKS };


/* ==========================================================================
   4. PLAYER STATE AND DOM REFERENCES
   ========================================================================== */
const state = {
  // What the user is looking at
  view: "all",              // "all" or an artist id
  query: "",
  layout: "list",           // "list" (default) | "grid"

  // What is playing. Browsing other playlists never touches this.
  queue: [],                // tracks in the order they were queued
  order: [],                // indexes into queue (shuffled when shuffle is on)
  pos: -1,                  // position inside `order`
  queueSource: null,        // view id the queue was started from

  // Player settings (saved between visits)
  loop: "off",              // "off" | "all" | "one"
  shuffle: false,
  autoplay: true,
  volume: 0.8,
  muted: false,

  // Runtime
  isPlaying: false,
  wantPlay: false,          // the user's intent, survives source switching
  seeking: false,
  sources: [],
  sourceIdx: 0,
  durations: {},            // track id -> seconds, learned from the audio itself
  demoDurations: {},        // demo file number -> seconds, probed after start-up
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const audio = $("#audio");
const els = {
  nav: $("#nav"), main: $("#main"), search: $("#search"),
  hero: $("#hero"), heroSleeve: $("#heroSleeve"), heroInit: $("#heroInit"), heroTitle: $("#heroTitle"),
  heroMeta: $("#heroMeta"), heroPlay: $("#heroPlay"), heroShuffle: $("#heroShuffle"),
  shelfSection: $("#shelfSection"), shelf: $("#shelf"),
  listTitle: $("#listTitle"), listCount: $("#listCount"), songs: $("#songs"),
  player: $("#player"), npArt: $("#npArt"), npInit: $("#npInit"), npTitle: $("#npTitle"), npArtist: $("#npArtist"),
  playBtn: $("#playBtn"), prevBtn: $("#prevBtn"), nextBtn: $("#nextBtn"),
  shuffleBtn: $("#shuffleBtn"), loopBtn: $("#loopBtn"), autoBtn: $("#autoBtn"),
  muteBtn: $("#muteBtn"), volBar: $("#volBar"), seekBar: $("#seekBar"),
  curTime: $("#curTime"), durTime: $("#durTime"), toast: $("#toast"),
};

const store = {
  load() {
    try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {}; } catch { return {}; }
  },
  save() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        volume: state.volume, muted: state.muted, loop: state.loop, shuffle: state.shuffle,
        autoplay: state.autoplay, layout: state.layout, view: state.view,
      }));
    } catch { /* storage unavailable (private mode): the player still works */ }
  },
};

let toastTimer;
function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("is-show"), 3200);
}

function getView(id = state.view) {
  return id === "all" ? ALL_VIEW : ARTIST_BY_ID.get(id);
}

function currentTrack() {
  return state.queue[state.order[state.pos]] || null;
}


/* ==========================================================================
   5. AUDIO SOURCES
   Each song tries, in order:
     1. its own local file (if `file` is set)
     2. an online royalty-free demo track
     3. a short synthesised tone generated in the browser (works offline)
   ========================================================================== */
function sourcesFor(track) {
  const list = [];
  if (track.file) list.push(CONFIG.localAudioFolder + track.file);
  list.push(CONFIG.demoTrackUrl(track.demoNo));
  list.push("offline-tone");
  return list;
}

const toneCache = new Map();
function sourceUrl(source, track) {
  if (source !== "offline-tone") return source;
  if (!toneCache.has(track.seed)) toneCache.set(track.seed, makeDemoTone(track.seed));
  return toneCache.get(track.seed);
}

// Builds a 24-second pentatonic melody as a WAV file and returns a blob: URL.
// It goes through the same <audio> element, so seek and volume work as normal.
function makeDemoTone(seed) {
  const rate = 22050, seconds = 24, total = rate * seconds;
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const root = 174.61 * Math.pow(2, ((seed * 7) % 12) / 12);
  const noteLen = Math.floor(rate * 0.3);
  let r = (seed * 9301 + 49297) % 233280;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const pcm = new Int16Array(total);

  for (let start = 0, k = 0; start < total; start += noteLen, k++) {
    const freq = root * Math.pow(2, scale[Math.floor(rnd() * scale.length)] / 12);
    const bass = k % 4 === 0;
    for (let j = 0; j < noteLen && start + j < total; j++) {
      const t = j / rate;
      const env = Math.exp(-t * 6) * Math.min(1, j / 120) * Math.min(1, (noteLen - j) / 220);
      let s = Math.sin(2 * Math.PI * freq * t) * 0.5 + Math.sin(4 * Math.PI * freq * t) * 0.15;
      if (bass) s += Math.sin(Math.PI * root * t) * 0.35 * Math.exp(-t * 2);
      pcm[start + j] = Math.max(-1, Math.min(1, s * env)) * 0.55 * 32767;
    }
  }

  const buffer = new ArrayBuffer(44 + total * 2);
  const view = new DataView(buffer);
  const text = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  text(0, "RIFF"); view.setUint32(4, 36 + total * 2, true); text(8, "WAVE"); text(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, total * 2, true);
  for (let i = 0; i < total; i++) view.setInt16(44 + i * 2, pcm[i], true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

// Duration shown in lists: learned from playback, or from the demo file that stands in for the song
function durationOf(track) {
  return state.durations[track.id] ?? (track.file ? undefined : state.demoDurations[track.demoNo]);
}

// Reads the length of each demo file once, one at a time, so every list row can show a duration
function probeDemoDurations() {
  const probe = new Audio();
  probe.preload = "metadata";
  let n = 1;
  const next = () => { if (n <= CONFIG.demoTrackCount) probe.src = CONFIG.demoTrackUrl(n); };
  probe.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(probe.duration)) state.demoDurations[n] = probe.duration;
    n++;
    refreshDurations();
    next();
  });
  probe.addEventListener("error", () => { /* offline: rows keep "--:--" until played */ });
  next();
}


/* ==========================================================================
   6. PLAYBACK
   ========================================================================== */

/* ---- Queue ---- */
function buildOrder(startIndex) {
  const indexes = state.queue.map((_, i) => i);
  if (state.shuffle) {
    const rest = indexes.filter((i) => i !== startIndex);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    state.order = [startIndex, ...rest];
    state.pos = 0;
  } else {
    state.order = indexes;
    state.pos = startIndex;
  }
}

// Replace the queue with `list`, start at `index`, and play
function startQueue(list, index, sourceId) {
  state.queue = list.slice();
  state.queueSource = sourceId;
  buildOrder(index);
  loadCurrent(true);
}

// Load the track at the current queue position into the audio element
function loadCurrent(shouldPlay) {
  const track = currentTrack();
  if (!track) return;
  state.sources = sourcesFor(track);
  state.sourceIdx = 0;
  state.wantPlay = shouldPlay;
  audio.src = sourceUrl(state.sources[0], track);
  audio.loop = state.loop === "one";
  renderNowPlaying(track);
  resetProgress();
  if (shouldPlay) safePlay(); else setPlayingUI(false);
  syncHighlights();
}

// If a source fails to load, fall through to the next one in the chain
audio.addEventListener("error", () => {
  const track = currentTrack();
  if (!track || !audio.getAttribute("src")) return;
  if (state.sourceIdx < state.sources.length - 1) {
    state.sourceIdx++;
    const source = state.sources[state.sourceIdx];
    if (source === "offline-tone" && state.wantPlay) toast("Couldn't reach the demo audio. Playing an offline demo tone instead.");
    audio.src = sourceUrl(source, track);
    if (state.wantPlay) safePlay();
  } else {
    state.wantPlay = false;
    setPlayingUI(false);
    toast("This song couldn't be played.");
  }
});

/* ---- Play / pause ---- */
function safePlay() {
  state.wantPlay = true;
  const promise = audio.play();
  if (promise && promise.catch) {
    promise.catch((err) => {
      if (err.name === "NotAllowedError") {
        state.wantPlay = false;
        setPlayingUI(false);
        toast("Press play to start the music.");
      }
      // AbortError (source changed mid-request) and load errors are handled elsewhere
    });
  }
}

function pauseAudio() {
  state.wantPlay = false;
  audio.pause();
}

function togglePlay() {
  if (!currentTrack()) return;
  if (audio.paused) safePlay(); else pauseAudio();
}

// Play or pause a whole view (used by the header button and the playlist shelf)
function playView(id) {
  const view = getView(id);
  if (!view || !view.tracks.length) return;
  if (state.queueSource === id && currentTrack()) togglePlay();
  else startQueue(view.tracks, 0, id);
}

function handleSongClick(id) {
  const current = currentTrack();
  if (current && current.id === id) { togglePlay(); return; }
  const list = visibleTracks();
  const index = list.findIndex((t) => t.id === id);
  if (index >= 0) startQueue(list, index, state.view);
}

/* ---- Next / previous ---- */
// dir: +1 next, -1 previous. auto: true when the song ended by itself.
function advance(dir, auto = false) {
  if (!state.queue.length) return;
  const last = state.order.length - 1;
  let pos = state.pos + dir;

  if (pos > last) {
    if (state.loop === "all" || !auto) {
      pos = 0;
    } else {
      // End of the playlist with repeat off: stop and line up the first song
      state.pos = 0;
      loadCurrent(false);
      toast("Reached the end of the playlist.");
      return;
    }
  }
  if (pos < 0) pos = last;

  state.pos = pos;
  loadCurrent(true);
}

function previous() {
  if (!state.queue.length) return;
  const atStart = state.pos === 0 && state.loop !== "all";
  if (audio.currentTime > CONFIG.restartAfterSeconds || atStart) {
    audio.currentTime = 0;
    updateProgress();
    return;
  }
  advance(-1);
}

// Fires when a song finishes. (Repeat-one never gets here: the audio element loops itself.)
audio.addEventListener("ended", () => {
  if (!state.autoplay) {
    state.wantPlay = false;
    audio.currentTime = 0;
    updateProgress();
    setPlayingUI(false);
    return;
  }
  advance(1, true);
});

/* ---- Repeat, shuffle, autoplay ---- */
const LOOP_LABELS = { off: "Repeat: off", all: "Repeat: playlist", one: "Repeat: this song" };

function cycleLoop() {
  state.loop = { off: "all", all: "one", one: "off" }[state.loop];
  audio.loop = state.loop === "one";
  updateLoopUI();
  store.save();
  toast(LOOP_LABELS[state.loop]);
}

function toggleShuffle() {
  state.shuffle = !state.shuffle;
  if (state.queue.length) buildOrder(state.order[state.pos]);   // keep the current song, re-order the rest
  updateShuffleUI();
  store.save();
}

function toggleAutoplay() {
  state.autoplay = !state.autoplay;
  updateAutoUI();
  store.save();
  toast(state.autoplay ? "Autoplay on" : "Autoplay off");
}

/* ---- Progress and seeking ---- */
function setFill(input, percent) {
  input.style.setProperty("--fill", `${percent}%`);
}

function resetProgress() {
  els.seekBar.value = 0;
  setFill(els.seekBar, 0);
  els.curTime.textContent = "0:00";
  const track = currentTrack();
  const known = track && durationOf(track);
  els.durTime.textContent = known ? fmtTime(known) : "0:00";
}

function updateProgress() {
  if (state.seeking) return;
  const d = audio.duration;
  const t = audio.currentTime;
  const percent = Number.isFinite(d) && d > 0 ? (t / d) * 100 : 0;
  els.seekBar.value = percent * 10;
  setFill(els.seekBar, percent);
  els.curTime.textContent = fmtTime(t);
  els.seekBar.setAttribute("aria-valuetext", `${fmtTime(t)} of ${fmtTime(d)}`);
}

function commitSeek() {
  if (!state.seeking) return;
  const d = audio.duration;
  if (Number.isFinite(d)) audio.currentTime = (els.seekBar.value / 1000) * d;
  state.seeking = false;
  updateProgress();
}

function seekBy(seconds) {
  if (!Number.isFinite(audio.duration)) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  updateProgress();
}

audio.addEventListener("timeupdate", updateProgress);

audio.addEventListener("loadedmetadata", () => {
  const track = currentTrack();
  if (track && Number.isFinite(audio.duration)) state.durations[track.id] = audio.duration;
  els.durTime.textContent = fmtTime(audio.duration);
  refreshDurations();
  updateProgress();
});

els.seekBar.addEventListener("input", () => {
  state.seeking = true;
  const d = audio.duration;
  const percent = els.seekBar.value / 10;
  setFill(els.seekBar, percent);
  if (Number.isFinite(d)) els.curTime.textContent = fmtTime((percent / 100) * d);
});
els.seekBar.addEventListener("change", commitSeek);
els.seekBar.addEventListener("pointerup", commitSeek);

/* ---- Volume ---- */
function applyVolume() {
  audio.volume = state.volume;
  audio.muted = state.muted;
  const shown = state.muted ? 0 : state.volume;
  els.volBar.value = Math.round(shown * 100);
  setFill(els.volBar, shown * 100);
  const name = shown === 0 ? "volume-mute" : shown < 0.5 ? "volume-low" : "volume-high";
  $("use", els.muteBtn).setAttribute("href", `#i-${name}`);
  els.muteBtn.setAttribute("aria-label", state.muted || shown === 0 ? "Unmute" : "Mute");
  els.muteBtn.title = state.muted || shown === 0 ? "Unmute (M)" : "Mute (M)";
}

function toggleMute() {
  if (state.muted || state.volume === 0) {
    state.muted = false;
    if (state.volume === 0) state.volume = 0.6;
  } else {
    state.muted = true;
  }
  applyVolume();
  store.save();
}

els.volBar.addEventListener("input", () => {
  state.volume = els.volBar.value / 100;
  state.muted = state.volume === 0;
  applyVolume();
  store.save();
});

function changeVolume(delta) {
  state.volume = Math.max(0, Math.min(1, (state.muted ? 0 : state.volume) + delta));
  state.muted = state.volume === 0;
  applyVolume();
  store.save();
}

/* ---- Audio element events drive the UI ---- */
audio.addEventListener("play", () => setPlayingUI(true));
audio.addEventListener("pause", () => setPlayingUI(false));
audio.addEventListener("waiting", () => els.player.classList.add("is-buffering"));
["playing", "canplay", "pause", "error"].forEach((type) =>
  audio.addEventListener(type, () => els.player.classList.remove("is-buffering")));


/* ==========================================================================
   7. RENDERING
   ========================================================================== */

/* ---- Sidebar: one entry per artist playlist ---- */
function renderNav() {
  const item = (id, name, letter, count) => `
    <button class="nav-item" type="button" data-view="${id}">
      <span class="art art--xs art--artist"><span class="art__init">${esc(letter)}</span></span>
      <span class="nav-item__text">
        <span class="nav-item__name">${esc(name)}</span>
        <span class="nav-item__count">${count} songs</span>
      </span>
      ${EQ}
    </button>`;

  els.nav.innerHTML =
    `<h2 class="nav-heading">Library</h2>` +
    item("all", ALL_VIEW.name, ALL_VIEW.letter, ALL_TRACKS.length) +
    `<h2 class="nav-heading">Artist playlists</h2>` +
    ARTISTS.map((a) => item(a.id, a.name, a.letter, a.tracks.length)).join("");
}

/* ---- Artist shelf on the home view ---- */
function renderShelf() {
  els.shelf.innerHTML = ARTISTS.map((a) => `
    <article class="pl-card" data-open="${a.id}">
      <div class="sleeve-wrap">
        <button class="pl-card__open" type="button" aria-label="Open ${esc(a.name)} playlist">
          <span class="sleeve">
            <span class="disc"></span>
            <span class="art art--artist"><span class="art__init">${esc(a.letter)}</span></span>
          </span>
        </button>
        <button class="fab" type="button" aria-label="Play ${esc(a.name)} playlist">${icon("play")}</button>
      </div>
      <span class="pl-card__name">${esc(a.name)}</span>
      <span class="pl-card__count">${a.tracks.length} songs</span>
    </article>`).join("");
}

/* ---- Header of the current view ---- */
function renderHero() {
  const view = getView();
  els.heroInit.textContent = view.letter;
  els.heroTitle.textContent = view.name;
  els.heroMeta.textContent = view.id === "all"
    ? `${ALL_TRACKS.length} songs across ${ARTISTS.length} artist playlists`
    : `${view.tracks.length} songs`;
}

/* ---- Song cards / list ---- */
function visibleTracks() {
  const view = getView();
  const q = state.query.trim().toLowerCase();
  if (!q) return view.tracks;
  return view.tracks.filter((t) => `${t.title} ${t.artist} ${t.playlistName}`.toLowerCase().includes(q));
}

function songHTML(t, i) {
  return `
    <li>
      <button class="song" type="button" data-id="${t.id}" aria-label="Play ${esc(t.title)} by ${esc(t.artist)}">
        <span class="art art--song">
          <span class="art__init">${esc(t.letter)}</span>
          <span class="song__overlay" aria-hidden="true">${icon("play", "i-play")}${icon("pause", "i-pause")}</span>
          ${EQ}
        </span>
        <span class="song__meta">
          <span class="song__title">${esc(t.title)}</span>
          <span class="song__artist">${esc(t.artist)}</span>
        </span>
        <span class="song__dur" data-id="${t.id}">--:--</span>
        <span class="song__num">${i + 1}</span>
      </button>
    </li>`;
}

function renderSongs() {
  const list = visibleTracks();
  const q = state.query.trim();
  els.listTitle.textContent = q ? "Search results" : state.view === "all" ? "All songs" : "Songs";
  els.listCount.textContent = `${list.length} ${list.length === 1 ? "song" : "songs"}`;
  els.songs.className = `songs ${state.layout === "list" ? "is-list" : "is-grid"}`;
  els.songs.innerHTML = list.length
    ? list.map(songHTML).join("")
    : `<li class="empty">No songs match “${esc(q)}”. Try another title or artist.</li>`;
  refreshDurations();
  syncHighlights();
}

function refreshDurations() {
  $$(".song__dur").forEach((el) => {
    const track = TRACK_BY_ID.get(el.dataset.id);
    const d = track && durationOf(track);
    el.textContent = d ? fmtTime(d) : "--:--";
  });
}

/* ---- Mark what is playing everywhere it appears ---- */
function syncHighlights() {
  const current = currentTrack();

  $$(".song.is-current").forEach((el) => { el.classList.remove("is-current"); el.removeAttribute("aria-current"); });
  if (current) {
    $$(`.song[data-id="${current.id}"]`).forEach((el) => { el.classList.add("is-current"); el.setAttribute("aria-current", "true"); });
  }
  $$(".nav-item").forEach((el) => el.classList.toggle("is-current", !!current && el.dataset.view === current.playlistId));

  // Header button: Play / Pause / Resume for this view
  const view = getView();
  const owns = !!current && state.queueSource === view.id;
  const playing = owns && state.isPlaying;
  const label = playing ? "Pause" : owns && audio.currentTime > 0 ? "Resume" : "Play";
  els.heroPlay.innerHTML = `${icon(playing ? "pause" : "play")}<span>${label}</span>`;
  els.heroSleeve.classList.toggle("is-live", !!current && (view.id === "all" || current.playlistId === view.id));
}

/* ---- Player bar ---- */
function renderNowPlaying(track) {
  els.npTitle.textContent = track.title;
  els.npArtist.textContent = track.artist;
  els.npInit.textContent = track.letter;
  document.title = `${track.title} — Tunezo`;

  if ("mediaSession" in navigator && window.MediaMetadata) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: track.playlistName });
  }
}

function setPlayingUI(isPlaying) {
  state.isPlaying = isPlaying;
  document.body.classList.toggle("is-playing", isPlaying);
  $("use", els.playBtn).setAttribute("href", isPlaying ? "#i-pause" : "#i-play");
  els.playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  els.playBtn.title = isPlaying ? "Pause (Space)" : "Play (Space)";
  const track = currentTrack();
  if (track) document.title = `${isPlaying ? "▶ " : ""}${track.title} — Tunezo`;
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  syncHighlights();
}

function updateLoopUI() {
  const on = state.loop !== "off";
  els.loopBtn.classList.toggle("is-on", on);
  els.loopBtn.setAttribute("aria-pressed", String(on));
  els.loopBtn.setAttribute("aria-label", LOOP_LABELS[state.loop]);
  $("use", els.loopBtn).setAttribute("href", state.loop === "one" ? "#i-repeat-one" : "#i-repeat");
}

function updateShuffleUI() {
  els.shuffleBtn.classList.toggle("is-on", state.shuffle);
  els.shuffleBtn.setAttribute("aria-pressed", String(state.shuffle));
}

function updateAutoUI() {
  els.autoBtn.setAttribute("aria-pressed", String(state.autoplay));
}

function updateLayoutUI() {
  $$("[data-layout]").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.layout === state.layout)));
}

/* ---- Switch between "All songs" and an artist playlist ---- */
function setView(id) {
  state.view = id;
  state.query = "";
  els.search.value = "";

  $$(".nav-item").forEach((btn) => {
    const active = btn.dataset.view === id;
    btn.classList.toggle("is-active", active);
    if (active) btn.setAttribute("aria-current", "page"); else btn.removeAttribute("aria-current");
  });

  renderHero();
  els.shelfSection.hidden = id !== "all";
  renderSongs();
  els.main.scrollTo({ top: 0 });

  const active = $(".nav-item.is-active");
  if (active) active.scrollIntoView({ block: "nearest", inline: "center" });
  store.save();
}


/* ==========================================================================
   8. EVENTS
   ========================================================================== */
els.nav.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-view]");
  if (btn) setView(btn.dataset.view);
});

els.shelf.addEventListener("click", (e) => {
  const card = e.target.closest(".pl-card");
  if (!card) return;
  if (e.target.closest(".fab")) playView(card.dataset.open);
  else setView(card.dataset.open);
});

els.songs.addEventListener("click", (e) => {
  const btn = e.target.closest(".song");
  if (btn) handleSongClick(btn.dataset.id);
});

els.heroPlay.addEventListener("click", () => playView(state.view));

els.heroShuffle.addEventListener("click", () => {
  const view = getView();
  state.shuffle = true;
  updateShuffleUI();
  store.save();
  startQueue(view.tracks, Math.floor(Math.random() * view.tracks.length), view.id);
});

els.playBtn.addEventListener("click", () => {
  if (currentTrack()) togglePlay();
  else playView(state.view);
});
els.prevBtn.addEventListener("click", previous);
els.nextBtn.addEventListener("click", () => advance(1));
els.shuffleBtn.addEventListener("click", toggleShuffle);
els.loopBtn.addEventListener("click", cycleLoop);
els.autoBtn.addEventListener("click", toggleAutoplay);
els.muteBtn.addEventListener("click", toggleMute);

$$("[data-layout]").forEach((btn) => btn.addEventListener("click", () => {
  state.layout = btn.dataset.layout;
  updateLayoutUI();
  renderSongs();
  store.save();
}));

els.search.addEventListener("input", () => {
  state.query = els.search.value;
  els.shelfSection.hidden = state.view !== "all" || state.query.trim() !== "";
  renderSongs();
});

els.search.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    els.search.value = "";
    els.search.dispatchEvent(new Event("input"));
    els.search.blur();
  }
});

// Keyboard shortcuts (ignored while typing in a field)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  switch (e.code) {
    case "Space":
      if (tag === "BUTTON") return;            // let a focused button handle its own Space
      e.preventDefault(); togglePlay(); break;
    case "ArrowRight": e.preventDefault(); seekBy(CONFIG.seekStepSeconds); break;
    case "ArrowLeft":  e.preventDefault(); seekBy(-CONFIG.seekStepSeconds); break;
    case "ArrowUp":    e.preventDefault(); changeVolume(0.05); break;
    case "ArrowDown":  e.preventDefault(); changeVolume(-0.05); break;
    case "KeyN": advance(1); break;
    case "KeyP": previous(); break;
    case "KeyM": toggleMute(); break;
    case "KeyL": cycleLoop(); break;
    case "KeyS": toggleShuffle(); break;
    case "Slash": e.preventDefault(); els.search.focus(); break;
  }
});

// Hardware media keys, headphone buttons and the lock-screen controls
function setupMediaSession() {
  if (!("mediaSession" in navigator)) return;
  const set = (action, handler) => { try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* unsupported action */ } };
  set("play", safePlay);
  set("pause", pauseAudio);
  set("previoustrack", previous);
  set("nexttrack", () => advance(1));
  set("seekto", (d) => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
}


/* ==========================================================================
   9. START-UP
   ========================================================================== */
function init() {
  const saved = store.load();
  const clamp01 = (n, fallback) => (typeof n === "number" && n >= 0 && n <= 1 ? n : fallback);

  state.volume = clamp01(saved.volume, 0.8);
  state.muted = saved.muted === true;
  state.loop = ["off", "all", "one"].includes(saved.loop) ? saved.loop : "off";
  state.shuffle = saved.shuffle === true;
  state.autoplay = saved.autoplay !== false;
  state.layout = saved.layout === "grid" ? "grid" : "list";
  state.view = saved.view === "all" || ARTIST_BY_ID.has(saved.view) ? saved.view : "all";

  renderNav();
  renderShelf();
  applyVolume();
  updateLoopUI();
  updateShuffleUI();
  updateAutoUI();
  updateLayoutUI();
  setView(state.view);
  setupMediaSession();

  // Line up the first song of the opening view (paused) so Play works straight away
  const view = getView();
  state.queue = view.tracks.slice();
  state.queueSource = view.id;
  buildOrder(0);
  loadCurrent(false);

  setTimeout(probeDemoDurations, 1500);
}

init();
