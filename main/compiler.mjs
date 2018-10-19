import settings from '../config.js';

const fs = settings.fs;

import syntax from './index/methods.mjs';

var file = fs.readFileSync(`./project/script.ls`).toString().split("\n");

var tok = "";
/*
for(i in file) {
    console.log(file[i]);
}
*/

let errCheck = false;

for(let i = 0; i < file.length; i++) {
  fileStrings = file[i];
  check = "";
  if(errCheck == true) {
    console.log("Error detected. Code compiler stopped.");
    break;
  }
  for(r = 0; r < 100; r++){
    check = check + fileStrings[r];
    for(c in syntax){
      if(check == c){
        loadTok(c, fileStrings, r);
        break;
      }
    }
  }
}

function loadTok(tempC, tempFile, tempR){
  switch(tempC){
    case "int":
      tok = tok + "{int";
      tempVar = "";
      for(l=4; l<tempFile.lenth; l++){
        tempVar = tempVar + tempFile[l];
        if(tempFile[l] == " "){
          if(tempFile[l+1] !== ":"){
            errCheck = true;
            break;
          }
          tok = tok + `[${tempVar}]`;
          for(z=l+3; z<tempFile.lenth; z++){
            if(tempFile[z] == " "){
              if(tempFile[z+1] !== ":"){
                errCheck = true;
              }
              if(tempFile[z+3] !== "g" || tempFile[z+3] !== "l" || tempFile[z+3] !== "c"){
                errCheck = true;
              }
              tok = tok + `[${tempFile[z+3]}]`;
              break;
            }
          }
        }
      }
      tok = tok + "}";
      break;
    case "method":
      break;
    case "print.console":
      break;
    case "print.alert":
      break;
    case "print.prompt":
      break;
    default: 
      break;
  }
}

fs.writeFileSync("../project/toks.tok", tok, (err) => {
  if(err) throw(err);
});
