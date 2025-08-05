const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    navigate: (url) => ipcRenderer.send('navigate', url),
    back: () => ipcRenderer.send('back'),
    forward: () => ipcRenderer.send('forward'),
    reload: () => ipcRenderer.send('reload'),
    newTab: () => ipcRenderer.send('new-tab'),
    switchTab: (index) => ipcRenderer.send('switch-tab', index),
    closeTab: (index) => ipcRenderer.send('close-tab', index),
    showHistory: () => ipcRenderer.send('show-history'),
    getHistory: () => ipcRenderer.invoke('get-history'),
    clearHistory: () => ipcRenderer.send('clear-history'),
    setDarkMode: (dark) => ipcRenderer.send('set-dark-mode', dark),
    setDarkMode: (dark) => ipcRenderer.send('set-dark-mode', dark),
    getDarkMode: () => ipcRenderer.invoke('get-dark-mode'),
    onUpdateTheme: (callback) => ipcRenderer.on('update-theme', callback),

    onUpdateTabs: (callback) => ipcRenderer.on('update-tabs', (event, tabList, currentIndex) => {
        callback(tabList, currentIndex);
    }),

    onHistoryUpdated: (callback) => ipcRenderer.on('history-updated', callback)
});