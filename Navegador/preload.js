const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Funções de navegação
    navigate: (url) => ipcRenderer.send('navigate', url),
    back: () => ipcRenderer.send('back'),
    forward: () => ipcRenderer.send('forward'),
    reload: () => ipcRenderer.send('reload'),
    
    // Funções de abas
    newTab: () => ipcRenderer.send('new-tab'),
    switchTab: (index) => ipcRenderer.send('switch-tab', index),
    closeTab: (index) => ipcRenderer.send('close-tab', index),
    
    // Funções de histórico
    showHistory: () => ipcRenderer.send('show-history'),
    getHistory: () => ipcRenderer.invoke('get-history'),
    clearHistory: () => ipcRenderer.send('clear-history'),
    
    // Funções de tema
    setDarkMode: (dark) => ipcRenderer.send('set-dark-mode', dark),
    getDarkMode: () => ipcRenderer.invoke('get-dark-mode'),
    
    // Listeners de eventos
    onUpdateTheme: (callback) => ipcRenderer.on('update-theme', callback),
    onUpdateTabs: (callback) => ipcRenderer.on('update-tabs', (event, tabList, currentIndex) => {
        callback(tabList, currentIndex);
    }),
    onHistoryUpdated: (callback) => ipcRenderer.on('history-updated', callback)
});

// Proteções adicionais (sem alterar as funções existentes)
if (window.__proto__) {
    delete window.__proto__.require;
    delete window.__proto__.process;
    delete window.__proto__.electronAPI; // Proteção extra
}

// Validação adicional para prevenir vazamentos
Object.freeze(window.electronAPI);
