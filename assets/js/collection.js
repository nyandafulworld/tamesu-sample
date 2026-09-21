/* =================================================================
   TAMESU（仮称） — collection ページ固有JS
   絞り込み（用途・メーカー・種別・ランク／AND）・並び替え・
   「迷ったらこの3台」・ランク表を data.js から描画する。
   ================================================================= */
(function(){
  "use strict";

  var DATA = window.TAMESU_DATA;
  var TAMESU = window.TAMESU;
  if(!DATA || !TAMESU) return;

  function run(name, fn){
    try{ fn(); }
    catch(e){ if(window.console && console.warn) console.warn("[collection.js]", name, e); }
  }
  function each(list, fn){ for(var i=0;i<list.length;i++) fn(list[i], i); }
  function pad2(n){ n = String(n); return n.length < 2 ? ("0" + n) : n; }

  var products = DATA.products || [];
  var selected = {use:{}, maker:{}, type:{}, rank:{}};
  var currentSort = "reco";

  var TYPE_LABELS = {body:"ボディ", lens:"レンズ", cine:"シネマ", compact:"コンパクト"};
  var TYPE_ORDER = ["body", "lens", "cine", "compact"];
  var RANK_ORDER = ["S", "A", "B"];

  /* ---------------- 選択肢の組み立て ---------------- */
  function buildOptions(group){
    if(group === "use"){
      var opts = [];
      for(var key in DATA.uses){
        if(!DATA.uses.hasOwnProperty(key)) continue;
        var count = 0;
        each(products, function(p){ if(p.uses && p.uses.indexOf(key) > -1) count++; });
        opts.push({value:key, label:DATA.uses[key].name, count:count});
      }
      return opts;
    }
    if(group === "maker"){
      var seen = {}, list = [];
      each(products, function(p){
        if(seen[p.maker]) return;
        seen[p.maker] = true;
        var c = 0;
        each(products, function(q){ if(q.maker === p.maker) c++; });
        list.push({value:p.maker, label:p.maker, count:c});
      });
      return list;
    }
    if(group === "type"){
      var tlist = [];
      each(TYPE_ORDER, function(t){
        var c = 0;
        each(products, function(p){ if(p.type === t) c++; });
        if(c > 0) tlist.push({value:t, label:TYPE_LABELS[t] || t, count:c});
      });
      return tlist;
    }
    if(group === "rank"){
      var rlist = [];
      each(RANK_ORDER, function(r){
        var c = 0;
        each(products, function(p){ if(p.rank === r) c++; });
        if(c > 0) rlist.push({value:r, label:"RANK " + r, count:c});
      });
      return rlist;
    }
    return [];
  }

  /* ---------------- フィルターチップの描画 ---------------- */
  function renderFilterChips(){
    each(["use", "maker", "type", "rank"], function(group){
      var host = document.querySelector('[data-chip-group="' + group + '"]');
      if(!host) return;
      var html = "";
      each(buildOptions(group), function(opt){
        html += ''
          + '<button class="c-chip" type="button" data-group="' + group + '" data-value="' + opt.value + '" aria-pressed="false">'
          +   '<b>' + opt.label + '</b><small>' + opt.count + '点</small>'
          + '</button>';
      });
      host.innerHTML = html;
    });

    document.addEventListener("click", function(e){
      var btn = e.target.closest ? e.target.closest("[data-chip-group] .c-chip") : null;
      if(!btn) return;
      var group = btn.getAttribute("data-group");
      var value = btn.getAttribute("data-value");
      if(!group || !selected[group]) return;
      var pressed = btn.getAttribute("aria-pressed") === "true";
      pressed = !pressed;
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
      if(pressed) selected[group][value] = true;
      else delete selected[group][value];
      render();
    });
  }

  /* URL の ?use= から初期選択を反映する */
  function applyInitialUse(){
    var params = new URLSearchParams(window.location.search);
    var use = params.get("use");
    if(!use || !DATA.uses || !DATA.uses[use]) return;
    selected.use[use] = true;
    var btn = document.querySelector('.c-chip[data-group="use"][data-value="' + use + '"]');
    if(btn) btn.setAttribute("aria-pressed", "true");
  }

  /* ---------------- 並び替え ---------------- */
  function initSort(){
    var row = document.querySelector("[data-sort-group]");
    if(!row) return;
    row.addEventListener("click", function(e){
      var btn = e.target.closest ? e.target.closest(".c-chip") : null;
      if(!btn) return;
      currentSort = btn.getAttribute("data-sort") || "reco";
      each(row.querySelectorAll(".c-chip"), function(b){
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  }
  function sortProducts(list){
    if(currentSort === "priceAsc"){
      list.sort(function(a, b){ return a.n3 - b.n3; });
    }else if(currentSort === "refDesc"){
      list.sort(function(a, b){ return b.refPrice - a.refPrice; });
    }
    return list;
  }

  /* ---------------- 絞り込み判定（AND） ---------------- */
  function hasAny(obj){ for(var k in obj){ if(obj.hasOwnProperty(k)) return true; } return false; }
  function matches(p){
    if(hasAny(selected.use)){
      var okUse = false;
      each(p.uses || [], function(u){ if(selected.use[u]) okUse = true; });
      if(!okUse) return false;
    }
    if(hasAny(selected.maker) && !selected.maker[p.maker]) return false;
    if(hasAny(selected.type) && !selected.type[p.type]) return false;
    if(hasAny(selected.rank) && !selected.rank[p.rank]) return false;
    return true;
  }

  /* ---------------- 一覧の再描画 ---------------- */
  function render(){
    var sheet = document.querySelector("[data-sheet]");
    var empty = document.getElementById("collectionEmpty");
    var countEl = document.querySelector("[data-result-count]");
    if(!sheet) return;

    var filtered = [];
    each(products, function(p){ if(matches(p)) filtered.push(p); });
    filtered = sortProducts(filtered);

    if(countEl) countEl.textContent = String(filtered.length);

    if(filtered.length === 0){
      sheet.innerHTML = "";
      sheet.hidden = true;
      if(empty) empty.hidden = false;
      return;
    }
    sheet.hidden = false;
    if(empty) empty.hidden = true;

    var html = "";
    each(filtered, function(p, i){
      html += TAMESU.productCard(p, {period:"n3", no:pad2(i + 1) + "A", eager:i < 4});
    });
    sheet.innerHTML = html;
  }

  /* ---------------- 絞り込み解除 ---------------- */
  function initReset(){
    document.addEventListener("click", function(e){
      var btn = e.target.closest ? e.target.closest("[data-filter-reset]") : null;
      if(!btn) return;
      selected = {use:{}, maker:{}, type:{}, rank:{}};
      each(document.querySelectorAll("[data-chip-group] .c-chip"), function(b){
        b.setAttribute("aria-pressed", "false");
      });
      render();
    });
  }

  /* ---------------- 迷ったらこの3台 ---------------- */
  function renderPicks(){
    var host = document.getElementById("collectionPicks");
    if(!host) return;
    var html = "";
    each(DATA.picks || [], function(pick){
      var p = TAMESU.product(pick.handle);
      if(!p) return;
      html += ''
        + '<div class="p-collection-picks__cell">'
        +   '<p class="p-collection-picks__tag u-mono">' + pick.tag + '</p>'
        +   TAMESU.productCard(p, {period:"n3"})
        + '</div>';
    });
    host.innerHTML = html;
  }

  /* ---------------- ランク表 ---------------- */
  function renderRankTable(){
    var body = document.querySelector("[data-rank-body]");
    if(!body) return;
    var html = "";
    each(DATA.ranks || [], function(r){
      html += ''
        + '<tr>'
        +   '<td><span class="c-badge c-badge--' + r.key.toLowerCase() + '">RANK ' + r.key + '</span></td>'
        +   '<td>' + r.range + '</td>'
        +   '<td>' + r.review + '</td>'
        + '</tr>';
    });
    body.innerHTML = html;
  }

  /* Element.closest の簡易ポリフィル（対象ブラウザはほぼ不要だが保険） */
  if(window.Element && !Element.prototype.closest){
    Element.prototype.closest = function(selector){
      var el = this;
      while(el && el.nodeType === 1){
        if(el.matches ? el.matches(selector) : false) return el;
        el = el.parentElement;
      }
      return null;
    };
  }

  run("filters", renderFilterChips);
  run("initial-use", applyInitialUse);
  run("sort", initSort);
  run("reset", initReset);
  run("render", render);
  run("picks", renderPicks);
  run("rank-table", renderRankTable);

})();
