'use strict';
// Safe one-way GitHub updater for the Vietnamese Windows build only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const TAG='mineradio-vn-auto',MANIFEST='latest-vn.json';
const HOSTS=new Set(['github.com','api.github.com','objects.githubusercontent.com','release-assets.githubusercontent.com','github-releases.githubusercontent.com']);
function trustedUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&HOSTS.has(u.hostname);}catch(_){return false;}}
async function request(url,timeout=20000){
  if(!trustedUrl(url))throw Error('UNTRUSTED_URL');
  for(let i=0;i<6;i++){
    const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(timeout),headers:{'User-Agent':'Mineradio-vn-update','Accept':'application/json,application/octet-stream'}});
    if([301,302,303,307,308].includes(r.status)){
      const location=r.headers.get('location');
      if(!location)throw Error('MISSING_REDIRECT');
      const next=new URL(location,url).href;
      if(!trustedUrl(next))throw Error('UNTRUSTED_REDIRECT');
      if(r.body)await r.body.cancel().catch(()=>{});
      url=next;continue;
    }
    if(!r.ok)throw Error('UPDATE_HTTP_'+r.status);
    return r;
  }
  throw Error('TOO_MANY_REDIRECTS');
}
async function readJSON(url){
  const r=await request(url,15000),chunks=[];let size=0;
  for await(const chunk of r.body){size+=chunk.length;if(size>262144)throw Error('METADATA_TOO_LARGE');chunks.push(Buffer.from(chunk));}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
async function validInstaller(file,a){
  try{
    const stat=await fs.promises.stat(file);if(!stat.isFile()||stat.size!==a.size)return false;
    const h=await fs.promises.open(file,'r'),mz=Buffer.alloc(2);
    try{await h.read(mz,0,2,0);}finally{await h.close();}
    if(mz.toString('ascii')!=='MZ')return false;
    const hash=crypto.createHash('sha256');
    for await(const chunk of fs.createReadStream(file))hash.update(chunk);
    return hash.digest('hex')===a.sha256;
  }catch(_){return false;}
}
async function download(url,file,a,onProgress){
  const response=await request(url,25000),part=file+'.part',hash=crypto.createHash('sha256');
  let fd=null,count=0;
  try{
    fd=await fs.promises.open(part,'w',0o600);
    for await(const chunk of response.body){
      count+=chunk.length;if(count>a.size)throw Error('UPDATE_SIZE_MISMATCH');
      await fd.write(chunk);hash.update(chunk);
      if(onProgress)onProgress(Math.floor(100*count/a.size));
    }
    await fd.close();fd=null;
    if(count!==a.size||hash.digest('hex')!==a.sha256)throw Error('UPDATE_SHA256_MISMATCH');
    await fs.promises.rename(part,file);
    if(!await validInstaller(file,a))throw Error('UPDATE_BAD_EXE');
  }catch(e){
    if(fd)await fd.close().catch(()=>{});
    await fs.promises.rm(part,{force:true}).catch(()=>{});
    await fs.promises.rm(file,{force:true}).catch(()=>{});
    throw e;
  }
}
function validateManifest(m){
  if(!m||m.schema!==1||m.channel!=='vi-VN'||!Number.isSafeInteger(m.buildNumber)||m.buildNumber<1||!/^[a-f0-9]{40}$/.test(m.commit||''))throw Error('INVALID_MANIFEST');
  const a=m.artifact;
  if(!a||a.name!=='Mineradio-VN-'+m.commit.slice(0,12)+'-Setup.exe'||!Number.isSafeInteger(a.size)||a.size<65536||a.size>850*1024*1024||!/^[a-f0-9]{64}$/.test(a.sha256||''))throw Error('INVALID_ARTIFACT');
  return m;
}
class GithubVnAutoUpdater{
  constructor(opts={}){
    this.owner=opts.owner||'28022005hpd-create';this.repo=opts.repo||'Mineradio_vn';
    if(!/^[a-z0-9_.-]+$/i.test(this.owner)||!/^[a-z0-9_.-]+$/i.test(this.repo))throw Error('INVALID_REPO');
    this.enabled=opts.enabled===true;this.buildNumber=Number(opts.buildNumber)||0;
    this.directory=path.join(opts.userData||'.','github-vn-updates');
    this.readJSON=opts.readJSON||readJSON;this.download=opts.download||download;
    this.onStatus=opts.onStatus||function(){};
    this.state={status:this.enabled?'idle':'disabled',buildNumber:this.buildNumber,latestBuild:0,progress:0,error:'',releaseUrl:''};
    this.pending=null;this.file='';this.artifact=null;
  }
  snapshot(){return Object.assign({},this.state);}
  status(value){Object.assign(this.state,value);this.onStatus(this.snapshot());}
  async check(){
    if(!this.enabled)return this.snapshot();
    if(this.pending)return this.pending;
    this.pending=this.checkOnce().catch(e=>{this.status({status:'error',error:e.message||'UPDATE_FAILED'});return this.snapshot();}).finally(()=>{this.pending=null;});
    return this.pending;
  }
  async checkOnce(){
    this.status({status:'checking',error:''});
    const root='https://github.com/'+this.owner+'/'+this.repo+'/releases/download/'+TAG+'/';
    const release=await this.readJSON('https://api.github.com/repos/'+this.owner+'/'+this.repo+'/releases/tags/'+TAG);
    if(!release||release.tag_name!==TAG||!release.prerelease||release.draft||!Array.isArray(release.assets))throw Error('CHANNEL_NOT_READY');
    const manifestAsset=release.assets.find(a=>a.name===MANIFEST);
    if(!manifestAsset||manifestAsset.browser_download_url!==root+MANIFEST)throw Error('MANIFEST_NOT_READY');
    const m=validateManifest(await this.readJSON(root+MANIFEST));
    const asset=release.assets.find(a=>a.name===m.artifact.name);
    if(!asset||asset.browser_download_url!==root+m.artifact.name||Number(asset.size)!==m.artifact.size)throw Error('ASSET_NOT_READY');
    const info={latestBuild:m.buildNumber,releaseUrl:'https://github.com/'+this.owner+'/'+this.repo+'/releases/tag/'+TAG};
    if(m.buildNumber<=this.buildNumber){this.status({...info,status:'up-to-date',progress:100});return this.snapshot();}
    await fs.promises.mkdir(this.directory,{recursive:true});
    const target=path.join(this.directory,m.artifact.name);
    if(!await validInstaller(target,m.artifact)){
      this.status({...info,status:'downloading',progress:0});let last=-1;
      await this.download(root+m.artifact.name,target,m.artifact,p=>{if(p>=last+3||p===100){last=p;this.status({status:'downloading',progress:p});}});
    }
    if(!await validInstaller(target,m.artifact))throw Error('SHA256_MISMATCH');
    this.file=target;this.artifact=m.artifact;this.status({...info,status:'ready',progress:100});
    return this.snapshot();
  }
  async verifiedFile(){
    if(this.state.status!=='ready'||!this.file||!this.artifact)return null;
    if(await validInstaller(this.file,this.artifact))return this.file;
    this.status({status:'error',error:'SHA256_MISMATCH'});return null;
  }
}
function installerLaunchScript(installer,dir,exe,pid){
  const q=s=>"'"+String(s).replace(/'/g,"''")+"'";
  return [
    '$oldProcessId = '+Math.floor(pid),
    'for ($i = 0; $i -lt 100; $i++) {',
    ' if (-not (Get-Process -Id $oldProcessId -ErrorAction SilentlyContinue)) { break }',
    ' Start-Sleep -Milliseconds 350',
    '}',
    'Start-Sleep -Seconds 2',
    '$result = Start-Process -FilePath '+q(installer)+' -ArgumentList @('+q('/S')+','+q('/D='+dir)+') -Wait -PassThru',
    'if ($result.ExitCode -eq 0 -and (Test-Path -LiteralPath '+q(exe)+')) { Start-Process -FilePath '+q(exe)+' }'
  ].join('\n');
}
module.exports={TAG,MANIFEST,trustedUrl,validateManifest,validInstaller,GithubVnAutoUpdater,installerLaunchScript};
