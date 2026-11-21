/* Shared grading, sampling and persistent progress. No network dependencies. */
(function (root) {
  'use strict';
  const prefix = 'atlas.v1.' + new URL('../', typeof document === 'undefined' ? 'https://test/assets/core.js' : document.currentScript.src).pathname + '.';
  function shuffled(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function isCorrect(selected, expected) {
    return selected.length === expected.length && expected.every(i => selected.includes(i));
  }
  function weighted(bank, domains, count) {
    const total = domains.reduce((sum, d) => sum + d.weight, 0);
    const groups = domains.map(d => {
      const items = shuffled(bank.filter(q => q.domain === d.name));
      const quota = count * d.weight / total;
      return {items, quota, take: Math.min(items.length, Math.floor(quota))};
    });
    let used = groups.reduce((s,g) => s + g.take, 0);
    while (used < count) {
      const available = groups.filter(g => g.take < g.items.length).sort((a,b) => (b.quota-b.take) - (a.quota-a.take));
      if (!available.length) break;
      available[0].take++; used++;
    }
    // Spread questions across topics before repeating one in the same domain.
    return shuffled(groups.flatMap(g => {
      const seen = new Set(), first = [], rest = [];
      for (const q of g.items) {
        (seen.has(q.docTopic) ? rest : first).push(q);
        seen.add(q.docTopic);
      }
      return first.concat(rest).slice(0,g.take);
    }));
  }
  function fresh(){return {items:{}, bookmarks:[], history:[], active:null};}
  function read(code) {
    try {return Object.assign(fresh(), JSON.parse(localStorage.getItem(prefix + code)) || {});} catch {return fresh();}
  }
  function write(code,state) {
    try {localStorage.setItem(prefix + code, JSON.stringify(state));return true;} catch {return false;}
  }
  function record(state, q, selected) {
    const hit = isCorrect(selected,q.correctAnswers);
    const prior = state.items[q.id] || {tries:0,hits:0};
    state.items[q.id] = {tries:prior.tries+1,hits:prior.hits+Number(hit),last:hit,domain:q.domain};
    return hit;
  }
  function score(hits,count){return count ? Math.round(1000 * hits / count) : 0;}
  function finish(state, byId) {
    const run=state.active;
    if (!run) return null;
    let hits=0;
    const rows = run.ids.map(id => {
      const q=byId.get(id), a=run.answers[id] || [];
      const hit=isCorrect(a,q.correctAnswers);
      if(run.mode==='exam' || !run.checked[id]) record(state,q,a);
      hits += Number(hit);
      return {id, selected:a, hit};
    });
    const result={mode:run.mode,at:Date.now(),count:rows.length,hits,score:score(hits,rows.length),rows};
    state.history.unshift(result);
    state.active=null;
    return result;
  }
  const api={shuffled,isCorrect,weighted,fresh,read,write,record,score,finish};
  root.Atlas=api;
  if(typeof module!=='undefined') module.exports=api;
})(globalThis);
