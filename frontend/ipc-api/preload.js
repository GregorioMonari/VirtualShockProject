const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveFile: (filename, content) => ipcRenderer.send('save-file', filename, content),
  readFile: (filename) => ipcRenderer.invoke('read-file', filename),
  assemble: (filename) => ipcRenderer.invoke('assemble',filename),
  openFileDialog: async (options) => {
    return await ipcRenderer.invoke('open-file-dialog',options);
  }
});