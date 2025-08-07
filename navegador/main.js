const { app, BrowserWindow, BrowserView, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const Store = require('electron-store'); 
const monitoramento = require('./monitoramento');
const { configurarSeguranca } = require('./seguranca');

// Inicialize o electron-store para persistência de dados do usuário
const store = new Store();

// Variáveis globais para gerenciar o estado do navegador
let mainWindow; // A janela principal do navegador
let tabs = []; // Array que armazena as 'BrowserView's, cada uma representando uma aba
let currentTab = 0; // Índice da aba atualmente ativa
let history = []; // Array para armazenar o histórico de navegação
let isDarkMode = store.get('darkMode', false); // Carrega o tema salvo do armazenamento, padrão para 'false' (modo claro)

// CSS para corrigir o tema escuro em páginas da web
// `!important` é usado para sobrescrever os estilos da página
const CSS_FIXES = `
    /* Correções específicas para elementos da página de pesquisa do Google */
    [dark] .g, [dark] .rc, [dark] .tF2Cxc {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
    }
    [dark] input.gLFyf {
        background-color: #333 !important;
        color: #fff !important;
    }
    
    /* Correções gerais para o tema escuro */
    [dark] {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
    }
    [dark] input, [dark] textarea, [dark] select {
        background-color: #333 !important;
        color: #fff !important;
        border-color: #555 !important;
    }
`;

// Registra um esquema de protocolo privilegiado para garantir que a aplicação possa carregar arquivos locais com segurança
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
            allowServiceWorkers: true,
            supportFetchAPI: true,
            corsEnabled: true
        }
    }
]);


// O evento `whenReady` é disparado quando o Electron termina de inicializar
app.whenReady().then(() => {
  const secureConfig = configurarSeguranca(); // Chama a função de segurança para obter as configurações
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            ...secureConfig.webPreferences, // Aplica as configurações de segurança
            preload: path.join(__dirname, 'preload.js'), // Carrega o script de pré-carregamento para a interface
            contextIsolation: true, // Habilita o isolamento de contexto para maior segurança
            nodeIntegration: false // Desabilita a integração com o Node.js no processo de renderização
        }
    });

    // Adiciona um listener para o evento de redimensionamento da janela
    mainWindow.on('resize', () => {
        setTabBounds(); // Ajusta o tamanho da aba atual
    });

    mainWindow.loadFile('index.html'); // Carrega a interface principal do navegador
    createNewTab('home'); // Cria a primeira aba com a página inicial
    monitoramento(app,mainWindow,dialog); // Inicia o monitoramento de recursos do sistema
});

// Função para criar uma nova aba
function createNewTab(url = 'home') {
  const secureConfig = configurarSeguranca();
    const newView = new BrowserView({
        webPreferences: {
           ...secureConfig.webPreferences, // Aplica as configurações de segurança para a nova visualização
            contextIsolation: false, // Pode ser necessário para injeção de scripts (opcionalmente pode ser 'true')
            enableRemoteModule: true // Permite o uso do módulo remoto (pode ser um risco de segurança)
        }
    });

    // Injeta o CSS do tema na aba quando a página terminar de carregar
    newView.webContents.on('did-finish-load', () => {
        injectTheme(newView);
    });
    // Medição de desempenho
    if (newView?.webContents) {
        const start = Date.now();
        newView.webContents.once('did-finish-load', () => {
            const loadTime = Date.now() - start;
            console.log(`[Desempenho] Página carregada em ${loadTime} ms`);
        });
    }
    if (url === 'home') {
        // Se a URL for 'home', carrega um HTML gerado embutido
        newView.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(generateHomeHTML())}`);
    } else {
        // Caso contrário, carrega a URL fornecida
        newView.webContents.loadURL(url);
        if (!url.startsWith('data:text/html')) {
            // Adiciona a URL ao histórico se não for uma página embutida
            history.push({
                url: url,
                title: 'Nova página',
                timestamp: new Date()
            });
        }
    }

    // Atualiza o título no histórico quando o título da página muda
    newView.webContents.on('page-title-updated', (event, title) => {
        if (url !== 'home') {
            const historyItem = history.find(item => item.url === url);
            if (historyItem) {
                historyItem.title = title;
                mainWindow.webContents.send('history-updated'); // Notifica a interface sobre a mudança
            }
        }
    });

    tabs.push(newView); // Adiciona a nova aba ao array de abas
    currentTab = tabs.length - 1; // Define a nova aba como a ativa
    mainWindow.setBrowserView(newView); // Exibe a nova aba na janela principal
    setTabBounds(); // Ajusta o tamanho da aba
    updateTabs(); // Atualiza a barra de abas na interface
}

// Função para gerar o HTML da página inicial
function generateHomeHTML() {
    return `
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: ${isDarkMode ? '#1a1a1a' : '#fff'};
                    color: ${isDarkMode ? '#f0f0f0' : '#333'};
                    background-image: url('https://upload.wikimedia.org/wikipedia/en/6/6f/GONxGON.png');
                    background-size: 300px; /* Aumentado aqui também */
                    background-repeat: no-repeat;
                    background-position: center 60px;
                }
                input {
                    margin-top: 200px; /* Ajuste para posicionar abaixo da imagem */
                    padding: 10px 20px;
                    width: 50%;
                    border-radius: 24px;
                    border: 1px solid ${isDarkMode ? '#444' : '#ccc'};
                    font-size: 16px;
                    background-color: ${isDarkMode ? '#333' : 'white'};
                    color: ${isDarkMode ? '#f0f0f0' : '#333'};
                }
            </style>
        </head>
        <body>
            <input id="search-home" placeholder="Search Google" autofocus />
            <script>
                document.getElementById('search-home').addEventListener('keydown', function(event) {
                    if (event.key === 'Enter') {
                        location.href = 'https://www.google.com/search?q=' + encodeURIComponent(this.value);
                    }
                });
            </script>
        </body>
        </html>
    `;
}

// Injeta o CSS do tema nas páginas carregadas
function injectTheme(view) {
    const bgImage = 'https://upload.wikimedia.org/wikipedia/en/6/6f/GONxGON.png';
    
    if (isDarkMode) {
        view.webContents.insertCSS(`
            :root {
                color-scheme: dark;
            }
            body {
                background-image: url('${bgImage}');
                background-size: 300px;
                background-repeat: no-repeat;
                background-position: center 60px;
                background-color: #1a1a1a !important;
            }
            ${CSS_FIXES}
        `);
    } else {
        view.webContents.insertCSS(`
            :root {
                color-scheme: light;
            }
            body {
                background-image: url('${bgImage}');
                background-size: 300px;
                background-repeat: no-repeat;
                background-position: center 60px;
                background-color: #ffffff !important;
            }
        `);
    }
}

// Define o tamanho e a posição da aba ativa
function setTabBounds() {
    if (tabs[currentTab]) {
        const { width, height } = mainWindow.getContentBounds();
        tabs[currentTab].setBounds({ 
            x: 0, 
            y: 80, // Altura da barra superior
            width: width,
            height: height - 80 // Desconta a altura da barra superior
        });
    }
}

// Troca para uma aba específica
function switchTab(index) {
    if (tabs[index]) {
        currentTab = index;
        mainWindow.setBrowserView(tabs[currentTab]);
        setTabBounds();
        updateTabs();
    }
}

// Fecha uma aba específica
function closeTab(index) {
    if (tabs[index]) {
        tabs[index].webContents.destroy(); // Destroi o conteúdo da aba
        tabs.splice(index, 1); // Remove a aba do array
        if (currentTab >= tabs.length) {
            currentTab = tabs.length - 1; // Ajusta o índice da aba atual
        }
        if (tabs.length > 0) {
            mainWindow.setBrowserView(tabs[currentTab]); // Exibe a nova aba ativa
            setTabBounds();
        }
        updateTabs();
    }
}

// Atualiza a interface da barra de abas
function updateTabs() {
        // Mapeia as abas para um formato de dados simples para enviar à interface
        const tabList = tabs.map((_, i) => ({ index: i, active: i === currentTab }));
        mainWindow.webContents.send('update-tabs', tabList);
    }

// Retorna o array de histórico
function getHistory() {
    return history;
}

// Limpa todo o histórico
function clearHistory() {
    history = [];
    mainWindow.webContents.send('history-updated');
}

// Manipuladores de eventos IPC (Inter-Process Communication)
// Recebem e processam as solicitações da interface do usuário

// Lida com a navegação para uma URL ou pesquisa
ipcMain.on('navigate', (event, url) => {
    let finalUrl = url;
    if (!url.startsWith('http')) {
        // Se a URL não for completa, assume que é uma pesquisa no Google
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
    if (tabs[currentTab]) {
        const start = Date.now();
        tabs[currentTab].webContents.loadURL(finalUrl);
        
        if (tabs[currentTab]?.webContents) {
            tabs[currentTab].webContents.once('did-finish-load', () => {
                const tempo = Date.now() - start;
                console.log(`[Desempenho] Página '${url}' carregada em ${tempo} ms`);
            });
        }
        if (finalUrl !== 'home') {
            // Adiciona a entrada ao histórico
            history.push({
                url: finalUrl,
                title: 'Carregando...',
                timestamp: new Date()
            });
            mainWindow.webContents.send('history-updated');
        }
    }
});

// Botão 'voltar'
ipcMain.on('back', () => {
    if (tabs[currentTab]?.webContents.navigationHistory.goBack()) {
        tabs[currentTab].webContents.goBack();
    }
});

// Botão 'avançar'
ipcMain.on('forward', () => {
    if (tabs[currentTab]?.webContents.navigationHistory.goForward()) {
        tabs[currentTab].webContents.goForward();
    }
});

// Botão 'recarregar'
ipcMain.on('reload', () => {
    tabs[currentTab]?.webContents.reload();
});

// Cria uma nova aba a partir da interface
ipcMain.on('new-tab', () => {
    createNewTab('home');
});

// Troca a aba ativa
ipcMain.on('switch-tab', (event, index) => {
    switchTab(index);
});

// Fecha uma aba
ipcMain.on('close-tab', (event, index) => {
    closeTab(index);
});

// Retorna o histórico de navegação (usando `handle` para resposta assíncrona)
ipcMain.handle('get-history', () => {
    return getHistory();
});

// Limpa o histórico
ipcMain.on('clear-history', () => {
    clearHistory();
});

// Abre a janela de histórico
ipcMain.on('show-history', () => {
    const historyWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    
    historyWindow.loadFile('historico.html');
});

// Define o tema (claro/escuro) e o salva
ipcMain.on('set-dark-mode', (event, dark) => {
    isDarkMode = dark;
    store.set('darkMode', dark); // Salva o estado do tema
    
    // Injeta o novo tema em todas as abas
    tabs.forEach(tab => {
        injectTheme(tab);
    });
    
    // Atualiza a página de histórico se estiver aberta
    BrowserWindow.getAllWindows().forEach(win => {
        if (win.webContents.getURL().endsWith('history.html')) {
            win.webContents.send('update-theme', dark);
        }
    });
});

// Atualiza o título de um item do histórico
ipcMain.on('update-history-title', (event, url, title) => {
  const historyItem = history.find(item => item.url === url);
  if (historyItem) {
    historyItem.title = title;
    mainWindow.webContents.send('history-updated', history);
  }
});


// Retorna o estado atual do tema (claro/escuro)
ipcMain.handle('get-dark-mode', () => {
    return isDarkMode;
});
