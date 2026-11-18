'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {LoginEasterEggGate}=require('../desktop/login-easter-egg-gate');
test('Vietnamese direct login bypasses wish puzzle without deleting saved login sessions',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mineradio-direct-login-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.writeFileSync(path.join(root,'.cookie'),'saved-session');
 const gate=new LoginEasterEggGate({userDataPath:root,disabled:true});
 let startupClears=0;
 const state=await gate.initialize(()=>{startupClears++;});
 assert.equal(state.unlocked,true);
 assert.equal(state.bypassed,true);
 assert.equal(gate.isUnlocked(),true);
 assert.equal(startupClears,0);
 assert.equal(fs.readFileSync(path.join(root,'.cookie'),'utf8'),'saved-session');
 assert.equal(gate.unlock('anything').unlocked,true);
 const logout=await gate.resetForReplay(()=>{startupClears++;});
 assert.equal(logout.ok,true);
 assert.equal(logout.bypassed,true);
 assert.equal(logout.unlocked,true);
 assert.equal(fs.existsSync(path.join(root,'.cookie')),false);
 assert.equal(startupClears,1);
 assert.equal((await gate.initialize()).unlocked,true);
});
test('only Vietnamese desktop build disables gate while backend is unlocked',()=>{
 const root=path.join(__dirname,'..');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const beta=JSON.parse(fs.readFileSync(path.join(root,'electron-builder.internal-beta.json'),'utf8'));
 const main=fs.readFileSync(path.join(root,'desktop/main.js'),'utf8');
 const logout=fs.readFileSync(path.join(root,'public/js/modules/08-account/04-user-modal-logout.js'),'utf8');
 assert.equal(pkg.mineradio.loginEasterEggEnabled,false);
 assert.notEqual(beta.extraMetadata.mineradio.loginEasterEggEnabled,false);
 assert.match(main,/disabled: APP_METADATA\.loginEasterEggEnabled === false && APP_METADATA\.internalBeta !== true/);
 assert.match(main,/MINERADIO_LOGIN_EASTER_EGG_GATE_FILE = loginEasterEggGate\.disabled/);
 assert.match(logout,/result\.bypassed/);
});


test('login modal resolves gate state before opening to avoid wish-screen flash',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../public/js/modules/08-account/03-login-modal-flows.js'),'utf8');
 const start=source.indexOf('async function showLoginModal(opts)');
 const end=source.indexOf('function resumeLoginModalAfterGate()',start);
 const section=source.slice(start,end);
 assert.ok(section.indexOf('await prepareLoginEasterEggGate()')>=0);
 assert.ok(section.indexOf('openGsapModal(modal)')>section.indexOf('await prepareLoginEasterEggGate()'));
 assert.doesNotMatch(section,/setLoginEasterEggMode\(true\)/);
});
