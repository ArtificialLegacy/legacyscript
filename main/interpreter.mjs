import settings from '../config.js';

const fs = settings.fs;

let project = JSON.parse(fs.readFileSync("./compile.json", "utf8"));
let entrySet = JSON.parse(fs.readFileSync(`./projects/${project.project}/${project.project}.json`, "utf8"));
let entry = entrySet.entry

var file = fs.readFileSync(`./projects/${project.project}/${entry}.tok`).toString().split("\n");

let fileStrings = "";

import syntax from './index/methods.mjs';
import operators from './index/operators.mjs';

var ln = 0;

var thread = 0;

var pointerGR = 0;
var pointerGRM = 0;
var pointerLR = 0;
var pointerLRM = 0;
var pointerGI = 0;
var pointerLI = 0;
var pointerGIN = 0;
var pointerLIN = 0;

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
    "normal": [
	    
    ]
  },
  "ifs": [
    
  ],
  "inits": [
		
   ],
   "commands": [
	   
   ]
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
	globalScope.commands.push("gin");      
      } else {
	createScope(scope[scopeP]);
	localScope[scope[scopeP]].commands.push("lin");      
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
	 globalScope.commands.push("gr");     
      } else {
	 createScope(scope[scopeP]);
	 localScope[scope[scopeP]].commands.push("lr");
      }
      createRun(compile[1], compile[2], compile[3], "run", scope[scopeP]);
      break;
    case "math":
      if(scope[scopeP] == "global"){
	 globalScope.commands.push("grm");
      } else {
	 createScope(scope[scopeP]);
	 localScope[scope[scopeP]].commands.push("lrm");
      }
      createMath(compile[1], compile[2], compile[3], scope[scopeP]);
      break;
    case "if":
      if(scope[scopeP] == "global"){
	  globalScope.commands.push("gi");    
      } else {
	  createScope(scope[scopeP]);
	  localScope[scope[scopeP]].commands.push("li");    
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

function createScope(tempName){
	if(!localScope[tempName]) localScope[tempName] = {};
	if(!localScope[tempName].inits) localScope[tempName].inits = [];
	if(!localScope[tempName].runs) localScope[tempName].runs = {"normal": [],"math": [], };
	if(!localScope[tempName].ifs) localScope[tempName].ifs = [];
	if(localScope[tempName].variables) localScope[tempName].variables = {};
	if(!localScope[tempName].commands) localScope[tempName].commands = [];
}

createVar("pi", "3.1415926535897454", "constant", "global");
createVar("undefined", "undefined", "constant", "global");
createVar("null", "null", "constant", "global");
createVar("true", "true", "constant", "global");
createVar("false", "false", "constant", "global");

function createInit(tempName, tempValue, tempTag, tempScope){
  if(tempTag == "g"){
     if(globalScope.inits[tempName]){
	error(`Syntax error. ${tempName} already has a declaration.`, ln, 1);     
     }
     globalScope.inits[tempName] = new Init(tempName, tempValue, "global", "normal");
  } else if(tempTag == "l"){
     if(tempScope !== "global"){
	 createScope(tempScope);
         localScope[tempScope].inits.push(new Init(tempName, tempValue, "local", "normal"));
     } else {
         globalScope.inits.push(new Init(tempName, tempValue, "global", "normal"));
     }
    } else if(tempTag == "c"){
         if(tempScope !== "global"){
            createScope();
            localScope[tempScope].inits.push(new Init(tempName, tempValue, "local", "constant"));
         } else {
            globalScope.inits.push(new Init(tempName, tempValue, "global", "constant"));
         }
     } else if(tempTag == "p"){
        globalScope.inits.push(new Init(tempName, tempValue, "global", "constant"));
     }
 }

function createVar(tempName, tempValue, tempTag, tempScope){
console.log("test");
  if(tempTag == "g"){
    if(globalScope.variables[tempName]){
      error(`Syntax error. ${tempName} has already been defined.`, ln, 2);
    }
     globalScope.variables[tempName] = new Var(tempName, tempValue, "global", "normal");
  } else if(tempTag == "l"){
    if(tempScope !== "global"){
      createScope(tempScope);
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
	createScope(tempScope);
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
    globalScope.runs.normal.push(new Run(tempName, params, tempTag, tempType));
  } else {
    createScope(tempScope);
    localScope[tempScope].runs.normal.push(new Run(tempName, params, tempTag, tempType));
  }
}

function createMath(tempSet, tempOp, tempSetting, tempScope){
  if(tempScope == "global"){
    globalScope.runs.math.push(new Ex(tempSet, tempOp, tempSetting));
  } else {
    createScope(tempScope);
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
	  createScope(tempScope);
	  localScope[tempScope].commands.push("e");
    	  delete scope[scopeP];
  }
   scopeP -= param;
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

scope = ["global"];
scopeP = 0;

function runCode(){
	for(let i=0; i<globalScope.commands.length; i++){
		loadCode(i, globalScope.commands[i]);
	}
}

function loadCode(i, s){
	switch(s){
		case "gr":
			let run = globalScope.runs.normal[pointerGR];
			if(!globalScope.methods[run.name]){
				error(`Syntax error. ${run.name} is not defined.`);	
			}
			createScope(run.name);
			for(let c=0; c<run.params; c++){
				localScope[run.name].variables[run.params[c].name] = run.params[c];	
			}
			scope.push(run.name);
			scopeP++;
			for(let z=0; z<localScope[run.name].commands.length; z++){
				loadCode(z, localScope[run.name].commands[z]);
			}
			pointerGR++;
			break;
		case "grm":
			let math = globalScope.runs.math[pointerGIN];
			if(!globalScope.variables[math.set] || !globalScope.variables[math.setting] || !operators[math.op]){
				error(`Syntax error. Missing or invalid arguments.`, ln, 1);
			}
			let x = parseInt(globalScope.variables[math.set].value);
			let y = parseInt(globalScope.variables[math.setting].value);
			if(isNaN(x) || isNaN(y)) error(`Syntax error. You cannot do math on strings.`);
			let z = 0;
			switch(math.op){
				case "+":
					z = x + y;
					break;
				case "-":
					z = x - y;
					break;
				case "*":
					z = x * y;
					break;
				case "/":
					z = x / y;
					break;
				case "%":
					z = x % y;
					break;
				case "^":
					let s = x;
					for(let c=0; c<y; c++){
						x = x * s;	
					}
					z = x;
					break;
				case "=":
					z = y;
					break;
				default:
					error(`Syntax error. Unknown operator.`, ln, 1);
					break;
			}
			z = toString(z);
			globalScope.variables[math.set].value = z;
			pointerGRM++;
			break;
		case "lr":
			let run = localScope[scope[scopeP]].runs.normal[pointerLR];
			if(!localScope[scope[scopeP]].methods[run.name]){
				error(`Syntax error. ${run.name} is not defined.`);	
			}
			if(run.tag == "i"){
				runI(run);
				break;
			}
			createScope(run.name);
			for(c=0; c<run.params; c++){
				localScope[run.name].variables[run.params[c].name] = run.params[c];	
			}
			scope.push(run.name);
			scopeP++;
			for(z=0; z<localScope[run.name].commands.length; z++){
				loadCode(z, localScope[run.name].commands[z]);
			}
			pointerLR++;
			break;
		case "lrm":
			createScope(scope[scopeP]);
			let math = localScope[scope[scopeP]].runs.math[pointerLIN];
			if(!localScope[scope[scopeP]].variables[math.set] || !localScope[scope[scopeP]].variables[math.setting] || !operators[math.op]){
				error(`Syntax error. Missing or invalid arguments.`, ln, 1);
			}
			let x = parseInt(localScope[scope[scopeP]].variables[math.set].value);
			let y = parseInt(localScope[scope[scopeP]].variables[math.setinng].value);
			if(isNaN(x) || isNaN(y)) error(`Syntax error. You cannot do math on strings.`);
			let z = 0;
			switch(math.op){
				case "+":
					z = x + y;
					break;
				case "-":
					z = x - y;
					break;
				case "*":
					z = x * y;
					break;
				case "/":
					z = x / y;
					break;
				case "%":
					z = x % y;
					break;
				case "^":
					let s = x;
					for(let c=0; c<y; c++){
						x = x * s;	
					}
					z = x;
					break;
				default:
					error(`Syntax error. Unknown operator.`, ln, 1);
					break;
			}
			x = toString(x);
			localScope[scope[scopeP]].variables[math.set].value = x;
			pointerLRM++;
			break;
		case "gi":
			pointerGI++;
			break;
		case "li":
			pointerLI++;
			break;
		case "gin":
			let init = globalScope.ints[pointerGIN];
			if(globalScope.variables[init.name]){
				error(`Syntax error. ${init.name} has already been defined.`);	
			}
			createVar(init.name, init.value, init.tag, scope[scopeP]);
			pointerGIN++;
			break;
		case "lin":
			createScope(scope[scopeP]);
			let init = localScope[scope[scopeP]].ints[pointerLIN];
			if(localScope[scope[scopeP]].variables[init.name]){
				error(`Syntax error. ${init.name} has already been defined.`);	
			}
			createVar(init.name, init.value, init.tag, scope[scopeP]);
			pointerLIN++;
			break;
		case "e":
			delete scope[scopeP]
			scopeP--;
			break;
		default:
			error(`Unkown parsing command. Got ${commands[i]}.`, i, 1);
			break;
	}
}

function runI(tempRun){
	switch(tempRun.name){
		case "print.cons":
			break;
	}
}
