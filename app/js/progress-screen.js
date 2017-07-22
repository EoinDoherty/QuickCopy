var electron = require('electron');
var ipc = electron.ipcRenderer;
var EventEmitter = require('events');

const fs = require('fs');
const pth = require('path');

const progBarEmitter = new EventEmitter();

var numProcessed = 0;
var total = 0;

function copyFile(source, destinationDir, filename){
  if(!fs.existsSync(destinationDir)){
    var folders = destinationDir.split(pth.sep);

    var dest = "";
    if(pth.isAbsolute(destinationDir)){
      dest = pth.sep;
    }
    var a = folders.reduce(function(tail, head){
      var dir = pth.resolve(tail, head);
      if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      return dir;
    }, dest);
  }

  var rs = fs.createReadStream(source);

  var ws = fs.createWriteStream(destinationDir + filename);
  rs.pipe(ws);
  ws.on('close', function(ex){
    progBarEmitter.emit('update-bar');
  });
}

var folder = "";

function makeNewBackup(startPath, filetypes, structured){
  //console.log(startPath + " " + filetypes + " " + structured);
  //console.log(__dirname);

  var directoryQueue = [startPath];
  var fileList = [];
  //console.log(filetypes.length);
  //console.log(__dirname);

  if(filetypes.length > 0){
    for(var i = 0; i < filetypes.length; i++){
      filetypes[i] = filetypes[i].toLowerCase();
      console.log(filetypes[i]);
    }
  }

  while(directoryQueue.length > 0){
    var currentDir = directoryQueue.shift();
    var files = fs.readdirSync(currentDir);

    for(var i = 0; i < files.length; i ++){
      var path = currentDir + files[i];
      var f = fs.statSync(path);
      if(f.isDirectory()){
        //console.log("pushing " + path + pth.sep);
        directoryQueue.push(path + pth.sep);
        //console.log(directoryQueue);
      }else{
        if(filetypes.length > 0){
          //filter the files
          for(var j = 0; j < filetypes.length; j++){
            if(path.length - filetypes[j].length >= 0 && path.substring(path.length - filetypes[j].length, path.length).toLowerCase() === filetypes[j]){
              fileList.push(path);
            }
          }
        }else{
          //console.log(path);
          fileList.push(path);
        }
      }
    }
  }

  if(fileList.length > 0){
    var time = new Date();
    var backUpFolder = __dirname + pth.sep + '..' + pth.sep + '..' + pth.sep + time;
    //console.log(backUpFolder);

    /*var numFolders = 1;
    var folderExists = fs.existsSync(backUpFolder);

    if(!folderExists){
      fs.mkdirSync(backUpFolder);
    }else{
      while(folderExists){
        var newName = backUpFolder + " " + numFolders;
        if(!fs.existsSync(newName)){
          fs.mkdirSync(newName);
          backUpFolder = newName;
          folderExists = false;
        }
      }
    }*/

    backUpFolder += pth.sep;

    folder = backUpFolder;

    var dest = document.querySelector('#dest-p');
    dest.innerHTML = "copying files to " + folder;

    total = fileList.length;
    //console.log(fileList);

    /*for(var i = 0; i < fileList.length; i++){
      var file = fileList[i].split(pth.sep);
      console.log(backUpFolder + fileList[i].substring(startPath.length, fileList[i].length));
      var dir = fileList[i].substring(startPath.length, fileList[i].length);
      if(structured){
        copyFile(fileList[i], backUpFolder + dir.substring(0,dir.length - file[file.length - 1].length), file[file.length - 1]);
      }else{
        copyFile(fileList[i], backUpFolder, file[file.length - 1]);
      }
    }*/

    while(fileList.length > 0){
      var fileListElem = fileList.shift();
      var file = fileListElem.split(pth.sep);

      var dir = fileListElem.substring(startPath.length, fileListElem.length);
      if(structured){
        copyFile(fileListElem, backUpFolder + dir.substring(0,dir.length - file[file.length - 1].length), file[file.length - 1]);
      }else{
        copyFile(fileListElem, backUpFolder, file[file.length - 1]);
      }
    }
  }else{
    alert("No files found.");
    ipc.send('close-prog-screen');
  }
}

ipc.send('prog-screen-loaded');
ipc.on('get-params', (event, params) => {
  makeNewBackup(params.path, params.filetypes, params.structured);
  //makeNewBackup("/Users/eoin/Programming/Test/", params.filetypes, params.structured);
});

/*
var increm = document.querySelector('#increment-prog-bar');
increm.addEventListener('click', () => {
  progBarEmitter.emit('update-bar');
});
*/

progBarEmitter.on('update-bar', () => {
  numProcessed += 1;

  var dest = document.querySelector('#dest-p');
  dest.innerHTML = "copying files to " + folder;

  var percent = 100 * (numProcessed / total);
  var progBar = document.querySelector('#prog-bar');
  progBar.style.width = percent + "%";

  var fract = document.querySelector('#fraction');
  fract.innerHTML = numProcessed + " / " + total;
});
