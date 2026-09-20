/* =================================================================
   TAMESU（仮称） — index ページ固有JS
   「迷ったらこの3台」を data.js の picks から描画する。
   ================================================================= */
(function(){
  "use strict";
  try{
    var DATA = window.TAMESU_DATA;
    var TAMESU = window.TAMESU;
    var host = document.getElementById("indexPicks");
    if(!host || !DATA || !TAMESU) return;

    var html = "";
    var picks = DATA.picks || [];
    for(var i=0;i<picks.length;i++){
      var pick = picks[i];
      var p = TAMESU.product(pick.handle);
      if(!p) continue;
      html += ''
        + '<div class="p-index-picks__cell">'
        +   '<p class="p-index-picks__tag u-mono">' + pick.tag + '</p>'
        +   TAMESU.productCard(p, {period:"n3"})
        + '</div>';
    }
    host.innerHTML = html;
  }catch(e){
    if(window.console && console.warn) console.warn("[index.js]", e);
  }
})();
