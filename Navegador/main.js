const { app, BrowserWindow, BrowserView, ipcMain, dialog } = require('electron');
const monitoramento = require('./monitoramento.js'); 



let mainWindow;
let tabs = [];
let currentTab = 0;



app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: __dirname + '/preload.js',
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    createNewTab("https://example.com");
    mainWindow.loadFile('index.html');
    monitoramento(app, mainWindow, dialog);
});

function createNewTab(url) {
    const newView = new BrowserView();
    newView.webContents.loadURL(url);

    tabs.push(newView);
    currentTab = tabs.length - 1;

    mainWindow.setBrowserView(newView);
    setTabBounds();
}

function setTabBounds() {
    if (tabs[currentTab]) {
        tabs[currentTab].setBounds({ x: 0, y: 100, width: 1000, height: 600 }); 
    }
}

function switchTab(index) {
    if (tabs[index]) {
        currentTab = index;
        mainWindow.setBrowserView(tabs[currentTab]);
        setTabBounds();
    }
}

// === IPC EVENTS ===
ipcMain.on('navigate', (event, url) => {
    if (!url.startsWith("http")) {
        // Se o usuário digitou algo que não é um link, transforma em pesquisa do Google
        url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
    if (tabs[currentTab]) {
        tabs[currentTab].webContents.loadURL(url);
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

ipcMain.on('new-tab', (event, url) => {
    createNewTab(url || "https://example.com");
});

ipcMain.on('switch-tab', (event, index) => {
    switchTab(index);
});
