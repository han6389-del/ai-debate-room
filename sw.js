/* AI 아이디어 토론방 — 폰 브라우저가 구버전 index.html을 계속 보여 주지 않도록
   캐시 세대를 올리고, 화면(내비게이션) 요청은 항상 네트워크에서 새로 받는다.
   같은 오리진의 상위 서비스워커가 이 경로를 캐시로 가로채는 것도 막는다. */
var CACHE = "adr-shell-v4-2026-11-22";

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(["./", "./index.html", "./sw.js"]);
    }).catch(function(){})
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        // 이 앱이 만든 옛 캐시만 지운다
        if(k !== CACHE && k.indexOf("adr-") === 0) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  if(e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" }).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put("./index.html", copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match("./index.html").then(function(r){ return r || caches.match(e.request); });
    })
  );
});
