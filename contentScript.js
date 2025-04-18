// Global değişkenler
let translatorPanel = null;
let isDragging = false;
let startX, startY, startLeft, startTop;

// Translator paneli oluşturma ve gösterme
function createTranslatorPanel() {
  // Eğer panel zaten varsa, yeni oluşturmaya gerek yok
  if (document.getElementById('meet-translator-panel')) {
    return document.getElementById('meet-translator-panel');
  }

  // Ana panel elementini oluştur
  const panel = document.createElement('div');
  panel.id = 'meet-translator-panel';
  panel.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    width: 350px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    font-family: 'Segoe UI', Arial, sans-serif;
    display: none;
    user-select: none;
    resize: both;
    overflow: hidden;
    min-width: 300px;
    min-height: 400px;
  `;

  // Panel içeriğini oluştur
  panel.innerHTML = `
    <div class="translator-header" style="
      padding: 12px;
      cursor: move;
      background: #4285f4;
      color: white;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="display: flex; align-items: center;">
        <img src="${chrome.runtime.getURL('icons/mainicon16.png')}" style="margin-right: 8px; width: 20px; height: 20px;">
        <span style="font-weight: 500;">Meet Translator</span>
      </div>
      <div>
        <button id="translator-minimize-btn" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          margin-right: 8px;
          outline: none;
        ">_</button>
        <button id="translator-close-btn" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          outline: none;
        ">×</button>
      </div>
    </div>
    <div class="translator-content" style="padding: 16px; overflow-y: auto; max-height: calc(100% - 50px);">
      <div id="controls" style="
        margin-bottom: 16px;
        display: flex;
        gap: 8px;
      ">
        <button id="startCapture" style="
          background: #4285f4;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        ">
          <span style="font-size: 16px; line-height: 1;">⏺</span>
          <span>Start Recording</span>
        </button>
        <button id="stopCapture" style="
          background: #ea4335;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          opacity: 0.6;
        " disabled>
          <span style="font-size: 16px; line-height: 1;">⏹</span>
          <span>Stop</span>
        </button>
      </div>
      <div id="status" style="
        margin-bottom: 16px;
        padding: 8px 12px;
        border-radius: 4px;
        background: #f1f3f4;
        color: #5f6368;
        font-size: 13px;
      ">
        Ready to record
      </div>
      <div class="section" style="
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: white;
      ">
        <div class="section-title" style="
          font-weight: 500;
          margin-bottom: 8px;
          color: #202124;
          font-size: 13px;
        ">
          Original [English]
        </div>
        <div id="original" class="content" style="
          min-height: 40px;
          font-size: 13px;
          line-height: 1.5;
          color: #444;
          padding: 8px;
          border-radius: 4px;
          background: #f8f9fa;
        "></div>
      </div>
      <div class="section" style="
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: white;
      ">
        <div class="section-title" style="
          font-weight: 500;
          margin-bottom: 8px;
          color: #202124;
          font-size: 13px;
        ">
          Translation [Turkish]
        </div>
        <div id="translation" class="content" style="
          min-height: 40px;
          font-size: 13px;
          line-height: 1.5;
          color: #444;
          padding: 8px;
          border-radius: 4px;
          background: #f8f9fa;
        "></div>
      </div>
      <div class="section" style="
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: white;
      ">
        <div class="section-title" style="
          font-weight: 500;
          margin-bottom: 8px;
          color: #202124;
          font-size: 13px;
        ">
          Suggestion
        </div>
        <div id="suggestion" class="content" style="
          min-height: 40px;
          font-size: 13px;
          line-height: 1.5;
          color: #444;
          padding: 8px;
          border-radius: 4px;
          background: #f8f9fa;
        "></div>
      </div>
    </div>
  `;

  // Sayfaya paneli ekle
  document.body.appendChild(panel);

  // Sürükle bırak işlevselliği
  const header = panel.querySelector('.translator-header');
  header.addEventListener('mousedown', startDragging);

  // Buton işlevselliği
  const minimizeBtn = panel.querySelector('#translator-minimize-btn');
  const closeBtn = panel.querySelector('#translator-close-btn');
  const startBtn = panel.querySelector('#startCapture');
  const stopBtn = panel.querySelector('#stopCapture');

  minimizeBtn.addEventListener('click', () => {
    const content = panel.querySelector('.translator-content');
    if (content.style.display === 'none') {
      content.style.display = 'block';
      minimizeBtn.textContent = '_';
      panel.style.height = panel.dataset.originalHeight || '500px';
    } else {
      // Store original height before minimizing
      panel.dataset.originalHeight = panel.style.height;
      content.style.display = 'none';
      minimizeBtn.textContent = '+';
      panel.style.height = 'auto';
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
    // Bildirimi background script'e gönder
    chrome.runtime.sendMessage({ 
      action: 'overlayStatusChanged', 
      isOpen: false 
    });
  });

  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.6';
    stopBtn.disabled = false;
    stopBtn.style.opacity = '1';
    
    // Kayıt başlatma işlemini background'a bildir
    chrome.runtime.sendMessage({ action: 'startCapture' });
    
    // UI durumunu güncelle
    const status = panel.querySelector('#status');
    status.textContent = '🔴 Recording in progress...';
    status.style.background = '#fef7f6';
    status.style.color = '#ea4335';
  });

  stopBtn.addEventListener('click', () => {
    stopBtn.disabled = true;
    stopBtn.style.opacity = '0.6';
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    // Kaydı durdurma işlemini background'a bildir
    chrome.runtime.sendMessage({ action: 'stopCapture' });
    
    // UI durumunu güncelle
    const status = panel.querySelector('#status');
    status.textContent = 'Recording stopped';
    status.style.background = '#f1f3f4';
    status.style.color = '#5f6368';
  });

  return panel;
}

// Panel sürüklemeyi başlat
function startDragging(e) {
  const panel = document.getElementById('meet-translator-panel');
  
  // Sol tıklama olup olmadığını kontrol et
  if (e.button !== 0) return;
  
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startLeft = parseInt(panel.style.left) || 0;
  startTop = parseInt(panel.style.top) || 0;
  
  // Global sürükleme olaylarını ekle
  document.addEventListener('mousemove', dragPanel);
  document.addEventListener('mouseup', stopDragging);
  
  // Sürükleme sırasında seçim olmasını engelle
  e.preventDefault();
}

// Paneli sürükle
function dragPanel(e) {
  if (!isDragging) return;
  
  const panel = document.getElementById('meet-translator-panel');
  
  const newLeft = startLeft + (e.clientX - startX);
  const newTop = startTop + (e.clientY - startY);
  
  // Ekran sınırlarını aşmayacak şekilde paneli konumlandır
  panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, newLeft)) + 'px';
  panel.style.top = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, newTop)) + 'px';
}

// Sürüklemeyi durdur
function stopDragging() {
  isDragging = false;
  document.removeEventListener('mousemove', dragPanel);
  document.removeEventListener('mouseup', stopDragging);
}

// İçeriği güncelle
function updatePanelContent(data) {
  if (!translatorPanel) return;
  
  if (data.original) {
    const originalElement = translatorPanel.querySelector('#original');
    originalElement.textContent = data.original;
  }
  
  if (data.translation) {
    const translationElement = translatorPanel.querySelector('#translation');
    translationElement.textContent = data.translation;
  }
  
  if (data.suggestion) {
    const suggestionElement = translatorPanel.querySelector('#suggestion');
    suggestionElement.textContent = data.suggestion;
  }
}

// Chrome mesajlarını dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showTranslatorPanel') {
    if (!translatorPanel) {
      translatorPanel = createTranslatorPanel();
    }
    translatorPanel.style.display = 'block';
    sendResponse({success: true});
  }
  
  if (message.action === 'closeOverlay') {
    if (translatorPanel) {
      translatorPanel.style.display = 'none';
      sendResponse({success: true});
    }
  }
  
  if (message.action === 'toggleOverlay') {
    if (translatorPanel) {
      if (translatorPanel.style.display === 'none') {
        translatorPanel.style.display = 'block';
        chrome.runtime.sendMessage({ action: 'overlayStatusChanged', isOpen: true });
      } else {
        translatorPanel.style.display = 'none';
        chrome.runtime.sendMessage({ action: 'overlayStatusChanged', isOpen: false });
      }
      sendResponse({success: true});
    }
  }
  
  if (message.type === 'processedResults') {
    if (!translatorPanel) {
      translatorPanel = createTranslatorPanel();
      translatorPanel.style.display = 'block';
    }
    updatePanelContent(message.data);
    sendResponse({success: true});
  }
  
  return true;
});
