const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const ipcMain = electron.ipcMain;

const {app, BrowserWindow, Menu, nativeImage} = electron;

app.on('ready', () => {
    let windowSize;

    // Create new window
    mainWindow = new BrowserWindow({
        minWidth: 500,
        minHeight: 500,
        width: 500,
        height: 900,
        resizable: true,
        // icon: "./app/res/icons/icon.png",
        vibrancy: "dark",
        title: "Medical Chatbot",
        webPreferences: {
            nodeIntegration: true
        },
        darkTheme: true
    });

    // Load HTML

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'app', 'src', 'index.html'),
            protocol: 'file:',
            slashes: true
        }),
        {"extraHeaders" : "pragma: no-cache\n"}
    );
});
