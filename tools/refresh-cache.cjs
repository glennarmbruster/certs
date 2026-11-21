(function(){
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets','catalog.js'),'utf8'),{window});
const files=['index.html',...fs.readdirSync(path.join(root,'assets')).sort().map(f=>'assets/'+f),...window.catalog.exams.flatMap(e=>[e.slug+'/index.html',e.slug+'/guide.html',e.slug+'/questions.json'])];
const worker=path.join(root,'sw.js'),template=fs.readFileSync(worker,'utf8');
const manifest=template.replace(/^const FILES=.*;$/m,'const FILES='+JSON.stringify(files)+';');
const marker=/CACHE=PREFIX\+'[a-f0-9]+'/;if(!marker.test(manifest))throw Error('Cache version marker is missing.');
const hash=crypto.createHash('sha256').update(manifest.replace(marker,"CACHE=PREFIX+'VERSION'"));
for(const file of files)hash.update(file).update(fs.readFileSync(path.join(root,file)));
const version=hash.digest('hex').slice(0,16);
fs.writeFileSync(worker,manifest.replace(marker,"CACHE=PREFIX+'"+version+"'"));
console.log(files.length+' offline assets; cache version '+version);
})();