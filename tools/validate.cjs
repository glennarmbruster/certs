(function(){
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..');
const win={};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/catalog.js'),'utf8'),{window:win});
const ids=new Set(),codes=new Set(),allPrompts=new Set(),{weighted}=require('../assets/core.js');let total=0;
for(const e of win.catalog.exams){
 if(!e.available&&process.argv.includes('--partial'))continue;
 assert.ok(e.available,e.code+' bank missing');assert.ok(!codes.has(e.code));codes.add(e.code);
 const dir=path.join(root,e.slug), bank=JSON.parse(fs.readFileSync(path.join(dir,'questions.json'),'utf8')),guide=fs.readFileSync(path.join(dir,'guide.html'),'utf8');assert.equal(bank.length,e.count);
 const prompts=new Set(),topics=new Set(),types=new Set();
 for(const q of bank){
 const msg=q.id;assert.ok(typeof msg==='string'&&!ids.has(msg),msg);ids.add(msg);
 for(const key of ['question','docTopic','difficulty','topicId'])assert.ok(typeof q[key]==='string'&&q[key].trim().length>0,msg);
 assert.ok(e.domains.some(d=>q.domain===d.name),msg);assert.ok(!prompts.has(q.question),msg);prompts.add(q.question);allPrompts.add(q.question);
 assert.ok(['single','multi'].includes(q.type),msg);types.add(q.type);assert.ok(q.options.length>=3&&q.options.every(o=>typeof o==='string'&&o.trim())&&new Set(q.options).size===q.options.length,msg);
 assert.ok(q.correctAnswers.length>0&&q.correctAnswers.length<q.options.length&&q.correctAnswers.every(n=>Number.isInteger(n)&&n>=0&&n<q.options.length)&&new Set(q.correctAnswers).size===q.correctAnswers.length,msg);
 assert.equal(q.correctAnswers.length===1,q.type==='single',msg);
 assert.ok(typeof q.explanation.summary==='string'&&q.explanation.summary.length>20,msg);assert.equal(q.explanation.options.length,q.options.length,msg);assert.ok(q.explanation.options.every(v=>typeof v==='string'&&v.length>20),msg);assert.ok(guide.includes('id="'+q.topicId+'"'),msg);topics.add(q.docTopic);
 }
 assert.equal(types.size,2);const set=weighted(bank,e.domains,40);assert.equal(set.length,40);assert.equal(new Set(set.map(q=>q.id)).size,40);
 for(const d of e.domains){const share=set.filter(q=>q.domain===d.name).length*2.5;assert.ok(share>=d.min-0.01&&share<=d.max+0.01,`${e.code} ${d.name} ${share}%`);}
 console.log(`${e.code}: ${bank.length} questions, ${topics.size} guide topics, ${e.domains.length} domains; PASS`);total+=bank.length;
}
if(!process.argv.includes('--partial')){assert.equal(codes.size,10);assert.equal(total,2130);assert.equal(allPrompts.size,total,'duplicate question across banks');}
console.log(`Verified ${total} questions, ${ids.size} unique IDs, ${allPrompts.size} distinct stems across exams.`);
})();
