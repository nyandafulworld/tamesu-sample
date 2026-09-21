/* =================================================================
   TAMESU（仮称） — admin ページ固有JS
   classic script / IIFE。fetch・type=module・外部ライブラリは使わない。
   状態変更はメモリ内のみで完結（リロードで初期状態に戻る）。
   ================================================================= */
(function(){
  "use strict";

  var DATA = window.TAMESU_DATA || {orders:[], persona:{}};
  var TAMESU = window.TAMESU || {toast:function(){}};

  /* ---------------- 注文データ（TAMESU_DATA を複製して使う） ---------------- */
  var orders = (DATA.orders || []).map(function(o){
    var copy = {};
    for(var k in o){ if(Object.prototype.hasOwnProperty.call(o,k)) copy[k] = o[k]; }
    return copy;
  });

  function findOrder(id){
    for(var i=0;i<orders.length;i++){ if(orders[i].id === id) return orders[i]; }
    return null;
  }

  /* 一覧に出す順番（対応が必要な注文を上に） */
  var ORDER_DISPLAY = ["#T-1044", "#T-1043", "#T-1042", "#T-1041", "#T-1039"];
  var DETAIL_IDS = ["#T-1042", "#T-1043", "#T-1044"];

  /* ---------------- ページ固有の補足情報（data.js を上書きしない） ---------------- */
  var REASON = {
    "#T-1042": "同名義のカードでの過去のご利用実績があり、会員登録名とカード名義が一致しています。",
    "#T-1043": "会員登録名とカード名義は一致していますが、配送先住所が本人確認書類の住所と異なり、勤務先が指定されています。",
    "#T-1044": "短時間に複数回の決済失敗があり、カード名義と会員名が一致しません。登録から5分で高額の注文となっています。"
  };

  var KYC_TEXT = {
    "#T-1042": "外部の本人確認サービスで確認済みです（書類の画像はShopify内に保存しません）。",
    "#T-1043": "外部の本人確認サービスで確認済みです（書類の画像はShopify内に保存しません）。",
    "#T-1044": "未完了です。会員登録から短時間で高額の注文となっており、本人確認の提出を待っています。"
  };

  var PAYMENT_TEXT = {
    "#T-1042": "カードを仮確保済みです（オーソリ期間は標準7日間）。期限まで残り4日です。",
    "#T-1043": "カードを仮確保済みです。保留の解除待ちのため確定作業は止めています。期限まで残り5日です。",
    "#T-1044": "複数回の決済失敗により、仮確保に至っていません。"
  };

  var MATCH_ADDR = {
    "#T-1042": {
      id:"福岡県福岡市中央区サンプル町1-2-3",
      billing:"福岡県福岡市中央区サンプル町1-2-3",
      shipping:"福岡県福岡市中央区サンプル町1-2-3",
      tone:"ok", label:"一致", note:"三点とも一致しています。"
    },
    "#T-1043": {
      id:"福岡県福岡市早良区サンプル町4-9-2",
      billing:"福岡県福岡市早良区サンプル町4-9-2",
      shipping:"福岡県福岡市博多区サンプル町7-1-1（勤務先）",
      tone:"hold", label:"不一致", note:"配送先だけが本人確認書類の住所と異なります（勤務先を指定）。"
    },
    "#T-1044": {
      id:"未提出",
      billing:"東京都サンプル区サンプル町3-3-3",
      shipping:"東京都サンプル区サンプル町9-9-9",
      tone:"wait", label:"照合不可", note:"本人確認が未完了のため照合できません。"
    }
  };

  var STAGES = ["申込", "本人確認", "与信", "自動分析", "三点照合", "承認待ち"];
  var TIMELINE = {
    "#T-1042": ["done", "done", "done", "done", "done", "current"],
    "#T-1043": ["done", "done", "done", "done", "hold", "hold"],
    "#T-1044": ["done", "fail", "fail", "flag", "skip", "fail"]
  };
  var STATE_LABEL = {done:"済", current:"対応中", hold:"保留", flag:"要注意", skip:"照合不可", fail:"停止"};

  var CHIP_NOTE = {
    "#T-1042": "三浦 健一・低リスク",
    "#T-1043": "高木 翔・中リスク",
    "#T-1044": "新規会員・高リスク"
  };

  /* ---------------- 表示ヘルパー ---------------- */
  function riskTone(risk){ return risk === "low" ? "ok" : (risk === "mid" ? "hold" : "ng"); }
  function riskLabel(risk){ return risk === "low" ? "低" : (risk === "mid" ? "中" : "高"); }
  function riskLabelLong(risk){ return risk === "low" ? "低リスク" : (risk === "mid" ? "中リスク" : "高リスク"); }

  function kycTone(kyc){ return kyc === "済" ? "ok" : "wait"; }

  /* 機材名と期間・補償を自然な位置で2行に分ける（"・"の最初の位置で分割） */
  function splitItemText(item){
    var i = (item || "").indexOf("・");
    if(i < 0) return {name:item, rest:""};
    return {name:item.slice(0,i), rest:item.slice(i+1)};
  }
  function appendItemLines(host, item){
    var parts = splitItemText(item);
    var nameEl = document.createElement("span");
    nameEl.className = "p-admin-itemName";
    nameEl.textContent = parts.name;
    host.appendChild(nameEl);
    if(parts.rest){
      var restEl = document.createElement("span");
      restEl.className = "p-admin-itemPeriod";
      restEl.textContent = parts.rest;
      host.appendChild(restEl);
    }
  }

  function matchTone(match){
    if(match === "一致") return "ok";
    if(match === "照合不可") return "wait";
    return "hold";
  }
  function matchShort(match){
    if(match === "一致") return "一致";
    if(match === "照合不可") return "照合不可";
    return "不一致";
  }

  function statusTone(status){
    if(status.indexOf("キャンセル") >= 0) return "ng";
    if(status.indexOf("自動保留") >= 0) return "ng";
    if(status.indexOf("保留") >= 0) return "hold";
    if(status.indexOf("発送承認待ち") >= 0) return "wait";
    if(status.indexOf("貸出中") >= 0) return "ok";
    if(status.indexOf("返却済み") >= 0) return "done";
    return "done";
  }

  function canApproveFromList(o){
    return o.risk === "low" && o.kyc === "済" && o.match === "一致" && o.status.indexOf("発送承認待ち") >= 0;
  }

  /* ---------------- 状態 ---------------- */
  var state = {
    tab: "today",
    orderId: "#T-1042",
    filter: null /* 'review' | 'ship' | 'hold' | 'return' | null */
  };

  /* ---------------- 計器（メトリクス） ---------------- */
  function metrics(){
    var m = {review:0, ship:0, hold:0, ret:0};
    for(var i=0;i<orders.length;i++){
      var o = orders[i];
      if(o.kyc !== "済") m.review++;
      if(o.status.indexOf("発送承認待ち") >= 0) m.ship++;
      if(o.status.indexOf("保留") >= 0) m.hold++;
      if(o.status.indexOf("貸出中") >= 0) m.ret++;
    }
    return m;
  }

  function matchesFilter(o, key){
    if(key === "review") return o.kyc !== "済";
    if(key === "ship") return o.status.indexOf("発送承認待ち") >= 0;
    if(key === "hold") return o.status.indexOf("保留") >= 0;
    if(key === "return") return o.status.indexOf("貸出中") >= 0;
    return true;
  }

  var FILTER_LABEL = {review:"審査待ち", ship:"発送承認待ち", hold:"保留中", return:"本日返却予定"};

  function renderMetrics(){
    var m = metrics();
    var elReview = document.getElementById("metricReview");
    var elShip = document.getElementById("metricShip");
    var elHold = document.getElementById("metricHold");
    var elReturn = document.getElementById("metricReturn");
    if(elReview) elReview.textContent = m.review;
    if(elShip) elShip.textContent = m.ship;
    if(elHold) elHold.textContent = m.hold;
    if(elReturn) elReturn.textContent = m.ret;

    var tiles = document.querySelectorAll(".p-admin-metric");
    for(var i=0;i<tiles.length;i++){
      var key = tiles[i].getAttribute("data-metric");
      tiles[i].classList.toggle("is-active", state.filter === key);
    }
  }

  /* ---------------- 今日のやること：一覧 ---------------- */
  function orderedList(){
    var list = [];
    for(var i=0;i<ORDER_DISPLAY.length;i++){
      var o = findOrder(ORDER_DISPLAY[i]);
      if(o) list.push(o);
    }
    if(state.filter){
      list = list.filter(function(o){ return matchesFilter(o, state.filter); });
    }
    return list;
  }

  function buildActionCell(o, forCard){
    if(canApproveFromList(o)){
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "c-btn c-btn--amber c-btn--sm";
      btn.textContent = "発送を承認";
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        applyAction(o.id, "approve");
      });
      return btn;
    }
    if(DETAIL_IDS.indexOf(o.id) >= 0){
      var link = document.createElement(forCard ? "button" : "a");
      link.className = "c-btn c-btn--ghost c-btn--sm";
      link.textContent = "詳細を見る";
      if(forCard){
        link.type = "button";
        link.addEventListener("click", function(e){
          e.stopPropagation();
          goOrder(o.id);
        });
      }else{
        link.setAttribute("href", "#order-" + o.id.replace("#", ""));
      }
      return link;
    }
    var dash = document.createElement("span");
    dash.className = "p-admin-table__dash u-mono";
    dash.textContent = "―";
    return dash;
  }

  function renderToday(){
    var tbody = document.getElementById("orderTableBody");
    var cards = document.getElementById("orderCards");
    if(!tbody || !cards) return;
    tbody.innerHTML = "";
    cards.innerHTML = "";

    var list = orderedList();

    if(!list.length){
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = 8;
      tdEmpty.textContent = "この区分の注文はありません。";
      tdEmpty.style.color = "var(--c-ink-3)";
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
    }

    list.forEach(function(o){
      var clickable = DETAIL_IDS.indexOf(o.id) >= 0;

      /* ---- テーブル行 ---- */
      var tr = document.createElement("tr");
      if(clickable) tr.className = "is-linkable";
      else if(o.status.indexOf("返却済み") >= 0) tr.className = "is-muted";

      var tdId = document.createElement("td");
      tdId.className = "p-admin-table__id u-mono";
      if(clickable){
        var a = document.createElement("a");
        a.href = "#order-" + o.id.replace("#", "");
        a.textContent = o.id;
        tdId.appendChild(a);
      }else{
        tdId.textContent = o.id;
      }
      tr.appendChild(tdId);

      var tdMember = document.createElement("td");
      tdMember.className = "p-admin-table__member";
      tdMember.textContent = o.member;
      tr.appendChild(tdMember);

      var tdItem = document.createElement("td");
      tdItem.className = "p-admin-table__item";
      appendItemLines(tdItem, o.item);
      tr.appendChild(tdItem);

      var tdRisk = document.createElement("td");
      var riskBadge = document.createElement("span");
      riskBadge.className = "c-badge c-badge--" + riskTone(o.risk);
      riskBadge.textContent = riskLabel(o.risk);
      tdRisk.appendChild(riskBadge);
      tr.appendChild(tdRisk);

      var tdKyc = document.createElement("td");
      var kycBadge = document.createElement("span");
      kycBadge.className = "c-badge c-badge--" + kycTone(o.kyc);
      kycBadge.textContent = o.kyc;
      tdKyc.appendChild(kycBadge);
      tr.appendChild(tdKyc);

      var tdMatch = document.createElement("td");
      var matchBadge = document.createElement("span");
      matchBadge.className = "c-badge c-badge--" + matchTone(o.match);
      matchBadge.textContent = matchShort(o.match);
      tdMatch.appendChild(matchBadge);
      if(o.match !== "一致" && o.match !== "照合不可"){
        var note = document.createElement("span");
        note.className = "p-admin-table__matchNote";
        note.textContent = o.match;
        tdMatch.appendChild(note);
      }
      tr.appendChild(tdMatch);

      var tdStatus = document.createElement("td");
      var statusTag = document.createElement("span");
      statusTag.className = "p-admin-status p-admin-status--" + statusTone(o.status);
      statusTag.textContent = o.status;
      tdStatus.appendChild(statusTag);
      tr.appendChild(tdStatus);

      var tdAction = document.createElement("td");
      tdAction.appendChild(buildActionCell(o, false));
      tr.appendChild(tdAction);

      if(clickable){
        tr.addEventListener("click", function(id){
          return function(){ goOrder(id); };
        }(o.id));
      }
      tbody.appendChild(tr);

      /* ---- モバイルカード ---- */
      var card = document.createElement("div");
      card.className = "p-admin-card" + (clickable ? " is-linkable" : (o.status.indexOf("返却済み") >= 0 ? " is-muted" : ""));

      var top = document.createElement("div");
      top.className = "p-admin-card__top";
      var cid = document.createElement("span");
      cid.className = "p-admin-card__id u-mono";
      cid.textContent = o.id;
      top.appendChild(cid);
      var crisk = document.createElement("span");
      crisk.className = "c-badge c-badge--" + riskTone(o.risk);
      crisk.textContent = riskLabelLong(o.risk);
      top.appendChild(crisk);
      card.appendChild(top);

      var citem = document.createElement("p");
      citem.className = "p-admin-card__item";
      appendItemLines(citem, o.item);
      card.appendChild(citem);

      var cmember = document.createElement("p");
      cmember.className = "p-admin-card__member";
      cmember.textContent = o.member;
      card.appendChild(cmember);

      var rowKyc = document.createElement("div");
      rowKyc.className = "p-admin-card__row";
      rowKyc.innerHTML = '<span>本人確認</span>';
      var kb2 = document.createElement("span");
      kb2.className = "c-badge c-badge--" + kycTone(o.kyc);
      kb2.textContent = o.kyc;
      rowKyc.appendChild(kb2);
      card.appendChild(rowKyc);

      var rowMatch = document.createElement("div");
      rowMatch.className = "p-admin-card__row";
      rowMatch.innerHTML = '<span>三点照合</span>';
      var mb2 = document.createElement("span");
      mb2.className = "c-badge c-badge--" + matchTone(o.match);
      mb2.textContent = matchShort(o.match);
      rowMatch.appendChild(mb2);
      card.appendChild(rowMatch);

      var cstatus = document.createElement("p");
      cstatus.className = "p-admin-card__status p-admin-status p-admin-status--" + statusTone(o.status);
      cstatus.textContent = o.status;
      card.appendChild(cstatus);

      var actionWrap = document.createElement("div");
      actionWrap.className = "p-admin-card__action";
      actionWrap.appendChild(buildActionCell(o, true));
      card.appendChild(actionWrap);

      if(clickable){
        card.addEventListener("click", function(id){
          return function(e){
            if(e.target.closest && e.target.closest("button")) return;
            goOrder(id);
          };
        }(o.id));
      }
      cards.appendChild(card);
    });

    var filterNote = document.getElementById("filterNote");
    if(filterNote){
      if(state.filter){
        filterNote.hidden = false;
        var span = filterNote.querySelector("span.u-mono");
        if(span) span.textContent = "絞り込み中：" + (FILTER_LABEL[state.filter] || "");
      }else{
        filterNote.hidden = true;
      }
    }
  }

  /* ---------------- 注文詳細 ---------------- */
  function renderOrderDetail(id){
    var o = findOrder(id);
    if(!o) return;
    state.orderId = id;

    var chips = document.querySelectorAll("[data-order-chip]");
    for(var i=0;i<chips.length;i++){
      var isCurrent = chips[i].getAttribute("data-order-chip") === id;
      chips[i].setAttribute("aria-pressed", isCurrent ? "true" : "false");
      chips[i].classList.toggle("is-current", isCurrent);
    }

    setText("orderId", o.id);
    setText("orderItem", o.item);
    setText("orderMember", "会員：" + o.member);

    var riskBadge = document.getElementById("orderRiskBadge");
    if(riskBadge){
      riskBadge.className = "c-badge p-admin-orderHead__riskBadge c-badge--" + riskTone(o.risk);
      riskBadge.textContent = riskLabelLong(o.risk);
    }

    setText("orderReason", REASON[id] || "—");
    setText("orderKyc", KYC_TEXT[id] || "—");
    setText("orderPayment", PAYMENT_TEXT[id] || "—");

    var cancelNotice = document.getElementById("orderCancelNotice");
    if(cancelNotice) cancelNotice.hidden = !(id === "#T-1044");

    var addr = MATCH_ADDR[id];
    if(addr){
      setText("matchId", addr.id);
      setText("matchBilling", addr.billing);
      setText("matchShipping", addr.shipping);
      var mb = document.getElementById("matchBadge");
      if(mb){
        mb.className = "c-badge c-badge--" + addr.tone;
        mb.textContent = addr.label;
      }
      setText("matchNote", addr.note);
    }

    renderTimeline(id);
    renderActions(o);
  }

  function renderTimeline(id){
    var ol = document.getElementById("orderTimeline");
    if(!ol) return;
    ol.innerHTML = "";
    var stateList = TIMELINE[id] || [];
    STAGES.forEach(function(name, i){
      var s = stateList[i] || "skip";
      var li = document.createElement("li");
      li.className = "p-admin-timeline__item is-" + s;
      var marker = document.createElement("span");
      marker.className = "p-admin-timeline__marker";
      marker.setAttribute("aria-hidden", "true");
      li.appendChild(marker);
      var nm = document.createElement("p");
      nm.className = "p-admin-timeline__name";
      nm.textContent = (i + 1) + " " + name;
      li.appendChild(nm);
      var st = document.createElement("p");
      st.className = "p-admin-timeline__state u-mono";
      st.textContent = STATE_LABEL[s] || s;
      li.appendChild(st);
      ol.appendChild(li);
    });
  }

  function renderActions(o){
    var approve = document.getElementById("actApprove");
    var hold = document.getElementById("actHold");
    var cancel = document.getElementById("actCancel");
    if(!approve || !hold || !cancel) return;

    /* "キャンセル推奨"（未対応の提案）と「キャンセル済み」（対応済みの終端状態）を混同しない */
    var terminal = o.status.indexOf("キャンセル済み") >= 0;
    var alreadyApproved = o.status.indexOf("発送承認済み") >= 0 || o.status.indexOf("貸出中") >= 0 || o.status.indexOf("返却済み") >= 0;

    approve.disabled = terminal || alreadyApproved || o.kyc !== "済";
    approve.title = (o.kyc !== "済") ? "本人確認が未完了のため承認できません。" : "";
    hold.disabled = terminal;
    cancel.disabled = terminal;
  }

  /* ---------------- 操作（発送承認／保留／キャンセル） ---------------- */
  function applyAction(id, action){
    var o = findOrder(id);
    if(!o) return;
    var msg = "";

    if(action === "approve"){
      if(o.kyc !== "済"){
        TAMESU.toast("本人確認が未完了のため承認できません（サンプルのため実際の処理は行われません）");
        return;
      }
      o.status = "発送承認済み・発送準備中";
      msg = o.id + " の発送を承認しました（サンプルのため実際の処理は行われません）";
    }else if(action === "hold"){
      o.status = "保留・本人へ確認メール送信済み";
      msg = o.id + " を保留し、確認メールを送信しました（サンプルのため実際の処理は行われません）";
    }else if(action === "cancel"){
      o.status = "キャンセル済み";
      msg = o.id + " をキャンセルしました（サンプルのため実際の処理は行われません）";
    }

    TAMESU.toast(msg);
    renderMetrics();
    renderToday();
    if(state.tab === "order" && state.orderId === id){
      renderOrderDetail(id);
    }
  }

  function setText(elId, text){
    var el = document.getElementById(elId);
    if(el) el.textContent = text;
  }

  /* ---------------- タブ切り替え／ハッシュ連動 ---------------- */
  function showTab(tab){
    state.tab = tab;
    var panels = document.querySelectorAll(".p-admin-panel");
    for(var i=0;i<panels.length;i++){
      panels[i].hidden = panels[i].getAttribute("data-panel") !== tab;
    }
    var navItems = document.querySelectorAll("[data-tab-link]");
    for(var j=0;j<navItems.length;j++){
      var isCurrent = navItems[j].getAttribute("data-tab-link") === tab;
      navItems[j].classList.toggle("is-current", isCurrent);
      if(isCurrent) navItems[j].setAttribute("aria-current", "page");
      else navItems[j].removeAttribute("aria-current");
    }
  }

  function goOrder(id){
    window.location.hash = "order-" + id.replace("#", "");
  }

  function parseHash(){
    var hash = (window.location.hash || "").replace("#", "");
    if(hash.indexOf("order-") === 0){
      var oid = "#" + hash.slice(6);
      if(!findOrder(oid) || DETAIL_IDS.indexOf(oid) < 0) oid = "#T-1042";
      showTab("order");
      renderOrderDetail(oid);
    }else if(hash === "rules"){
      showTab("rules");
    }else{
      showTab("today");
    }
  }

  /* ---------------- 起動 ---------------- */
  function init(){
    renderMetrics();
    renderToday();
    renderOrderDetail(state.orderId);
    renderTimeline(state.orderId);
    parseHash();

    window.addEventListener("hashchange", parseHash);

    var approveBtn = document.getElementById("actApprove");
    var holdBtn = document.getElementById("actHold");
    var cancelBtn = document.getElementById("actCancel");
    if(approveBtn) approveBtn.addEventListener("click", function(){ applyAction(state.orderId, "approve"); });
    if(holdBtn) holdBtn.addEventListener("click", function(){ applyAction(state.orderId, "hold"); });
    if(cancelBtn) cancelBtn.addEventListener("click", function(){ applyAction(state.orderId, "cancel"); });

    var metricEls = document.querySelectorAll(".p-admin-metric");
    for(var i=0;i<metricEls.length;i++){
      metricEls[i].addEventListener("click", function(){
        var key = this.getAttribute("data-metric");
        state.filter = (state.filter === key) ? null : key;
        renderMetrics();
        renderToday();
      });
    }

    var filterClear = document.getElementById("filterClear");
    if(filterClear){
      filterClear.addEventListener("click", function(){
        state.filter = null;
        renderMetrics();
        renderToday();
      });
    }
  }

  try{
    init();
  }catch(e){
    if(window.console && console.warn) console.warn("[admin.js]", e);
  }

})();
