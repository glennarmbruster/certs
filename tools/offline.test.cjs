(function(){
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),vm=require('node:vm');
test('all exam entry points, guides and banks resolve from cache when the static host is offline', async()=>{
 const root=path.resolve(__dirname,'..'),scope='https://example.test/pages/certification/',routes={},stores=new Map();let online=true;
 const fetchSite=async(request)=>{assert.ok(online,'A cached route tried to reach the network');const url=new URL(request.url||request);assert.ok(url.href.startsWith(scope));return new Response(await fs.readFile(path.join(root,url.href.slice(scope.length))));};
 const cacheAPI={
  async open(key){if(!stores.has(key))stores.set(key,new Map());const store=stores.get(key);return {
   async addAll(requests){const entries=await Promise.all(requests.map(async r=>[r.url,await fetchSite(r)]));for(const entry of entries)store.set(...entry);},
   async match(url){return store.get(url)?.clone();}
  };},async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);}
 };
 const worker=await fs.readFile(path.join(root,'sw.js'),'utf8');vm.runInNewContext(worker,{self:{registration:{scope},clients:{claim:async()=>{}},addEventListener:(key,fn)=>{routes[key]=fn;}},Request,URL,caches:cacheAPI,fetch:fetchSite});
 async function lifetime(name){let pending;routes[name]({waitUntil(p){pending=p;}});await pending;}
 async function cached(url){let response;routes.fetch({request:new Request(scope+url),respondWith(p){response=p;}});return (await response).text();}
 await lifetime('install');await lifetime('activate');online=false;
 assert.match(await cached(''),/<title>Study dashboard/);
 const window={};vm.runInNewContext(await cached('assets/catalog.js'),{window});
 for(const e of window.catalog.exams){assert.match(await cached(e.slug+'/'),/id="main"/);assert.match(await cached(e.slug+'/guide.html'),/id="guide-search"/);assert.equal(JSON.parse(await cached(e.slug+'/questions.json')).length,e.count);}
});
})();