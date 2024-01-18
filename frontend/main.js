const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");
const { create } = require('domain');
const VshVmApi= require("./electron_modules/VshVmApi")

console.log("### VSH Suite - Desktop version v0.0.1 ###")

let mainWindow

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, `/dist/frontend/index.html`),
            protocol: "file:",
            slashes: true
        }));
    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', async ()=>{
    initVMApi();
    createWindow();
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})



//----- CUSTOM FUNCTIONS -----//
function initVMApi(){
    console.log("INITIALIZING VM API")
    const vshApi=new VshVmApi(3000);
    vshApi.start();   
}