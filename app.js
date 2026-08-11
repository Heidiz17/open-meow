/* ==========================================
   📚 第三頁 app.js - 目錄 Part 4 (9/12)
   ========================================== */

/* ------------------------------------------
   [4.1] UI 主題色與 LocalStorage 記憶載入
   ------------------------------------------ */
let savedThemeIdx = localStorage.getItem("meowTitleThemeIdx");
let titleThemeIdx = savedThemeIdx !== null ? parseInt(savedThemeIdx) : 1;

let savedSubIdx = localStorage.getItem("meowSubThemeIdx");
let subThemeIdx = savedSubIdx !== null ? parseInt(savedSubIdx) : 0;

const themeClasses = ['', 'theme-white', 'theme-gold', 'theme-red', 'theme-blue', 'theme-black'];
const subThemeClasses = ['sub-orange', 'sub-green', 'sub-red', 'sub-blue', 'sub-white'];

if (document.body && themeClasses[titleThemeIdx]) document.body.classList.add(themeClasses[titleThemeIdx]);
if (document.body && subThemeClasses[subThemeIdx]) document.body.classList.add(subThemeClasses[subThemeIdx]);

/* ------------------------------------------
   [4.2] 全局 Web Audio API UI 音效引擎
   ------------------------------------------ */
let audioCtx = null;
let djMasterGain = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    djMasterGain = audioCtx.createGain();
    djMasterGain.gain.value = 0.8;
    djMasterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') { audioCtx.resume(); }
  return audioCtx;
}

function playUiSound(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'foldOpen') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'foldClose') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
      gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'chime') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); osc.frequency.setValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
    } else if (type === 'click') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.start(now); osc.stop(now + 0.04);
    }
  } catch(e) {}
}

/* 🎨 主標題獨立換色 */
function toggleTitleColor() {
  playUiSound('click');
  titleThemeIdx = (titleThemeIdx + 1) % 6;
  document.body.classList.remove('theme-white', 'theme-gold', 'theme-red', 'theme-blue', 'theme-black');
  if (themeClasses[titleThemeIdx]) document.body.classList.add(themeClasses[titleThemeIdx]);
  localStorage.setItem("meowTitleThemeIdx", titleThemeIdx);
  showToast("🎨 主標色已切換");
}

/* 🎨 副標題獨立換色 */
function toggleSubTitleColor() {
  playUiSound('click');
  const subThemeClasses = ['sub-orange', 'sub-gold', 'sub-green', 'sub-red', 'sub-blue', 'sub-white'];
  subThemeIdx = (subThemeIdx + 1) % subThemeClasses.length;
  document.body.classList.remove('sub-orange', 'sub-gold', 'sub-green', 'sub-red', 'sub-blue', 'sub-white');
  if (subThemeClasses[subThemeIdx]) document.body.classList.add(subThemeClasses[subThemeIdx]);
  localStorage.setItem("meowSubThemeIdx", subThemeIdx);
  showToast("🎨 副標色已切換");
}

/* 📂 櫃桶開合邏輯 */
let isAllFolded = false;
function toggleFold(id) {
  const content = document.getElementById(id);
  const arrowId = "arrow" + id.replace("fold", "");
  const arrow = document.getElementById(arrowId);
  if (content) {
    const isActive = content.classList.contains('active');
    if (isActive) {
      content.classList.remove('active');
      if (arrow) arrow.innerText = "▼ 展開";
      playUiSound('foldClose');
    } else {
      content.classList.add('active');
      if (arrow) arrow.innerText = "▲ 收起";
      playUiSound('foldOpen');
    }
  }
}

function toggleAllFolds() {
  playUiSound('click');
  const allContents = document.querySelectorAll('.fold-content, .radio-sub-box');
  const allArrows = document.querySelectorAll('.fold-arrow');
  const btn = document.getElementById('btnMasterFold');
  isAllFolded = !isAllFolded;
  allContents.forEach(content => {
    if (isAllFolded) content.classList.add('active');
    else content.classList.remove('active');
  });
  allArrows.forEach(arrow => { if (arrow) arrow.innerText = isAllFolded ? "▲ 收起" : "▼ 展開"; });
  if (btn) {
    btn.innerText = isAllFolded ? "📁 一鍵全縮" : "📂 一鍵全開";
    btn.style.background = isAllFolded ? "#00b894" : "#e17055";
  }
  showToast(isAllFolded ? "📂 已一鍵展開所有區域！" : "📁 已一鍵收縮還原！");
}

/* 🔠 字體切換 */
let fontScaleLevel = 0;
function toggleFontSize() {
  playUiSound('click');
  fontScaleLevel = (fontScaleLevel + 1) % 3;
  const titles = document.querySelectorAll('.section-title-btn, .header-fold-title');
  const subTips = document.querySelectorAll('.sub-tip');
  const bibleText = document.getElementById('bibleText');

  if (fontScaleLevel === 0) {
    titles.forEach(t => t.style.fontSize = '14px'); subTips.forEach(s => s.style.fontSize = '11px');
    if (bibleText) bibleText.style.fontSize = '14px'; showToast("🔠 字體已切換至：小號 (還原舊版)");
  } else if (fontScaleLevel === 1) {
    titles.forEach(t => t.style.fontSize = '17px'); subTips.forEach(s => s.style.fontSize = '12.5px');
    if (bibleText) bibleText.style.fontSize = '17px'; showToast("🔠 字體已切換至：中號清晰字體");
  } else {
    titles.forEach(t => t.style.fontSize = '20px'); subTips.forEach(s => s.style.fontSize = '14.5px');
    if (bibleText) bibleText.style.fontSize = '20px'; showToast("🔠 字體已切換至：特大號車機字！");
  }
  if (db) db.transaction("settings", "readwrite").objectStore("settings").put({ key: "fontScale", val: fontScaleLevel });
}

/* ✝️ 聖經金句抽卡邏輯 */
let bibleData = null, isDrawingCard = false;
async function loadVersesJSON() {
  try {
    const response = await fetch('verses.json');
    if (!response.ok) throw new Error();
    bibleData = await response.json();
  } catch (e) { console.log("verses.json 未載入"); }
}

function drawBibleCardWithAnim() {
  if (isDrawingCard) return;
  playUiSound('chime');
  isDrawingCard = true;
  const cardBox = document.getElementById('bibleCardBox');
  const textEl = document.getElementById('bibleText');
  const catSelect = document.getElementById('bibleCategorySelect');
  const selectedCat = catSelect ? catSelect.value : "ALL";

  if (cardBox && textEl) {
    cardBox.classList.add('drawing-anim');
    textEl.style.color = "#74b9ff";
    textEl.innerText = "⏳ 🙏 正在誠心禱告，尋求天父話語與祝福...";
    
    setTimeout(() => {
      let pool = [];
      if (bibleData) {
        if (selectedCat === "ALL") pool = Object.values(bibleData).flat();
        else if (bibleData[selectedCat]) pool = bibleData[selectedCat];
        else pool = Object.values(bibleData).flat();
      }

      if (pool && pool.length > 0) {
        const randIdx = Math.floor(Math.random() * pool.length);
        textEl.innerText = pool[randIdx];
      } else {
        textEl.innerText = "✨ 「在至高之處榮耀歸與神！在地上平安歸與他所喜悅的人。」 (路加福音 2:14)";
      }

      cardBox.classList.remove('drawing-anim');
      textEl.style.color = "#ffeaa7";
      isDrawingCard = false;
      showToast("<span style='font-size:15px; color:#ffeaa7; font-weight:bold;'>❤️阿們！</span><br>已領受神的話語");
    }, 800);
  }
}
loadVersesJSON();
/* ==========================================
   📚 第三頁 app.js - 目錄 Part 4 (10/12)
   ========================================== */

/* ------------------------------------------
   [4.3] 古早 DJ 合成器與雙 Deck BPM 邏輯
   ------------------------------------------ */
function playSynthSound(type) {
  try {
    const ctx = getAudioContext(); const now = ctx.currentTime;
    const padGain = ctx.createGain(); padGain.connect(djMasterGain);

    if (type === 'kick') {
      const osc = ctx.createOscillator(); osc.connect(padGain);
      osc.frequency.setValueAtTime(130, now); osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
      padGain.gain.setValueAtTime(1, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'snare') {
      const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.connect(padGain);
      osc.frequency.setValueAtTime(250, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      padGain.gain.setValueAtTime(0.8, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'hihat') {
      const bufferSize = ctx.sampleRate * 0.05; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buffer;
      const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 7000;
      noise.connect(filter); filter.connect(padGain); padGain.gain.setValueAtTime(0.5, now);
      padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); noise.start(now);
    } else if (type === 'crash') {
      const bufferSize = ctx.sampleRate * 0.4; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buffer;
      const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 4000;
      noise.connect(filter); filter.connect(padGain); padGain.gain.setValueAtTime(0.7, now);
      padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4); noise.start(now);
    } else if (type === 'tom') {
      const osc = ctx.createOscillator(); osc.connect(padGain);
      osc.frequency.setValueAtTime(180, now); osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
      padGain.gain.setValueAtTime(0.8, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'clap') {
      const osc = ctx.createOscillator(); osc.type = 'square'; osc.connect(padGain);
      osc.frequency.setValueAtTime(800, now); padGain.gain.setValueAtTime(0.5, now);
      padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'arpUp') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator(); const noteGain = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = freq; osc.connect(noteGain); noteGain.connect(djMasterGain);
        noteGain.gain.setValueAtTime(0.2, now + i*0.06); noteGain.gain.exponentialRampToValueAtTime(0.01, now + (i+1)*0.06);
        osc.start(now + i*0.06); osc.stop(now + (i+1)*0.06);
      });
    } else if (type === 'stutter') {
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator(); const noteGain = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = 440; osc.connect(noteGain); noteGain.connect(djMasterGain);
        noteGain.gain.setValueAtTime(0.25, now + i*0.05); noteGain.gain.exponentialRampToValueAtTime(0.01, now + i*0.05 + 0.03);
        osc.start(now + i*0.05); osc.stop(now + i*0.05 + 0.03);
      }
    } else if (type === 'laser') {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.connect(padGain);
      osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      padGain.gain.setValueAtTime(0.4, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'check') {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.connect(padGain);
      osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      padGain.gain.setValueAtTime(0.3, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'go') {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.connect(padGain);
      osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      padGain.gain.setValueAtTime(0.3, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.connect(padGain);
      osc.frequency.setValueAtTime(523.25, now); osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
      padGain.gain.setValueAtTime(0.3, now); padGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    }
  } catch(e) {}
}

let deckABpmVal = 124.0, deckBBpmVal = 120.0;
function updateDeckPitch(deck, val) {
  playUiSound('click'); const bgPlayer = document.getElementById('bgPlayer');
  if (bgPlayer) bgPlayer.playbackRate = val;
  if (deck === 'A') { deckABpmVal = (124.0 * val).toFixed(1); document.getElementById('deckABpm').innerText = deckABpmVal + " BPM"; } 
  else { deckBBpmVal = (120.0 * val).toFixed(1); document.getElementById('deckBBpm').innerText = deckBBpmVal + " BPM"; }
}

function syncBpmBtoA() {
  playUiSound('click'); const targetRate = deckABpmVal / 120.0;
  document.getElementById('deckBPitch').value = targetRate; updateDeckPitch('B', targetRate);
  showToast("⚡ 已將 Deck B 速度自動鎖定至 Deck A (" + deckABpmVal + " BPM)！");
}

function playDeck(deck) { playUiSound('click'); const bgPlayer = document.getElementById('bgPlayer'); if (bgPlayer) bgPlayer.play(); showToast("▶️ 開始播放 Deck " + deck); }
function pauseDeck(deck) { playUiSound('click'); const bgPlayer = document.getElementById('bgPlayer'); if (bgPlayer) bgPlayer.pause(); showToast("⏸️ 暫停 Deck " + deck); }
function updateCrossfader(val) { 
  const bgPlayer = document.getElementById('bgPlayer'); 
  if (bgPlayer) bgPlayer.volume = document.getElementById('volBgm').value * (1 - val * 0.5); 
  document.getElementById('meterCrossfader').style.width = (val * 100) + "%";
}
function autoCrossfade() {
  playUiSound('click'); const slider = document.getElementById('crossfader'); let currentVal = parseFloat(slider.value);
  const targetVal = currentVal > 0.5 ? 0 : 1; const step = (targetVal - currentVal) / 30; let count = 0;
  const timer = setInterval(() => { currentVal += step; slider.value = currentVal; updateCrossfader(currentVal); count++; if (count >= 30) { clearInterval(timer); showToast("🔄 Auto Crossfade 換歌完成！"); } }, 100);
}

/* ------------------------------------------
   [4.4] IndexedDB 本地資料庫初始化
   ------------------------------------------ */
let db, currentAlbum = "default", currentCatAudio = null, currentActiveVideo = null, currentPresetIdx = 0;
let albumMediaList = [], slideIndex = 0, slideTimer = null, isPlayingSlideshow = false, slideshowInterval = 6000;
let musicList = [], currentTrackIdx = 0, playMode = 'sequence', pressTimer = null, touchStartX = 0, touchEndX = 0;
const presetWallpapers = ["linear-gradient(135deg, #f3a683 0%, #f7d794 100%)", "linear-gradient(135deg, #f7f9fc 0%, #e2e8f0 100%)", "linear-gradient(135deg, #2d3436 0%, #000000 100%)"];

const request = indexedDB.open("OpenMeowMasterDB", 5);
request.onupgradeneeded = function(e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains("media")) db.createObjectStore("media", { keyPath: "id", autoIncrement: true });
  if (!db.objectStoreNames.contains("albums")) db.createObjectStore("albums", { keyPath: "id" });
  if (db.objectStoreNames.contains("music")) db.deleteObjectStore("music");
  db.createObjectStore("music", { keyPath: "id", autoIncrement: true });
  if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
};
request.onsuccess = function(e) { 
  db = e.target.result; 
  loadAlbums(); loadMedia(); loadSavedMusic(); loadSavedWallpaper(); loadSavedOpacity(); loadSavedFontTheme(); initAlbumLongPress(); renderCatGrid();
  updateVolumes(); updateNatureVolumes();
};
/* ==========================================
   📚 第三頁 app.js - 目錄 Part 4 (11/12)
   ========================================== */

function toggleFontTheme() {
  playUiSound('click'); document.body.classList.toggle('jp-font');
  const isJp = document.body.classList.contains('jp-font'); showToast(isJp ? "✨ 已切換至：日系可愛字體！" : "✨ 已切換至：經典港系粗體！");
  if (db) db.transaction("settings", "readwrite").objectStore("settings").put({ key: "fontTheme", val: isJp ? "jp" : "hk" });
}
function loadSavedFontTheme() { const req = db.transaction("settings", "readonly").objectStore("settings").get("fontTheme"); req.onsuccess = function() { if (req.result && req.result.val === "jp") document.body.classList.add('jp-font'); }; }

const catSounds = [
  { name: "打招呼喵", emoji: "😺", desc: "奴才你返嚟啦！", file: "cat1.mp3" }, { name: "要罐罐喵", emoji: "🍖", desc: "快啲開罐罐！急需要！", file: "cat2.mp3" },
  { name: "急促討食", emoji: "⚡", desc: "動作太慢，扣 50 分！", file: "cat3.mp3" }, { name: "裝可憐喵", emoji: "🥺", desc: "畀粒零食我食啦～", file: "cat4.mp3" },
  { name: "開心呼嚕", emoji: "🥰", desc: "摸得好舒服，想瞓覺。", file: "cat5.mp3" }, { name: "興奮鳥鳴", emoji: "🐥", desc: "見到窗外有飛鳥！", file: "cat6.mp3" },
  { name: "告白短喵", emoji: "❤️", desc: "最信任你啦奴才。", file: "cat7.mp3" }, { name: "放術踏踏", emoji: "🐾", desc: "按摩中，請勿打擾。", file: "cat8.mp3" },
  { name: "迎人高音", emoji: "🎉", desc: "好開心見到你返屋企！", file: "cat9.mp3" }, { name: "滾火低吼", emoji: "😡", desc: "唔好逼我，想咬人！", file: "cat10.mp3" },
  { name: "警告哈氣", emoji: "🐍", desc: "別過嚟！再過嚟我動手！", file: "cat11.mp3" }, { name: "踩尾尖叫", emoji: "🙀", desc: "踩到我尾巴啦！痛呀！", file: "cat12.mp3" }
];

function renderCatGrid() {
  const soundGrid = document.getElementById('soundGrid');
  if (soundGrid) {
    soundGrid.innerHTML = "";
    catSounds.forEach((item) => {
      const btn = document.createElement('div'); btn.className = 'sound-btn';
      btn.innerHTML = `<span>${item.emoji}</span>${item.name}`; btn.onclick = () => playRealCatSound(item); soundGrid.appendChild(btn);
    });
  }
}

function playRealCatSound(item) {
  if (currentCatAudio) { currentCatAudio.pause(); currentCatAudio = null; }
  currentCatAudio = new Audio('cat' + item.file.replace('cat', '')); currentCatAudio.volume = document.getElementById('volCat').value;
  currentCatAudio.play().then(() => { showToast(`${item.emoji} ${item.name}：${item.desc}`); }).catch(e => {
    currentCatAudio = new Audio(item.file); currentCatAudio.volume = document.getElementById('volCat').value;
    currentCatAudio.play().then(() => { showToast(`${item.emoji} ${item.name}：${item.desc}`); }).catch(err => { showToast(`🐾 貓語：${item.desc}`); });
  });
}

function toggleNatureSound(type) {
  playUiSound('click');
  const audio = document.getElementById('sound-' + type);
  const btn = document.getElementById('btn-nature-' + type);
  const names = { wave: '🌊 海浪聲', windbell: '🎐 風吹風鈴', rain: '🌧️ 雨夜聽雨', forest: '🌲 晨曦森林' };

  if (audio.paused) {
    updateNatureVolumes();
    audio.play().then(() => {
      btn.innerText = names[type] + ' (開)';
      btn.style.boxShadow = "0 0 12px #ffeaa7";
      btn.style.border = "1.5px solid #ffeaa7";
      showToast("🌿 開始播放：" + names[type]);
    }).catch(e => showToast("❌ 音效載入失敗！"));
  } else {
    audio.pause();
    btn.innerText = names[type] + ' (關)';
    btn.style.boxShadow = "none";
    btn.style.border = "1px solid rgba(255,255,255,0.4)";
    showToast("⏸️ 暫停：" + names[type]);
  }
}

function updateGlobalMasterVolume() {
  const globalMaster = document.getElementById('volMaster') ? document.getElementById('volMaster').value : 1.0;
  if (document.getElementById('meterMaster')) document.getElementById('meterMaster').style.width = (globalMaster * 100) + "%";
  const bgPlayer = document.getElementById('bgPlayer');
  const bgmVolInput = document.getElementById('volBgm');
  if (bgPlayer) {
    const baseBgm = bgmVolInput ? bgmVolInput.value : 0.8;
    bgPlayer.volume = baseBgm * globalMaster;
  }
  updateNatureVolumes();
}

function updateNatureVolumes() {
  const globalMaster = document.getElementById('volMaster') ? document.getElementById('volMaster').value : 1.0;
  ['wave', 'windbell', 'rain', 'forest'].forEach(type => {
    const audio = document.getElementById('sound-' + type);
    const volInput = document.getElementById('vol' + type.charAt(0).toUpperCase() + type.slice(1));
    const meter = document.getElementById('meter' + type.charAt(0).toUpperCase() + type.slice(1));
    if (volInput && audio) {
      audio.volume = volInput.value * globalMaster;
      if (meter) meter.style.width = (volInput.value * 100) + "%";
    }
  });
}

function uploadCustomWallpaper(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader(); reader.onload = function(e) {
      const wpData = e.target.result; document.body.style.backgroundImage = `url(${wpData})`;
      saveWallpaperSetting("custom", wpData); showToast("✨ 成功換上自訂底紙！");
    }; reader.readAsDataURL(file);
  }
}

function changeWallpaperPreset() {
  playUiSound('click'); currentPresetIdx = (currentPresetIdx + 1) % presetWallpapers.length;
  const bgStyle = presetWallpapers[currentPresetIdx]; document.body.style.backgroundImage = "none"; document.body.style.background = bgStyle;
  saveWallpaperSetting("preset", bgStyle); showToast("🎨 切換預設風格底紙！");
}

function saveWallpaperSetting(type, val) { db.transaction("settings", "readwrite").objectStore("settings").put({ key: "wallpaper", type: type, val: val }); }
function loadSavedWallpaper() { const req = db.transaction("settings", "readonly").objectStore("settings").get("wallpaper"); req.onsuccess = function() { if (req.result) { if (req.result.type === "custom") { document.body.style.backgroundImage = `url(${req.result.val})`; } else { document.body.style.background = req.result.val; } } }; }

function updatePanelOpacity(val) {
  document.documentElement.style.setProperty('--panel-alpha', val); const blurVal = (val == 0) ? '0px' : '14px';
  document.querySelectorAll('.section-title-btn, .album-controls, .music-box, .mixer-box, .sound-btn, .dj-box').forEach(el => {
    el.style.backdropFilter = `blur(${blurVal})`; el.style.webkitBackdropFilter = `blur(${blurVal})`;
  });
  document.getElementById('opacityValDisplay').innerText = Math.round(val * 100) + "%";
  document.getElementById('meterOpacity').style.width = (val * 100) + "%";
  if (db) db.transaction("settings", "readwrite").objectStore("settings").put({ key: "panelOpacity", val: val });
}
function loadSavedOpacity() { const req = db.transaction("settings", "readonly").objectStore("settings").get("panelOpacity"); req.onsuccess = function() { if (req.result) { const val = req.result.val; document.getElementById('volOpacity').value = val; updatePanelOpacity(val); } }; }

function updateVolumes() {
  const bgmVol = document.getElementById('volBgm').value;
  const catVol = document.getElementById('volCat').value;
  const videoVol = document.getElementById('volVideo').value;

  if (document.getElementById('bgPlayer')) document.getElementById('bgPlayer').volume = bgmVol;
  if (currentCatAudio) currentCatAudio.volume = catVol;
  if (currentActiveVideo) currentActiveVideo.volume = videoVol;

  if (document.getElementById('meterBgm')) document.getElementById('meterBgm').style.width = (bgmVol * 100) + "%";
  if (document.getElementById('meterCat')) document.getElementById('meterCat').style.width = (catVol * 100) + "%";
  if (document.getElementById('meterVideo')) document.getElementById('meterVideo').style.width = (videoVol * 100) + "%";
}

function exportFullRPGSave() {
  playUiSound('click'); showToast("⏳ 正在打包全機 RPG 存檔..."); const rpgData = { albums: [], media: [], music: [], settings: [] };
  const tx = db.transaction(["albums", "media", "music", "settings"], "readonly");
  tx.objectStore("albums").getAll().onsuccess = (e) => { rpgData.albums = e.target.result; };
  tx.objectStore("media").getAll().onsuccess = (e) => { rpgData.media = e.target.result; };
  tx.objectStore("music").getAll().onsuccess = (e) => { rpgData.music = e.target.result; };
  tx.objectStore("settings").getAll().onsuccess = (e) => { rpgData.settings = e.target.result; };
  tx.oncomplete = function() {
    const jsonStr = JSON.stringify(rpgData); const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); const dateStr = new Date().toISOString().slice(0,10);
    a.href = url; a.download = `Meow_RPG_Save_${dateStr}.json`; a.click(); URL.revokeObjectURL(url); showToast("💾 成功下載全機 RPG 存檔！");
  };
}

function importFullRPGSave(event) {
  const file = event.target.files[0]; if (!file) return;
  if (!confirm("⚠️ 讀取 RPG 存檔會覆蓋現有數據，確定要繼續？")) return;
  const reader = new FileReader(); reader.onload = function(e) {
    try {
      const rpgData = JSON.parse(e.target.result); const tx = db.transaction(["albums", "media", "music", "settings"], "readwrite");
      tx.objectStore("albums").clear(); tx.objectStore("media").clear(); tx.objectStore("music").clear(); tx.objectStore("settings").clear();
      if (rpgData.albums) rpgData.albums.forEach(item => tx.objectStore("albums").add(item));
      if (rpgData.media) rpgData.media.forEach(item => tx.objectStore("media").add(item));
      if (rpgData.music) rpgData.music.forEach(item => tx.objectStore("music").add(item));
      if (rpgData.settings) rpgData.settings.forEach(item => tx.objectStore("settings").add(item));
      tx.oncomplete = function() { showToast("🎉 讀檔成功！即將刷新介面..."); setTimeout(() => { location.reload(); }, 1200); };
    } catch (err) { alert("❌ 存檔格式錯誤！"); }
  }; reader.readAsText(file); event.target.value = "";
}
/* ==========================================
   📚 第三頁 app.js - 目錄 Part 4 (12/12)
   ========================================== */

/* ------------------------------------------
   [4.5] 多媒體相簿、播放器與 Lightbox 換壁紙
   ------------------------------------------ */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast'); toast.innerHTML = msg; toast.style.display = 'block';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

function createAlbum() {
  playUiSound('click'); const name = prompt("請輸入新相簿名稱：", "黑貓仔寫真");
  if (name) { const id = "album_" + Date.now(); const tx = db.transaction("albums", "readwrite"); tx.objectStore("albums").add({ id: id, name: name, order: Date.now() }); tx.oncomplete = function() { loadAlbums(id); showToast("✨ 成功建立新相簿！"); }; }
}

function initAlbumLongPress() {
  const select = document.getElementById('albumSelect'); if (!select) return;
  select.addEventListener('touchstart', () => { pressTimer = setTimeout(() => { triggerRenameCurrentAlbum(); }, 800); });
  select.addEventListener('touchend', () => { clearTimeout(pressTimer); });
  select.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { triggerRenameCurrentAlbum(); }, 800); });
  select.addEventListener('mouseup', () => { clearTimeout(pressTimer); });
}

function triggerRenameCurrentAlbum() {
  if (currentAlbum === "default") { showToast("⚠️ 「預設相簿」名字受系統保護！"); return; }
  const tx = db.transaction("albums", "readonly"); tx.objectStore("albums").get(currentAlbum).onsuccess = function(e) {
    const album = e.target.result;
    if (album) { const newName = prompt("✏️ 請輸入新相簿名稱：", album.name); if (newName && newName.trim() !== "") { const txWrite = db.transaction("albums", "readwrite"); txWrite.objectStore("albums").put({ id: currentAlbum, name: newName.trim(), order: album.order || Date.now() }); txWrite.oncomplete = function() { showToast(`✨ 相簿已改名為：「${newName.trim()}」`); loadAlbums(currentAlbum); }; } }
  };
}

function moveAlbumOrder(direction) {
  playUiSound('click'); if (currentAlbum === "default") { showToast("⚠️ 「預設相簿」固定在最前！"); return; }
  const tx = db.transaction("albums", "readonly"); let albums = []; tx.objectStore("albums").openCursor().onsuccess = function(e) {
    const cursor = e.target.result; if (cursor) { albums.push(cursor.value); cursor.continue(); } 
    else {
      albums.sort((a, b) => (a.order || 0) - (b.order || 0)); let idx = albums.findIndex(item => item.id === currentAlbum); if (idx === -1) return;
      let targetIdx = idx + direction; if (targetIdx < 0 || targetIdx >= albums.length) return;
      let tempOrder = albums[idx].order || idx; albums[idx].order = albums[targetIdx].order || targetIdx; albums[targetIdx].order = tempOrder;
      const txWrite = db.transaction("albums", "readwrite"); const store = txWrite.objectStore("albums"); store.put(albums[idx]); store.put(albums[targetIdx]);
      txWrite.oncomplete = function() { showToast("✨ 相簿排位調動成功！"); loadAlbums(currentAlbum); };
    }
  };
}

function deleteCurrentAlbum() {
  playUiSound('click'); if (currentAlbum === "default") { alert("⚠️ 「預設相簿」唔可以刪除！"); return; }
  if (confirm("確定要刪除呢個相簿？")) {
    db.transaction("albums", "readwrite").objectStore("albums").delete(currentAlbum);
    const txMedia = db.transaction("media", "readwrite"); txMedia.objectStore("media").openCursor().onsuccess = function(ev) { const c = ev.target.result; if (c) { if (c.value.albumId === currentAlbum) c.delete(); c.continue(); } };
    txMedia.oncomplete = function() { showToast("🗑️ 相簿已成功刪除！"); loadAlbums("default"); };
  }
}

function loadAlbums(selectId) {
  const select = document.getElementById('albumSelect'); if(!select) return; select.innerHTML = '<option value="default">📁 預設相簿</option>';
  let albumList = []; db.transaction("albums", "readonly").objectStore("albums").openCursor().onsuccess = function(e) {
    const cursor = e.target.result; if (cursor) { albumList.push(cursor.value); cursor.continue(); } 
    else {
      albumList.sort((a, b) => (a.order || 0) - (b.order || 0));
      albumList.forEach(alb => { const opt = document.createElement('option'); opt.value = alb.id; opt.innerText = "📁 " + alb.name; select.appendChild(opt); });
      if (selectId) select.value = selectId; currentAlbum = select.value; loadMedia();
    }
  };
}

function switchAlbum() { currentAlbum = document.getElementById('albumSelect').value; loadMedia(); }
function toggleGrid() { playUiSound('click'); document.getElementById('mediaGrid').classList.toggle('four-cols'); }

function uploadMedia(event) {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    let loadedCount = 0; files.forEach(file => {
      const reader = new FileReader(); const isVideo = file.type.startsWith('video/');
      reader.onload = function(e) {
        const tx = db.transaction("media", "readwrite"); tx.objectStore("media").add({ albumId: currentAlbum, src: e.target.result, caption: file.name.split('.')[0], isVideo: isVideo });
        tx.oncomplete = function() { loadedCount++; if (loadedCount === files.length) { loadMedia(); showToast(`✅ 成功揼入 ${files.length} 個檔案！`); } };
      }; reader.readAsDataURL(file);
    });
  }
}

function loadMedia() {
  const mediaGrid = document.getElementById('mediaGrid'); if(!mediaGrid) return; mediaGrid.innerHTML = ""; albumMediaList = [];
  db.transaction("media", "readonly").objectStore("media").openCursor().onsuccess = function(e) {
    const cursor = e.target.result;
    if (cursor) {
      if (cursor.value.albumId === currentAlbum) {
        albumMediaList.push(cursor.value); const card = document.createElement('div'); card.className = 'media-card'; const index = albumMediaList.length - 1;
        card.innerHTML = cursor.value.isVideo ? `<button class="delete-btn" onclick="deleteMedia(${cursor.key})">✕</button><video src="${cursor.value.src}" onclick="openLightboxIndex(${index})"></video><p>🎬 ${cursor.value.caption}</p>` : `<button class="delete-btn" onclick="deleteMedia(${cursor.key})">✕</button><img src="${cursor.value.src}" onclick="openLightboxIndex(${index})"><p>📷 ${cursor.value.caption}</p>`;
        mediaGrid.appendChild(card);
      } cursor.continue();
    }
  };
}

function deleteMedia(id) { if (confirm("確定要刪除？")) { const tx = db.transaction("media", "readwrite").objectStore("media").delete(id); tx.oncomplete = function() { loadMedia(); }; } }

function uploadMusic(event) {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    let loadedCount = 0; files.forEach(file => {
      const reader = new FileReader(); reader.onload = function(e) {
        const tx = db.transaction("music", "readwrite"); tx.objectStore("music").add({ name: file.name, src: e.target.result });
        tx.oncomplete = function() { loadedCount++; if (loadedCount === files.length) { loadSavedMusic(); showToast(`🎵 成功加入 ${files.length} 首歌！`); event.target.value = ""; } };
      }; reader.readAsDataURL(file);
    });
  }
}

function loadSavedMusic() {
  musicList = []; db.transaction("music", "readonly").objectStore("music").openCursor().onsuccess = function(e) {
    const cursor = e.target.result; if (cursor) { musicList.push({ id: cursor.key, name: cursor.value.name, src: cursor.value.src }); cursor.continue(); } 
    else { renderPlaylist(); if (musicList.length > 0 && !document.getElementById('bgPlayer').src) { playTrack(0); } }
  };
}

function renderPlaylist() {
  const display = document.getElementById('playlistDisplay'); if(!display) return; display.innerHTML = "";
  if (musicList.length === 0) { display.innerHTML = "<div style='text-align:center; color:#dfe6e9; padding:6px; font-size:11px;'>（未有音樂）</div>"; document.getElementById('musicName').innerText = "（未選擇音樂）"; return; }
  musicList.forEach((track, idx) => {
    const div = document.createElement('div'); div.className = `track-item ${idx === currentTrackIdx ? 'active' : ''}`;
    div.innerHTML = `<span>🎵 ${idx + 1}. ${track.name}</span><span class="track-del" onclick="deleteTrack(event, ${track.id})">✕</span>`;
    div.onclick = () => playTrack(idx); display.appendChild(div);
  });
  document.getElementById('musicName').innerText = `🎵 播放中 (${currentTrackIdx + 1}/${musicList.length})：${musicList[currentTrackIdx].name}`;
}

function playTrack(idx) { if (musicList.length === 0) return; currentTrackIdx = idx; const player = document.getElementById('bgPlayer'); player.src = musicList[currentTrackIdx].src; player.play().then(() => { renderPlaylist(); updateVolumes(); }).catch(e => console.log(e)); }
function confirmRadioPlay(stationName, streamUrl) { playUiSound('click'); if (confirm(`🐾 準備播放《${stationName}》？`)) { const player = document.getElementById('bgPlayer'); player.src = streamUrl; player.play().then(() => { showToast(`📻 直播中：${stationName}`); document.getElementById('musicName').innerText = `📻 直播中：${stationName}`; }).catch(e => showToast("❌ 連線失敗！")); } }
function setPlayMode(mode) { playUiSound('click'); playMode = mode; document.getElementById('btnSeq').classList.toggle('active', mode === 'sequence'); document.getElementById('btnLoop').classList.toggle('active', mode === 'single-loop'); document.getElementById('btnRand').classList.toggle('active', mode === 'random'); showToast(`🎵 模式改為：${mode === 'sequence' ? '順序' : (mode === 'single-loop' ? '單曲' : '隨機')}`); }
function handleTrackEnded() { if (musicList.length === 0) return; if (playMode === 'single-loop') playTrack(currentTrackIdx); else if (playMode === 'random') playTrack(Math.floor(Math.random() * musicList.length)); else playTrack((currentTrackIdx + 1) % musicList.length); }
function deleteTrack(e, id) { e.stopPropagation(); if (confirm("確定刪除呢首歌？")) { const tx = db.transaction("music", "readwrite").objectStore("music").delete(id); tx.oncomplete = function() { loadSavedMusic(); showToast("🗑️ 已刪除！"); }; } }

function openLightboxIndex(idx) {
  if (albumMediaList.length === 0) return; slideIndex = idx; showSlide(slideIndex);
  const lightbox = document.getElementById('lightbox'); lightbox.style.display = 'flex';
  lightbox.ontouchstart = (e) => { touchStartX = e.changedTouches[0].screenX; };
  lightbox.ontouchend = (e) => { touchEndX = e.changedTouches[0].screenX; if (touchEndX < touchStartX - 50) nextSlide(); if (touchEndX > touchStartX + 50) prevSlide(); };
}

function showSlide(idx) {
  if (albumMediaList.length === 0) return; if (idx >= albumMediaList.length) slideIndex = 0; if (idx < 0) slideIndex = albumMediaList.length - 1;
  const item = albumMediaList[slideIndex]; const content = document.getElementById('lightboxContent'); content.style.opacity = 0;
  setTimeout(() => {
    if (item.isVideo) {
      content.innerHTML = `<video id="activeVideo" src="${item.src}" controls autoplay></video>`; document.getElementById('lightboxCaption').innerText = `🎬 (${slideIndex + 1}/${albumMediaList.length}) ${item.caption}`;
      setTimeout(() => { currentActiveVideo = document.getElementById('activeVideo'); if (currentActiveVideo) currentActiveVideo.volume = document.getElementById('volVideo').value; }, 100);
    } else {
      content.innerHTML = `<img src="${item.src}">`; document.getElementById('lightboxCaption').innerText = `📷 (${slideIndex + 1}/${albumMediaList.length}) ${item.caption}`; currentActiveVideo = null;
    }
    content.style.opacity = 1;
  }, 150);
}

/* 🔥 新功能大腦：相簿放大圖一鍵設為背景壁紙 */
function setLightboxImgAsWallpaper() {
  playUiSound('click');
  if (albumMediaList.length === 0) return;
  const currentItem = albumMediaList[slideIndex];
  
  if (currentItem.isVideo) {
    showToast("⚠️ 影片暫時唔可以設為背景壁紙喔！");
    return;
  }
  
  document.body.style.backgroundImage = `url(${currentItem.src})`;
  saveWallpaperSetting("custom", currentItem.src);
  showToast("✨ 成功將呢張相設為貓貓助手壁紙！");
}

function startSlideshow() { playUiSound('click'); if (albumMediaList.length === 0) { showToast("⚠️ 相簿暫時未有檔案！"); return; } openLightboxIndex(0); isPlayingSlideshow = true; document.getElementById('playPauseBtn').innerText = "⏸️"; resetSlideTimer(); }
function setSlideshowSpeed(ms) {
  playUiSound('click'); slideshowInterval = ms; document.getElementById('spd3').classList.remove('active'); document.getElementById('spd6').classList.remove('active'); document.getElementById('spd10').classList.remove('active');
  if (ms === 3000) document.getElementById('spd3').classList.add('active'); if (ms === 6000) document.getElementById('spd6').classList.add('active'); if (ms === 10000) document.getElementById('spd10').classList.add('active');
  showToast(`⏱️ 速度改為 ${ms/1000} 秒！`); if (isPlayingSlideshow) resetSlideTimer();
}
function resetSlideTimer() { clearInterval(slideTimer); if (isPlayingSlideshow) slideTimer = setInterval(() => { nextSlide(); }, slideshowInterval); }
function toggleSlideshowPlay() { playUiSound('click'); isPlayingSlideshow = !isPlayingSlideshow; document.getElementById('playPauseBtn').innerText = isPlayingSlideshow ? "⏸️" : "▶️"; if (isPlayingSlideshow) resetSlideTimer(); else clearInterval(slideTimer); }
function nextSlide() { slideIndex++; showSlide(slideIndex); if (isPlayingSlideshow) resetSlideTimer(); }
function prevSlide() { slideIndex--; showSlide(slideIndex); if (isPlayingSlideshow) resetSlideTimer(); }
function closeLightbox() { clearInterval(slideTimer); isPlayingSlideshow = false; if (currentActiveVideo) { currentActiveVideo.pause(); currentActiveVideo = null; } document.getElementById('lightboxContent').innerHTML = ""; document.getElementById('lightbox').style.display = 'none'; }
