/* ==========================================================================
   🐾 OPEN 貓貓助手 - 全局 JavaScript 邏輯主體 (app.js) [PART 1/4]
   ==========================================================================
   📋 系統功能章節目錄 (Table of Contents):
   1. [UI Theme & LocalStorage]  2. [Web Audio API Synthesizer]
   3. [Radio & Quick Control]    4. [Verses Generator Engine]
   5. [Global & Nature Mixer]   6. [IndexedDB & RPG Save]
   7. [Cat Soundboard]          8. [Jukebox & Playlist]
   9. [Deck BPM Mixer System]    10.[Album & Lightbox Wallpaper]
   ========================================================================== */

/* 1. [UI Theme & LocalStorage] */
let savedThemeIdx = localStorage.getItem("meowTitleThemeIdx");
let titleThemeIdx = savedThemeIdx !== null ? parseInt(savedThemeIdx) : 1;
let savedSubIdx = localStorage.getItem("meowSubThemeIdx");
let subThemeIdx = savedSubIdx !== null ? parseInt(savedSubIdx) : 0;

const themeClasses = ['', 'theme-white', 'theme-gold', 'theme-red', 'theme-blue', 'theme-black'];
const subThemeClasses = ['sub-orange', 'sub-green', 'sub-red', 'sub-blue', 'sub-white'];

if (document.body && themeClasses[titleThemeIdx]) document.body.classList.add(themeClasses[titleThemeIdx]);
if (document.body && subThemeClasses[subThemeIdx]) document.body.classList.add(subThemeClasses[subThemeIdx]);

function toggleTitleColor() {
  playUiSound('click');
  titleThemeIdx = (titleThemeIdx + 1) % 6;
  document.body.classList.remove('theme-white', 'theme-gold', 'theme-red', 'theme-blue', 'theme-black');
  if (themeClasses[titleThemeIdx]) document.body.classList.add(themeClasses[titleThemeIdx]);
  localStorage.setItem("meowTitleThemeIdx", titleThemeIdx);
  showToast("🎨 主標色已切換");
}

function toggleSubTitleColor() {
  playUiSound('click');
  const subThemeClasses = ['sub-orange', 'sub-gold', 'sub-green', 'sub-red', 'sub-blue', 'sub-white'];
  subThemeIdx = (subThemeIdx + 1) % subThemeClasses.length;
  document.body.classList.remove('sub-orange', 'sub-gold', 'sub-green', 'sub-red', 'sub-blue', 'sub-white');
  if (subThemeClasses[subThemeIdx]) document.body.classList.add(subThemeClasses[subThemeIdx]);
  localStorage.setItem("meowSubThemeIdx", subThemeIdx);
  showToast("🎨 副標色已切換");
}

let isAllFolded = false;
function toggleFold(id) {
  const content = document.getElementById(id);
  const arrow = document.getElementById("arrow" + id.replace("fold", ""));
  if (content) {
    const isActive = content.classList.contains('active');
    content.classList.toggle('active');
    if (arrow) arrow.innerText = isActive ? "▼ 展開" : "▲ 收起";
    playUiSound(isActive ? 'foldClose' : 'foldOpen');
  }
}

function toggleAllFolds() {
  playUiSound('click');
  isAllFolded = !isAllFolded;
  document.querySelectorAll('.fold-content, .radio-sub-box').forEach(c => c.classList.toggle('active', isAllFolded));
  document.querySelectorAll('.fold-arrow').forEach(a => a.innerText = isAllFolded ? "▲ 收起" : "▼ 展開");
  const btn = document.getElementById('btnMasterFold');
  if (btn) { btn.innerText = isAllFolded ? "📁 一鍵全縮" : "📂 一鍵全開"; btn.style.background = isAllFolded ? "#00b894" : "#e17055"; }
  showToast(isAllFolded ? "📂 已一鍵展開！" : "📁 已一鍵收縮！");
}

let fontScaleLevel = 0;
function toggleFontSize() {
  playUiSound('click');
  fontScaleLevel = (fontScaleLevel + 1) % 3;
  const titles = document.querySelectorAll('.section-title-btn, .header-fold-title');
  const subTips = document.querySelectorAll('.sub-tip');
  const bibleText = document.getElementById('bibleText');
  const sizes = [['14px','11px'], ['17px','12.5px'], ['20px','14.5px']];
  titles.forEach(t => t.style.fontSize = sizes[fontScaleLevel][0]);
  subTips.forEach(s => s.style.fontSize = sizes[fontScaleLevel][1]);
  if (bibleText) bibleText.style.fontSize = sizes[fontScaleLevel][0];
  showToast(`🔠 字體：${['小號','中號','特大號'][fontScaleLevel]}`);
}

function toggleFontTheme() {
  playUiSound('click'); document.body.classList.toggle('jp-font');
  const isJp = document.body.classList.contains('jp-font'); showToast(isJp ? "✨ 日系字體" : "✨ 港系字體");
}

/* 2. [Web Audio API Synthesizer] - 混淆連打與 Buffer 引擎 */
let audioCtx = null, djMasterGain = null;
const drumBuffers = {};

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    djMasterGain = audioCtx.createGain(); djMasterGain.gain.value = 0.8;
    djMasterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

async function preloadDrumSound(name, url) {
  try {
    const ctx = getAudioContext();
    const res = await fetch(url);
    const buf = await ctx.decodeAudioData(await res.arrayBuffer());
    drumBuffers[name] = buf;
  } catch (e) {}
}

function playPolyphonicDrum(name) {
  try {
    const ctx = getAudioContext();
    if (!drumBuffers[name]) { playSynthSound(name); return; }
    const src = ctx.createBufferSource();
    src.buffer = drumBuffers[name]; src.connect(ctx.destination); src.start(0);
  } catch (e) { playSynthSound(name); }
}
/* ==========================================================================
   🐾 OPEN 貓貓助手 (app.js) [PART 2/4]
   1. [UI Theme] 2. [Audio Synth] 3. [Radio] 4. [Verses Engine] 5. [Global Mixer]
   ========================================================================== */

function playSynthSound(type) {
  try {
    const ctx = getAudioContext(), now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'kick') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
      gain.gain.setValueAtTime(1.0, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'snare') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(250, now); osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
      gain.gain.setValueAtTime(0.8, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    }
  } catch(e) {}
}

function playUiSound(type) {
  try {
    const ctx = getAudioContext(), now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'click') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.start(now); osc.stop(now + 0.04);
    } else if (type === 'chime') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); osc.frequency.setValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
    }
  } catch(e) {}
}

/* 3. [Radio & Quick Control] */
function confirmRadioPlay(stationName, streamUrl) { 
  playUiSound('click'); 
  if (confirm(`🐾 準備播放《${stationName}》？`)) { 
    const player = document.getElementById('bgPlayer'); 
    player.src = streamUrl; 
    player.play().then(() => { 
      showToast(`📻 直播中：${stationName}`); 
      document.getElementById('musicName').innerText = `📻 直播中：${stationName}`; 
      document.getElementById('btnQuickRadioToggle').innerText = "⏸️ 暫停";
    }).catch(e => showToast("❌ 連線失敗！")); 
  } 
}

function toggleQuickRadio(e) {
  if (e) e.stopPropagation(); playUiSound('click');
  const bgPlayer = document.getElementById('bgPlayer'), btn = document.getElementById('btnQuickRadioToggle');
  if (!bgPlayer || !bgPlayer.src) return showToast("📻 暫未選取電台！");
  if (bgPlayer.paused) { bgPlayer.play(); btn.innerText = "⏸️ 暫停"; showToast("▶️ 繼續播放"); } 
  else { bgPlayer.pause(); btn.innerText = "▶️ 播放"; showToast("⏸️ 即時暫停"); }
}

/* 4. [Verses Generator Engine] */
let bibleData = null, isDrawingCard = false;
async function loadVersesJSON() {
  try { const res = await fetch('verses.json'); bibleData = await res.json(); } catch (e) {}
}

function drawBibleCardWithAnim() {
  if (isDrawingCard) return; playUiSound('chime'); isDrawingCard = true;
  const cardBox = document.getElementById('bibleCardBox'), textEl = document.getElementById('bibleText');
  const selectedCat = document.getElementById('bibleCategorySelect')?.value || "ALL";
  if (cardBox && textEl) {
    cardBox.classList.add('drawing-anim'); textEl.style.color = "#74b9ff";
    textEl.innerText = "⏳ 🙏 誠心禱告尋求祝福...";
    setTimeout(() => {
      let pool = bibleData ? (selectedCat === "ALL" ? Object.values(bibleData).flat() : bibleData[selectedCat] || Object.values(bibleData).flat()) : [];
      textEl.innerText = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : "✨ 「在至高之處榮耀歸與神！在地上平安歸與他所喜悅的人。」 (路加福音 2:14)";
      cardBox.classList.remove('drawing-anim'); textEl.style.color = "#ffeaa7"; isDrawingCard = false;
      showToast("❤️ 阿們！已領受神的話語");
    }, 800);
  }
}
loadVersesJSON();

/* 5. [Global & Nature Mixer] */
function toggleNatureSound(type) {
  playUiSound('click');
  const audio = document.getElementById('sound-' + type), btn = document.getElementById('btn-nature-' + type);
  const names = { wave: '🌊 海浪', windbell: '🎐 風鈴', rain: '🌧️ 雨夜', forest: '🌲 森林' };
  if (audio.paused) {
    updateNatureVolumes(); audio.play().then(() => { btn.innerText = names[type] + ' (開)'; showToast("🌿 播放：" + names[type]); });
  } else { audio.pause(); btn.innerText = names[type] + ' (關)'; showToast("⏸️ 暫停：" + names[type]); }
}

function updateGlobalMasterVolume() {
  const master = document.getElementById('volMaster')?.value || 1.0;
  if (document.getElementById('meterMaster')) document.getElementById('meterMaster').style.width = (master * 100) + "%";
  const bgPlayer = document.getElementById('bgPlayer');
  if (bgPlayer) bgPlayer.volume = (document.getElementById('volBgm')?.value || 0.8) * master;
  updateNatureVolumes();
}

function updateNatureVolumes() {
  const master = document.getElementById('volMaster')?.value || 1.0;
  ['wave', 'windbell', 'rain', 'forest'].forEach(t => {
    const audio = document.getElementById('sound-' + t), vol = document.getElementById('vol' + t.charAt(0).toUpperCase() + t.slice(1));
    if (vol && audio) audio.volume = vol.value * master;
  });
}
/* ==========================================================================
   🐾 OPEN 貓貓助手 (app.js) [PART 3/4]
   6. [IndexedDB & RPG Save] 7. [Cat Soundboard] 8. [Jukebox & Playlist]
   ========================================================================== */

function updatePanelOpacity(val) {
  document.documentElement.style.setProperty('--panel-alpha', val);
  document.getElementById('opacityValDisplay').innerText = Math.round(val * 100) + "%";
}

function updateVolumes() {
  const bgmVol = document.getElementById('volBgm').value, catVol = document.getElementById('volCat').value;
  if (document.getElementById('bgPlayer')) document.getElementById('bgPlayer').volume = bgmVol;
  if (currentCatAudio) currentCatAudio.volume = catVol;
}

/* 6. [IndexedDB & RPG Save] */
let db, currentAlbum = "default", currentCatAudio = null, musicList = [], currentTrackIdx = 0, playMode = 'sequence';
const request = indexedDB.open("OpenMeowMasterDB", 5);
request.onupgradeneeded = function(e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains("media")) db.createObjectStore("media", { keyPath: "id", autoIncrement: true });
  if (!db.objectStoreNames.contains("albums")) db.createObjectStore("albums", { keyPath: "id" });
  if (!db.objectStoreNames.contains("music")) db.createObjectStore("music", { keyPath: "id", autoIncrement: true });
  if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
};
request.onsuccess = function(e) { db = e.target.result; loadSavedMusic(); renderCatGrid(); };

function exportFullRPGSave() {
  playUiSound('click'); showToast("⏳ 正在打包 RPG 存檔...");
  const rpgData = { albums: [], media: [], music: [], settings: [] };
  const tx = db.transaction(["albums", "media", "music", "settings"], "readonly");
  tx.objectStore("albums").getAll().onsuccess = (e) => rpgData.albums = e.target.result;
  tx.objectStore("music").getAll().onsuccess = (e) => rpgData.music = e.target.result;
  tx.oncomplete = function() {
    const blob = new Blob([JSON.stringify(rpgData)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Meow_RPG_Save_${new Date().toISOString().slice(0,10)}.json`; a.click(); showToast("💾 匯出存檔成功！");
  };
}

function importFullRPGSave(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result); const tx = db.transaction(["albums", "music"], "readwrite");
      if (data.music) data.music.forEach(m => tx.objectStore("music").add(m));
      tx.oncomplete = function() { showToast("🎉 讀檔成功！"); setTimeout(() => location.reload(), 1000); };
    } catch (err) { alert("❌ 存檔格式錯誤！"); }
  }; reader.readAsText(file);
}

/* 7. [Cat Soundboard] */
const catSounds = [
  { name: "打招呼喵", emoji: "😺", file: "cat1.mp3" }, { name: "要罐罐喵", emoji: "🍖", file: "cat2.mp3" },
  { name: "急促討食", emoji: "⚡", file: "cat3.mp3" }, { name: "裝可憐喵", emoji: "🥺", file: "cat4.mp3" }
];

function renderCatGrid() {
  const grid = document.getElementById('soundGrid'); if (!grid) return; grid.innerHTML = "";
  catSounds.forEach((item) => {
    const btn = document.createElement('div'); btn.className = 'sound-btn';
    btn.innerHTML = `<span>${item.emoji}</span>${item.name}`; btn.onclick = () => playRealCatSound(item); grid.appendChild(btn);
  });
}

function playRealCatSound(item) {
  if (currentCatAudio) currentCatAudio.pause();
  currentCatAudio = new Audio(item.file); currentCatAudio.volume = document.getElementById('volCat').value;
  currentCatAudio.play().then(() => showToast(`${item.emoji} ${item.name}`));
}

/* 8. [Jukebox & Playlist] */
function uploadMusic(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader(); reader.onload = function(e) {
      const tx = db.transaction("music", "readwrite"); tx.objectStore("music").add({ name: file.name, src: e.target.result });
      tx.oncomplete = () => loadSavedMusic();
    }; reader.readAsDataURL(file);
  });
}

function loadSavedMusic() {
  musicList = []; db.transaction("music", "readonly").objectStore("music").openCursor().onsuccess = function(e) {
    const cursor = e.target.result; if (cursor) { musicList.push(cursor.value); cursor.continue(); } else renderPlaylist();
  };
}

function renderPlaylist() {
  const display = document.getElementById('playlistDisplay'); if (!display) return; display.innerHTML = "";
  musicList.forEach((track, idx) => {
    const div = document.createElement('div'); div.className = `track-item ${idx === currentTrackIdx ? 'active' : ''}`;
    div.innerHTML = `<span>🎵 ${idx + 1}. ${track.name}</span>`; div.onclick = () => playTrack(idx); display.appendChild(div);
  });
}

function playTrack(idx) {
  if (musicList.length === 0) return; currentTrackIdx = idx;
  const player = document.getElementById('bgPlayer'); player.src = musicList[idx].src; player.play(); renderPlaylist();
}
/* ==========================================================================
   🐾 OPEN 貓貓助手 (app.js) [PART 4/4]
   9. [Deck BPM Mixer System - 140 BPM 雙模 Crossfade]
   10.[Album & Lightbox Wallpaper]
   ========================================================================== */

/* 9. [Deck BPM Mixer System] */
let deckABpmVal = 140.0, deckBBpmVal = 140.0;
let isCueMode = false, deckACueTime = 0, deckBCueTime = 0;

function loadDeckTrack(deck, event) {
  const file = event.target.files[0]; if (!file) return;
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  player.src = URL.createObjectURL(file);
  document.getElementById(deck === 'A' ? 'deckAName' : 'deckBName').innerText = "🎵 " + file.name;
  showToast(`✅ Deck ${deck} 已載入！`);
}

function setDeckCue(deck) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player && player.src) {
    const time = player.currentTime, mins = Math.floor(time / 60), secs = Math.floor(time % 60).toString().padStart(2, '0');
    if (deck === 'A') { deckACueTime = time; document.getElementById('btnJumpCueA').innerText = `🔥 爆 Cue (${mins}:${secs})`; }
    else { deckBCueTime = time; document.getElementById('btnJumpCueB').innerText = `🔥 爆 Cue (${mins}:${secs})`; }
    showToast(`📍 記低 Cue 點：${mins}:${secs}`);
  }
}

function jumpToDeckCue(deck) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player && player.src) { player.currentTime = (deck === 'A' ? deckACueTime : deckBCueTime); player.play(); }
}

function updateDeckPitch(deck, val) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player) player.playbackRate = val;
  if (deck === 'A') { deckABpmVal = (140.0 * val).toFixed(1); document.getElementById('deckABpm').innerText = deckABpmVal + " BPM"; }
  else { deckBBpmVal = (140.0 * val).toFixed(1); document.getElementById('deckBBpm').innerText = deckBBpmVal + " BPM"; }
}

function syncBpmBtoA() {
  playUiSound('click');
  const targetRate = (deckABpmVal / 140.0).toFixed(2);
  document.getElementById('deckBPitch').value = targetRate;
  updateDeckPitch('B', targetRate);
  showToast("⚡ Deck B 已鎖定至 Deck A (" + deckABpmVal + " BPM)！");
}

function playDeck(deck) { document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer').play(); }
function pauseDeck(deck) { document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer').pause(); }

function updateCrossfader(val) {
  const pA = document.getElementById('deckAPlayer'), pB = document.getElementById('deckBPlayer');
  if (pA) pA.volume = Math.cos(val * Math.PI / 2);
  if (pB) pB.volume = Math.sin(val * Math.PI / 2);
}

/* 🔄 防呆雙模 Auto Crossfade (預設 6860ms = 4 Bars) */
function autoCrossfade(durationMs = 6860) {
  playUiSound('click');
  const slider = document.getElementById('crossfader'); if (!slider) return;
  let currentVal = parseFloat(slider.value), targetVal = currentVal > 0.5 ? 0 : 1;
  const steps = 30, intervalTime = durationMs / steps, stepVal = (targetVal - currentVal) / steps;
  let count = 0;
  const timer = setInterval(() => {
    currentVal += stepVal; slider.value = currentVal; updateCrossfader(currentVal);
    if (++count >= steps) { clearInterval(timer); showToast(`🔄 自動過歌完成 (${(durationMs/1000).toFixed(1)}s)！`); }
  }, intervalTime);
}

/* 10. [Album & Lightbox Wallpaper] */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast'); if (!toast) return;
  toast.innerHTML = msg; toast.style.display = 'block';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.style.display = 'none', 2500);
}
