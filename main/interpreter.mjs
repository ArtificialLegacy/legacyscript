import settings from '../config.js';

const fs = settings.fs;

let project = JSON.parse(fs.readFileSync("./run.json", "utf8"));
let entrySet = JSON.parse(fs.readFileSync(`./projects/${project.project}/${project.project}.json`, "utf8"));
let entry = entrySet.entry

var file = fs.readFileSync(`./projects/${project.project}/${entry}.lg`).toString().split("\n");

let fileStrings = "";

import syntax from './index/methods.mjs';

var ln = 0;

for(let i = 0; i < file.length; i++) {
  ln = i;
  fileStrings = file[i];
  let check = "";
  for(let r = 0; r < 100; r++){
    check = check + fileStrings[r];
    for(let c in syntax){
      if(check == c){
        interpret(fileStrings, r, c);
        break;
      }
     }
  }
}

function interpret(tempFile, tempR, tempC){
  let compile = tempFile.split("[");
  for(i=0; i<compile.length; i++){
    let store = compile[i].split("]");
    compile[i] = store[0];
  }
  compile[0] = compile[0].substring(1);
  switch(tempC){
    case "init":
      break;
    case "method":
      break;
    case "run":
      break;
    case "math":
      break;
    case "print.cons":
      break;
    case "print.count":
      break;
    case "print.stime":
      break;
    case "print.etime":
      break;
    case "print.clear":
      break;
    case "print.warn":
      break;
    case "print.info":
      break;
    case "print.error":
      break;
    case "edit.round":
      break;
    case "edit.floor":
      break;
    case "edit.ceil":
      break;
    case "edit.flip":
      break;
    case "edit.abs":
      break;
    case "edit.del":
      break;
    case "construct.list":
      break;
    case "construct.map":
      break;
    case "index.list":
      break;
    case "index.map":
      break;
    case "set.random":
      break;
    case "set.min":
      break;
    case "set.max":
      break;
    case "set.sqr":
      break;
    case "if":
      break;
    case "end":
      break
    default:
      break;
  }
}

let globalScope = {
  "methods": {
    
  },
  "variables": {
    
  },
  "runs": {
  
  },
};

let localScope = {
  
};

let bin = {
  
};

class Var {
  constructor(tempName, tempValue, tempScope, tempType){
    this.name = tempName;
    this.value = tempValue;
    this.scope = tempScope;
    this.type = tempType;
  }
}

function createVar(tempName, tempValue, tempTag, tempScope){
  if(tempTag == "g"){
     globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "normal");
  } else if(tempTag == "l"){
    localScope[tempScope].variables[tempName] = new Var(tempName, tempValue, "local", "normal");
  } else if(tempTag == "c"){
    localScope[tempScope].variables[tempName] = new Var(tempName, tempValue, "local", "constant");
  } else if(tempTag == "p"){
    globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "constant");
  } else {
    error(`Syntax error. Invalid or missing tag. Got '${tempTag}'`,  ln+1, 6);
  }
}

class Method {
  constructor(tempName, tempParams, tempTag="d"){
    this.name = tempName;
    this.params = tempParams;
    this.tag = tempTag;
  }
}

function createMethod(tempName, tempParams, tempTag){
  let params = tempParams.split("(");
  params[1] = params[1].split(")");
  params = params[1][0].split(",");
  globalScope.methods[tempName] = new Method(tempName, params, tempTag);
}

function error(tempError, tempLn, tempCol){
  throw(`Error detected! ${tempError} at Ln.${tempLn} Col.${tempCol}`);
}
