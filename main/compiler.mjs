import settings from '../config.js';

const fs = settings.fs;

import syntax from './index/methods.mjs';

let project = JSON.parse(fs.readFileSync("./compile.json", "utf8"));
let entrySet = JSON.parse(fs.readFileSync(`./projects/${project.project}/${project.project}.json`, "utf8"));
let entry = entrySet.entry

var file = fs.readFileSync(`./projects/${project.project}/${entry}.lg`).toString().split("\n");

let Ln = 0;

var tok = "";
/*
for(i in file) {
    console.log(file[i]);
}
*/

let fileStrings = "";

var cOpen = false;

for(let i = 0; i < file.length; i++) {
  Ln = i;
  fileStrings = file[i];
  let check = "";
  for(let r = 0; r < 100; r++){
    check = check + fileStrings[r];
    if(check == "~~"){
        if(cOpen) cOpen = false;
        if(!cOpen) cOpen = true;
    }
    if(!cOpen){
        for(let c in syntax){
            if(check == c){
                loadTok(c, fileStrings, r);
                break;
            }
        }
     }
  }
}

function loadTok(tempC, tempFile, tempR){
    let compile = tempFile.split(" ");
    tok = tok + `{${compile[0]}`;
    tok = tok + `[${compile[1]}]`;
    if(compile[2] !== ":"){
      error(`Syntax error. Expected ':' got '${compile[2]}'`, Ln, 2);  
    } else {
        tok = tok + `[${compile[3]}]`;
        if(compile[4] !== ":"){
            error(`Syntax error. Expected ':' got '${compile[4]}'`, Ln, 4);
        } else {
            tok = tok + `[${compile[5]}]}\n`;  
        }
        if(compile[6][0] !== ";"){
          error(`SyntaxError. Expected ';' got '${compile[6]}'`, Ln, 6);  
        }
        if(compile[7]){
            error(`Syntax error. Syntax overflow. Expected ' ' got ${compile[5]}`, Ln, 7);
        }
    }
}

function error(tempErr, tempLn, tempCo){
    throw(`Error Detected: ${tempErr} at Ln.${tempLn+1} Col${tempCo+1}`);
}

fs.writeFileSync(`./projects/${project.project}/${entry}.tok`, tok, (err) => {
  if(err){
    console.log(err);
    error("Build failed.", "END", "END");
  }
});

console.log("Compilation Finished!");
