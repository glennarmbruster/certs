(function(){
const test=require('node:test'),assert=require('node:assert/strict'),core=require('../assets/core.js');
const domains=[{name:'One',weight:37.5},{name:'Two',weight:62.5}];
const bank=Array.from({length:200},(_,i)=>({id:'t'+i,docTopic:'Topic '+i%13,domain:domains[i%2].name,correctAnswers:i%2?[0]:[1,2]}));
test('exam sampling is unique, bounded and apportioned',()=>{for(let i=0;i<20;i++){const set=core.weighted(bank,domains,40);assert.equal(set.length,40);assert.equal(new Set(set.map(q=>q.id)).size,40);assert.equal(set.filter(q=>q.domain==='One').length,15);}assert.equal(core.weighted(bank.slice(0,2),domains,40).length,2);});
test('multi-select uses exact sets',()=>{assert.ok(core.isCorrect([2,1],[1,2]));for(const a of [[],[1],[2,1,0],[2,2]])assert.equal(core.isCorrect(a,[1,2]),false);});
test('practice is recorded once; later correct answer clears missed status',()=>{const s=core.fresh(),q=bank[1];core.record(s,q,[1]);assert.equal(s.items[q.id].last,false);core.record(s,q,[0]);s.active={ids:[q.id],mode:'practice',answers:{[q.id]:[0]},checked:{[q.id]:true}};core.finish(s,new Map([[q.id,q]]));assert.equal(s.items[q.id].tries,2);assert.equal(s.items[q.id].last,true);assert.equal(s.history[0].score,1000);assert.equal(core.finish(s,new Map()),null);});
test('timed submission grades unanswered and persists rows',()=>{const s=core.fresh();s.active={mode:'exam',ids:bank.slice(0,10).map(q=>q.id),answers:Object.fromEntries(bank.slice(0,7).map(q=>[q.id,q.correctAnswers])),checked:{}};core.finish(s,new Map(bank.map(q=>[q.id,q])));assert.equal(s.history[0].score,700);assert.equal(Object.keys(s.items).length,10);assert.equal(s.history[0].rows.filter(x=>!x.hit).length,3);});
})();
