/* =================================================================
   TAMESU（仮称） — product ページ固有JS
   ?h=<handle> で商品を切替（既定 a1m2、無い handle は a1m2 にフォールバック）。
   期間・利用開始日・補償を選ぶと、料金・返却期限・参考購入価格比を再計算する。
   ================================================================= */
(function(){
  "use strict";

  var DATA = window.TAMESU_DATA;
  var TAMESU = window.TAMESU;
  if(!DATA || !TAMESU) return;

  function run(name, fn){
    try{ fn(); }
    catch(e){ if(window.console && console.warn) console.warn("[product.js]", name, e); }
  }
  function each(list, fn){ for(var i=0;i<list.length;i++) fn(list[i], i); }
  function qs(sel){ return document.querySelector(sel); }
  function setText(sel, text){ var el = qs(sel); if(el) el.textContent = text; }

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

  var products = DATA.products || [];
  var periods = DATA.periods || [];
  var protections = DATA.protections || [];

  /* ---------------- 日付ユーティリティ ---------------- */
  var WEEK_JP = ["日", "月", "火", "水", "木", "金", "土"];
  function todayAtMidnight(){
    var t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }
  function addDays(date, days){
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }
  function pad2(n){ n = String(n); return n.length < 2 ? ("0" + n) : n; }
  function isoDate(date){
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
  }
  function parseIsoDate(s){
    var parts = (s || "").split("-");
    if(parts.length !== 3) return null;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(d.getTime()) ? null : d;
  }
  function formatJPDate(date){
    return (date.getMonth() + 1) + "月" + date.getDate() + "日（" + WEEK_JP[date.getDay()] + "）";
  }
  function findByKey(list, key){
    for(var i = 0; i < list.length; i++){ if(list[i].key === key) return list[i]; }
    return null;
  }
  function findRecommended(list){
    for(var i = 0; i < list.length; i++){ if(list[i].recommended) return list[i]; }
    return list[0] || null;
  }

  /* ---------------- 商品の解決（?h= → 無ければ a1m2） ---------------- */
  function resolveProduct(){
    var params = new URLSearchParams(window.location.search);
    var handle = params.get("h") || "a1m2";
    var p = TAMESU.product(handle);
    if(!p) p = TAMESU.product("a1m2");
    return p;
  }

  /* ---------------- セット内容（機材の種別ごと） ---------------- */
  var KIT_ITEMS = {
    body:    ["ボディ本体", "バッテリー×2", "充電器", "ストラップ", "SDメモリーカード", "耐衝撃ハードケース"],
    compact: ["本体（レンズ一体型）", "バッテリー×2", "充電器", "ストラップ", "SDメモリーカード", "耐衝撃ハードケース"],
    cine:    ["ボディ本体", "トップハンドル", "バッテリー×2", "充電器", "SDメモリーカード", "耐衝撃ハードケース"],
    lens:    ["レンズ本体", "前後キャップ", "レンズフード", "レンズポーチ", "耐衝撃ハードケース"]
  };

  var state = {
    product: null,
    period: findRecommended(periods) ? findRecommended(periods).key : (periods[0] && periods[0].key),
    protection: findRecommended(protections) ? findRecommended(protections).key : (protections[0] && protections[0].key),
    startDate: null,
    gallery: []
  };

  /* ---------------- ギャラリー ---------------- */
  function buildGallery(p){
    var mainHost = document.getElementById("productMainFrame");
    var thumbHost = document.getElementById("productThumbs");
    if(!mainHost || !thumbHost) return;

    var items = [
      {key: p.img,       alt: (DATA.images[p.img] || {}).alt || p.name, label: p.name},
      {key: "kit-set",   alt: (DATA.images["kit-set"] || {}).alt || "セット内容",   label: "セット内容"},
      {key: "case-seal", alt: (DATA.images["case-seal"] || {}).alt || "発送前点検", label: "発送前点検・封緘"}
    ];
    state.gallery = items;

    function setMain(item){
      mainHost.innerHTML = TAMESU.frame(item.key, "11", item.alt, {eager: true});
      var exifHost = document.getElementById("productExif");
      if(exifHost) exifHost.textContent = ((DATA.images[item.key] || {}).exif) || "";
    }
    setMain(items[0]);

    var html = "";
    each(items, function(item, i){
      html += ''
        + '<button class="p-product-gallery__thumb" type="button" data-thumb-index="' + i + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">'
        +   TAMESU.frame(item.key, "11", item.alt, {})
        +   '<span class="p-product-gallery__thumbLabel">' + item.label + '</span>'
        + '</button>';
    });
    thumbHost.innerHTML = html;

    thumbHost.addEventListener("click", function(e){
      var btn = e.target.closest ? e.target.closest("[data-thumb-index]") : null;
      if(!btn) return;
      var idx = Number(btn.getAttribute("data-thumb-index"));
      var item = state.gallery[idx];
      if(!item) return;
      setMain(item);
      each(thumbHost.querySelectorAll("[data-thumb-index]"), function(b){
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  }

  /* ---------------- 購入ボックス ---------------- */
  function buildBoxHTML(p){
    var rankKey = (p.rank || "").toLowerCase();

    var periodChips = "";
    each(periods, function(period){
      var reco = period.recommended ? " c-chip--reco" : "";
      var pressed = period.key === state.period ? "true" : "false";
      periodChips += '<button class="c-chip' + reco + '" type="button" data-period="' + period.key + '" aria-pressed="' + pressed + '"><b>' + period.name + '</b><small>' + (period.recommended ? "おすすめ" : " ") + '</small></button>';
    });

    var protectionChips = "";
    each(protections, function(pr){
      var reco = pr.recommended ? " c-chip--reco" : "";
      var pressed = pr.key === state.protection ? "true" : "false";
      var shortName = pr.name.replace("（おすすめ）", "");
      protectionChips += '<button class="c-chip' + reco + '" type="button" data-protection="' + pr.key + '" aria-pressed="' + pressed + '"><b>' + shortName + '</b><small>' + (pr.recommended ? "おすすめ" : " ") + '</small></button>';
    });

    var stockText = p.left === 0
      ? "今週末は予約済みです"
      : ("今週末の空き <b>" + p.left + "</b>台（在庫" + p.stock + "台）");

    return ''
      + '<p class="p-product-box__maker u-mono">' + p.maker + '</p>'
      + '<h1 class="p-product-box__name u-wide">' + p.name + '</h1>'
      + '<div class="p-product-box__meta">'
      +   '<span class="p-product-box__cat">' + p.category + '</span>'
      +   '<span class="c-badge c-badge--' + rankKey + '">RANK ' + p.rank + '</span>'
      + '</div>'
      + '<p class="c-price c-price--ref"><span class="c-price__label">参考購入価格</span><span class="c-price__amount">' + TAMESU.yen(p.refPrice) + '</span><span class="c-price__unit">円</span></p>'

      + '<div class="p-product-calc">'
      +   '<div class="p-product-calc__block">'
      +     '<p class="p-product-calc__label u-mono">STEP 01 — 期間を選ぶ</p>'
      +     '<div class="c-chip-row" data-period-group>' + periodChips + '</div>'
      +   '</div>'
      +   '<div class="p-product-calc__block">'
      +     '<label class="p-product-calc__label u-mono" for="productStartDate">STEP 02 — 利用開始日</label>'
      +     '<input class="p-product-calc__date" type="date" id="productStartDate" data-start-date>'
      +   '</div>'
      +   '<div class="p-product-calc__block">'
      +     '<p class="p-product-calc__label u-mono">STEP 03 — 補償を選ぶ</p>'
      +     '<div class="c-chip-row" data-protection-group>' + protectionChips + '</div>'
      +   '</div>'

      +   '<div class="p-product-calc__result">'
      +     '<div class="p-product-calc__row"><span>レンタル料</span><span class="u-wide"><span data-out="rental">0</span><small>円</small></span></div>'
      +     '<div class="p-product-calc__row"><span>補償料</span><span class="u-wide"><span data-out="protectionFee">0</span><small>円</small></span></div>'
      +     '<div class="p-product-calc__row p-product-calc__row--total"><span>合計</span><span class="u-wide"><span data-out="total">0</span><small>円</small></span></div>'
      +     '<div class="p-product-calc__row p-product-calc__row--sub"><span>返却期限（発送）</span><span data-out="returnDate">―</span></div>'
      +     '<p class="p-product-calc__ratio">参考購入価格の約<b data-out="ratio">0.0</b>%で、この期間を試せます。</p>'
      +   '</div>'

      +   '<div class="c-notice p-product-calc__paymentNote" data-payment-note hidden>'
      +     '<span class="c-notice__mark u-mono">NOTE</span>'
      +     '<p>ご利用開始日が先の場合、お支払いの確定時期は予約内容に応じてご案内します。</p>'
      +   '</div>'
      + '</div>'

      + '<div class="p-product-box__cta">'
      +   '<button class="c-btn c-btn--primary c-btn--block" type="button" data-cta data-demo="このサイトはサンプルです。実際の予約・決済は行われません。">レンタルを申し込む</button>'
      +   '<p class="p-product-box__stock u-mono">' + stockText + '</p>'
      +   '<a class="p-product-box__kyc" href="guide.html">はじめての方は、先に本人確認を（無料・約3分）</a>'
      + '</div>';
  }

  /* ---------------- 紹介文 ---------------- */
  function buildIntro(p){
    var host = document.getElementById("productIntro");
    if(!host) return;
    var useNames = [];
    each(p.uses || [], function(u){
      var meta = DATA.uses && DATA.uses[u];
      if(meta) useNames.push(meta.name);
    });
    var html = p.intro || "";
    if(useNames.length){
      html += '<br><span class="u-mono" style="font-size:11px;letter-spacing:.06em;color:var(--c-ink-3);">こんな用途に　' + useNames.join("／") + '</span>';
    }
    host.innerHTML = html;
  }

  /* ---------------- スペック表 ---------------- */
  function buildSpecs(p){
    var host = document.getElementById("productSpecs");
    if(!host) return;
    var html = "";
    each(p.specs || [], function(row){
      html += '<div class="c-spec__row"><p class="c-spec__label">' + row[0] + '</p><p class="c-spec__value">' + row[1] + '</p></div>';
    });
    host.innerHTML = html;
  }

  /* ---------------- セット内容リスト ---------------- */
  function buildKit(p){
    var host = document.getElementById("productKitList");
    if(!host) return;
    var items = KIT_ITEMS[p.type] || KIT_ITEMS.body;
    var html = "";
    each(items, function(item){ html += "<li>" + item + "</li>"; });
    host.innerHTML = html;
  }

  /* ---------------- 審査レベル ---------------- */
  function buildRankRow(p){
    var host = document.getElementById("productRankRow");
    if(!host) return;
    var html = "";
    each(DATA.ranks || [], function(r){
      var current = r.key === p.rank;
      html += ''
        + '<div class="p-product-rankRow__item' + (current ? " is-current" : "") + '">'
        +   '<p class="p-product-rankRow__badge"><span class="c-badge c-badge--' + r.key.toLowerCase() + '">RANK ' + r.key + '</span>' + (current ? '<span class="p-product-rankRow__tag u-mono">この機材</span>' : '') + '</p>'
        +   '<p class="p-product-rankRow__range u-mono">' + r.range + '</p>'
        +   '<p class="p-product-rankRow__review">' + r.review + '</p>'
        + '</div>';
    });
    host.innerHTML = html;
  }

  /* ---------------- 補償の比較表 ---------------- */
  function buildProtectionTable(){
    var body = document.querySelector("[data-protection-body]");
    if(body){
      var html = "";
      each(protections, function(pr){
        var cap = pr.cap === 0 ? "0円" : (TAMESU.yen(pr.cap) + "円まで");
        html += ''
          + '<tr class="' + (pr.recommended ? "is-reco" : "") + '">'
          +   '<td>' + pr.name + '</td>'
          +   '<td>' + pr.fee + '</td>'
          +   '<td class="u-num">' + cap + '</td>'
          + '</tr>';
      });
      body.innerHTML = html;
    }
    var note = document.querySelector("[data-protection-note]");
    if(note && DATA.protectionNote) note.textContent = DATA.protectionNote;
  }

  /* ---------------- よく一緒に借りられる機材 ---------------- */
  function buildRelated(p){
    var host = document.getElementById("productRelated");
    if(!host) return;
    var pool = [];
    each(products, function(q){
      if(q.handle === p.handle) return;
      var shareUse = false;
      each(q.uses || [], function(u){ if((p.uses || []).indexOf(u) > -1) shareUse = true; });
      if(shareUse) pool.push(q);
    });
    if(pool.length < 3){
      each(products, function(q){
        if(q.handle === p.handle) return;
        if(pool.indexOf(q) > -1) return;
        if(pool.length < 3) pool.push(q);
      });
    }
    pool = pool.slice(0, 3);
    var html = "";
    each(pool, function(q){
      html += '<div class="p-product-related__cell">' + TAMESU.productCard(q, {period: "n3"}) + '</div>';
    });
    host.innerHTML = html;
  }

  /* ---------------- 料金計算の再描画 ---------------- */
  function protectionPct(pr){
    var m = /(\d+)\s*%/.exec((pr && pr.fee) || "");
    return m ? (Number(m[1]) / 100) : 0;
  }

  function updateCalc(){
    var p = state.product;
    if(!p || !state.startDate) return;
    var period = findByKey(periods, state.period) || periods[0];
    var protection = findByKey(protections, state.protection) || protections[0];
    if(!period || !protection) return;

    var rental = (p[period.key] != null) ? p[period.key] : p.n3;
    var pct = protectionPct(protection);
    var protectionFee = Math.round(rental * pct);
    var total = rental + protectionFee;
    // 返却期限＝利用開始日＋泊数（3泊4日なら4日目）。mypage.js と同じ定義に統一
    var deadline = addDays(state.startDate, (period.nights != null) ? period.nights : period.days - 1);
    var ratio = p.refPrice ? (rental / p.refPrice * 100).toFixed(1) : "0.0";

    setText('[data-out="rental"]', TAMESU.yen(rental));
    setText('[data-out="protectionFee"]', TAMESU.yen(protectionFee));
    setText('[data-out="total"]', TAMESU.yen(total));
    setText('[data-out="returnDate"]', formatJPDate(deadline));
    setText('[data-out="ratio"]', ratio);

    var note = qs("[data-payment-note]");
    if(note){
      var diffDays = Math.round((state.startDate.getTime() - todayAtMidnight().getTime()) / 86400000);
      note.hidden = !(diffDays > 7);
    }

    var demoMsg = "サンプルのため実際には決済されません。" + period.name + "・" + protection.name.replace("（おすすめ）", "") + "・合計" + TAMESU.yen(total) + "円。";
    var cta = qs("[data-cta]");
    if(cta) cta.setAttribute("data-demo", demoMsg);

    setText("[data-bar-total]", TAMESU.yen(total));
    setText("[data-bar-period]", period.name);
    var barCta = qs("[data-bar-cta]");
    if(barCta) barCta.setAttribute("data-demo", demoMsg);
  }

  /* ---------------- 操作の配線 ---------------- */
  function bindChipEvents(){
    document.addEventListener("click", function(e){
      var periodBtn = e.target.closest ? e.target.closest("[data-period]") : null;
      if(periodBtn){
        state.period = periodBtn.getAttribute("data-period");
        each(document.querySelectorAll("[data-period-group] .c-chip"), function(b){
          b.setAttribute("aria-pressed", b === periodBtn ? "true" : "false");
        });
        updateCalc();
        return;
      }
      var protBtn = e.target.closest ? e.target.closest("[data-protection]") : null;
      if(protBtn){
        state.protection = protBtn.getAttribute("data-protection");
        each(document.querySelectorAll("[data-protection-group] .c-chip"), function(b){
          b.setAttribute("aria-pressed", b === protBtn ? "true" : "false");
        });
        updateCalc();
        return;
      }
    });
  }

  function bindDateEvents(){
    document.addEventListener("change", function(e){
      var input = e.target;
      if(!input || input.id !== "productStartDate") return;
      var minDate = addDays(todayAtMidnight(), 2);
      var parsed = parseIsoDate(input.value);
      if(!parsed || parsed.getTime() < minDate.getTime()){
        parsed = minDate;
        input.value = isoDate(minDate);
      }
      state.startDate = parsed;
      updateCalc();
    });
  }

  /* ---------------- 初期化 ---------------- */
  run("resolve", function(){ state.product = resolveProduct(); });

  if(state.product){
    var p = state.product;

    run("title", function(){ document.title = p.maker + " " + p.name + "｜TAMESU"; });
    run("crumb", function(){ setText("#productCrumbName", p.name); });
    run("gallery", function(){ buildGallery(p); });

    run("box", function(){
      var box = document.getElementById("productBox");
      if(box) box.innerHTML = buildBoxHTML(p);

      var today = todayAtMidnight();
      var minDate = addDays(today, 2);
      var defaultDate = addDays(today, 3);
      var input = document.getElementById("productStartDate");
      if(input){
        input.min = isoDate(minDate);
        input.value = isoDate(defaultDate);
      }
      state.startDate = defaultDate;
    });

    run("intro", function(){ buildIntro(p); });
    run("specs", function(){ buildSpecs(p); });
    run("kit", function(){ buildKit(p); });
    run("rank", function(){ buildRankRow(p); });
    run("protection", function(){ buildProtectionTable(); });
    run("related", function(){ buildRelated(p); });

    run("bind-chips", bindChipEvents);
    run("bind-date", bindDateEvents);
    run("calc-initial", updateCalc);
  }

})();
