const fs = require('fs');
const pth = require('path');

function copyFile(source, destinationDir, filename){
  if(!fs.existsSync(destinationDir)){
    var folders = destinationDir.split(pth.sep);

    var dest = "";
    if(pth.isAbsolute(destinationDir)){
      dest = "/";
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
    console.log("Copied " + filename);
  });

}

function makeNewBackup(startPath, filetypes, structured){
  console.log(startPath + " " + filetypes + " " + structured);
  //ipc.send('copy-update', processed, total);
  ipc.send('copy-update', 10, 10);
  /*var directoryQueue = [startPath];
  var fileList = [];
  console.log(filetypes.length);
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
        console.log("pushing " + path + pth.sep);
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
          console.log(path);
          fileList.push(path);
        }
      }
    }
  }

  var time = new Date();
  var backUpFolder = __dirname + pth.sep + time;
  //console.log(backUpFolder);

  var numFolders = 1;
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
  }

  backUpFolder += pth.sep;

  for(var i = 0; i < fileList.length; i++){
    var file = fileList[i].split(pth.sep);
    console.log(backUpFolder + fileList[i].substring(startPath.length, fileList[i].length));
    //console.log(fileList[i]);
    var dir = fileList[i].substring(startPath.length, fileList[i].length);
    //console.log("copying " + file[file.length - 1]);
    if(structured){
      copyFile(fileList[i], backUpFolder + dir.substring(0,dir.length - file[file.length - 1].length), file[file.length - 1]);
      console.log("copied " + i + " of " + fileList.length + " items...");
    }else{
      copyFile(fileList[i], backUpFolder, file[file.length - 1]);
      console.log("copied " + i + " of " + fileList.length + " items...");
    }
  }*/
}

module.exports.makeBackup = makeNewBackup;
