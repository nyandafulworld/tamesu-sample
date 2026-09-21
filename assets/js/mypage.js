/* =================================================================
   TAMESU（仮称） — mypage ページ固有JS
   classic script / IIFE。1機能ずつ try/catch で保護する。
   ================================================================= */
(function(){
  "use strict";

  var DATA = window.TAMESU_DATA || {periods:[]};
  var WD = ["日","月","火","水","木","金","土"];

  function fmtDate(d){
    return (d.getMonth() + 1) + "月" + d.getDate() + "日（" + WD[d.getDay()] + "）";
  }

  /* 受取予定日・返却期限を「本日」基準で計算する（#T-1042・3泊4日）。
     受取までの日数（発送準備の目安）は3日、宿泊数はdata.jsのperiodsから取得。 */
  function initOrderDates(){
    var elReceive = document.getElementById("mypageReceiveDate");
    var elReturn = document.getElementById("mypageReturnDate");
    if(!elReceive || !elReturn) return;

    var periods = DATA.periods || [];
    var nights = 3;
    for(var i = 0; i < periods.length; i++){
      if(periods[i].key === "n3"){ nights = periods[i].nights || 3; break; }
    }

    var RECEIVE_LEAD_DAYS = 3;
    var today = new Date();
    var receive = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    receive.setDate(receive.getDate() + RECEIVE_LEAD_DAYS);
    var ret = new Date(receive.getFullYear(), receive.getMonth(), receive.getDate());
    ret.setDate(ret.getDate() + nights);

    elReceive.textContent = fmtDate(receive);
    elReturn.textContent = fmtDate(ret);
  }

  /* 返却方法チップ：単一選択にし、送信ボタンの data-demo 文言に選択内容を反映する。 */
  function initReturnChips(){
    var chips = document.querySelectorAll("[data-return-chip]");
    var submit = document.querySelector("[data-return-submit]");
    if(!chips.length) return;

    for(var i = 0; i < chips.length; i++){
      chips[i].addEventListener("click", function(){
        for(var j = 0; j < chips.length; j++){ chips[j].setAttribute("aria-pressed", "false"); }
        this.setAttribute("aria-pressed", "true");
        if(submit){
          var b = this.querySelector("b");
          var name = b ? b.textContent : "選択した方法";
          submit.setAttribute("data-demo", name + "で返却の申し込みを受け付けました（サンプルのため実際には送信されません）。");
        }
      });
    }
  }

  function run(name, fn){
    try{ fn(); }
    catch(e){ if(window.console && console.warn) console.warn("[mypage.js]", name, e); }
  }

  run("order-dates", initOrderDates);
  run("return-chips", initReturnChips);

})();
