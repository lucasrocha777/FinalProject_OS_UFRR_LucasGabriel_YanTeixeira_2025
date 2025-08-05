const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store'); 

// Inicialize o electron-store
const store = new Store();

let mainWindow;
let tabs = [];
let currentTab = 0;
let history = [];
let isDarkMode = store.get('darkMode', false); // Carrega o tema salvo

const CSS_FIXES = `
    /* Correções para o Google */
    [dark] .g, [dark] .rc, [dark] .tF2Cxc {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
    }
    [dark] input.gLFyf {
        background-color: #333 !important;
        color: #fff !important;
    }
    
    /* Correções gerais */
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


app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });


    mainWindow.on('resize', () => {
        setTabBounds();
    });

    mainWindow.loadFile('index.html');
    createNewTab('home');
});

function createNewTab(url = 'home') {
    const newView = new BrowserView({
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // Injeta o tema quando a página carrega
    newView.webContents.on('did-finish-load', () => {
        injectTheme(newView);
    });

    if (url === 'home') {
        newView.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(generateHomeHTML())}`);
    } else {
        newView.webContents.loadURL(url);
        if (!url.startsWith('data:text/html')) {
            history.push({
                url: url,
                title: 'Nova página',
                timestamp: new Date()
            });
        }
    }

    newView.webContents.on('page-title-updated', (event, title) => {
        if (url !== 'home') {
            const historyItem = history.find(item => item.url === url);
            if (historyItem) {
                historyItem.title = title;
                mainWindow.webContents.send('history-updated');
            }
        }
    });

    tabs.push(newView);
    currentTab = tabs.length - 1;
    mainWindow.setBrowserView(newView);
    setTabBounds();
    updateTabs();
}

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

function setTabBounds() {
    if (tabs[currentTab]) {
        const { width, height } = mainWindow.getContentBounds();
        tabs[currentTab].setBounds({ 
            x: 0, 
            y: 80, // Altura da barra superior
            width: width,
            height: height - 80 // Desconta a altura da barra
        });
    }
}

function switchTab(index) {
    if (tabs[index]) {
        currentTab = index;
        mainWindow.setBrowserView(tabs[currentTab]);
        setTabBounds();
        updateTabs();
    }
}

function closeTab(index) {
    if (tabs[index]) {
        tabs[index].webContents.destroy();
        tabs.splice(index, 1);
        if (currentTab >= tabs.length) {
            currentTab = tabs.length - 1;
        }
        if (tabs.length > 0) {
            mainWindow.setBrowserView(tabs[currentTab]);
            setTabBounds();
        }
        updateTabs();
    }
}

function updateTabs() {
    const tabList = tabs.map((_, i) => ({ index: i, active: i === currentTab }));
    mainWindow.webContents.send('update-tabs', tabList);
}

function getHistory() {
    return history;
}

function clearHistory() {
    history = [];
    mainWindow.webContents.send('history-updated');
}

// IPC Handlers
ipcMain.on('navigate', (event, url) => {
    let finalUrl = url;
    if (!url.startsWith('http')) {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    }
    if (tabs[currentTab]) {
        tabs[currentTab].webContents.loadURL(finalUrl);
        if (finalUrl !== 'home') {
            history.push({
                url: finalUrl,
                title: 'Carregando...',
                timestamp: new Date()
            });
            mainWindow.webContents.send('history-updated');
        }
    }
});

ipcMain.on('back', () => {
    if (tabs[currentTab]?.webContents.canGoBack()) {
        tabs[currentTab].webContents.goBack();
    }
});

ipcMain.on('forward', () => {
    if (tabs[currentTab]?.webContents.canGoForward()) {
        tabs[currentTab].webContents.goForward();
    }
});

ipcMain.on('reload', () => {
    tabs[currentTab]?.webContents.reload();
});

ipcMain.on('new-tab', () => {
    createNewTab('home');
});

ipcMain.on('switch-tab', (event, index) => {
    switchTab(index);
});

ipcMain.on('close-tab', (event, index) => {
    closeTab(index);
});

ipcMain.handle('get-history', () => {
    return getHistory();
});

ipcMain.on('clear-history', () => {
    clearHistory();
});

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
    
    historyWindow.loadFile('history.html');
});

ipcMain.on('set-dark-mode', (event, dark) => {
    isDarkMode = dark;
    store.set('darkMode', dark);
    
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

ipcMain.handle('get-dark-mode', () => {
    return isDarkMode;
});