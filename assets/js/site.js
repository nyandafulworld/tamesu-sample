/* =================================================================
   TAMESU（仮称）サンプルサイト — 共通の動き window.TAMESU
   classic script / IIFE。fetch・type=module・外部ライブラリは使わない。
   各機能は try/catch で分離し、1つ失敗しても他が動く。
   このファイルはページ側から編集しない（凍結対象）。
   ================================================================= */
(function(){
  "use strict";

  var DATA = window.TAMESU_DATA || {products:[],images:{},pages:[],periods:[]};
  var TAMESU = window.TAMESU = window.TAMESU || {};

  /* ---------------- ヘルパー ---------------- */

  TAMESU.img = function(key){
    return "assets/img/" + key + ".webp";
  };

  TAMESU.yen = function(n){
    try{ return Number(n).toLocaleString("ja-JP"); }
    catch(e){ return String(n); }
  };

  TAMESU.product = function(handle){
    try{
      var list = DATA.products || [];
      for(var i=0;i<list.length;i++){ if(list[i].handle === handle) return list[i]; }
      return null;
    }catch(e){ return null; }
  };

  /* c-frame（ファインダー枠）のHTML文字列を組み立てる。
     ratio: "169" | "32" | "11" | "45" */
  TAMESU.frame = function(key, ratio, alt, opts){
    opts = opts || {};
    var meta = (DATA.images && DATA.images[key]) || {};
    var w = opts.w || meta.w || 1200;
    var h = opts.h || meta.h || 1200;
    var altText = (alt != null ? alt : meta.alt) || "";
    var loading = opts.eager ? "" : ' loading="lazy"';
    var keyText = String(key).toUpperCase();
    var noTag = opts.no ? ('<span class="c-card-product__no u-mono">' + opts.no + '</span>') : "";
    return ''
      + '<figure class="c-frame c-frame--' + ratio + (opts.extraClass ? (' ' + opts.extraClass) : '') + '" data-frame>'
      +   noTag
      +   '<img src="' + TAMESU.img(key) + '" width="' + w + '" height="' + h + '" alt="' + altText + '"' + loading + '>'
      +   '<span class="c-frame__corner c-frame__corner--tl" aria-hidden="true"></span>'
      +   '<span class="c-frame__corner c-frame__corner--tr" aria-hidden="true"></span>'
      +   '<span class="c-frame__corner c-frame__corner--bl" aria-hidden="true"></span>'
      +   '<span class="c-frame__corner c-frame__corner--br" aria-hidden="true"></span>'
      +   '<span class="c-frame__cross" aria-hidden="true"></span>'
      +   '<span class="c-frame__key" aria-hidden="true"><span class="c-frame__key-text">' + keyText + '</span><span class="c-frame__key-sub">NO IMAGE</span></span>'
      + '</figure>';
  };

  /* 商品カードのHTML文字列（全ページ共通マークアップ）。
     opts: {period:'n1'|'n3'|'n7', no:'01A', eager:true} */
  TAMESU.productCard = function(p, opts){
    if(!p) return "";
    opts = opts || {};
    var period = opts.period || "n3";
    var periodList = DATA.periods || [];
    var periodMeta = null;
    for(var i=0;i<periodList.length;i++){ if(periodList[i].key === period){ periodMeta = periodList[i]; break; } }
    var periodName = periodMeta ? periodMeta.name : "3泊4日";
    var price = (p[period] != null) ? p[period] : p.n3;
    var isLow = p.left === 0;
    var stockText = isLow
      ? "今週末は予約済み"
      : ("在庫 " + p.stock + "台・今週末 <b>" + p.left + "</b>台");
    // アンカリング：レンタル料の横に参考購入価格を必ず併記する
    var refText = p.refPrice
      ? '<span class="c-card-product__ref u-mono">参考購入価格 <s>' + TAMESU.yen(p.refPrice) + '</s>円</span>'
      : '';
    var meta = (DATA.images && DATA.images[p.img]) || {};
    var frame = TAMESU.frame(p.img, "11", meta.alt || p.name, {no:opts.no, eager:!!opts.eager});

    return ''
      + '<article class="c-card-product" data-handle="' + p.handle + '">'
      +   '<a class="c-card-product__link" href="product.html?h=' + p.handle + '">'
      +     '<div class="c-card-product__frame">' + frame + '</div>'
      +     '<div class="c-card-product__body">'
      +       '<p class="c-card-product__meta"><span class="u-mono">' + p.maker + '</span><span class="c-badge c-badge--' + p.rank.toLowerCase() + '">RANK ' + p.rank + '</span></p>'
      +       '<h3 class="c-card-product__name u-wide">' + p.name + '</h3>'
      +       '<p class="c-card-product__cat">' + p.category + '</p>'
      +       '<div class="c-card-product__foot">'
      +         '<p class="c-card-product__price">'
      +           '<span class="c-card-product__priceLabel u-mono">' + periodName + '</span>'
      +           '<span class="c-card-product__priceNum">' + TAMESU.yen(price) + '<span>円〜</span></span>'
      +           refText
      +         '</p>'
      +         '<p class="c-card-product__stock u-mono' + (isLow ? ' is-low' : '') + '">' + stockText + '</p>'
      +       '</div>'
      +     '</div>'
      +   '</a>'
      + '</article>';
  };

  TAMESU.toast = function(msg){
    try{
      var host = document.getElementById("toast");
      if(!host || !msg) return;
      var item = document.createElement("div");
      item.className = "c-toast__item";
      item.textContent = msg;
      host.appendChild(item);
      window.requestAnimationFrame(function(){ item.classList.add("is-visible"); });
      window.setTimeout(function(){
        item.classList.remove("is-visible");
        window.setTimeout(function(){ if(item.parentNode) item.parentNode.removeChild(item); }, 420);
      }, 3200);
    }catch(e){}
  };

  /* ---------------- 実行ユーティリティ ---------------- */
  function run(name, fn){
    try{ fn(); }
    catch(e){ if(window.console && console.warn) console.warn("[TAMESU]", name, e); }
  }
  function closest(el, selector){
    while(el && el.nodeType === 1){
      if(el.matches ? el.matches(selector) : false) return el;
      el = el.parentElement;
    }
    return null;
  }
  function each(list, fn){ for(var i=0;i<list.length;i++) fn(list[i], i); }

  /* ---------------- dock：現在地ハイライト ---------------- */
  function initDockHighlight(){
    var page = document.documentElement.getAttribute("data-page");
    var items = document.querySelectorAll(".c-dock__item");
    each(items, function(item){
      var isCurrent = item.getAttribute("data-nav") === page;
      item.classList.toggle("is-current", isCurrent);
      if(isCurrent) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  /* ---------------- dock：折りたたみ（モバイル） ---------------- */
  function initDockCollapse(){
    var dock = document.querySelector(".c-dock");
    var btn = document.querySelector("[data-dock-collapse]");
    if(!dock || !btn) return;
    var KEY = "tamesu-dock-collapsed";
    var collapsed = false;
    try{ collapsed = localStorage.getItem(KEY) === "1"; }catch(e){}
    apply(collapsed);
    btn.addEventListener("click", function(){
      collapsed = !collapsed;
      apply(collapsed);
      try{ localStorage.setItem(KEY, collapsed ? "1" : "0"); }catch(e){}
    });
    function apply(state){
      dock.classList.toggle("is-collapsed", state);
      btn.setAttribute("aria-expanded", state ? "false" : "true");
    }
  }

  /* ---------------- dock：スマホで現在地を見える位置へ ---------------- */
  function initDockAutoScroll(){
    if(window.innerWidth >= 900) return;
    var current = document.querySelector(".c-dock__item.is-current");
    var scroller = document.querySelector("[data-dock-scroll]");
    if(!current || !scroller) return;
    var target = current.offsetLeft - (scroller.clientWidth / 2) + (current.clientWidth / 2);
    scroller.scrollLeft = Math.max(0, target);
  }

  /* ---------------- 実装メモ：ON/OFF切替 ---------------- */
  function initMemoToggle(){
    var KEY = "tamesu-memo-on";
    var btn = document.querySelector("[data-memo-toggle]");
    var state = false;
    try{
      var params = new URLSearchParams(window.location.search);
      if(params.get("memo") === "1") state = true;
      else if(localStorage.getItem(KEY) === "1") state = true;
    }catch(e){}
    apply(state);
    if(btn){
      btn.addEventListener("click", function(){
        state = !state;
        apply(state);
        try{ localStorage.setItem(KEY, state ? "1" : "0"); }catch(e){}
      });
    }
    function apply(s){
      document.documentElement.classList.toggle("is-memo-on", s);
      if(btn) btn.setAttribute("aria-pressed", s ? "true" : "false");
      updateDockLinks(s);
    }
    function updateDockLinks(s){
      var items = document.querySelectorAll(".c-dock__item[data-nav]");
      var pages = DATA.pages || [];
      each(items, function(item){
        var nav = item.getAttribute("data-nav");
        var file = nav + ".html";
        for(var i=0;i<pages.length;i++){ if(pages[i].key === nav){ file = pages[i].file; break; } }
        item.setAttribute("href", file + (s ? "?memo=1" : ""));
      });
    }
  }

  /* ---------------- 実装メモ：連番ピンとバッジを自動生成 ---------------- */
  function enhanceMemos(){
    var memos = document.querySelectorAll("[data-memo]");
    var typeLabels = {native:"標準機能", app:"アプリ", custom:"個別開発", external:"外部サービス", ops:"手動運用"};
    var planLabels = {start:"スタート", standard:"スタンダード", growth:"グロース"};
    each(memos, function(memo, i){
      var pinNum = String(i + 1).length < 2 ? ("0" + (i + 1)) : String(i + 1);
      var types = (memo.getAttribute("data-type") || "").trim().split(/\s+/).filter(Boolean);
      var plan = memo.getAttribute("data-plan") || "";
      var conf = memo.getAttribute("data-confidence") || "";
      var ref = memo.getAttribute("data-ref") || "";

      var head = document.createElement("div");
      head.className = "c-memo__head";

      var pin = document.createElement("span");
      pin.className = "c-memo__pin";
      pin.textContent = pinNum;
      head.appendChild(pin);

      each(types, function(t){
        var b = document.createElement("span");
        b.className = "c-badge c-badge--" + t;
        b.textContent = typeLabels[t] || t;
        head.appendChild(b);
      });

      if(plan){
        var pl = document.createElement("span");
        pl.className = "c-memo__plan";
        pl.textContent = "対応 " + (planLabels[plan] || plan) + "〜";
        head.appendChild(pl);
      }
      if(conf){
        var cf = document.createElement("span");
        cf.className = "c-memo__conf" + (conf === "確認済" ? " is-ok" : "");
        cf.textContent = conf;
        head.appendChild(cf);
      }
      if(ref){
        var rf = document.createElement("span");
        rf.className = "c-memo__ref u-mono";
        rf.textContent = ref;
        head.appendChild(rf);
      }

      memo.insertBefore(head, memo.firstChild);
      var h = memo.querySelector("h4, h5, h3");
      if(h) h.classList.add("c-memo__title");
      var p = memo.querySelector("p");
      if(p) p.classList.add("c-memo__body");
    });
  }

  /* ---------------- 画像エラー時の .is-noimg 付与 ---------------- */
  function initImgErrorCapture(){
    document.addEventListener("error", function(e){
      var t = e.target;
      if(!t || t.tagName !== "IMG") return;
      var frame = closest(t, ".c-frame");
      if(frame) frame.classList.add("is-noimg");
    }, true);
  }

  /* ---------------- u-reveal：段階的リビール ---------------- */
  function initReveal(){
    var els = document.querySelectorAll(".u-reveal");
    if(!els.length) return;
    if(!("IntersectionObserver" in window)){
      each(els, function(el){ el.classList.add("is-visible"); });
      return;
    }
    // threshold は 0：ビューポートより背の高いブロックでも必ず発火させる
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0, rootMargin:"0px 0px -4% 0px"});
    each(els, function(el){ io.observe(el); });

    // 保険：素早いスクロールやページ内ジャンプで IO が遅れても白紙に見せない。
    // 画面の下端より上にある要素は、スクロールのたびに表示済みにする。
    var ticking = false;
    function sweep(){
      ticking = false;
      var limit = window.innerHeight * 0.98;
      var rest = document.querySelectorAll(".u-reveal:not(.is-visible)");
      each(rest, function(el){
        if(el.getBoundingClientRect().top < limit){
          el.classList.add("is-visible");
          try{ io.unobserve(el); }catch(e){}
        }
      });
    }
    function onScroll(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(sweep);
      window.setTimeout(function(){ if(ticking) sweep(); }, 120);
    }
    window.addEventListener("scroll", onScroll, {passive:true});
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    window.setTimeout(sweep, 400);
    window.setTimeout(sweep, 1500);
  }

  /* ---------------- data-demo：トースト ---------------- */
  function initDemoToast(){
    document.addEventListener("click", function(e){
      var el = closest(e.target, "[data-demo]");
      if(!el) return;
      var form = closest(el, "form[data-demo]");
      if(form && el.type === "submit") return; /* submit イベント側に任せる */
      if(el.tagName === "A") e.preventDefault();
      TAMESU.toast(el.getAttribute("data-demo"));
    });
    document.addEventListener("submit", function(e){
      var form = e.target;
      if(form && form.hasAttribute && form.hasAttribute("data-demo")){
        e.preventDefault();
        TAMESU.toast(form.getAttribute("data-demo"));
      }
    });
  }

  /* ---------------- ヘッダーのスクロール状態 ---------------- */
  function initHeaderScroll(){
    var header = document.querySelector("[data-header]");
    if(!header) return;
    var ticking = false;
    function update(){
      header.classList.toggle("is-scrolled", window.scrollY > 6);
      ticking = false;
    }
    window.addEventListener("scroll", function(){
      if(!ticking){ window.requestAnimationFrame(update); ticking = true; }
    }, {passive:true});
    update();
  }

  /* ---------------- モバイルメニュー ---------------- */
  function initMobileMenu(){
    var btn = document.querySelector("[data-menu-toggle]");
    var menu = document.getElementById("mobileMenu");
    if(!btn || !menu) return;
    function close(){
      btn.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("is-menu-open");
    }
    function open(){
      btn.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("is-menu-open");
    }
    btn.addEventListener("click", function(){
      var expanded = btn.getAttribute("aria-expanded") === "true";
      if(expanded) close(); else open();
    });
    each(menu.querySelectorAll("a"), function(a){ a.addEventListener("click", close); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
  }

  /* ---------------- 起動 ----------------
     このスクリプトは body 末尾で読み込まれるため、
     実行時点で DOM は構築済み（DOMContentLoaded 待ち不要）。 */
  run("dock-highlight", initDockHighlight);
  run("dock-collapse", initDockCollapse);
  run("dock-autoscroll", initDockAutoScroll);
  run("memo-toggle", initMemoToggle);
  run("memo-enhance", enhanceMemos);
  run("img-error", initImgErrorCapture);
  run("reveal", initReveal);
  run("demo-toast", initDemoToast);
  run("header-scroll", initHeaderScroll);
  run("mobile-menu", initMobileMenu);

})();
