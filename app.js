/* ==========================================================================
   🐾 OPEN 貓貓助手 - 全局 JavaScript 邏輯主體 (app.js) - 終極升級整合版
   ========================================================================== */

/* --------------------------------------------------------------------------
   🛡️ [Security & Autoplay Prevention] - 防盜鎖與強制防自動播歌機制
   -------------------------------------------------------------------------- */
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) || (event.ctrlKey && event.key === 'U')) {
    event.preventDefault();
  }
});

// 🛡️ 強制所有音訊與 MP3 預設暫停，防止開機亂自動播歌
window.addEventListener('DOMContentLoaded', () => {
  const bgPlayer = document.getElementById('bgPlayer');
  if (bgPlayer) {
    bgPlayer.pause();
    bgPlayer.currentTime = 0;
  }
  document.querySelectorAll('audio').forEach(audio => {
    audio.pause();
  });
  console.log("🛡️ 防自動播歌機制已啟動：所有音訊已鎖定暫停。");
});

/*==========================================================================
   🐾 靈寵對講機 - 獨立 Prompt / 語音 Talkback / 6色 Preset 升級核心
   ========================================================================== */

let currentCatThemeIdx = parseInt(localStorage.getItem("catChatThemeIdx") || "0");
const catThemeClasses = ['cat-theme-0', 'cat-theme-1', 'cat-theme-2', 'cat-theme-3', 'cat-theme-4', 'cat-theme-5'];
const catThemeNames = [
  '🐈‍⬛ 黑金 (阿豬)', 
  '🤍 雪銀 (灰貓)', 
  '🍊 焦糖 (橘貓)', 
  '🌸 夢幻紫 (少女)', 
  '❄️ 純白 (白貓)', 
  '👑 帝皇黃 (黃貓)'
];

// 🎨 1. 循環切換 6 隻高對比毛色主題
function switchCatChatTheme() {
  try { playUiSound('click'); } catch(e){}
  currentCatThemeIdx = (currentCatThemeIdx + 1) % catThemeClasses.length;
  localStorage.setItem("catChatThemeIdx", currentCatThemeIdx);
  
  var card = document.getElementById('catModalCard');
  if (card) {
    // 清除舊 Class 並套用新主題
    card.className = catThemeClasses[currentCatThemeIdx];
    showToast("🎨 切換底色： " + catThemeNames[currentCatThemeIdx]);
  }
}

// ⚙️ 2. 寵物獨立設定選單（名稱 + Prompt + Key 完全分離）
function setupPetConfig() {
  try { playUiSound('click'); } catch(e){}
  var currentName = localStorage.getItem("custom_pet_name") || "阿豬貓波";
  var currentPrompt = localStorage.getItem("custom_pet_prompt") || "你是一隻叫阿豬的可愛黑貓，說話活潑，常用『喵～』與『咕嚕咕嚕』，深愛主人明仔。";
  var currentKey = localStorage.getItem("custom_ds_key") || "";

  var newName = prompt("🐱 請輸入寵物名字（例如：陳國壽 / 阿豬）：", currentName);
  if (newName !== null && newName.trim() !== "") {
    localStorage.setItem("custom_pet_name", newName.trim());
  }

  var newPrompt = prompt("✨ 請輸入『" + (newName || currentName) + "』嘅性格 Prompt (靈魂提示詞)：", currentPrompt);
  if (newPrompt !== null && newPrompt.trim() !== "") {
    localStorage.setItem("custom_pet_prompt", newPrompt.trim());
  }

  var newKey = prompt("🔑 請輸入專屬 API Key（若無請留空）：", currentKey);
  if (newKey !== null) {
    localStorage.setItem("custom_ds_key", newKey.trim());
  }

  showToast("✨ 寵物『" + (newName || currentName) + "』設定已成功儲存！");
  openCatChatModal(); 
}

// 📸 3. 獨立上傳寵物對話框頭像 + 上傳完自動刷新 Modal 顯示飛打拉桿
function syncSavedCatAvatar() {
  var savedCatAvatar = localStorage.getItem("catNavAvatarData");
  var navImg = document.getElementById('catNavImg');
  if (savedCatAvatar && navImg) navImg.src = savedCatAvatar;
}
window.addEventListener('DOMContentLoaded', syncSavedCatAvatar);

function uploadPetChatAvatar(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var imgData = e.target.result;
    localStorage.setItem("catNavAvatarData", imgData);
    
    // 1. 同步更新外面主介面 Chapter 2.5 嗰張相
    var navImg = document.getElementById('catNavImg');
    if (navImg) navImg.src = imgData;
    
    showToast("📸 成功換上專屬貓咪靚相！");
    
    // 2. 💡 關鍵修復：上傳完即刻重新開啟對講機 Modal，確保音調語速飛打拉桿完好無缺！
    openCatChatModal();
  };
  reader.readAsDataURL(file);
}

// 🎙️ 4. 語音 Talkback 對講 (廣東話 STT：聽完入框，留畀明仔修改後手動發送)
function startVoiceTalkback() {
  try { playUiSound('chime'); } catch(e){}
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("⚠️ 瀏覽器未支援語音識別，請直接打字！");
    return;
  }
  var recognition = new SpeechRecognition();
  recognition.lang = 'zh-HK';
  recognition.start();
  showToast("🎙️ 正在聽你講嘢，請講廣東話...");

  recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;
    var inputEl = document.getElementById('catAiInput');
    if (inputEl) {
      inputEl.value = transcript; // 💡 只填入輸入框，唔會自動發送！
      showToast("✨ 語音已轉換！你可以修改後再撳發送。");
    }
  };
  recognition.onerror = function() {
    showToast("❌ 語音未聽清，請再試一次！");
  };
}

// 🎛️ 1. 動態更新並儲存音調數值
function updateCatVoiceConfig() {
  var pVal = document.getElementById('catPitchRange') ? document.getElementById('catPitchRange').value : "1.4";
  var rVal = document.getElementById('catRateRange') ? document.getElementById('catRateRange').value : "1.05";
  
  localStorage.setItem("custom_cat_pitch", pVal);
  localStorage.setItem("custom_cat_rate", rVal);

  if (document.getElementById('pitchValDisp')) document.getElementById('pitchValDisp').innerText = pVal;
  if (document.getElementById('rateValDisp')) document.getElementById('rateValDisp').innerText = rVal;
}

// 💬 5. 對話框核心 (全螢幕加大 + 語音動態調校)
function openCatChatModal() {
  try { playUiSound('chime'); } catch(e){}
  var existingModal = document.getElementById('catChatModal');
  if (existingModal) existingModal.remove();

  var savedCatAvatar = localStorage.getItem("catNavAvatarData");
  var navImg = document.getElementById('catNavImg');
  var currentAvatar = savedCatAvatar || (navImg ? navImg.src : 'IMG-20260823-WA0000.jpg');
  var petName = localStorage.getItem("custom_pet_name") || "阿豬貓波";
  
  var currentPitch = localStorage.getItem("custom_cat_pitch") || "1.4";
  var currentRate = localStorage.getItem("custom_cat_rate") || "1.05";

  var modal = document.createElement('div');
  modal.id = 'catChatModal';
  modal.style.position = 'fixed';
  modal.style.top = '0'; modal.style.left = '0';
  modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0,0,0,0.88)';
  modal.style.backdropFilter = 'blur(12px)';
  modal.style.webkitBackdropFilter = 'blur(12px)';
  modal.style.zIndex = '999999';
  modal.style.display = 'flex'; modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
  modal.style.padding = '10px';

  var boxHtml = '';
  boxHtml += '<div id="catModalCard" class="' + catThemeClasses[currentCatThemeIdx] + '">';
  
  boxHtml += '<div style="position:relative; text-align:center;">';
  boxHtml += '<button onclick="switchCatChatTheme()" style="position:absolute; right:0; top:0; background:rgba(255,255,255,0.2); color:white; border:none; padding:4px 8px; border-radius:10px; font-size:10px; cursor:pointer;">🎨 換色</button>';
  
  boxHtml += '<div style="display:inline-block; position:relative;">';
  boxHtml += '<img id="catChatAvatarImg" src="' + currentAvatar + '">';
  boxHtml += '<label for="petAvatarInput" style="position:absolute; bottom:6px; right:6px; background:#00b894; color:white; border-radius:50%; width:28px; height:28px; display:flex; justify-content:center; align-items:center; font-size:12px; cursor:pointer; border:1px solid white;">📸</label>';
  boxHtml += '<input type="file" id="petAvatarInput" accept="image/*" style="display:none;" onchange="uploadPetChatAvatar(event)">';
  boxHtml += '</div>';

  boxHtml += '<div style="font-size: 17px; font-weight: 900; margin-top:4px;">🐈‍⬛ ' + petName + '</div>';
  boxHtml += '<div style="font-size: 11px; color: #55efc4; font-weight: bold;">✨ 貓星在線 ‧ 獨立靈魂連線中</div>';
  boxHtml += '</div>';

  boxHtml += '<div id="catAiChatBox" style="background: rgba(0,0,0,0.45); border-radius: 12px; overflow-y: auto; text-align: left;">';
  boxHtml += '<div style="text-align:left; margin-bottom:8px;"><span style="background:rgba(255,234,167,0.2); color:#ffeaa7; border:1px solid #ffeaa7; padding:8px 12px; border-radius:10px; font-size:12px; display:inline-block; line-height:1.5;">喵～ 明仔！我係『' + petName + '』，我喺貓星連線成功喇！想同我講咩呀？❤️</span></div>';
  boxHtml += '</div>';

  // 🎛️ 開發者專屬：音調與語速即時調校控制台
  boxHtml += '<div style="background:rgba(0,0,0,0.35); border:1px solid rgba(255,234,167,0.4); padding:6px 10px; border-radius:10px; margin-bottom:8px; font-size:11px;">';
  boxHtml += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">';
  boxHtml += '<span>🎵 語調 (Pitch): <b id="pitchValDisp" style="color:#ffeaa7;">' + currentPitch + '</b></span>';
  boxHtml += '<input type="range" id="catPitchRange" min="0.5" max="2.0" step="0.1" value="' + currentPitch + '" oninput="updateCatVoiceConfig()" style="width:110px;">';
  boxHtml += '</div>';
  boxHtml += '<div style="display:flex; justify-content:space-between; align-items:center;">';
  boxHtml += '<span >⚡ 語速 (Speed): <b id="rateValDisp" style="color:#55efc4;">' + currentRate + '</b></span>';
  boxHtml += '<input type="range" id="catRateRange" min="0.5" max="1.8" step="0.05" value="' + currentRate + '" oninput="updateCatVoiceConfig()" style="width:110px;">';
  boxHtml += '</div>';
  boxHtml += '</div>';

  boxHtml += '<div>';
  boxHtml += '<div style="display:flex; gap:6px; margin-bottom:8px;">';
  boxHtml += '<input type="text" id="catAiInput" placeholder="同貓咪講嘢..." onkeydown="if(event.key===\'Enter\') sendCatAiMessage()" style="flex:1; background:rgba(0,0,0,0.5); border:1px solid #ffeaa7; color:white; padding:8px 12px; border-radius:15px; font-size:13px; outline:none;">';
  boxHtml += '<button onclick="startVoiceTalkback()" style="background:#e84393; color:white; border:none; padding:8px 12px; border-radius:15px; font-size:12px; font-weight:bold; cursor:pointer;">🎤 語音</button>';
  boxHtml += '<button onclick="sendCatAiMessage()" style="background:#00b894; color:white; border:none; padding:8px 14px; border-radius:15px; font-size:13px; font-weight:bold; cursor:pointer;">發送</button>';
  boxHtml += '</div>';

  boxHtml += '<div style="display:flex; gap:8px; justify-content:center;">';
  boxHtml += '<button onclick="setupPetConfig()" style="background:rgba(255,255,255,0.2); color:#ffeaa7; border:1px solid #ffeaa7; padding:6px 12px; border-radius:15px; font-size:11px; cursor:pointer;">⚙️ 設定 Prompt</button>';
  boxHtml += '<button onclick="closeCatChatModal()" style="background:linear-gradient(135deg, #e17055, #d63031); color:white; border:1px solid #ffeaa7; padding:6px 16px; border-radius:15px; font-weight:900; font-size:11px; cursor:pointer;">❤️ 關閉對講機</button>';
  boxHtml += '</div>';
  boxHtml += '</div>';

  boxHtml += '</div>';

  modal.innerHTML = boxHtml;
  document.body.appendChild(modal);
}

function closeCatChatModal() {
  try { playUiSound('click'); } catch(e){}
  var modal = document.getElementById('catChatModal');
  if (modal) modal.remove();
}

// 📢 2. 廣東話 Q 版貓咪語音朗讀函數 (讀取動態設定)
function speakCatReply(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    var cleanText = text.replace(/（[^）]*）|\([^)]*\)/g, '');
    var utterance = new SpeechSynthesisUtterance(cleanText);
    
    var pVal = parseFloat(localStorage.getItem("custom_cat_pitch") || "1.4");
    var rVal = parseFloat(localStorage.getItem("custom_cat_rate") || "1.05");

    utterance.lang = 'zh-HK';
    utterance.pitch = pVal;
    utterance.rate = rVal;
    
    window.speechSynthesis.speak(utterance);
  }
}


// 🌐 6. 發送訊息 (將動態 Prompt 送交 Cloudflare Worker + 自動廣東話語音 Talkback)
async function sendCatAiMessage() {
  var inputEl = document.getElementById('catAiInput');
  var chatBox = document.getElementById('catAiChatBox');
  var userText = inputEl ? inputEl.value.trim() : '';

  if (!userText) return;

  chatBox.innerHTML += '<div style="text-align:right; margin-bottom:8px;"><span style="background:#6c5ce7; color:white; padding:6px 10px; border-radius:10px; font-size:12px; display:inline-block;">明仔：' + userText + '</span></div>';
  if (inputEl) inputEl.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  var petName = localStorage.getItem("custom_pet_name") || "阿豬";
  var petPrompt = localStorage.getItem("custom_pet_prompt") || "你是一隻叫阿豬的可愛黑貓，說話活潑，常用『喵～』與『咕嚕咕嚕』，深愛主人明仔。";
  var customKey = localStorage.getItem("custom_ds_key") || "";

  var loadingId = 'loading_' + Date.now();
  chatBox.innerHTML += '<div id="' + loadingId + '" style="text-align:left; margin-bottom:8px;"><span style="background:rgba(255,255,255,0.15); color:#ffeaa7; padding:6px 10px; border-radius:10px; font-size:12px; display:inline-block;">🐈‍⬛ ' + petName + '思考中... (咕嚕咕嚕...)</span></div>';
  chatBox.scrollTop = chatBox.scrollHeight;

  var workerUrl = 'https://icy-wood-2801.stream-hub-th.workers.dev';

  try {
    var response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userText: userText,
        petName: petName,
        petPrompt: petPrompt,
        customKey: customKey
      })
    });

    var data = await response.json();
    var ldEl = document.getElementById(loadingId);
    if (ldEl) ldEl.remove();

    if (data && data.reply) {
      chatBox.innerHTML += '<div style="text-align:left; margin-bottom:8px;"><span style="background:rgba(255,234,167,0.2); color:#ffeaa7; border:1px solid #ffeaa7; padding:8px 12px; border-radius:10px; font-size:12px; display:inline-block; line-height:1.5;">🐈‍⬛ ' + petName + '：<br>' + data.reply + '</span></div>';
      
      // 🔊 阿豬自動用廣東話少女童音讀出回覆！
      speakCatReply(data.reply);
    } else {
      chatBox.innerHTML += '<div style="text-align:left; margin-bottom:8px;"><span style="color:#ff7675; font-size:11px;">⚠️ 貓星連線異常，請檢查設定。</span></div>';
    }
  } catch (err) {
    var ldErr = document.getElementById(loadingId);
    if (ldErr) ldErr.remove();
    chatBox.innerHTML += '<div style="text-align:left; margin-bottom:8px;"><span style="color:#ff7675; font-size:11px;">⚠️ 連線失敗，請檢查網路。</span></div>';
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* --------------------------------------------------------------------------
   1. [UI Theme & LocalStorage] - 主/副標題顏色記憶與櫃桶開合
   -------------------------------------------------------------------------- */
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

function toggleFontTheme() {
  playUiSound('click'); document.body.classList.toggle('jp-font');
  const isJp = document.body.classList.contains('jp-font'); showToast(isJp ? "✨ 已切換至：日系可愛字體！" : "✨ 已切換至：經典港系粗體！");
  if (db) db.transaction("settings", "readwrite").objectStore("settings").put({ key: "fontTheme", val: isJp ? "jp" : "hk" });
}
function loadSavedFontTheme() { const req = db.transaction("settings", "readonly").objectStore("settings").get("fontTheme"); req.onsuccess = function() { if (req.result && req.result.val === "jp") document.body.classList.add('jp-font'); }; }
/* --------------------------------------------------------------------------
   2. [Web Audio API DSP Synthesizer] - 聲道、UI音效與 2.0 狂暴增益模式
   -------------------------------------------------------------------------- */
let audioCtx = null;
let djMasterGain = null;
let isSuperBoostActive = false; // 💥 狂暴模式開關

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

function toggleSuperBoost() {
  playUiSound('click');
  isSuperBoostActive = !isSuperBoostActive;
  const btn = document.getElementById('btnSuperBoost');
  if (btn) {
    btn.innerText = isSuperBoostActive ? "💥 狂暴模式 (2.0x 啟動)" : "⚡ 標準模式 (1.0x)";
    btn.style.background = isSuperBoostActive ? "#d63031" : "#00b894";
  }
  showToast(isSuperBoostActive ? "💥 狂暴模式已開啓：古早鼓組增益提升至 2.0 倍！" : "✨ 已還原至標準 1.0 倍立體聲");
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

function confirmRadioPlay(stationName, streamUrl) { 
  playUiSound('click'); 
  if (confirm(`🐾 準備播放《${stationName}》？`)) { 
    const player = document.getElementById('bgPlayer'); 
    player.src = streamUrl; 
    player.play().then(() => { 
      showToast(`📻 直播中：${stationName}`); 
      const musicName = document.getElementById('musicName');
      if (musicName) musicName.innerText = `📻 直播中：${stationName}`; 
      const btn = document.getElementById('btnQuickRadioToggle');
      if (btn) btn.innerText = "⏸️ 暫停";
    }).catch(e => showToast("❌ 連線失敗！")); 
  } 
}

function toggleQuickRadio(e) {
  if (e) e.stopPropagation();
  playUiSound('click');
  const bgPlayer = document.getElementById('bgPlayer');
  const btn = document.getElementById('btnQuickRadioToggle');
  if (!bgPlayer || !bgPlayer.src) { showToast("📻 暫未選取電台或音樂！"); return; }
  if (bgPlayer.paused) {
    bgPlayer.play().then(() => { if (btn) btn.innerText = "⏸️ 暫停"; showToast("▶️ 繼續播放電台/音樂"); }).catch(err => showToast("❌ 播放失敗"));
  } else {
    bgPlayer.pause(); if (btn) btn.innerText = "▶️ 播放"; showToast("⏸️ 已即時暫停播放");
  }
}

/* --------------------------------------------------------------------------
   🎛️ [Logarithmic Volume Curve] - 攤開 0% 至 30% 靈敏區間
   -------------------------------------------------------------------------- */
function scaleLogarithmicVolume(sliderVal) {
  const val = parseFloat(sliderVal);
  return val * val; // 利用平滑對數轉化，將頭 30% 細細聲區間攤開
}

function toggleNatureSound(type) {
  playUiSound('click');
  const audio = document.getElementById('sound-' + type);
  const btn = document.getElementById('btn-nature-' + type);
  const names = { wave: '🌊 海浪聲', windbell: '🎐 風吹風鈴', rain: '🌧️ 雨夜聽雨', forest: '🌲 晨曦森林' };

  if (audio.paused) {
    updateNatureVolumes();
    audio.play().then(() => {
      btn.innerText = names[type] + ' (開)'; btn.style.boxShadow = "0 0 12px #ffeaa7"; btn.style.border = "1.5px solid #ffeaa7";
      showToast("🌿 開始播放：" + names[type]);
    }).catch(e => showToast("❌ 音效載入失敗！"));
  } else {
    audio.pause(); btn.innerText = names[type] + ' (關)'; btn.style.boxShadow = "none"; btn.style.border = "1px solid rgba(255,255,255,0.4)";
    showToast("⏸️ 暫停：" + names[type]);
  }
}

function updateGlobalMasterVolume() {
  const globalMaster = document.getElementById('volMaster') ? document.getElementById('volMaster').value : 1.0;
  if (document.getElementById('meterMaster')) document.getElementById('meterMaster').style.width = (globalMaster * 100) + "%";
  const bgPlayer = document.getElementById('bgPlayer');
  const bgmVolInput = document.getElementById('volBgm');
  if (bgPlayer) {
    const baseBgm = bgmVolInput ? scaleLogarithmicVolume(bgmVolInput.value) : 0.8;
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
      const mappedVol = scaleLogarithmicVolume(volInput.value);
      audio.volume = mappedVol * globalMaster;
      if (meter) meter.style.width = (volInput.value * 100) + "%";
    }
  });
}

function updatePanelOpacity(val) {
  document.documentElement.style.setProperty('--panel-alpha', val); const blurVal = (val == 0) ? '0px' : '14px';
  document.querySelectorAll('.section-title-btn, .album-controls, .music-box, .mixer-box, .sound-btn, .dj-box').forEach(el => {
    el.style.backdropFilter = `blur(${blurVal})`; el.style.webkitBackdropFilter = `blur(${blurVal})`;
  });
  document.getElementById('opacityValDisplay').innerText = Math.round(val * 100) + "%";
  if (document.getElementById('meterOpacity')) document.getElementById('meterOpacity').style.width = (val * 100) + "%";
  if (db) db.transaction("settings", "readwrite").objectStore("settings").put({ key: "panelOpacity", val: val });
}
function loadSavedOpacity() { const req = db.transaction("settings", "readonly").objectStore("settings").get("panelOpacity"); req.onsuccess = function() { if (req.result) { const val = req.result.val; document.getElementById('volOpacity').value = val; updatePanelOpacity(val); } }; }

function updateVolumes() {
  const bgmVol = scaleLogarithmicVolume(document.getElementById('volBgm').value);
  const catVol = scaleLogarithmicVolume(document.getElementById('volCat').value);
  const videoVol = scaleLogarithmicVolume(document.getElementById('volVideo').value);
  if (document.getElementById('bgPlayer')) document.getElementById('bgPlayer').volume = bgmVol;
  if (currentCatAudio) currentCatAudio.volume = catVol;
  if (currentActiveVideo) currentActiveVideo.volume = videoVol;
  if (document.getElementById('meterBgm')) document.getElementById('meterBgm').style.width = (document.getElementById('volBgm').value * 100) + "%";
  if (document.getElementById('meterCat')) document.getElementById('meterCat').style.width = (document.getElementById('volCat').value * 100) + "%";
  if (document.getElementById('meterVideo')) document.getElementById('meterVideo').style.width = (document.getElementById('volVideo').value * 100) + "%";
}
/* --------------------------------------------------------------------------
   3. [Bible, Cat Sounds, MP3 Playlist & Deck BPM Mixer System]
   -------------------------------------------------------------------------- */
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
  currentCatAudio = new Audio('cat' + item.file.replace('cat', ''));
  currentCatAudio.volume = scaleLogarithmicVolume(document.getElementById('volCat').value);
  currentCatAudio.play().then(() => { showToast(`${item.emoji} ${item.name}：${item.desc}`); }).catch(e => {
    currentCatAudio = new Audio(item.file);
    currentCatAudio.volume = scaleLogarithmicVolume(document.getElementById('volCat').value);
    currentCatAudio.play().then(() => { showToast(`${item.emoji} ${item.name}：${item.desc}`); }).catch(err => { showToast(`🐾 貓語：${item.desc}`); });
  });
}

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
    else { renderPlaylist(); }
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
function setPlayMode(mode) { playUiSound('click'); playMode = mode; document.getElementById('btnSeq').classList.toggle('active', mode === 'sequence'); document.getElementById('btnLoop').classList.toggle('active', mode === 'single-loop'); document.getElementById('btnRand').classList.toggle('active', mode === 'random'); showToast(`🎵 模式改為：${mode === 'sequence' ? '順序' : (mode === 'single-loop' ? '單曲' : '隨機')}`); }
function handleTrackEnded() { if (musicList.length === 0) return; if (playMode === 'single-loop') playTrack(currentTrackIdx); else if (playMode === 'random') playTrack(Math.floor(Math.random() * musicList.length)); else playTrack((currentTrackIdx + 1) % musicList.length); }
function deleteTrack(e, id) { e.stopPropagation(); if (confirm("確定刪除呢首歌？")) { const tx = db.transaction("music", "readwrite").objectStore("music").delete(id); tx.oncomplete = function() { loadSavedMusic(); showToast("🗑️ 已刪除！"); }; } }

let deckABpmVal = 140.0, deckBBpmVal = 140.0;
let isCueMode = false;
let deckACueTime = 0, deckBCueTime = 0;
let isCrossfading = false;

function formatTimeStr(secs) {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDeckTimeDisplay(deck) {
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  const timeDisp = document.getElementById(deck === 'A' ? 'deckATime' : 'deckBTime');
  if (player && timeDisp) {
    const cur = formatTimeStr(player.currentTime);
    const dur = formatTimeStr(player.duration);
    timeDisp.innerText = `⏱️ ${cur} / ${dur}`;
  }
}

function loadDeckTrack(deck, event) {
  const file = event.target.files[0];
  if (!file) return;
  const fileUrl = URL.createObjectURL(file);
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  const label = document.getElementById(deck === 'A' ? 'deckAName' : 'deckBName');
  if (player) {
    player.src = fileUrl;
    if (label) label.innerText = "🎵 " + file.name;
    if (deck === 'A') { deckACueTime = 0; const btn = document.getElementById('btnJumpCueA'); if(btn) btn.innerText = "🔥 爆 Cue (00:00)"; }
    else { deckBCueTime = 0; const btn = document.getElementById('btnJumpCueB'); if(btn) btn.innerText = "🔥 爆 Cue (00:00)"; }
    player.ontimeupdate = () => updateDeckTimeDisplay(deck);
    player.onloadedmetadata = () => updateDeckTimeDisplay(deck);
    showToast(`✅ Deck ${deck} 已載入：${file.name}`);
    updateCrossfader(document.getElementById('crossfader') ? document.getElementById('crossfader').value : 0.5);
  }
}

function setDeckCue(deck) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player && player.src) {
    const time = player.currentTime;
    const timeStr = formatTimeStr(time);
    if (deck === 'A') { deckACueTime = time; const btn = document.getElementById('btnJumpCueA'); if(btn) btn.innerText = `🔥 爆 Cue (${timeStr})`; }
    else { deckBCueTime = time; const btn = document.getElementById('btnJumpCueB'); if(btn) btn.innerText = `🔥 爆 Cue (${timeStr})`; }
    showToast(`📍 已記低 Deck ${deck} Cue 點：${timeStr}`);
  } else { showToast(`⚠️ Deck ${deck} 未載入歌曲！`); }
}

function jumpToDeckCue(deck) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player && player.src) {
    const targetTime = deck === 'A' ? deckACueTime : deckBCueTime;
    player.currentTime = targetTime;
    if (player.paused) player.play();
    showToast(`🔥 Deck ${deck} 秒速切入 Cue 點！`);
  } else { showToast(`⚠️ Deck ${deck} 未載入歌曲！`); }
}

function updateDeckPitch(deck, val) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player) player.playbackRate = val;
  if (deck === 'A') { deckABpmVal = (140.0 * val).toFixed(1); const bpmDisp = document.getElementById('deckABpm'); if (bpmDisp) bpmDisp.innerText = deckABpmVal + " BPM"; }
  else { deckBBpmVal = (140.0 * val).toFixed(1); const bpmDisp = document.getElementById('deckBBpm'); if (bpmDisp) bpmDisp.innerText = deckBBpmVal + " BPM"; }
}

function syncBpmBtoA() {
  playUiSound('click');
  const targetRate = (deckABpmVal / 140.0).toFixed(2);
  const sliderB = document.getElementById('deckBPitch');
  if (sliderB) sliderB.value = targetRate;
  updateDeckPitch('B', targetRate);
  showToast("⚡ 已將 Deck B 速度鎖定至 Deck A (" + deckABpmVal + " BPM)！");
}

function playDeck(deck) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player && player.src) { player.play().then(() => showToast("▶️ 開始播放 Deck " + deck)).catch(e => showToast("❌ 請先載入歌曲")); }
  else { showToast("⚠️ Deck " + deck + " 未載入歌曲！"); }
}

function pauseDeck(deck) {
  playUiSound('click');
  const player = document.getElementById(deck === 'A' ? 'deckAPlayer' : 'deckBPlayer');
  if (player) { player.pause(); showToast("⏸️ 暫停 Deck " + deck); }
}

function toggleCueMode() {
  playUiSound('click');
  isCueMode = !isCueMode;
  const btn = document.getElementById('btnCueToggle');
  const panel = document.getElementById('cuePanel');
  if (btn) { btn.innerText = isCueMode ? "🎧 Cue Mode (開)" : "🎧 預聽模式 (關)"; btn.style.background = isCueMode ? "#e84393" : "rgba(45, 52, 54, 0.9)"; }
  if (panel) panel.style.display = isCueMode ? "block" : "none";
  updateCrossfader(document.getElementById('crossfader') ? document.getElementById('crossfader').value : 0.5);
  showToast(isCueMode ? "🎧 預聽模式：Deck A 走大喇叭 ‧ Deck B 走耳機！" : "📻 還原標準混音模式");
}

function updateCrossfader(val) {
  const playerA = document.getElementById('deckAPlayer');
  const playerB = document.getElementById('deckBPlayer');
  const masterVol = document.getElementById('volMaster') ? document.getElementById('volMaster').value : 1.0;
  const bgmVol = document.getElementById('volBgm') ? scaleLogarithmicVolume(document.getElementById('volBgm').value) : 0.8;
  const cueVol = document.getElementById('volCue') ? scaleLogarithmicVolume(document.getElementById('volCue').value) : 1.0;
  const baseVolume = masterVol * bgmVol;
  if (isCueMode) {
    if (playerA) playerA.volume = baseVolume * (1 - val);
    if (playerB) playerB.volume = baseVolume * cueVol;
  } else {
    const volA = Math.cos(val * Math.PI / 2);
    const volB = Math.sin(val * Math.PI / 2);
    if (playerA) playerA.volume = baseVolume * volA;
    if (playerB) playerB.volume = baseVolume * volB;
  }
  if (document.getElementById('meterCrossfader')) document.getElementById('meterCrossfader').style.width = (val * 100) + "%";
}

function autoCrossfade(durationMs = 3430) {
  if (isCrossfading) { showToast("⏳ 自動過歌中，請稍候..."); return; }
  playUiSound('click');
  const slider = document.getElementById('crossfader');
  if (!slider) return;
  isCrossfading = true;
  let currentVal = parseFloat(slider.value);
  const targetVal = currentVal > 0.5 ? 0 : 1;
  const steps = 30;
  const stepVal = (targetVal - currentVal) / steps;
  let count = 0;
  const intervalTime = durationMs / steps;
  
  const timer = setInterval(() => {
    currentVal += stepVal;
    slider.value = currentVal;
    updateCrossfader(currentVal);
    count++;
    if (count >= steps) {
      clearInterval(timer);
      isCrossfading = false;
      showToast(`🔄 Auto Crossfade (${(durationMs/1000).toFixed(2)}s) 完成！`);
    }
  }, intervalTime);
}
/* --------------------------------------------------------------------------
/* --------------------------------------------------------------------------
   4a. [12 古早 MP3 真音效 DSP 0延遲 RAM 預載引擎 + 乾淨 Cut-Off 0連音 + 2.0 狂暴模式]
   -------------------------------------------------------------------------- */
const soundBuffers = {}; // 存放解碼後嘅 RAM 音效
const activeSources = {}; // 🛡️ 紀錄現時播放中嘅音源，用於極速 Cut-off 防黏連

// 💡 讀取並解碼 12 個 MP3 檔存入 RAM
async function loadAndDecodeFiles(event) {
  const files = event.target.files;
  if (!files.length) return;

  showToast("⏳ 正在用晶片解碼 12 個 MP3 存入 RAM...");

  let loadedCount = 0;
  for (let file of files) {
    const name = file.name.toLowerCase();
    try {
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decodedData = await ctx.decodeAudioData(arrayBuffer);
      
      if (name.includes('yeah')) soundBuffers['yeah'] = decodedData;
      else if (name.includes('go')) soundBuffers['go'] = decodedData;
      else if (name.includes('check')) soundBuffers['check'] = decodedData;
      else if (name.includes('crash')) soundBuffers['crash'] = decodedData;
      else if (name.includes('kick')) soundBuffers['kick'] = decodedData;
      else if (name.includes('snare')) soundBuffers['snare'] = decodedData;
      else if (name.includes('clap')) soundBuffers['clap'] = decodedData;
      else if (name.includes('tom')) soundBuffers['tom'] = decodedData;
      else if (name.includes('hihat')) soundBuffers['hihat'] = decodedData;
      else if (name.includes('laser')) soundBuffers['laser'] = decodedData;
      else if (name.includes('stutter')) soundBuffers['stutter'] = decodedData;
      else if (name.includes('arpup')) soundBuffers['arpUp'] = decodedData;

      loadedCount++;
    } catch (e) {
      console.log(`⚠️ 解碼失敗：${file.name}`, e);
    }
  }

  showToast(`✅ 成功載入 ${loadedCount} 個 MP3！即刻狂打 0 延遲！`);
}

// 🌐 網頁啟動時自動靜默 fetch 載入
const autoMp3List = {
  yeah: "yeah.mp3", go: "go.mp3", check: "check.mp3", crash: "crash.mp3",
  snare: "snare.mp3", kick: "kick.mp3", clap: "clap.mp3", tom: "tom.mp3",
  hihat: "hihat.mp3", laser: "laser.mp3", stutter: "stutter.mp3", arpUp: "arpup.mp3"
};

async function autoFetchMp3s() {
  const ctx = getAudioContext();
  Object.keys(autoMp3List).forEach(async (type) => {
    try {
      const res = await fetch(autoMp3List[type]);
      if (res.ok) {
        const ab = await res.arrayBuffer();
        soundBuffers[type] = await ctx.decodeAudioData(ab);
      }
    } catch (e) {}
  });
}
autoFetchMp3s();

// ⚡ 0 延遲發聲核心 + 智能分流（有 MP3 播 MP3，冇 MP3 播模擬聲）
function playSynthSound(type, event) {
  if (event) event.preventDefault();

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const multiplier = isSuperBoostActive ? 2.0 : 1.0;

    // ✂️ Cut-Off 防黏連
    if (activeSources[type]) {
      try {
        activeSources[type].stop(now);
        activeSources[type].disconnect();
      } catch (err) {}
    }

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.8 * multiplier, now);

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-6, now);
    limiter.knee.setValueAtTime(0, now);
    limiter.ratio.setValueAtTime(20, now);
    limiter.attack.setValueAtTime(0.001, now);
    limiter.release.setValueAtTime(0.05, now);

    padGain.connect(limiter);
    limiter.connect(djMasterGain || ctx.destination);

    if (soundBuffers[type]) {
      // 🚀【情況 A】：有 MP3！100% 只發出純淨真 MP3 鼓聲（不加嘟嘟聲）
      const source = ctx.createBufferSource();
      source.buffer = soundBuffers[type];
      source.connect(padGain);
      source.start(now);
      
      activeSources[type] = source;
      showToast(`🥁 打擊：${type.toUpperCase()}`);
    } else {
      // 💡【情況 B】：未有 MP3！自動播返 UI 點擊聲頂替，確保一定有聲！
      playUiSound('click');
      showToast(`⚠️ 請點右上角「📁 載入 12 MP3」`);
    }
  } catch(e) {
    console.log("Play Sound Error: ", e);
  }
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast'); toast.innerHTML = msg; toast.style.display = 'block';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 2500);
}


/* --------------------------------------------------------------------------
   4b. [RPG Save System, Album Management & Wallpaper Controls]
   -------------------------------------------------------------------------- */
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
      setTimeout(() => { currentActiveVideo = document.getElementById('activeVideo'); if (currentActiveVideo) currentActiveVideo.volume = scaleLogarithmicVolume(document.getElementById('volVideo').value); }, 100);
    } else {
      content.innerHTML = `<img src="${item.src}">`; document.getElementById('lightboxCaption').innerText = `📷 (${slideIndex + 1}/${albumMediaList.length}) ${item.caption}`; currentActiveVideo = null;
    }
    content.style.opacity = 1;
  }, 150);
}

function setLightboxImgAsWallpaper() {
  playUiSound('click');
  if (albumMediaList.length === 0) return;
  const currentItem = albumMediaList[slideIndex];
  if (currentItem.isVideo) { showToast("⚠️ 影片暫時唔可以設為背景壁紙喔！"); return; }
  document.body.style.backgroundImage = `url(${currentItem.src})`;
  saveWallpaperSetting("custom", currentItem.src);
  showToast("✨ 成功將呢張相設為貓貓助手壁紙！");
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
