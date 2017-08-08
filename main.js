var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;
var app = electron.app;
var ipc = electron.ipcMain;
var win = null;

app.on('ready', () => {

  // Menu template
  var template = [{
    label: "QuickCopy",
    submenu:[
      {label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }},
    ]},
    {label: "Edit",
    submenu:[

      {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
      {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
      {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"}
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));


  win = new BrowserWindow({
    height: 500,
    width: 500
  });

  win.loadURL('file://' + __dirname + '/app/index.html');

  win.on('closed', () => {
	app.quit();
  });
});

tempWin = null;

ipc.on('open-temp-window', () => {
  tempWin = new BrowserWindow({
    height: 200,
    width: 500
  });

  tempWin.loadURL('file://' + __dirname + '/app/templates.html');
});

ipc.on('send-temps-main', (event, ls) =>{
  tempWin.close();
  if(win != null){
    win.webContents.send('send-temps-index', ls);
  }
});

ipc.on('create-backup', (event, params) => {
  console.log(params);
  var progWin = new BrowserWindow({
    height: 200,
    width: 500
  });

  progWin.loadURL('file://' + __dirname + '/app/progress-screen.html');

  progWin.webContents.on('did-finish-load', () => {
    progWin.webContents.send('get-params', params);
  });

  progWin.on('close', () => {
	progWin = null;
  });
});
