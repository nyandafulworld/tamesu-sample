/* =================================================================
   TAMESU（仮称） — lp ページ固有JS
   classic script / IIFE。data.js の値だけを使い、料金例と
   モバイル下部固定CTAの表示切替を行う。
   ================================================================= */
(function(){
  "use strict";

  /* ---- 料金例3機種（α1 II / Leica Q3 / GFX100S II） ---- */
  try{
    var host = document.getElementById("lpPriceGrid");
    if(host && window.TAMESU && window.TAMESU.product){
      var handles = ["a1m2", "q3", "gfx100s2"];
      var html = "";
      for(var i = 0; i < handles.length; i++){
        var p = window.TAMESU.product(handles[i]);
        if(!p) continue;
        var ratio = Math.round((p.n3 / p.refPrice) * 100);
        html += ''
          + '<div class="p-lp-price__col">'
          +   '<p class="p-lp-price__maker u-mono">' + p.maker + '</p>'
          +   '<h3 class="p-lp-price__name u-wide">' + p.name
          +     '<span class="c-badge c-badge--' + p.rank.toLowerCase() + '">RANK ' + p.rank + '</span>'
          +   '</h3>'
          +   '<p class="p-lp-price__row"><span class="p-lp-price__rowLabel u-mono">参考購入価格</span>'
          +     '<span class="p-lp-price__rowNum">' + window.TAMESU.yen(p.refPrice) + '<small>円</small></span></p>'
          +   '<p class="p-lp-price__arrow u-mono">3泊4日なら</p>'
          +   '<p class="p-lp-price__row"><span class="p-lp-price__rowLabel u-mono">レンタル料</span>'
          +     '<span class="p-lp-price__rowNum p-lp-price__rowNum--now">' + window.TAMESU.yen(p.n3) + '<small>円〜</small></span></p>'
          +   '<p class="p-lp-price__ratio">参考購入価格の<b>約' + ratio + '%</b></p>'
          +   '<a class="c-btn c-btn--ghost c-btn--sm" href="product.html?h=' + p.handle + '">この機材を見る</a>'
          + '</div>';
      }
      host.innerHTML = html;
    }
  }catch(e){ if(window.console && console.warn) console.warn("[lp.js] price", e); }

  /* ---- モバイル下部固定CTA：ヒーローのCTAが画面内にある間は隠す ---- */
  try{
    var sticky = document.querySelector("[data-lp-sticky]");
    var heroCta = document.querySelector(".p-lp-hero__cta");
    if(sticky && heroCta && "IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          sticky.classList.toggle("is-visible", !entry.isIntersecting);
        });
      }, {threshold: 0, rootMargin: "-72px 0px 0px 0px"});
      io.observe(heroCta);
    }
  }catch(e){ if(window.console && console.warn) console.warn("[lp.js] sticky", e); }

})();
