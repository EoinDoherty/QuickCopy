var electron = require('electron');
var ipc = electron.ipcRenderer;
var fs = require('fs');

var temps = JSON.parse(fs.readFileSync(__dirname + '/js/filetypes.json'));

var ftLs = document.querySelector('#template-ls');
for(var i = 0; i < temps.tempsLs.length; i++){
  var tempLi = document.createElement('li');
  var inp = document.createElement('input');
  inp.setAttribute('type', 'checkbox');
  inp.setAttribute('class', 'temp-content');
  inp.setAttribute('class', 'temp-input');
  inp.setAttribute('id', i);
  //tempLi.innerHTML = temps.tempsLs[i].title + ' ' + temps.tempsLs[i].contents;
  var p = document.createElement('p');
  p.setAttribute('class', 'temp-content');
  p.innerHTML = temps.tempsLs[i].title + ' ' + temps.tempsLs[i].contents;
  tempLi.appendChild(inp);
  tempLi.appendChild(p);
  ftLs.appendChild(tempLi);
}

var submitTemps = document.querySelector('#submit-temp');
submitTemps.addEventListener('click', () => {
  var selectedTemps = [];
  var inputs = document.querySelectorAll('.temp-input');

  for(var i = 0; i < inputs.length; i++){
    if(inputs[i].checked){
      var index = Number(inputs[i].id);
      selectedTemps = selectedTemps.concat(temps.tempsLs[index].contents);
    }
  }

  var tmp = selectedTemps.filter((elem, index) => {
    return selectedTemps.indexOf(elem) == index;
  });

  selectedTemps = tmp;
  ipc.send('send-temps-main', selectedTemps);
});
