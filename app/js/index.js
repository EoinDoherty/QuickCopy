var fs = require('fs');
var electron = require('electron');
var pth = require('path');
var ipc = electron.ipcRenderer;

function tieEnterToClick(inputField, button){
  inputField.addEventListener('keyup', (event) => {
    event.preventDefault();
    if(event.keyCode == 13){
      button.click();
    }
  });
}

function prepButton(buttonEl, parent, ft){
  buttonEl.addEventListener('click', () => {
    buttonEl.remove();
    parent.remove();
    fileTypes.splice(fileTypes.indexOf(ft), 1);
  });
}

var params = {
  "path": "",
  "filetypes": [],
  "structured": false
};

var pathSubmit = document.querySelector('#submit-path');
pathSubmit.addEventListener('click', () => {
  var pathDisp = document.getElementById('path-p');
  var pathInp = document.getElementById('path-input');
  var pathStr = pathInp.value;

  if(pathStr[pathStr.length - 1] != pth.sep){
    pathStr = pathStr + pth.sep;
  }
  if(pathStr[0] != pth.sep){
    pathStr = pth.sep + pathStr;
  }
  pathDisp.innerHTML = pathStr;
  params.path = pathStr;
});

var pathInput = document.querySelector('#path-input');
tieEnterToClick(pathInput, pathSubmit);

var fileTypes = [];

var submitFiletype = document.querySelector('#submit-filetype');

function appendFileType(ft){

  var append = true;

  if(ft === ""){
    return;
  }

  if(ft[0] !== '.'){
    ft = '.' + ft;
  }

  for(var i = 0; i < fileTypes.length; i++){
    if(fileTypes[i] === ft){
      append = false;
      break;
    }
  }
  if(append){
    fileTypes.push(ft);
    var ftList = document.querySelector('#ft-list');
    var li = document.createElement('li');
    li.setAttribute('id', "entry-" + ft.slice(1, ft.length));

    li.innerHTML = ft;

    var liButton = document.createElement('button');
    liButton.setAttribute('id', 'button-' + ft.slice(1, ft.length));
    liButton.setAttribute('class', 'ft-button');
    liButton.innerHTML = "Remove";
    li.appendChild(liButton);

    ftList.appendChild(li);

    prepButton(liButton, li, ft);
  }
}

submitFiletype.addEventListener('click', () => {
  var filetypeInput = document.querySelector('#filetype-input');

  var entries = filetypeInput.value.split(' ');

  for(var i = 0; i < entries.length; i++){
    appendFileType(entries[i]);

    /*var append = true;
    if(entry == ""){
      append = false;
    }

    if(entry[0] != '.'){
      entry = '.' + entry;
    }

    if(append){
      appendFileType(entry);

      fileTypes.push(entry);
      var ftList = document.querySelector('#ft-list');
      var li = document.createElement('li');
      li.setAttribute('id', "entry-" + entry.slice(1, entry.length));

      li.innerHTML = entry;

      var liButton = document.createElement('button');
      liButton.setAttribute('id', 'button-' + entry.slice(1, entry.length));
      liButton.setAttribute('class', 'ft-button');
      liButton.innerHTML = "Remove";
      li.appendChild(liButton);

      ftList.appendChild(li);

      prepButton(liButton, li, entry);

    }*/
  }

  filetypeInput.value = "";
});

var filetypeInput = document.querySelector('#filetype-input');
tieEnterToClick(filetypeInput, submitFiletype);

var templateBtn = document.querySelector('#template-btn');
templateBtn.addEventListener('click', () => {
  ipc.send('open-temp-window');
});

ipc.on('send-temps-index', (event, ls) => {
  for(var i = 0; i < ls.length; i++){
    appendFileType(ls[i]);
  }
});

var backupButton = document.querySelector('#backup-button');
backupButton.addEventListener('click', () => {

  var structured = document.querySelector('#structured').checked;
  params.structured = structured;
  params.filetypes = fileTypes;

  if(params.path.length > 1 && fs.existsSync(params.path) && fs.statSync(params.path).isDirectory()){
    var pathDisp = document.getElementById('path-p');
    var pathInp = document.getElementById('path-input');
    pathDisp.innerHTML = "";
    pathInp.value = "";
    ipc.send('create-backup', params);
  }else{
    alert("Specified path does not exist");
  }
});
