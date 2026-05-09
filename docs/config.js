// docs/config.js
(function() {
    // Определяем, локально мы или на сервере
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    // Базовый URL для API
    window.API_URL = isLocal 
        ? 'http://localhost:3001/api'
        : 'https://homespace-production.up.railway.app/api';
    
    // Базовый URL для WebSocket
    window.WS_URL = isLocal
        ? 'http://localhost:3001'
        : 'https://homespace-production.up.railway.app';
    
    // Базовый URL для статики
    window.BASE_URL = isLocal
        ? 'http://localhost:3001'
        : 'https://homespace-production.up.railway.app';
    
    console.log('✅ Config загружен:', {
        API_URL: window.API_URL,
        WS_URL: window.WS_URL,
        isLocal: isLocal
    });
})();