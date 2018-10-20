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

let fileStrings = "";

for(let i = 0; i < file.length; i++) {
  fileStrings = file[i];
  let check = "";
  if(errCheck == true) {
    console.log("Error detected. Code compiler stopped.");
    break;
  }
  for(let r = 0; r < 100; r++){
    check = check + fileStrings[r];
    for(let c in syntax){
      if(check == c){
        loadTok(c, fileStrings, r);
        break;
      }
    }
  }
}

function loadTok(tempC, tempFile, tempR){
  switch(tempC){
    case "init":
      tok = tok + "{init";
      let tempVar = "";
      for(let l=5; l<tempFile.length; l++){
        if(tempFile[l] !== " "){
          tempVar = tempVar + tempFile[l];  
        }
        if(tempFile[l] == " "){
          if(tempFile[l+1] !== ":"){
            errCheck = true;
            break;
          }
          tok = tok + `[${tempVar}]`;
          let tempVal = "";
          for(let z=l+3; z<tempFile.length; z++){
            if(tempFile[z] !== " "){
                tempVal = tempVal + tempFile[z];  
            }
            if(tempFile[z] == " "){
              if(tempFile[z+1] !== ":"){
                errCheck = true;
                break;
              }
              tok = tok + `[${tempVal}]`;
              if(tempFile[z+3] !== "g" || tempFile[z+3] !== "l" || tempFile[z+3] !== "c"){
                errCheck = true;
              }
              tok = tok + `[${tempFile[z+3]}]`;
              break;
            }
          }
        }
      }
      tok = tok + "}\n";
      break;
    case "method":
      break;
    case "print.cons":
      break;
    case "print.warn":
      break;
    case "print.error":
      break;
    case "print.info":
      break;
    default: 
      break;
  }
}

fs.writeFileSync("./project/toks.tok", tok, (err) => {
  if(err) throw(err);
});
