// Audio context and processing variables
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let activeMeetTabId = null;
let isOverlayOpen = false;

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'close_popup' && isOverlayOpen) {
    const meetTabs = await chrome.tabs.query({ url: 'https://meet.google.com/*' });
    if (meetTabs.length > 0) {
      chrome.tabs.sendMessage(meetTabs[0].id, { action: 'closeOverlay' });
      isOverlayOpen = false;
    }
  }
});

// Track popup window state - Yeni yaklaşım: Popup penceresi yerine content script'te overlay açacağız
chrome.action.onClicked.addListener(async () => {
  // Find Google Meet tabs
  const meetTabs = await chrome.tabs.query({ url: 'https://meet.google.com/*' });
  
  if (meetTabs.length === 0) {
    // Eğer Google Meet açık değilse uyarı göster
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/mainicon64.png',
      title: 'Meet Translator',
      message: 'Lütfen önce Google Meet açın!'
    });
    return;
  }
  
  activeMeetTabId = meetTabs[0].id;
  
  // Eğer overlay zaten açıksa, kapalıysa açık olacak şekilde toggle et
  if (isOverlayOpen) {
    chrome.tabs.sendMessage(activeMeetTabId, { action: 'toggleOverlay' });
  } else {
    // Overlay'i aç
    chrome.tabs.sendMessage(activeMeetTabId, { action: 'showTranslatorPanel' });
    isOverlayOpen = true;
  }
});

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startCapture') {
    startTabCapture();
    sendResponse({success: true});
  } else if (message.action === 'stopCapture') {
    stopTabCapture();
    sendResponse({success: true});
  } else if (message.action === 'overlayStatusChanged') {
    isOverlayOpen = message.isOpen;
    sendResponse({success: true});
  }
  return true;
});

async function startTabCapture() {
  try {
    // First find Google Meet tab
    const meetTabs = await chrome.tabs.query({ url: 'https://meet.google.com/*' });
    if (meetTabs.length === 0) {
      console.error('No Google Meet tab found');
      return;
    }
    
    // Set the active Meet tab
    activeMeetTabId = meetTabs[0].id;
    
    // Then capture audio
    const stream = await chrome.tabCapture.capture({
      audio: true,
      video: false
    });
    
    if (!stream) {
      console.error('Failed to capture tab audio');
      return;
    }

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    isRecording = true;

    // Handle audio data as it comes in
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        // Process chunks every 5 seconds
        if (audioChunks.length > 5) {
          await processAudioChunks();
        }
      }
    };

    mediaRecorder.start(1000); // Collect data in 1-second chunks
  } catch (error) {
    console.error('Error starting capture:', error);
  }
}

async function stopTabCapture() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    await processAudioChunks(); // Process any remaining audio
  }
}

async function processAudioChunks() {
  if (audioChunks.length === 0) return;

  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  audioChunks = []; // Clear the chunks

  // TODO: Implement the following steps:
  // 1. Convert audio to base64
  // 2. Send to Gemini API for speech-to-text
  // 3. Translate text to Turkish
  // 4. Generate response suggestion
  // 5. Send results to content script

  // Placeholder for API calls (to be implemented with actual Gemini API endpoints)
  const results = {
    original: "Transcribed text will appear here",
    translation: "Turkish translation will appear here",
    suggestion: "AI-generated suggestion will appear here"
  };

  // Send results to content script
  if (activeMeetTabId) {
    chrome.tabs.sendMessage(activeMeetTabId, { 
      type: 'processedResults', 
      data: results 
    });
  }
}
