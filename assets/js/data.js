/* =================================================================
   TAMESU（仮称）サンプルサイト — 共有データ window.TAMESU_DATA
   価格・在庫・人物・注文はすべてダミーです。
   このファイルはページ側から編集しない（凍結対象）。
   ================================================================= */
window.TAMESU_DATA = {

  brand:{
    name:"TAMESU",
    tagName:"仮称",
    tagline:"高額カメラ専門レンタル",
    catch:"憧れの一台を、買う前に試す。必要な日だけ、安心して。",
    concept:"安心して借りられる。安心して貸せる。高額カメラ専門レンタル。"
  },

  pages:[
    {key:"index",      group:"customer",    no:"01", name:"トップ",     hint:"第一印象と信頼",             file:"index.html"},
    {key:"collection", group:"customer",    no:"02", name:"機材一覧",   hint:"用途から絞り込む",           file:"collection.html"},
    {key:"product",    group:"customer",    no:"03", name:"機材詳細",   hint:"期間と補償で料金が変わる",   file:"product.html"},
    {key:"guide",      group:"customer",    no:"04", name:"ご利用の流れ", hint:"登録から返却まで",         file:"guide.html"},
    {key:"security",   group:"customer",    no:"05", name:"安心の仕組み", hint:"不正注文への5つの備え",     file:"security.html"},
    {key:"mypage",     group:"customer",    no:"06", name:"マイページ", hint:"審査状況と返却手続き",       file:"mypage.html"},
    {key:"admin",      group:"operator",    no:"07", name:"運営管理",   hint:"審査と発送承認",             file:"admin.html"},
    {key:"lp",         group:"acquisition", no:"08", name:"広告LP",     hint:"広告から申込までの導線",     file:"lp.html"}
  ],

  /* ---- 画像マニフェスト（key / ratio / width / height / alt / exif） ---- */
  images:{
    "hero-main":   {ratio:"16:9", w:1920, h:1080, alt:"紙色の背景に置かれたフラッグシップミラーレスカメラ", exif:"90mm  f/8  1/125  ISO 100"},
    "prod-a1m2":   {ratio:"1:1",  w:1200, h:1200, alt:"フラッグシップ・フルサイズミラーレス（ボディ）", exif:"BODY  50.1MP  30fps"},
    "prod-a7r5":   {ratio:"1:1",  w:1200, h:1200, alt:"高画素フルサイズミラーレス（ボディ）", exif:"BODY  61.0MP"},
    "prod-r5m2":   {ratio:"1:1",  w:1200, h:1200, alt:"フルサイズミラーレス（ボディ）", exif:"BODY  45.0MP  8K"},
    "prod-r1":     {ratio:"1:1",  w:1200, h:1200, alt:"プロ向けフラッグシップ（縦位置グリップ一体型ボディ）", exif:"BODY  24.2MP  40fps"},
    "prod-z9":     {ratio:"1:1",  w:1200, h:1200, alt:"フラッグシップ・フルサイズミラーレス（縦位置グリップ一体型）", exif:"BODY  45.7MP  8K"},
    "prod-z8":     {ratio:"1:1",  w:1200, h:1200, alt:"フルサイズミラーレス（ボディ）", exif:"BODY  45.7MP"},
    "prod-gfx100s2":{ratio:"1:1", w:1200, h:1200, alt:"中判ミラーレス（ボディ）", exif:"BODY  102MP  44x33"},
    "prod-q3":     {ratio:"1:1",  w:1200, h:1200, alt:"高級コンパクト（レンズ一体型）", exif:"28mm  f/1.7  60.3MP"},
    "prod-m11p":   {ratio:"1:1",  w:1200, h:1200, alt:"レンジファインダー（ボディ＋標準レンズ）", exif:"BODY  60.3MP  RF"},
    "prod-fx3":    {ratio:"1:1",  w:1200, h:1200, alt:"シネマカメラ（ボディ＋トップハンドル）", exif:"BODY  4K120p  S35/FF"},
    "prod-70200":  {ratio:"1:1",  w:1200, h:1200, alt:"望遠ズームレンズ 70-200mm F2.8", exif:"70-200mm  f/2.8"},
    "prod-400f28": {ratio:"1:1",  w:1200, h:1200, alt:"超望遠単焦点レンズ 400mm F2.8", exif:"400mm  f/2.8  TC1.4x"},
    "sec-hero":    {ratio:"16:9", w:1920, h:1080, alt:"ウレタンフォームに収められたカメラと耐衝撃ハードケース", exif:"35mm  f/4  1/60  ISO 400"},
    "lp-hero":     {ratio:"16:9", w:1920, h:1080, alt:"自宅で届いたレンタルカメラを手に取る男性", exif:"35mm  f/2  1/125  ISO 320"},
    "scene-travel":  {ratio:"3:2", w:1600, h:1067, alt:"旅先の高原で風景を撮る夫婦", exif:"24mm  f/8  1/500  ISO 100"},
    "scene-undokai": {ratio:"3:2", w:1600, h:1067, alt:"運動会で望遠レンズを構える父親", exif:"200mm  f/2.8  1/2000  ISO 200"},
    "scene-trial":   {ratio:"3:2", w:1600, h:1067, alt:"購入前に2台のカメラを自宅で比較する", exif:"50mm  f/2.8  1/80  ISO 640"},
    "scene-youtube": {ratio:"3:2", w:1600, h:1067, alt:"小さなスタジオで撮影準備をする映像クリエイター", exif:"35mm  f/2  1/60  ISO 800"},
    "flow-unbox":    {ratio:"3:2", w:1600, h:1067, alt:"届いた箱とハードケース、同梱の返送用伝票", exif:"35mm  f/4  1/100  ISO 400"},
    "flow-inspect":  {ratio:"3:2", w:1600, h:1067, alt:"発送前にカメラを点検・清掃する技術スタッフの手元", exif:"60mm  f/4  1/100  ISO 400"},
    "flow-return":   {ratio:"3:2", w:1600, h:1067, alt:"玄関先で宅配スタッフに返却の箱を渡す", exif:"35mm  f/2.8  1/250  ISO 200"},
    "company-bench": {ratio:"3:2", w:1600, h:1067, alt:"設備工事の現場で培った機器管理を行う技術者", exif:"35mm  f/2.8  1/100  ISO 500"},
    "kit-set":     {ratio:"1:1",  w:1200, h:1200, alt:"レンタルセットの内容物（ボディ、レンズ、バッテリー2個、充電器、ストラップ、メモリーカード）", exif:"SET  7 ITEMS"},
    "case-seal":   {ratio:"1:1",  w:1200, h:1200, alt:"封緘シールが貼られた耐衝撃ハードケース", exif:"CASE  SEALED"},
    "voice-1":     {ratio:"1:1",  w:1200, h:1200, alt:"50代男性のお客様（サンプル）", exif:""},
    "voice-2":     {ratio:"1:1",  w:1200, h:1200, alt:"30代女性のお客様（サンプル）", exif:""},
    "voice-3":     {ratio:"1:1",  w:1200, h:1200, alt:"40代男性のお客様（サンプル）", exif:""},
    "lp-regret":   {ratio:"3:2",  w:1600, h:1067, alt:"高額なカメラの購入を前に悩む男性", exif:"50mm  f/2  1/60  ISO 800"}
  },

  /* ---- 商品（12点。参考購入価格・レンタル料・在庫はダミー） ---- */
  products:[
    {
      handle:"a1m2", img:"prod-a1m2", maker:"SONY", name:"α1 II", type:"body",
      category:"フルサイズ・フラッグシップ", rank:"S", refPrice:990000,
      n1:14800, n3:29800, n7:49800, stock:2, left:1,
      uses:["trial","event","wildlife"],
      specs:[
        ["有効画素数","約5010万画素"],
        ["連続撮影","最高30コマ/秒（電子シャッター）"],
        ["手ブレ補正","ボディ内5軸・最大8.5段"],
        ["動画","8K/4K記録に対応"],
        ["マウント","ソニーEマウント"],
        ["質量","約743g（本体のみ）"]
      ],
      intro:"高画素と速写性を高い次元で両立させた、ソニーの現行フラッグシップ。一台で結果を出したい撮影に。"
    },
    {
      handle:"a7r5", img:"prod-a7r5", maker:"SONY", name:"α7R V", type:"body",
      category:"フルサイズ・高画素", rank:"A", refPrice:560000,
      n1:8800, n3:17800, n7:29800, stock:3, left:2,
      uses:["trial","travel","portrait"],
      specs:[
        ["有効画素数","約6100万画素"],
        ["AF","AI被写体認識による高精度AF"],
        ["連続撮影","最高10コマ/秒"],
        ["手ブレ補正","ボディ内5軸・最大8段"],
        ["マウント","ソニーEマウント"],
        ["質量","約723g（本体のみ）"]
      ],
      intro:"高画素機の描写力を、購入前に確かめたい方の最初の一台に。風景からポートレートまで解像感が違います。"
    },
    {
      handle:"r5m2", img:"prod-r5m2", maker:"Canon", name:"EOS R5 Mark II", type:"body",
      category:"フルサイズ・オールラウンド", rank:"A", refPrice:650000,
      n1:9800, n3:19800, n7:32800, stock:3, left:1,
      uses:["trial","event","video"],
      specs:[
        ["有効画素数","約4500万画素"],
        ["連続撮影","最高30コマ/秒（電子シャッター）"],
        ["動画","8K RAW内部記録に対応"],
        ["手ブレ補正","ボディ内5軸協調制御"],
        ["マウント","キヤノンRFマウント"],
        ["質量","約746g（本体のみ）"]
      ],
      intro:"静止画も動画も高い水準でこなすオールラウンダー。発表会の撮影から動画制作まで一台で試せます。"
    },
    {
      handle:"r1", img:"prod-r1", maker:"Canon", name:"EOS R1", type:"body",
      category:"フルサイズ・プロスポーツ", rank:"S", refPrice:1090000,
      n1:16800, n3:33800, n7:56800, stock:1, left:0,
      uses:["event","wildlife"],
      specs:[
        ["有効画素数","約2420万画素"],
        ["連続撮影","最高40コマ/秒（電子シャッター）"],
        ["AF","クロス測距・高速被写体認識"],
        ["手ブレ補正","ボディ内5軸"],
        ["マウント","キヤノンRFマウント"],
        ["質量","約745g（本体のみ）"]
      ],
      intro:"速さを最優先に設計されたプロスポーツ機。動く被写体を確実に止めたい撮影のために。"
    },
    {
      handle:"z9", img:"prod-z9", maker:"Nikon", name:"Z9", type:"body",
      category:"フルサイズ・フラッグシップ", rank:"S", refPrice:770000,
      n1:11800, n3:23800, n7:39800, stock:2, left:1,
      uses:["event","wildlife","video"],
      specs:[
        ["有効画素数","約4571万画素"],
        ["連続撮影","最高20コマ/秒（RAW）"],
        ["動画","8K/30p記録に対応"],
        ["手ブレ補正","ボディ内5軸"],
        ["マウント","ニコンZマウント"],
        ["質量","約1340g（バッテリー・カード込み）"]
      ],
      intro:"メカシャッターを持たないニコンのフラッグシップ。野鳥や飛行機など高速被写体との相性を確かめたい方に。"
    },
    {
      handle:"z8", img:"prod-z8", maker:"Nikon", name:"Z8", type:"body",
      category:"フルサイズ・オールラウンド", rank:"A", refPrice:600000,
      n1:8800, n3:17800, n7:29800, stock:3, left:2,
      uses:["trial","travel","event"],
      specs:[
        ["有効画素数","約4571万画素"],
        ["連続撮影","最高20コマ/秒（RAW）"],
        ["動画","8K/30p記録に対応"],
        ["手ブレ補正","ボディ内5軸"],
        ["マウント","ニコンZマウント"],
        ["質量","約910g（バッテリー・カード込み）"]
      ],
      intro:"Z9の性能を小型ボディに凝縮した一台。何を撮るか決まっていない旅にも安心して持ち出せます。"
    },
    {
      handle:"gfx100s2", img:"prod-gfx100s2", maker:"FUJIFILM", name:"GFX100S II", type:"body",
      category:"中判・1億画素", rank:"S", refPrice:850000,
      n1:12800, n3:25800, n7:42800, stock:1, left:1,
      uses:["trial","travel","portrait"],
      specs:[
        ["有効画素数","約1億200万画素（中判）"],
        ["センサー","43.8×32.9mm ラージフォーマット"],
        ["手ブレ補正","ボディ内5軸・最大8段"],
        ["連続撮影","最高7コマ/秒"],
        ["マウント","富士フイルムGマウント"],
        ["質量","約883g（本体のみ）"]
      ],
      intro:"中判センサーが生む階調と解像感を、購入前に一度。じっくり構えるポートレートや風景で違いが分かります。"
    },
    {
      handle:"q3", img:"prod-q3", maker:"Leica", name:"Q3", type:"compact",
      category:"高級コンパクト", rank:"S", refPrice:1000000,
      n1:13800, n3:27800, n7:46800, stock:2, left:1,
      uses:["trial","travel"],
      specs:[
        ["有効画素数","約6030万画素"],
        ["レンズ","28mm F1.7 単焦点（固定）"],
        ["連続撮影","最高15コマ/秒"],
        ["動画","8K記録に対応"],
        ["マウント","レンズ一体型"],
        ["質量","約743g（本体のみ）"]
      ],
      intro:"荷物を増やさず一台で完結する旅の相棒。所有する満足感を、旅先で先に確かめられます。"
    },
    {
      handle:"m11p", img:"prod-m11p", maker:"Leica", name:"M11-P", type:"body",
      category:"レンジファインダー", rank:"S", refPrice:1500000,
      n1:19800, n3:39800, n7:66800, stock:1, left:0,
      uses:["trial","travel"],
      specs:[
        ["有効画素数","約6030万画素（トリプルレゾリューション）"],
        ["フォーカス","距離計連動マニュアルフォーカス"],
        ["マウント","ライカMマウント"],
        ["質量","約530g（本体のみ）"],
        ["特徴","静止画専用機（動画記録なし）"]
      ],
      intro:"操作のすべてを自分の手に取り戻す一台。所有する前に、その重さと手応えを確かめてほしい機材です。"
    },
    {
      handle:"fx3", img:"prod-fx3", maker:"SONY", name:"FX3", type:"cine",
      category:"シネマカメラ", rank:"A", refPrice:580000,
      n1:9800, n3:19800, n7:32800, stock:2, left:2,
      uses:["video"],
      specs:[
        ["有効画素数","約1010万画素（動画特化）"],
        ["動画","4K/120p 10bit記録"],
        ["感度","デュアルベースISO"],
        ["形状","ビューファインダーレス・シネマボディ"],
        ["マウント","ソニーEマウント"],
        ["質量","約715g（本体のみ）"]
      ],
      intro:"動画制作のために設計されたボディ形状と発色。YouTubeや商品撮影の画づくりを試せます。"
    },
    {
      handle:"70200gm2", img:"prod-70200", maker:"SONY", name:"FE 70-200mm F2.8 GM OSS II", type:"lens",
      category:"望遠ズーム", rank:"B", refPrice:400000,
      n1:5800, n3:11800, n7:19800, stock:3, left:3,
      uses:["event","wildlife","portrait"],
      specs:[
        ["焦点距離","70-200mm"],
        ["開放絞り","F2.8（通し）"],
        ["手ブレ補正","光学式・最大5.5段"],
        ["最短撮影距離","0.4m（広角側）"],
        ["マウント","ソニーEマウント"],
        ["質量","約1045g"]
      ],
      intro:"発表会やスポーツの定番画角。単体購入前に、望遠の圧縮効果と重さを体験できます。"
    },
    {
      handle:"z400f28", img:"prod-400f28", maker:"Nikon", name:"NIKKOR Z 400mm f/2.8 TC VR S", type:"lens",
      category:"超望遠単焦点", rank:"S", refPrice:2000000,
      n1:24800, n3:49800, n7:82800, stock:1, left:0,
      uses:["wildlife","event"],
      specs:[
        ["焦点距離","400mm（内蔵テレコン使用時560mm）"],
        ["開放絞り","F2.8"],
        ["手ブレ補正","光学式・最大5.5段"],
        ["内蔵テレコンバーター","1.4倍"],
        ["マウント","ニコンZマウント"],
        ["質量","約2950g"]
      ],
      intro:"野鳥や航空機撮影の憧れの一本。200万円の判断を下す前に、その画角と重さを確かめられます。"
    }
  ],

  /* ---- 用途タグ ---- */
  uses:{
    trial:   {name:"購入前のお試し", desc:"高額機の購入前に、実際の描写と操作感を確かめる。", img:"scene-trial"},
    travel:  {name:"旅行",           desc:"荷物を増やしすぎず、旅先での一枚にこだわる。",     img:"scene-travel"},
    event:   {name:"運動会・発表会", desc:"年に数回の晴れ舞台を、望遠と速写で確実に残す。",   img:"scene-undokai"},
    video:   {name:"動画・YouTube",  desc:"動画制作向けのボディと画づくりを試す。",           img:"scene-youtube"},
    portrait:{name:"ポートレート",   desc:"階調と解像感で、人物の質感を丁寧に描く。",         img:null},
    wildlife:{name:"野鳥・飛行機・スポーツ", desc:"高速で動く被写体を、望遠と速写性能で追う。", img:null}
  },

  /* ---- 機材ランクと審査レベル ---- */
  ranks:[
    {key:"B", range:"参考購入価格 50万円未満", review:"本人確認（顔写真付き身分証＋本人名義カード）"},
    {key:"A", range:"50万〜80万円未満",         review:"B ＋ 本人確認書類の住所へのみ発送"},
    {key:"S", range:"80万円以上",               review:"A ＋ 電話での在籍・意思確認、初回は対面受取（受領サイン）"}
  ],

  /* ---- 補償（3択・中央がおすすめ） ---- */
  protections:[
    {key:"basic", name:"標準補償",               fee:"料金に含む",           cap:50000, recommended:false},
    {key:"plus",  name:"あんしん補償（おすすめ）", fee:"レンタル料の10%",     cap:10000, recommended:true},
    {key:"full",  name:"フル補償",               fee:"レンタル料の18%",     cap:0,     recommended:false}
  ],
  protectionNote:"盗難・紛失・未返却は全プラン補償対象外です（規約に基づき実費を請求します）。",

  /* ---- レンタル期間 ---- */
  periods:[
    {key:"n1", name:"1泊2日", nights:1, days:2, recommended:false},
    {key:"n3", name:"3泊4日", nights:3, days:4, recommended:true},
    {key:"n7", name:"7泊8日", nights:7, days:8, recommended:false}
  ],

  /* ---- 迷ったらこの3台 ---- */
  picks:[
    {handle:"a7r5", tag:"はじめての高画素"},
    {handle:"z8",   tag:"何でも撮れる一台"},
    {handle:"q3",   tag:"旅に一台だけ"}
  ],

  /* ---- デモ通し筋の人物（mypage / admin 共通） ---- */
  persona:{
    name:"三浦 健一",
    label:"様（サンプル）",
    address:"福岡県福岡市中央区サンプル町1-2-3",
    tel:"090-0000-0000",
    memberNo:"TM-00128",
    verified:true,
    verifiedRank:"S",
    verifiedNote:"本人確認済み（ランクSまで承認）"
  },

  /* ---- デモ通し筋の注文（mypage / admin 共通） ---- */
  orders:[
    {
      id:"#T-1042", member:"三浦 健一", item:"α1 II・3泊4日・あんしん補償",
      risk:"low", kyc:"済", match:"一致",
      status:"発送承認待ち", statusMypage:"審査完了・発送準備中"
    },
    {
      id:"#T-1043", member:"高木 翔", item:"Leica Q3・1泊2日",
      risk:"mid", kyc:"済", match:"配送先が身分証住所と不一致（勤務先を指定）",
      status:"保留・本人へ確認メール送信済み"
    },
    {
      id:"#T-1044", member:"新規会員", item:"Z9 ＋ 400mm f/2.8・7泊8日",
      risk:"high", kyc:"未完了", match:"照合不可",
      status:"自動保留 → キャンセル推奨",
      note:"短時間に複数回の決済失敗、カード名義と会員名が不一致、登録から5分で高額注文"
    },
    {
      id:"#T-1041", member:"会員", item:"EOS R5 Mark II",
      risk:"low", kyc:"済", match:"一致",
      status:"貸出中（返却予定日あり）"
    },
    {
      id:"#T-1039", member:"会員", item:"α7R V",
      risk:"low", kyc:"済", match:"一致",
      status:"返却済み・検品完了"
    }
  ]
};
