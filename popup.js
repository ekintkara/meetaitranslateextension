document.addEventListener('DOMContentLoaded', async () => {
    const startButton = document.getElementById('startCapture');
    const stopButton = document.getElementById('stopCapture');
    const closeButton = document.getElementById('closeButton');
    const status = document.getElementById('status');
    const sections = document.querySelectorAll('.section');
    
    // Get user's browser language
    const userLanguage = getUserLanguage();

    // Yeni davranış: Popup boşaltılmıyor, böylece ikon tıklaması ile yeniden açılabilir
    // chrome.action.setPopup({ popup: '' }); // Bu satırı kaldırdık

    // Localize UI elements
    function localizeUI() {
        // Buttons
        startButton.innerHTML = `<i class="material-icons">mic</i> ${getTranslation('startCapture', userLanguage)}`;
        stopButton.innerHTML = `<i class="material-icons">stop</i> ${getTranslation('stopCapture', userLanguage)}`;
        closeButton.title = getTranslation('closePopup', userLanguage);
        
        // Section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles[0].innerHTML = `<i class="material-icons">record_voice_over</i> [${getTranslation('english', userLanguage)}]`;
        sectionTitles[1].innerHTML = `<i class="material-icons">translate</i> [${getTranslation('turkish', userLanguage)}]`;
        sectionTitles[2].innerHTML = `<i class="material-icons">psychology</i> [${getTranslation('suggestion', userLanguage)}]`;
        
        // Initial status
        status.innerHTML = `<i class="material-icons" style="margin-right: 4px; font-size: 16px;">info</i> ${getTranslation('checkingMeetTabs', userLanguage)}`;
    }

    // Call localization immediately
    localizeUI();

    // Kapat butonu tıklandığında popup'ı kapat
    closeButton.addEventListener('click', () => {
        // Eklenti popup'ı artık ayrı bir pencere olduğu için
        // window.close() yerine chrome.runtime.sendMessage kullanıyoruz
        chrome.runtime.sendMessage({ action: 'closePopupWindow' });
    });

    // Add fade-in animation to sections
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('fade-in');
        }, index * 100);
    });

    function updateStatus(messageKey, type) {
        // Get translated message
        const text = getTranslation(messageKey, userLanguage);
        
        status.textContent = '';
        status.className = 'status ' + type;
        
        if (type === 'warning') {
            const icon = document.createElement('i');
            icon.className = 'material-icons';
            icon.style.marginRight = '4px';
            icon.style.fontSize = '16px';
            icon.textContent = 'warning';
            status.appendChild(icon);
            status.appendChild(document.createTextNode(text));
            status.classList.add('shake');
            setTimeout(() => status.classList.remove('shake'), 820);
        } else {
            const icon = document.createElement('i');
            icon.className = 'material-icons';
            icon.style.marginRight = '4px';
            icon.style.fontSize = '16px';
            icon.textContent = type === 'recording' ? 'fiber_manual_record' : 'info';
            status.appendChild(icon);
            status.appendChild(document.createTextNode(text));
        }

        if (type === 'recording') {
            const indicator = document.createElement('div');
            indicator.className = 'recording-indicator';
            status.prepend(indicator);
        }
    }

    function updateSection(id, content) {
        const element = document.getElementById(id);
        element.style.opacity = '0';
        setTimeout(() => {
            element.textContent = content;
            element.style.opacity = '1';
        }, 300);
    }
    
    // Function to check for Google Meet tabs
    async function checkForMeetTabs() {
        const tabs = await chrome.tabs.query({ url: 'https://meet.google.com/*' });
        if (tabs.length === 0) {
            updateStatus('meetTabNotOpen', 'warning');
            startButton.disabled = true;
            stopButton.disabled = true;
            return false;
        } else {
            updateStatus('readyToRecord', 'stopped');
            startButton.disabled = false;
            
            // Keep stop button disabled unless recording is in progress
            if (!status.classList.contains('recording')) {
                stopButton.disabled = true;
            }
            return true;
        }
    }

    // Check initially and set up periodic check
    await checkForMeetTabs();
    setInterval(checkForMeetTabs, 5000); // Check every 5 seconds

    startButton.addEventListener('click', async () => {
        const hasMeetTab = await checkForMeetTabs();
        if (!hasMeetTab) {
            updateStatus('openMeetFirst', 'warning');
            return;
        }
        chrome.runtime.sendMessage({ action: 'startCapture' });
        updateStatus('recordingInProgress', 'recording');
        startButton.disabled = true;
        stopButton.disabled = false;
    });

    stopButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'stopCapture' });
        updateStatus('recordingStopped', 'stopped');
        startButton.disabled = false;
        stopButton.disabled = true;
        checkForMeetTabs(); // Re-check for Meet tabs after stopping
    });

    // Listen for close popup command from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'closePopup') {
            window.close();
        }
        
        if (message.type === 'processedResults') {
            updateSection('original', message.data.original);
            updateSection('translation', message.data.translation);
            updateSection('suggestion', message.data.suggestion);
        }
    });

    // Initialize button states
    stopButton.disabled = true;
});
