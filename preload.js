const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getServerAddress: () => ipcRenderer.invoke('get-server-address')
});
