import settings from '../config.js';

const fs = settings.fs;

let project = JSON.parse(fs.readFileSync("./compile.json", "utf8"));
let entrySet = JSON.parse(fs.readFileSync(`./projects/${project.project}/${project.project}.json`, "utf8"));
let entry = entrySet.entry

var file = fs.readFileSync(`./projects/${project.project}/${entry}.tok`).toString().split("\n");

let fileStrings = "";

import syntax from './index/methods.mjs';

var ln = 0;

var thread = 0;

var commands = [];

class Var {
  constructor(tempName, tempValue, tempScope, tempType){
    this.name = tempName;
    this.value = tempValue;
    this.scope = tempScope;
    this.type = tempType;
  }
}

class Init {
  constructor(tempName, tempValue, tempScope, tempType){
    this.name = tempName;
    this.value = tempValue;
    this.scope = tempScope;
    this.type = tempType;
  }
}

class Method {
  constructor(tempName, tempState, tempTag="d"){
    this.name = tempName;
    this.state = tempState;
    this.tag = tempTag;
  }
}

class Run {
  constructor(tempName, tempParams, tempTag, tempType){
    this.name = tempName;
    this.params = tempParams;
    this.tag = tempTag;
    this.type = tempType;
  }
}

class Ex {
  constructor(tempSet, tempOp, tempSetter){
    this.set = tempSet;
    this.op = tempOp;
    this.setter = tempSetter;
  }
}

class If {
  constructor(tempVar, tempOp, tempComp){
    this.var = tempVar;
    this.op = tempOp;
    this.comp = tempComp;
  }
}

var scope = [
  "global",
];
var scopeP = 0;

var open = 0;

let globalScope = {
  "methods": {
    
  },
  "variables": {
    
  },
  "runs": {
    "math": [
      
    ],
  },
  "ifs": {
    
  }
};

let localScope = {
  
};

for(let i = 0; i < file.length; i++) {
  ln = i;
  fileStrings = file[i];
  let check = "";
  for(let r = 0; r < 100; r++){
    check = check + fileStrings[r];
    for(let c in syntax){
      if(check == `{${c}`){
        interpret(fileStrings, r, c);
        break;
      }
     }
  }
}

function interpret(tempFile, tempR, tempC){
  let compile = tempFile.split("[");
  for(let i=0; i<compile.length; i++){
    let store = compile[i].split("]");
    compile[i] = store[0];
  }
  compile[0] = compile[0].substring(1);
  switch(tempC){
    case "init":
      if(scope[scopeP] == "global"){
	commands.push("gin");      
      } else {
	commands.push("lin");      
      }
      createInit(compile[1], compile[2], compile[3], scope[scopeP]);
      break;
    case "method":
      open++;
      createMethod(compile[1], compile[2], compile[3]);
      scopeP++;
      scope[scopeP] = (compile[1]);
      break;
    case "run":
      if(scope[scopeP] == "global"){
	 commands.push("gr");     
      } else {
	 commands.push("lr");
      }
      createRun(compile[1], compile[2], compile[3], "run", scope[scopeP]);
      break;
    case "math":
      if(scope[scopeP] == "global"){
	 commands.push("grm");
      } else {
	 commands.push("lrm");
      }
      createMath(compile[1], compile[2], compile[3], scope[scopeP]);
      break;
    case "if":
      if(scope[scopeP] == "global"){
	  commands.push("gi");    
      } else {
	  commands.push("li");    
      }
      open++;
      createIf(compile[1], compile[2], compile[3], scope[scopeP]);
      break;
    case "end":
      createEnd(compile[1], compile[2], compile[3]);
      break
    default:
      error("Syntax error. Unknown statement.", ln, 1);
      break;
  }
}

createVar("pi", "3.1415926535897545", "p", "global");

function createInit(tempName, tempValue, tempTag, tempScope){
  if(tempTag == "g"){
     if(globalScope.inits[tempName]){
	error(`Syntax error. ${tempName} already has a declaration.`, ln, 1);     
     }
     globalScope.inits[tempName] = new Init(tempName, tempValue, "global", "normal");
  } else if(tempTag == "l"){
     if(tempScope !== "global"){
	 if(!localScope[tempScope]) localScope[tempScope] = {};
	 if(!localScope[tempScope].inits) localScope[tempScope].inits = {};
	 if(localScope[tempScope.inits[tempName]){
	    error(`Syntax  error. ${tempName} already has a declaration.` ln, 1);
         }
         localScope[tempScope].inits[tempName] = new Init(tempName, tempValue, "local", "normal");
     } else {
         if(globalScope.inits[tempName]){
	    error(`Syntax error. ${tempName} already has a declaration.`, ln, 1);
	 }
         globalScope.inits[tempName] = new Init(tempName, tempValue, "global", "normal");
     }
    } else if(tempTag == "c"){
         if(tempScope !== "global"){
            if(!localScope[tempScope]) localScope[tempScope] = {};
            if(!localScope[tempScope].inits) localScope[tempScope].inits = {};
            if(localScope[tempScope].inits[tempName]){
               error(`Syntax error. ${tempName} already has a declaration.`, ln, 1);
            }
            localScope[tempScope].inits[tempName] = new Init(tempName, tempValue, "local", "constant");
         } else {
            if(globalScope.inits[tempName]){
               error(`Syntax error. ${tempName} already has a declaration.`, ln, 1);
            }
            globalScope.inits[tempName] = new Init(tempName, tempValue, "global", "constant");
         }
     } else if(tempTag == "p"){
        if(globalScope.inits[tempName]){
           error(`Syntax error. ${tempName} already has a declaration.`, ln, 1);
        }
        globalScope.inits[tempName] = new Init(tempName, tempValue, "global", "constant");
     }
  }
}

function createVar(tempName, tempValue, tempTag, tempScope){
  if(tempTag == "g"){
    if(globalScope.variables[tempName]){
      error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
    }
     globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "normal");
  } else if(tempTag == "l"){
    if(tempScope !== "global"){
	  if(!localScope[tempScope]) localScope[tempScope] = {};
	  if(!localScope[tempScope].variables) localScope[tempScope].variables = {};
      if(localScope[tempScope].variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      localScope[tempScope].variables[tempName] = new Var(tempName, tempValue, "local", "normal");
    } else {
      if(globalScope.variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "normal");
    }
  } else if(tempTag == "c"){
    if(tempScope !== "global"){
      if(localScope[tempScope].variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      localScope[tempScope].variables[tempName] = new Var(tempName, tempValue, "local", "constant");
    } else {
      if(globalScope.variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "constant");
    }
  } else if(tempTag == "p"){
    if(globalScope.variables[tempName]){
      error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
    }
    globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "constant");
  } else {
    error(`Syntax error. Invalid or missing tag. Got '${tempTag}'`,  ln, 6);
  }     globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "normal");
  } else if(tempTag == "l"){
    if(tempScope !== "global"){
	  if(!localScope[tempScope]) localScope[tempScope] = {};
	  if(!localScope[tempScope].variables) localScope[tempScope].variables = {};
      if(localScope[tempScope].variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      localScope[tempScope].variables[tempName] = new Var(tempName, tempValue, "local", "normal");
    } else {
      if(globalScope.variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "normal");
    }
  } else if(tempTag == "c"){
    if(tempScope !== "global"){
      if(localScope[tempScope].variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      localScope[tempScope].variables[tempName] = new Var(tempName, tempValue, "local", "constant");
    } else {
      if(globalScope.variables[tempName]){
        error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
      }
      globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "constant");
    }
  } else if(tempTag == "p"){
    if(globalScope.variables[tempName]){
      error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
    }
    globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "constant");
  } else {
    error(`Syntax error. Invalid or missing tag. Got '${tempTag}'`,  ln, 6);
  }
}

createMethod("print.cons", "s", "i");
createMethod("print.clear", "s", "i");
createMethod("print.info", "s", "i");
createMethod("print.warn", "s", "i");
createMethod("print.count", "s", "i");
createMethod("print.stime", "s", "i");
createMethod("print.etime", "s", "i");
createMethod("edit.round", "s", "i");
createMethod("edit.floor", "s", "i");
createMethod("edit.ceil", "s", "i");
createMethod("edit.flip", "s", "i");
createMethod("edit.abs", "s", "i");
createMethod("edit.del", "s", "i");
createMethod("construct.list", "s", "i");
createMethod("construct.map", "s", "i");
createMethod("index.list", "s", "i");
createMethod("index.map", "s", "i");
createMethod("set.random", "s", "i");
createMethod("set.min", "s", "i");
createMethod("set.max", "s", "i");
createMethod("set.sqr", "s", "i");

function createMethod(tempName, tempState, tempTag){
  if(globalScope.methods[tempName] || tempName == "math"){
    error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
  }
  globalScope.methods[tempName] = new Method(tempName, tempState, tempTag);
}

function createRun(tempName, tempParams, tempTag, tempType, tempScope){
  let params = tempParams.split("(");
  params[1] = params[1].split(")");
  params = params[1][0].split(",");
  if(tempScope == "global"){
  if(!globalScope.runs[tempName]) globalScope.runs[tempName] = [];
    globalScope.runs[tempName].push(new Run(tempName, params, tempTag, tempType));
  } else {
	if(!localScope[tempScope]) localScope[tempScope] = {};
	if(!localScope[tempScope].runs) localScope[tempScope].runs = {};
	if(!localScope[tempScope].runs[tempName]) localScope[tempScope].runs[tempName] = [];
    localScope[tempScope].runs[tempName].push(new Run(tempName, params, tempTag, tempType));
  }
}

function createMath(tempSet, tempOp, tempSetting, tempScope){
  if(tempScope == "global"){
    globalScope.runs.math.push(new Ex(tempSet, tempOp, tempSetting));
  } else {
	if(!localScope[tempScope]) localScope[tempScope] = {};
	if(!localScope[tempScope].runs) localScope[tempScope].runs = {};
	if(!localScope[tempScope].runs.math) localScope[tempScope].runs.math = [];
    localScope[tempScope].runs.math.push(new Ex(tempSet, tempOp, tempSetting));
  }
}

function createEnd(tempParams, tempState, tempTag, tempScope){
  let param = tempParams.split("(");
  param = param[1].split(")");
  param = param[0];
  param = parseInt(param);
  open -= param;
  if(open < 0){
   error("Syntax error. Unexpected end statement.", ln, 1);
  }
  for(let i=0; i<param; i++){
    delete scope[scopeP];
  }
   scopeP--;
}

function createIf(tempVar, tempOp, tempComp, tempScope){
  scopeP++;
  scope[scopeP] = thread;	
  if(tempScope == "global"){
    globalScope.ifs.push(new If(tempVar, tempOp, tempComp));
  } else {
    localScope[tempScope].ifs.push(new If(tempVar, tempOp, tempComp));
  }
}

function error(tempError, tempLn, tempCol){
  throw(`Error detected! ${tempError} at Ln.${tempLn+1} Col.${tempCol}`);
}

console.log("Interpretted Code.");
