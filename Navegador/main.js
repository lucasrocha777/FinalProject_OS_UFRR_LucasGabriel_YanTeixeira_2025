const { app, BrowserWindow } = require('electron');

function creatWindow() {
    const win = new BrowserWindow({
        wight: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html');
}

app.whenReady().then(creatWindow);