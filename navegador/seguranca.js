const { session } = require('electron'); // Importa o módulo `session` do Electron para configurar o comportamento da sessão de navegação

// A função `configurarSeguranca` encapsula todas as políticas de segurança
function configurarSeguranca() {
    const ses = session.defaultSession; // Obtém a sessão padrão do Electron, que será usada para configurar as políticas

    // 1. Configuração de Permissões
    // `setPermissionRequestHandler` intercepta solicitações de permissão de páginas web
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
        // Define uma lista de permissões que são consideradas seguras para serem concedidas
        const permissoesPermitidas = [
            'clipboard-read',    // Permissão para ler a área de transferência
            'clipboard-write',   // Permissão para escrever na área de transferência
            'fullscreen',        // Permissão para entrar no modo de tela cheia
            'pointerLock'        // Permissão para travar o ponteiro do mouse (usado em jogos, por exemplo)
        ];

        // A `callback` é chamada para conceder ou negar a permissão.
        // Se a permissão solicitada estiver na lista de permissões permitidas, ela é concedida (`true`), caso contrário, é negada (`false`).
        callback(permissoesPermitidas.includes(permission));
    });

    // 2. Configuração de CSP (Content Security Policy)
    // `onHeadersReceived` permite interceptar e modificar os cabeçalhos de resposta HTTP
    ses.webRequest.onHeadersReceived((details, callback) => {
        // Cria uma cópia dos cabeçalhos de resposta originais
        const responseHeaders = {
            ...details.responseHeaders,
            // Adiciona ou sobrescreve o cabeçalho 'Content-Security-Policy'
            'Content-Security-Policy': [
                "default-src 'self'",               // Permite o carregamento de recursos apenas da mesma origem ('self')
                "script-src 'self' 'unsafe-inline' https:", // Permite scripts da mesma origem, scripts inline e de fontes HTTPS
                "style-src 'self' 'unsafe-inline' https:",  // Permite estilos da mesma origem, estilos inline e de fontes HTTPS
                "img-src 'self' data: https:",              // Permite imagens da mesma origem, dados embutidos (data:) e de fontes HTTPS
                "font-src 'self' https:",                   // Permite fontes da mesma origem e de fontes HTTPS
                "connect-src 'self' https:",                // Restringe conexões (XHR, WebSockets) para a mesma origem e fontes HTTPS
                "media-src 'self' https:",                  // Permite mídias da mesma origem e de fontes HTTPS
                "object-src 'none'",                // Proíbe completamente a incorporação de objetos como <embed> ou <object>
                "frame-src 'self' https:"           // Restringe iframes para a mesma origem e fontes HTTPS
            ].join('; ')
        };

        // Chama a `callback` com os novos cabeçalhos de resposta
        callback({ responseHeaders });
    });

    // 3. Configurações de segurança adicionais
    ses.setSpellCheckerEnabled(false); // Desabilita o corretor ortográfico para reduzir a superfície de ataque
    ses.setBluetoothPairingHandler(() => {}); // Desabilita o emparelhamento Bluetooth, impedindo ataques potenciais por esse vetor

    // 4. Configurações de cache
    ses.clearCache(); // Limpa o cache para garantir que dados antigos não sejam carregados
    ses.clearStorageData(); // Limpa dados de armazenamento (cookies, localStorage, etc.)

    // Retorna um objeto com as `webPreferences` recomendadas
    return {
        webPreferences: {
            sandbox: true,                          // Ativa o sandbox, isolando o processo de renderização
            contextIsolation: true,                 // Isolamento de contexto, para evitar injeção de código
            nodeIntegration: false,                 // Desativa a integração com o Node.js, prevenindo acesso ao sistema de arquivos
            webSecurity: true,                      // Ativa as políticas de segurança web padrão (CSP, CORS)
            allowRunningInsecureContent: false,     // Bloqueia conteúdo HTTP em páginas HTTPS
            webgl: false,                           // Desabilita WebGL, um vetor comum de exploração
            plugins: false,                         // Desabilita plugins, como o Flash
            experimentalFeatures: false,            // Desativa funcionalidades experimentais do Chromium
            enableBlinkFeatures: '',                // Desabilita todas as funcionalidades do Blink que não são necessárias
            disableBlinkFeatures: 'Auxclick',       // Desabilita o recurso "Auxclick" para prevenir comportamentos inesperados
            partition: 'persist:secure-partition'   // Usa uma partição de sessão isolada para evitar que dados sejam compartilhados com outras janelas
        }
    };
}

// Exporta a função para ser usada em outras partes da aplicação
module.exports = {
    configurarSeguranca
};