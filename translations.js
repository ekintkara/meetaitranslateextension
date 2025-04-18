// Language translations for the extension
const translations = {
    // English translations
    'en': {
        'meetTabNotOpen': 'Google Meet tab is not open! Please go to Google Meet.',
        'readyToRecord': 'Ready to start recording',
        'openMeetFirst': 'Please open a Google Meet tab first',
        'recordingInProgress': 'Recording in progress...',
        'recordingStopped': 'Recording stopped',
        'startCapture': 'Start Capture',
        'stopCapture': 'Stop Capture',
        'checkingMeetTabs': 'Checking for Meet tabs...',
        'english': 'ENGLISH',
        'turkish': 'TURKISH',
        'suggestion': 'SUGGESTION',
        'closePopup': 'Close'
    },
    // Turkish translations
    'tr': {
        'meetTabNotOpen': 'Google Meet tabı açık değil! Lütfen Google Meet\'e gidin.',
        'readyToRecord': 'Kayda başlamak için hazır',
        'openMeetFirst': 'Lütfen önce bir Google Meet tabı açın',
        'recordingInProgress': 'Kayıt devam ediyor...',
        'recordingStopped': 'Kayıt durduruldu',
        'startCapture': 'Kaydı Başlat',
        'stopCapture': 'Kaydı Durdur',
        'checkingMeetTabs': 'Google Meet tabları kontrol ediliyor...',
        'english': 'İNGİLİZCE',
        'turkish': 'TÜRKÇE',
        'suggestion': 'ÖNERİ',
        'closePopup': 'Kapat'
    },
    // German translations
    'de': {
        'meetTabNotOpen': 'Google Meet-Tab ist nicht geöffnet! Bitte gehen Sie zu Google Meet.',
        'readyToRecord': 'Bereit zur Aufnahme',
        'openMeetFirst': 'Bitte öffnen Sie zuerst einen Google Meet-Tab',
        'recordingInProgress': 'Aufnahme läuft...',
        'recordingStopped': 'Aufnahme gestoppt',
        'startCapture': 'Aufnahme starten',
        'stopCapture': 'Aufnahme stoppen',
        'checkingMeetTabs': 'Prüfe auf Meet-Tabs...',
        'english': 'ENGLISCH',
        'turkish': 'TÜRKISCH',
        'suggestion': 'VORSCHLAG'
    },
    // Spanish translations
    'es': {
        'meetTabNotOpen': '¡La pestaña de Google Meet no está abierta! Por favor, vaya a Google Meet.',
        'readyToRecord': 'Listo para comenzar a grabar',
        'openMeetFirst': 'Por favor, abra primero una pestaña de Google Meet',
        'recordingInProgress': 'Grabación en curso...',
        'recordingStopped': 'Grabación detenida',
        'startCapture': 'Iniciar Captura',
        'stopCapture': 'Detener Captura',
        'checkingMeetTabs': 'Comprobando pestañas de Meet...',
        'english': 'INGLÉS',
        'turkish': 'TURCO',
        'suggestion': 'SUGERENCIA'
    },
    // French translations
    'fr': {
        'meetTabNotOpen': 'L\'onglet Google Meet n\'est pas ouvert ! Veuillez accéder à Google Meet.',
        'readyToRecord': 'Prêt à commencer l\'enregistrement',
        'openMeetFirst': 'Veuillez d\'abord ouvrir un onglet Google Meet',
        'recordingInProgress': 'Enregistrement en cours...',
        'recordingStopped': 'Enregistrement arrêté',
        'startCapture': 'Démarrer la capture',
        'stopCapture': 'Arrêter la capture',
        'checkingMeetTabs': 'Vérification des onglets Meet...',
        'english': 'ANGLAIS',
        'turkish': 'TURC',
        'suggestion': 'SUGGESTION'
    }
};

// Get translation based on message key and language
function getTranslation(key, language) {
    // Default to English if the language is not supported
    const lang = translations[language] ? language : 'en';
    
    // Return the translated message or the key itself if not found
    return translations[lang][key] || translations['en'][key] || key;
}

// Get user's browser language (first two characters)
function getUserLanguage() {
    const language = navigator.language || navigator.userLanguage || 'en';
    return language.split('-')[0]; // Extract the language code (e.g., 'en' from 'en-US')
}
