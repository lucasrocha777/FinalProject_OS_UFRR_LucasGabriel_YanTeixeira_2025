const { session } = require('electron');

function configurarSeguranca() {
    const ses = session.defaultSession;

    // 1. Configuração de Permissões
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
        const permissoesPermitidas = [
            'clipboard-read',
            'clipboard-write',
            'fullscreen',
            'pointerLock'
        ];

        callback(permissoesPermitidas.includes(permission));
    });

    // 2. Configuração de CSP
    ses.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = {
            ...details.responseHeaders,
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https:",
                "style-src 'self' 'unsafe-inline' https:",
                "img-src 'self' data: https:",
                "font-src 'self' https:",
                "connect-src 'self' https:",
                "media-src 'self' https:",
                "object-src 'none'",
                "frame-src 'self' https:"
            ].join('; ')
        };

        callback({ responseHeaders });
    });

    // 3. Configurações de segurança
    ses.setSpellCheckerEnabled(false);
    ses.setBluetoothPairingHandler(() => {});

    // 4. Configurações de cache
    ses.clearCache();
    ses.clearStorageData();

    return {
        webPreferences: {
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
            allowRunningInsecureContent: false,
            webgl: false,
            plugins: false,
            experimentalFeatures: false,
            enableBlinkFeatures: '',
            disableBlinkFeatures: 'Auxclick',
            partition: 'persist:secure-partition'
        }
    };
}

module.exports = {
    configurarSeguranca
};