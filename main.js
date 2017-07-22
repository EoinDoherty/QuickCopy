var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var app = electron.app;
var ipc = electron.ipcMain;
var win = null;

app.on('ready', () => {
  win = new BrowserWindow({
    height: 500,
    width: 500
  });

  win.loadURL('file://' + __dirname + '/app/index.html');
});


ipc.on('create-backup', (event, params) => {
  console.log(params);
  progWin = new BrowserWindow({
    height: 200,
    width: 500
  });

  progWin.loadURL('file://' + __dirname + '/app/progress-screen.html');
  
  progWin.webContents.on('did-finish-load', () => {
    progWin.webContents.send('get-params', params);
  });
});


/*
ipc.on('create-backup', (event, params) => {
  win.loadURL('file://' + __dirname + '/app/progress-screen.html');

  ipc.on('prog-screen-loaded', () => {
    win.webContents.send('get-params', params);
  });

  ipc.on('close-prog-screen', () => {
    win.loadURL('file://' + __dirname + '/app/index.html');
  });
});
*/
