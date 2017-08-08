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

function makeNewBackup(startPath, filetypes, structured){

  var directoryQueue = [startPath];
  var fileList = [];

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

    if(process.platform == "darwin"){
		  backUpFolder = __dirname + pth.sep + '..' + pth.sep + '..' + pth.sep + '..' + pth.sep + '..' + pth.sep + '..' + pth.sep + time;
	  }else if(process.platform == "linux"){
      backUpFolder = __dirname + pth.sep + '..' + pth.sep + '..' + pth.sep + '..' + pth.sep + '..' + pth.sep + time;
	}

    backUpFolder += pth.sep;

    total = fileList.length;

    while(fileList.length > 0){
      var fileListElem = fileList.shift();
      var file = fileListElem.split(pth.sep);

      var dir = fileListElem.substring(startPath.length, fileListElem.length);
      if(structured){
        copyFile(fileListElem, backUpFolder + dir.substring(0,dir.length - file[file.length - 1].length), file[file.length - 1]);
      }else{

        var filename = file[file.length - 1];
        var i = 1;

        var original = filename;
        while(fs.existsSync(backUpFolder + filename)){
          // Insert a number before file names to distinguish between duplicates
          var dotPos = original.lastIndexOf('.');
          filename = original.substring(0, dotPos) + '(' + i + ')' + original.substring(dotPos, original.length);
          i += 1;
        }

        copyFile(fileListElem, backUpFolder, filename);
      }
    }
  }else{
    alert("No files found.");
    ipc.send('close-prog-screen');
  }
}

ipc.on('get-params', (event, params) => {
  makeNewBackup(params.path, params.filetypes, params.structured);
});

progBarEmitter.on('update-bar', () => {
  numProcessed += 1;

  var percent = 100 * (numProcessed / total);
  var progBar = document.querySelector('#prog-bar');
  progBar.style.width = percent + "%";

  var fract = document.querySelector('#fraction');
  fract.innerHTML = numProcessed + " / " + total;
});
