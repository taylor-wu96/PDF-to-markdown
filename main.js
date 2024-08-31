// const { app, BrowserWindow } = require('electron');
// const path = require('path');
// const childProcess = require('child_process');

// let mainWindow;
// let serverProcess;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//     },
//   });

//   mainWindow.loadFile('./public/index.html');

//   mainWindow.on('closed', function () {
//     mainWindow = null;
//     // Stop the server when the window is closed
//     if (serverProcess) {
//       serverProcess.kill();
//     }
//   });
// }

// app.whenReady().then(() => {
//   // Start your Node.js server as a child process
//   const serverScript = path.join(__dirname, 'server.js');
//   serverProcess = childProcess.spawn('node', [serverScript]);

//   serverProcess.stdout.on('data', (data) => {
//     console.log(`Server: ${data}`);
//   });

//   serverProcess.stderr.on('data', (data) => {
//     console.error(`Server Error: ${data}`);
//   });

//   createWindow();

//   app.on('activate', function () {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') app.quit();
// });

// 
//  v4 test

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { app: server, PORT } = require('./server');
const http = require('http');

let mainWindow;
let serverInstance;
let serverAddress = `http://localhost:${PORT}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  serverInstance = http.createServer(server);
  serverInstance.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

app.on('will-quit', () => {
  if (serverInstance) {
    serverInstance.close();
  }
});

// Add this IPC handler
ipcMain.handle('get-server-address', () => {
  return serverAddress;
});
