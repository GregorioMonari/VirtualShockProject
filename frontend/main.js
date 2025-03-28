const {app, BrowserWindow, ipcMain} = require('electron')
const url = require("url");
const path = require("path");
//const { create } = require('domain');
const AppModuleManager= require("./app-modules/AppModuleManager.js")
const IpcApi = require("./ipc-api/IpcApi.js")

console.log("### VSH Suite - Desktop version v0.0.1 ###")

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '/ipc-api/preload.js'),
            contextIsolation: true, // Recommended for security
            enableRemoteModule: false // Recommended for security
        }
    })

    mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, `/dist/frontend/index.html`),
            protocol: "file:",
            slashes: true
        }));
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', async ()=>{
    await startBackend();
    createWindow();
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})



//----- CUSTOM FUNCTIONS -----//
async function startBackend(){
    const mainDirName= __dirname;
    //const appModuleManager = new AppModuleManager(mainDirName)
    //await appModuleManager.start();

    const api= new IpcApi();
    api.start();
}