/* ===== 店舗データ（サンプル。実在店舗に差し替えてください） ===== */
/* lat: 緯度 / lng: 経度（距離順の並び替えに使用） */
const stores = [
  { id:1, name:"雷　津田沼駅前店", type:"二郎系", address:"千葉県船橋市前原西2-4-10", lat:35.6928262540814, lng:140.01886022851002, emoji:"🍜", image:"images/shop1-1.jpg",
    entry:4, queue:3, order:"食券制と口頭", regular:"普通",
    rules:["麺の硬さ・味の濃さは食券購入時に選ぶ","トッピングは食券機で追加"],
    seats:"カウンター席　テーブル席", atmosphere:"静かで落ち着いた雰囲気",
    tip:"初めてならミニにすべし！" },

  { id:2, name:"△△二郎 駅前店", type:"二郎系", address:"千葉県船橋市前原東3-1-5", lat:35.6955, lng:140.0102, emoji:"🍜", image:"",
    entry:2, queue:12, order:"食券制", regular:"多い",
    rules:["食券購入後、店員さんに麺量やコールを聞かれる","コールは聞かれてから伝える"],
    seats:"カウンター席（詰めて座ることがあります）", atmosphere:"活気があり、やや賑やか",
    tip:"量が多いので、初めては小ぶりの量から試すのがおすすめです。" },

  { id:3, name:"□□食堂", type:"その他", address:"千葉県船橋市本町7-8-9", lat:35.6870, lng:140.0310, emoji:"🍜", image:"",
    entry:5, queue:2, order:"口頭注文", regular:"普通",
    rules:["着席後、店員さんに注文を伝える","支払いはテーブルで会計"],
    seats:"テーブル席・カウンター席", atmosphere:"家族連れも多く、明るい雰囲気",
    tip:"迷ったら店員さんに「おすすめは？」と聞けば大丈夫です。" },

  { id:4, name:"◇◇家 二号店", type:"家系", address:"千葉県習志野市谷津1-1-1", lat:35.7010, lng:140.0350, emoji:"🍜", image:"",
    entry:3, queue:6, order:"食券制", regular:"普通",
    rules:["入口で食券を購入","海苔・ほうれん草は食券機でトッピング可能"],
    seats:"カウンター席", atmosphere:"ほどよく賑やか",
    tip:"家系は好みの調整が多いので、初回は基本メニューがおすすめです。" },

  { id:5, name:"▽▽らーめん", type:"その他", address:"千葉県習志野市津田沼2-2-2", lat:35.6905, lng:140.0050, emoji:"🍜", image:"",
    entry:4, queue:7, order:"食券制", regular:"少ない",
    rules:["食券機で基本メニューを選ぶ","席に着いたら食券を店員さんへ"],
    seats:"カウンター席・テーブル席", atmosphere:"落ち着いた雰囲気",
    tip:"鶏白湯系で、クセが少なく食べやすいと評判です。" },

  { id:6, name:"☆☆二郎 本店", type:"二郎系", address:"千葉県船橋市前原西3-3-3", lat:35.6980, lng:140.0080, emoji:"🍜", image:"",
    entry:1, queue:15, order:"食券制", regular:"多い",
    rules:["麺量・野菜量・脂などの呼び方を事前に確認","食べ終わったら速やかに退店"],
    seats:"カウンター席のみ", atmosphere:"常連が多く、独特の雰囲気",
    tip:"初めての方は、開店直後や平日の昼過ぎを狙うと入りやすいです。" }
];

/* ===== 共通設定 ===== */
const GENRE_IMG = {
  "二郎系": "icons/jiro.png",
  "家系":   "icons/iekei.png",
  "その他": "icons/other.png"
};

const REG = { "少ない":0, "普通":1, "多い":2 };

/* ===== 並び替え（index.html の #sort の value と一致させる） ===== */
const SORTS = {
  ease:     (a,b) => b.entry - a.entry,                  // 入りやすさ順（高い順）
  queue:    (a,b) => a.queue - b.queue,                  // 行列が短い順
  name:     (a,b) => a.name.localeCompare(b.name, "ja"), // 名前順
  regular:  (a,b) => REG[a.regular] - REG[b.regular],    // 常連が少ない順
  distance: (a,b) => {                                   // 近い順
    const da = distOf(a), db = distOf(b);
    return da === db ? 0 : da - db;
  }
};

/* ===== 距離計算と位置情報 ===== */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

let userLoc = null;

function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        resolve(userLoc);
      },
      err => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
}

function distOf(store) {
  if (!userLoc || store.lat == null || store.lng == null) return Infinity;
  return distanceKm(userLoc.lat, userLoc.lng, store.lat, store.lng);
}

function distanceLabel(store) {
  const d = distOf(store);
  if (!isFinite(d)) return "";
  return d < 1 ? `約${Math.round(d * 1000)}m` : `約${d.toFixed(1)}km`;
}

/* ===== 共通ユーティリティ ===== */
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

function queueInfo(q){
  if(q>=10) return {cls:"ng",  txt:"混みやすい"};
  if(q>=5)  return {cls:"mid", txt:"やや並ぶ"};
  return {cls:"ok", txt:"空きやすい"};
}

function renderCards(list, container){
  if(!list.length){
    container.innerHTML = '<p class="empty">該当するお店がありません。</p>';
    return;
  }
  container.innerHTML = list.map(s => {
    const q = queueInfo(s.queue);
    const img = s.image
      ? `<img src="${esc(s.image)}" alt="${esc(s.name)}">`
      : `<div>${s.emoji}</div><div class="ph">写真準備中</div>`;
    return `
    <div class="card" data-id="${s.id}">
      <div class="img">${img}<span class="badge">${esc(s.type)}</span></div>
      <div class="body">
        <h3>${esc(s.name)}</h3>
        <div class="addr">📍 ${esc(s.address)} <span class="dist">${distanceLabel(s)}</span></div>
        <div class="row"><span>入りやすさ</span><span class="stars">${"★".repeat(s.entry)}${"☆".repeat(5-s.entry)}</span></div>
        <div class="row"><span>行列の目安</span><span class="${q.cls}">約${s.queue}人（${q.txt}）</span></div>
        <div class="row"><span>注文方法</span><span>${esc(s.order)}</span></div>
        <div class="row"><span>常連客</span><span>${esc(s.regular)}</span></div>
      </div>
    </div>`;
  }).join("");
}

/* ===== 詳細モーダル（全ページ共通） ===== */
function ensureModal(){
  if(document.getElementById("modal")) return;
  const m = document.createElement("div");
  m.id = "modal";
  m.className = "modal";
  m.innerHTML = `<div class="modal-box"><button class="modal-close" aria-label="閉じる">×</button><div id="modalBody"></div></div>`;
  document.body.appendChild(m);
}

function openModal(id){
  const s = stores.find(x => x.id === id);
  if(!s) return;
  ensureModal();
  const q = queueInfo(s.queue);
  document.getElementById("modalBody").innerHTML = `
    <span class="badge" style="position:static;display:inline-block">${esc(s.type)}</span>
    <h3 style="margin-top:10px">${esc(s.name)}</h3>
    <div class="meta">📍 ${esc(s.address)}</div>
    <div class="row"><span>入りやすさ</span><span class="stars">${"★".repeat(s.entry)}${"☆".repeat(5-s.entry)}</span></div>
    <div class="row"><span>行列の目安</span><span class="${q.cls}">約${s.queue}人（${q.txt}）</span></div>
    <div class="row"><span>注文方法</span><span>${esc(s.order)}</span></div>
    <div class="row"><span>常連客</span><span>${esc(s.regular)}</span></div>
    <h4 style="margin:18px 0 6px">お店のルール</h4>
    <ul>${s.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
    <div class="row"><span>座席</span><span>${esc(s.seats)}</span></div>
    <div class="row"><span>雰囲気</span><span>${esc(s.atmosphere)}</span></div>
    <p style="margin:16px 0 0;color:#f3ece6">💡 ${esc(s.tip)}</p>
    <a class="btn" href="store.html?id=${s.id}" style="margin-top:18px">店舗の詳細を見る</a>`;
  document.getElementById("modal").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  const m = document.getElementById("modal");
  if(m) m.classList.remove("show");
  document.body.style.overflow = "";
}

document.addEventListener("click", e => {
  const card = e.target.closest("[data-id]");
  if(card){ openModal(Number(card.dataset.id)); return; }
  if(e.target.id === "modal" || e.target.closest(".modal-close")) closeModal();
});
document.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });
