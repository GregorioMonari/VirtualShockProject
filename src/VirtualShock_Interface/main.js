const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600
    })
  
    win.loadFile('index.html')
    win.setMenuBarVisibility(false)
  }


app.whenReady().then(() => {
  createWindow()

  initMainModules()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })



//---------------
const FileManagerApi = require("./electron_main_modules/FileManagerApi")
function initMainModules(){
    var fileManagerApi = new FileManagerApi();
    fileManagerApi.start()
}