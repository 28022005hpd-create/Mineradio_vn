'use strict';
// CI must test the INSTALLED app payload, not just the repository sources.
// Eagerly required modules in server.js must resolve and the local API server
// must successfully reach listening state with no user credentials or network.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire, builtinModules } = require('node:module');
const { spawn } = require('node:child_process');

const appRoot = process.argv[2] && path.resolve(process.argv[2]);
if (!appRoot || !fs.existsSync(path.join(appRoot,'server.js'))) {
  console.error('BLOOM_BOOT_SMOKE_FAIL: expected extracted resources/app folder');
  process.exit(2);
}
const builtin = new Set(builtinModules.map(x=>x.replace(/^node:/,'')));
const examined = new Set();
const stack = [path.join(appRoot,'server.js'),path.join(appRoot,'desktop','main.js')];
const missing = [];
while (stack.length) {
  const entry = stack.pop();
  if (examined.has(entry)) continue;
  examined.add(entry);
  let content;
  try { content = fs.readFileSync(entry,'utf8'); } catch(err) {
    missing.push({from:entry,module:'<file>',reason:err.message});continue;
  }
  // Follow literal relative requires reachable from the Electron main process
  // and local server. Dynamic / optional requires must be tested separately.
  const regex = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const req=createRequire(entry);
  let m;
  while ((m=regex.exec(content))) {
    const id=m[1];
    if (builtin.has(id.replace(/^node:/,'')) || id === 'electron') continue; // Electron injects its own builtin
    try {
      const target=req.resolve(id);
      if (id.startsWith('.') && target.endsWith('.js') && target.startsWith(appRoot+path.sep)) {
        stack.push(target);
      }
    } catch(err) {
      missing.push({from:path.relative(appRoot,entry),module:id,reason:err.message});
    }
  }
}
if (missing.length) {
  missing.forEach(x=>console.error('MISSING_SHIPPED_REQUIRE',JSON.stringify(x)));
  console.error('BLOOM_BOOT_SMOKE_FAIL: '+missing.length+' unresolved packaged imports');
  process.exit(3);
}
console.log('BLOOM_PACKAGE_REQUIRE_GRAPH_PASS files='+examined.size);

const probe=String.raw`
'use strict';
const path=require('node:path');
const appRoot=process.argv[1];
let server;
try { server=require(path.join(appRoot,'server.js')); }
catch(err){ console.error('BLOOM_SERVER_REQUIRE_FAIL:',err && err.stack || err); process.exit(5); }
const timer=setTimeout(()=>{console.error('BLOOM_SERVER_START_TIMEOUT');process.exit(6);},10000);
function finish(){
  clearTimeout(timer);
  console.log('BLOOM_SERVER_START_LISTENING_PASS');
  server.close(()=>process.exit(0));
}
if(server.listening)finish();
else {
  server.once('listening',finish);
  server.once('error',err=>{console.error('BLOOM_SERVER_LISTEN_FAIL',err);process.exit(7);});
}
`;
const child=spawn(process.execPath,['-e',probe,appRoot],{
  cwd:appRoot,
  env:{
    ...process.env, PORT:'0',HOST:'127.0.0.1',
    MINERADIO_UPDATE_REPOSITORY:'',MINERADIO_UPDATE_MANIFEST:'',
    COOKIE_FILE:path.join(appRoot,'__ci_test_nonexistent_cookie'),
    QQ_COOKIE_FILE:path.join(appRoot,'__ci_test_nonexistent_qq_cookie'),
    KUGOU_COOKIE_FILE:path.join(appRoot,'__ci_test_nonexistent_kugou_cookie'),
    QISHUI_COOKIE_FILE:path.join(appRoot,'__ci_test_nonexistent_qishui_cookie')
  },
  windowsHide:true,stdio:['ignore','pipe','pipe']
});
let stdout='',stderr='',completed=false;
child.stdout.on('data',d=>{stdout+=d.toString();if(stdout.length>32000)stdout=stdout.slice(-32000);});
child.stderr.on('data',d=>{stderr+=d.toString();if(stderr.length>32000)stderr=stderr.slice(-32000);});
const watchdog=setTimeout(()=>{
  if(!completed){console.error('BLOOM_SERVER_TEST_HUNG');child.kill();process.exitCode=8;}
},15000);
child.on('error',err=>{console.error('BLOOM_SERVER_LAUNCH_ERROR',err);process.exitCode=9;});
child.on('close',code=>{
  completed=true;clearTimeout(watchdog);
  if(code!==0||!stdout.includes('BLOOM_SERVER_START_LISTENING_PASS')){
    console.error('BLOOM_PACKAGED_SERVER_BOOT_FAIL exit='+code+'\n'+stdout+'\n'+stderr);
    process.exitCode=code||10;
  } else console.log('BLOOM_PACKAGED_SERVER_BOOT_PASS');
});
