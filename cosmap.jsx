import { useEffect, useRef, useState } from "react";

// - PALETTE -
const C = {
  bg:"#F0F2FF", white:"#FFFFFF", ink:"#16134A", mid:"#6B6899", soft:"#AAA8C8", line:"#E4E2F4",
  blue:"#2B5BFF", rose:"#FF3D5C", blueBg:"#E8EDFF", roseBg:"#FFE9ED",
};
const EVENT_COLORS = [C.blue, C.rose, "#7C3AED", C.blue, C.rose];
const eventColor = id => EVENT_COLORS[(id-1) % EVENT_COLORS.length];
const f = (s=12,w=400,c=null) => ({margin:0,fontSize:s,fontWeight:w,color:c||C.ink,fontFamily:"'Nunito',sans-serif"});
const HR = ({mx=0}) => <div style={{height:1,background:C.line,margin:mx?`0 ${mx}px`:0}}/>;

// - ICONS -
const I = {
  home:   c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  map:    c=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  user:   (c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell:   c=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  pin:    (c,s=12)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c||C.soft} strokeWidth="2.2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  chev:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||C.soft} strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>,
  back:   c=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c||C.ink} strokeWidth="2.2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>,
  plus:   c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  check:  (c,s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.8" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>,
  link:   c=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  ticket: c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>,
  share:  c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  clock:  c=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  people: c=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  edit:   c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  door:   c=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M13 4H3v16h10"/><path d="m17 8 4 4-4 4"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  close:  c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  img:    c=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  camera: c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  heart:  (c,filled=false)=><svg width="14" height="14" viewBox="0 0 24 24" fill={filled?c:"none"} stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  twitter:c=><svg width="13" height="13" viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  insta:  c=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  tiktok: c=><svg width="13" height="13" viewBox="0 0 24 24" fill={c}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.77a8.16 8.16 0 0 0 4.76 1.52V6.82a4.85 4.85 0 0 1-1-.13z"/></svg>,
  search: (c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>,
  msg:    (c,s=22)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

// - DATA -
const TODAY = new Date("2025-06-15");
const ALL_EVENTS = [
  {id:1,name:"acosta! 池袋",venue:"東池袋中央公園",tag:"野外",date:new Date("2025-06-15"),time:"10:00〜17:00",ticket:"無料",
    url:"https://acosta.jp",desc:"acosta! Ikebukuro",dressing:true,photo:true,
    images:["#3B82F6","#60A5FA","#93C5FD"],
    posts:[{user:"kafka_star",emoji:"⭐",text:"去年最高だった！今年も楽しみ〜",likes:24},{user:"nami_cos",emoji:"🌊",text:"撮影スポット多くて最高",likes:11}]},
  {id:2,name:"コスプレサミット渋谷",venue:"渋谷区文化総合センター",tag:"室内",date:new Date("2025-06-15"),time:"11:00〜18:00",ticket:"無料",
    url:"https://example.com",desc:"Cosplay Summit Shibuya",dressing:true,photo:true,
    images:["#8B5CF6","#A78BFA"],
    posts:[{user:"gojo_san",emoji:"🌀",text:"去年初参加して最高だった",likes:8}]},
  {id:3,name:"コミックマーケット 105",venue:"東京ビッグサイト",tag:"大規模",date:new Date("2025-08-12"),time:"10:00〜16:00",ticket:"1,000円",
    url:"https://www.comiket.co.jp",desc:"Comiket 105",dressing:true,photo:true,
    images:["#EC4899","#F472B6","#FBCFE8","#F43F5E"],
    posts:[{user:"raiden_cos",emoji:"⚔️",text:"昨年夏の写真です🔥 今年も行く！",likes:52},{user:"kafka_star",emoji:"🌸",text:"更衣室の列に注意",likes:33}]},
  {id:4,name:"ニコニコ超会議 2025",venue:"幕張メッセ",tag:"大規模",date:new Date("2025-09-26"),time:"10:00〜18:00",ticket:"2,500円",
    url:"https://chokaigi.jp",desc:"Niconico Chokaigi 2025",dressing:true,photo:true,
    images:["#F59E0B","#FCD34D"],posts:[]},
  {id:5,name:"日本橋ストリートフェスタ",venue:"日本橋〜なんば",tag:"野外",date:new Date("2025-07-16"),time:"11:00〜17:00",ticket:"無料",
    url:"https://example.com",desc:"Nipponbashi Street Festa",dressing:false,photo:true,
    images:["#10B981","#34D399"],
    posts:[{user:"nami_cos",emoji:"🌊",text:"大阪といえばここ！毎年来てます",likes:19}]},
]
const todayEvents    = ALL_EVENTS.filter(e=>e.date.toDateString()===TODAY.toDateString());
const upcomingEvents = ALL_EVENTS.filter(e=>e.date>TODAY).sort((a,b)=>a.date-b.date);
const dateStr = e=>`${e.date.getMonth()+1}月${e.date.getDate()}日`;

const STUDIOS = [
  {id:"s1",name:"Studio Rei",area:"新宿区大久保",type:"貸切",hourly:"3,500円〜/h",url:"https://example.com",
    colors:["#E0E7FF","#C7D2FE","#A5B4FC"],
    posts:[{user:"raiden_cos",emoji:"⚔️",text:"白ホリゾント最高！また来ます",likes:15},{user:"kafka_star",emoji:"⭐",text:"スタッフさんも親切で使いやすい",likes:9}]},
  {id:"s2",name:"ARCH Photo Studio",area:"渋谷区代々木",type:"シェア",hourly:"1,200円〜/h",url:"https://example.com",
    colors:["#FEF3C7","#FDE68A","#F59E0B"],
    posts:[{user:"nami_cos",emoji:"🌊",text:"背景の種類が豊富すぎて選べない笑",likes:22}]},
  {id:"s3",name:"LUMI Studio",area:"台東区浅草",type:"貸切",hourly:"4,000円〜/h",url:"https://example.com",
    colors:["#FCE7F3","#FBCFE8","#F472B6"],posts:[]},
];

const EVENT_AREAS = ["ステージ前","撮影エリアA","撮影エリアB","更衣室付近","入口付近","休憩エリア","フードコート"];

const FOLLOWING = [
  {id:"u1",name:"raiden_cos", bio:"原神メイン。雷電将軍が好きです",           attending:[1,3],preset:{emoji:"⚔️"},sns:{twitter:"@raiden_cos",instagram:"raiden_cosplay",tiktok:""},    location:{eventId:1,area:"ステージ前",text:"",updatedAt:"14:32"}},
  {id:"u2",name:"kafka_star", bio:"スタレ・崩壊系。撮影歓迎",                attending:[1,2],preset:{emoji:"⭐"},sns:{twitter:"@kafka_star",instagram:"",tiktok:"kafka_star_cos"},  location:{eventId:1,area:"撮影エリアA",text:"3人で集まってます！",updatedAt:"14:55"}},
  {id:"u3",name:"gojo_san",   bio:"呪術廻戦一筋。五条悟コスずっとやってます", attending:[3],  preset:{emoji:"🌀"},sns:{twitter:"",instagram:"gojo.cos",tiktok:""},                   location:null},
  {id:"u4",name:"nami_cos",   bio:"ワンピース・ナミ担当",                     attending:[1,4],preset:{emoji:"🌊"},sns:{twitter:"@nami_cos_one",instagram:"nami_cosplay_jp",tiktok:"nami_cos"},location:{eventId:1,area:"入口付近",text:"",updatedAt:"15:10"}},
];
const AVATAR_PRESETS=[
  {id:"cat",emoji:"🐱"},{id:"star",emoji:"⭐"},{id:"moon",emoji:"🌙"},{id:"fire",emoji:"🔥"},
  {id:"sakura",emoji:"🌸"},{id:"sword",emoji:"⚔️"},{id:"crown",emoji:"👑"},{id:"gem",emoji:"💎"},
  {id:"wave",emoji:"🌊"},{id:"spiral",emoji:"🌀"},{id:"rainbow",emoji:"🌈"},{id:"bolt",emoji:"⚡"},
];

// - SHARED -
const AvatarCircle = ({preset,name,size=44}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:preset && preset.emoji?C.blueBg:C.blue+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:size*0.46,lineHeight:1,border:`2.5px solid ${C.white}`,boxShadow:"0 2px 8px rgba(43,91,255,0.13)"}}>
    {preset && preset.emoji?<span>{preset.emoji}</span>:<span style={{...f(size*0.34,800,C.blue),lineHeight:1}}>{(name||"?")[0].toUpperCase()}</span>}
  </div>
);
const AttendBadge = ({small=false}) => (
  <span style={{display:"flex",alignItems:"center",gap:3,background:C.blue+"16",borderRadius:99,padding:small?"3px 8px":"4px 10px",flexShrink:0}}>
    {I.check(C.blue,small?9:11)}<span style={{...f(small?8:9,800,C.blue)}}>参加予定</span>
  </span>
);
const Card = ({children,style={}}) => <div style={{background:C.white,borderRadius:24,overflow:"hidden",...style}}>{children}</div>;
const BackBtn = ({onBack,light=false}) => (
  <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:"none",cursor:"pointer",marginBottom:20,padding:0}}>
    {I.back(light?"#fff":C.mid)}<span style={{...f(13,700,light?"rgba(255,255,255,0.8)":C.mid)}}>戻る</span>
  </button>
);

const EventCard = ({event,attended,onOpen,showDate=false}) => {
  const col=eventColor(event.id);
  return (
    <div onClick={()=>onOpen(event)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",cursor:"pointer",minHeight:72}}>
      <div style={{width:46,height:46,borderRadius:14,background:col+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <div style={{width:14,height:14,borderRadius:"50%",background:col}}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
          <p style={{...f(14,800),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{event.name}</p>
          {attended&&<AttendBadge small/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {showDate&&<span style={{...f(11,700,col)}}>{dateStr(event)}</span>}
          <span style={{display:"flex",alignItems:"center",gap:3}}>{I.pin(C.soft,11)}<span style={f(11,500,C.mid)}>{event.venue}</span></span>
        </div>
      </div>
      {I.chev()}
    </div>
  );
};

const SNSLinks = ({sns}) => {
  const items=[
    {key:"twitter",label:"X",icon:I.twitter,color:C.ink},
    {key:"instagram",label:"Instagram",icon:I.insta,color:"#E1306C"},
    {key:"tiktok",label:"TikTok",icon:I.tiktok,color:C.blue},
  ].filter(s=>sns[s.key]);
  if(!items.length) return null;
  return (
    <div style={{display:"flex",gap:8}}>
      {items.map(({key,label,icon,color})=>(
        <button key={key} style={{flex:1,padding:"10px 0",background:color+"0C",border:`1.5px solid ${color}28`,borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          {icon(color)}<span style={{...f(11,800,color)}}>{label}</span>
        </button>
      ))}
    </div>
  );
};

const PhotoGallery = ({colors,label="写真"}) => {
  const [idx,setIdx] = useState(0);
  return (
    <div style={{marginBottom:0}}>
      <div style={{height:200,background:colors[idx],borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.3s",flexDirection:"column",gap:8}}>
        {I.img("rgba(255,255,255,0.55)")}
        <p style={{...f(11,600,"rgba(255,255,255,0.65)")}}>📷 {label} {idx+1}/{colors.length}</p>
      </div>
      {colors.length>1&&(
        <div style={{display:"flex",gap:6,marginTop:10,justifyContent:"center"}}>
          {colors.map((c,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{width:i===idx?22:8,height:8,borderRadius:4,background:i===idx?C.blue:C.line,border:"none",cursor:"pointer",transition:"all 0.2s",padding:0}}/>
          ))}
        </div>
      )}
    </div>
  );
};

const UserPosts = ({posts}) => {
  const [liked,setLiked] = useState(new Set());
  if(!posts||!posts.length) return <p style={{...f(12,500,C.soft),textAlign:"center",padding:"16px 0 20px"}}>まだ投稿はありません</p>;
  return (
    <div>
      {posts.map((p,i)=>(
        <div key={i}>
          <div style={{display:"flex",gap:12,padding:"14px 20px",alignItems:"flex-start"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:C.blueBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>{p.emoji}</div>
            <div style={{flex:1}}>
              <p style={{...f(12,800,C.blue),marginBottom:4}}>@{p.user}</p>
              <p style={{...f(12,500,C.mid),lineHeight:1.6}}>{p.text}</p>
            </div>
            <button onClick={()=>setLiked(s=>{const n=new Set(s);n.has(i)?n.delete(i):n.add(i);return n;})}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",cursor:"pointer",flexShrink:0}}>
              {I.heart(liked.has(i)?C.rose:C.soft,liked.has(i))}
              <span style={{...f(10,700,liked.has(i)?C.rose:C.soft)}}>{p.likes+(liked.has(i)?1:0)}</span>
            </button>
          </div>
          {i<posts.length-1&&<HR mx={20}/>}
        </div>
      ))}
      <div style={{height:4}}/>
    </div>
  );
};

const TabToggle = ({tabs,active,onChange}) => (
  <div style={{display:"flex",background:C.bg,borderRadius:12,padding:3,gap:0}}>
    {tabs.map(([key,lbl])=>(
      <button key={key} onClick={()=>onChange(key)}
        style={{flex:1,padding:"8px 0",borderRadius:10,border:"none",background:active===key?C.white:"transparent",color:active===key?C.blue:C.mid,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:active===key?"0 2px 8px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"}}>{lbl}</button>
    ))}
  </div>
);

// - SUB SCREENS -

// - SEARCH -
const SearchScreen = ({onOpenUser, onOpenEvent}) => {
  const [query, setQuery] = useState("");
  const ALL_USERS = [
    {id:"u1",name:"raiden_cos",  bio:"原神メイン。雷電将軍が好きです",           attending:[1,3],preset:{emoji:"⚡",bg:"#EDE9FF"},sns:{twitter:"raiden_cos",instagram:"",tiktok:""}},
    {id:"u2",name:"kafka_star",  bio:"スタレ・崩壊系。撮影歓迎",                attending:[1,2],preset:{emoji:"🌸",bg:"#FFE4F0"},sns:{twitter:"",instagram:"kafka_star",tiktok:""}},
    {id:"u3",name:"gojo_san",    bio:"呪術廻戦一筋。五条悟コスずっとやってます", attending:[3],  preset:{emoji:"🌀",bg:"#E0F2FE"},sns:{twitter:"gojo_san",instagram:"gojo_cos",tiktok:""}},
    {id:"u4",name:"nami_cos",    bio:"ワンピース・ナミ担当",                     attending:[1,4],preset:{emoji:"🍊",bg:"#FFF3E0"},sns:{twitter:"",instagram:"nami_cos",tiktok:"nami_cos"}},
    {id:"u5",name:"mikasa_ace",  bio:"進撃の巨人 ミカサ専門",                   attending:[2],  preset:{emoji:"⚔️",bg:"#F3F4F6"},sns:{twitter:"mikasa_ace",instagram:"",tiktok:""}},
    {id:"u6",name:"zero_two",    bio:"ダーリン・イン・ザ・フランキス",           attending:[4],  preset:{emoji:"🦋",bg:"#FFE4E4"},sns:{twitter:"",instagram:"zero_two_cos",tiktok:""}},
    {id:"u7",name:"levi_clean",  bio:"リヴァイ兵長一筋10年",                    attending:[3],  preset:{emoji:"🗡️",bg:"#F0FDF4"},sns:{twitter:"levi_clean",instagram:"levi_cos",tiktok:""}},
    {id:"u8",name:"aqua_cos",    bio:"アクアコス！推し活しながら撮影も",         attending:[1],  preset:{emoji:"💙",bg:"#EFF6FF"},sns:{twitter:"aqua_cos",instagram:"aqua_cos",tiktok:"aqua_cos"}},
  ];

  const popularEvents = [...ALL_EVENTS].sort((a,b)=>{
    const aCount = FOLLOWING.filter(u=>u.attending.includes(a.id)).length;
    const bCount = FOLLOWING.filter(u=>u.attending.includes(b.id)).length;
    return bCount - aCount;
  }).slice(0,4);

  const q = query.trim().toLowerCase();
  const userResults  = q ? ALL_USERS.filter(u=>u.name.toLowerCase().includes(q)||u.bio.toLowerCase().includes(q)) : [];
  const eventResults = q ? ALL_EVENTS.filter(e=>e.name.toLowerCase().includes(q)||e.venue.toLowerCase().includes(q)||e.tag.toLowerCase().includes(q)) : [];
  const hasResults   = userResults.length>0 || eventResults.length>0;

  return (
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
    <div style={{paddingBottom:40}}>
      <div style={{background:C.white,padding:"52px 20px 14px"}}>
        <h1 style={{...f(22,900),letterSpacing:"-0.03em",marginBottom:14}}>検索</h1>
        <div style={{display:"flex",alignItems:"center",gap:10,background:C.bg,borderRadius:14,padding:"12px 16px"}}>
          {I.search(C.soft,16)}
          <input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="ユーザー名・イベント名で検索..."
            style={{flex:1,border:"none",background:"transparent",fontSize:13,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none"}}/>
          {query&&<button onClick={()=>setQuery("")} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}>{I.close(C.soft)}</button>}
        </div>
      </div>

      <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:24}}>
        {!q ? (
          <div>
            <div>
              <p style={{...f(11,800,C.soft),letterSpacing:"0.08em",marginBottom:10,padding:"0 4px"}}>人気のイベント</p>
              <Card><div style={{padding:"6px 0"}}>
                {popularEvents.map((e,i)=>(
                  <div key={e.id}>
                    <div onClick={()=>onOpenEvent(e)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",cursor:"pointer"}}>
                      <div style={{width:44,height:44,borderRadius:13,background:eventColor(e.id)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <div style={{width:13,height:13,borderRadius:"50%",background:eventColor(e.id)}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{...f(13,800),marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</p>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{...f(10,700,eventColor(e.id))}}>{dateStr(e)}</span>
                          <span style={f(10,500,C.soft)}>·</span>
                          <span style={f(10,500,C.mid)}>{e.venue}</span>
                        </div>
                      </div>
                      <div style={{flexShrink:0}}>
                        {I.chev()}
                      </div>
                    </div>
                    {i<popularEvents.length-1&&<HR mx={20}/>}
                  </div>
                ))}
              </div></Card>
            </div>
            <div>
              <p style={{...f(11,800,C.soft),letterSpacing:"0.08em",marginBottom:10,padding:"0 4px",marginTop:8}}>おすすめユーザー</p>
              <Card><div style={{padding:"6px 0"}}>
                {ALL_USERS.slice(0,4).map((u,i)=>(
                  <div key={u.id}>
                    <div onClick={()=>onOpenUser(u)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 20px",cursor:"pointer"}}>
                      <AvatarCircle preset={u.preset} name={u.name} size={42}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{...f(13,800),marginBottom:2}}>@{u.name}</p>
                        <p style={{...f(11,500,C.soft),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.bio}</p>
                      </div>
                      {I.chev()}
                    </div>
                    {i<3&&<HR mx={20}/>}
                  </div>
                ))}
              </div></Card>
            </div>
          </div>
        ) : !hasResults ? (
          <div style={{padding:"40px 0",textAlign:"center"}}>
            <p style={f(14,700,C.mid)}>「{query}」に一致する結果がありません</p>
            <p style={{...f(11,500,C.soft),marginTop:6}}>別のキーワードで試してみてね</p>
          </div>
        ) : (
          <div>
            {eventResults.length>0&&(
              <div>
                <p style={{...f(11,800,C.soft),letterSpacing:"0.08em",marginBottom:10,padding:"0 4px"}}>イベント ({eventResults.length}件)</p>
                <Card><div style={{padding:"6px 0"}}>
                  {eventResults.map((e,i)=>(
                    <div key={e.id}>
                      <div onClick={()=>onOpenEvent(e)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",cursor:"pointer"}}>
                        <div style={{width:44,height:44,borderRadius:13,background:eventColor(e.id)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <div style={{width:13,height:13,borderRadius:"50%",background:eventColor(e.id)}}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{...f(13,800),marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</p>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{...f(10,700,eventColor(e.id))}}>{dateStr(e)}</span>
                            <span style={f(10,500,C.soft)}>·</span>
                            <span style={f(10,500,C.mid)}>{e.venue}</span>
                          </div>
                        </div>
                        {I.chev()}
                      </div>
                      {i<eventResults.length-1&&<HR mx={20}/>}
                    </div>
                  ))}
                </div></Card>
              </div>
            )}
            {userResults.length>0&&(
              <div>
                <p style={{...f(11,800,C.soft),letterSpacing:"0.08em",marginBottom:10,padding:"0 4px"}}>ユーザー ({userResults.length}件)</p>
                <Card><div style={{padding:"6px 0"}}>
                  {userResults.map((u,i)=>(
                    <div key={u.id}>
                      <div onClick={()=>onOpenUser(u)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 20px",cursor:"pointer"}}>
                        <AvatarCircle preset={u.preset} name={u.name} size={44}/>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{...f(14,800),marginBottom:3}}>@{u.name}</p>
                          <p style={{...f(11,500,C.soft),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.bio}</p>
                        </div>
                        {u.attending.length>0&&<span style={{...f(10,700,C.blue),background:C.blueBg,borderRadius:99,padding:"3px 9px",whiteSpace:"nowrap"}}>{u.attending.length}件</span>}
                        {I.chev()}
                      </div>
                      {i<userResults.length-1&&<HR mx={20}/>}
                    </div>
                  ))}
                </div></Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    </div>  );
};


const FollowingScreen = ({onBack,onOpenUser,myLocation,attended}) => {
  const demoLocs = {"u1":{area:"ステージ前",text:"雷電将軍きてます！",updatedAt:"13:24"},"u2":{area:"撮影エリアA",text:"",updatedAt:"13:41"},"u3":{area:"フードコート",text:"休憩中〜",updatedAt:"14:02"},"u4":{area:"入口付近",text:"",updatedAt:"13:15"}};
  return (
  <div style={{paddingBottom:40}}>
    <div style={{background:C.white,padding:"52px 22px 16px",borderBottom:"1px solid "+C.line}}>
      <BackBtn onBack={onBack}/>
      <h2 style={{...f(20,900),letterSpacing:"-0.02em"}}>フォロー中</h2>
      <p style={{...f(12,500,C.soft),marginTop:4}}>{FOLLOWING.length}人</p>
    </div>
    <div style={{padding:"14px 16px"}}>
      <Card><div style={{padding:"6px 0"}}>
        {FOLLOWING.map((u,i)=>{
          const sharedEvent = todayEvents.find(e=>u.attending.includes(e.id)&&attended&&attended.has(e.id));
          const uloc = sharedEvent ? demoLocs[u.id] : null;
          return (
            <div key={u.id}>
              <div onClick={()=>onOpenUser(u)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 20px",cursor:"pointer"}}>
                <AvatarCircle preset={u.preset} name={u.name} size={44}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{...f(14,800),marginBottom:3}}>@{u.name}</p>
                  {uloc ? (
                    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:C.rose,display:"inline-block",flexShrink:0}}/>
                      <span style={{...f(9,900,C.rose),letterSpacing:"0.06em"}}>参加中</span>
                      <span style={{background:C.blueBg,color:C.blue,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:99}}>{uloc.area}</span>
                      {uloc.text&&<span style={{...f(10,500,C.mid),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{uloc.text}</span>}
                      <span style={f(9,500,C.soft)}>{uloc.updatedAt}</span>
                    </div>
                  ) : (
                    <p style={{...f(11,500,C.soft),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.bio}</p>
                  )}
                </div>
                {u.attending.length>0&&<span style={{...f(10,700,C.blue),background:C.blueBg,borderRadius:99,padding:"3px 9px"}}>{u.attending.length}件</span>}
                {I.chev()}
              </div>
              {i<FOLLOWING.length-1&&<HR mx={20}/>}
            </div>
          );
        })}
      </div></Card>
    </div>
  </div>
  );
};

const NearbyScreen = ({attended,onBack,onOpenEvent}) => (
  <div style={{paddingBottom:40}}>
    <div style={{background:C.white,padding:"52px 22px 16px",borderBottom:`1px solid ${C.line}`}}>
      <BackBtn onBack={onBack}/>
      <h2 style={{...f(20,900),letterSpacing:"-0.02em"}}>近くのイベント</h2>
      <p style={{...f(12,500,C.soft),marginTop:4}}>今後開催 {upcomingEvents.length}件</p>
    </div>
    <div style={{padding:"14px 16px"}}>
      <Card><div style={{padding:"6px 0"}}>
        {upcomingEvents.map((e,i)=>(<div key={e.id}><EventCard event={e} attended={attended.has(e.id)} onOpen={onOpenEvent} showDate/>{i<upcomingEvents.length-1&&<HR mx={20}/>}</div>))}
      </div></Card>
    </div>
  </div>
);

const AttendedScreen = ({attended,onBack,onOpenEvent}) => {
  const list=ALL_EVENTS.filter(e=>attended.has(e.id)).sort((a,b)=>a.date-b.date);
  return (
    <div style={{paddingBottom:40}}>
      <div style={{background:C.white,padding:"52px 22px 16px",borderBottom:`1px solid ${C.line}`}}>
        <BackBtn onBack={onBack}/>
        <h2 style={{...f(20,900),letterSpacing:"-0.02em"}}>参加予定</h2>
        <p style={{...f(12,500,C.soft),marginTop:4}}>{list.length}件登録中</p>
      </div>
      <div style={{padding:"14px 16px"}}>
        {list.length===0
          ?<div style={{textAlign:"center",paddingTop:60}}><p style={f(14,700,C.mid)}>まだ登録したイベントはありません</p></div>
          :<Card><div style={{padding:"6px 0"}}>
            {list.map((e,i)=>(<div key={e.id}><EventCard event={e} attended onOpen={onOpenEvent} showDate/>{i<list.length-1&&<HR mx={20}/>}</div>))}
          </div></Card>
        }
      </div>
    </div>
  );
};

// - USER DETAIL -
const UserDetail = ({user,onBack,onOpenEvent,myAttended,onOpenMsg}) => {
  const [following,setFollowing]=useState(true);
  const userEvents=ALL_EVENTS.filter(e=>user.attending.includes(e.id));
  return (
    <div style={{paddingBottom:40}}>
      <div style={{background:C.white,padding:"52px 22px 24px"}}>
        <BackBtn onBack={onBack}/>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <AvatarCircle preset={user.preset} name={user.name} size={60}/>
          <div style={{flex:1}}>
            <p style={{...f(18,800),marginBottom:3}}>@{user.name}</p>
            <p style={{...f(12,500,C.mid),lineHeight:1.5}}>{user.bio}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setFollowing(p=>!p)}
            style={{flex:1,padding:"12px",borderRadius:14,border:"none",background:following?C.blue:C.blueBg,cursor:"pointer",...f(13,800,following?"#fff":C.blue)}}>
            {following?"フォロー中":"フォローする"}
          </button>
          <button onClick={()=>onOpenMsg(user)} style={{flex:1,padding:"12px",borderRadius:14,border:"2px solid "+C.line,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,...f(13,800,C.ink)}}>{I.msg(C.ink,15)}メッセージ</button>
        </div>
      </div>
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {/* SNS */}
        {Object.values(user.sns).some(v=>v)&&(
          <Card style={{padding:"16px 20px"}}>
            <p style={{...f(10,800,C.soft),letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>SNS</p>
            <SNSLinks sns={user.sns}/>
          </Card>
        )}
        {/* 参加予定 */}
        <Card>
          <div style={{padding:"18px 20px 4px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:8,background:C.blueBg,display:"flex",alignItems:"center",justifyContent:"center"}}>{I.people(C.blue)}</div>
              <p style={{...f(13,800)}}>{user.name} の参加予定</p>
              <span style={{background:C.blue,color:"#fff",fontSize:10,fontWeight:800,minWidth:18,height:18,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{userEvents.length}</span>
            </div>
            {userEvents.length===0
              ?<p style={{...f(12,500,C.soft),paddingBottom:16}}>参加予定のイベントはありません</p>
              :userEvents.map((e,i)=>(<div key={e.id}><EventCard event={e} attended={myAttended.has(e.id)} onOpen={onOpenEvent} showDate/>{i<userEvents.length-1&&<HR mx={20}/>}</div>))
            }
          </div>
        </Card>
      </div>
    </div>
  );
};

// - STUDIO DETAIL -
const StudioDetail = ({studio,onBack}) => {
  const [copied,setCopied]=useState(false);
  const tc=studio.type==="貸切"?C.blue:C.rose;
  return (
    <div style={{paddingBottom:80}}>
      <div style={{background:C.white,padding:"52px 16px 16px"}}>
        <div style={{padding:"0 6px"}}><BackBtn onBack={onBack}/></div>
        <PhotoGallery colors={studio.colors} label="スタジオ写真"/>
      </div>
      <div style={{background:C.white,padding:"16px 22px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <h1 style={{...f(22,900),letterSpacing:"-0.02em"}}>{studio.name}</h1>
          <span style={{background:tc+"16",color:tc,fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:99}}>{studio.type}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:18}}>
          {I.pin(C.soft,11)}<span style={f(12,500,C.mid)}>{studio.area}</span>
        </div>
        <a href={studio.url} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"15px",borderRadius:16,background:C.blue,textDecoration:"none",boxShadow:`0 6px 20px ${C.blue}44`}}>
          {I.link("#fff")}<span style={{...f(15,800,"#fff")}}>公式HPを見る</span>
        </a>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        <Card>
          {[[I.clock(C.soft),"営業時間",studio.hours],[I.ticket(C.soft),"料金",studio.hourly],[I.user(C.soft,14),"定員",studio.capacity]].map(([icon,lbl,val],i)=>(
            <div key={i}><div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px"}}>
              <div style={{width:18,display:"flex",justifyContent:"center"}}>{icon}</div>
              <span style={{...f(11,500,C.soft),width:56}}>{lbl}</span>
              <span style={{...f(13,700),flex:1}}>{val}</span>
            </div>{i<2&&<HR mx={20}/>}</div>
          ))}
        </Card>
        <Card style={{padding:"18px 20px"}}>
          <p style={{...f(10,800,C.soft),letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>スタジオ詳細</p>
          <p style={{...f(13,500,C.mid),lineHeight:1.75}}>{studio.desc}</p>
        </Card>
        <button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);}}
          style={{padding:"14px",borderRadius:14,border:`2px solid ${C.line}`,background:copied?C.blueBg:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.18s",marginBottom:4}}>
          {I.share(copied?C.blue:C.mid)}<span style={{...f(13,800,copied?C.blue:C.ink)}}>{copied?"コピーしました！":"シェアする"}</span>
        </button>
      </div>
    </div>
  );
};

// - EVENT DETAIL -
const EventDetail = ({event,isAttended,onToggleAttend,onBack,onOpenUser,myLocation}) => {
  const [copied,setCopied]=useState(false);
  const col=eventColor(event.id);
  const friends=FOLLOWING.filter(u=>u.attending.includes(event.id));
  const isToday=event.date.toDateString()===TODAY.toDateString();
  return (
    <div style={{paddingBottom:80}}>
      <div style={{background:col,padding:"52px 22px 28px"}}>
        <BackBtn onBack={onBack} light/>
        {isToday&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.22)",borderRadius:99,padding:"4px 12px",marginBottom:10}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
            <span style={{...f(10,800,"#fff"),letterSpacing:"0.06em"}}>LIVE 本日開催</span>
          </div>
        )}
        <h1 style={{...f(22,900,"#fff"),lineHeight:1.25,marginBottom:10}}>{event.name}</h1>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[event.tag,event.dressing?"更衣室あり":null,event.photo?"撮影可":null].filter(Boolean).map((t,i)=>(
            <span key={i} style={{background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:99}}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{padding:"14px 16px 0"}}>
        <PhotoGallery colors={event.images} label="イベント写真"/>
      </div>

      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {/* 参加ボタン */}
        <button onClick={onToggleAttend} style={{width:"100%",padding:"16px",borderRadius:16,border:"none",cursor:"pointer",background:isAttended?C.blue:C.white,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:isAttended?`0 6px 20px ${C.blue}44`:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{width:24,height:24,borderRadius:12,background:isAttended?"rgba(255,255,255,0.24)":C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {isAttended?I.check("#fff",13):<span style={{width:9,height:9,borderRadius:5,border:`2.5px solid ${C.soft}`,display:"block"}}/>}
          </div>
          <span style={{...f(15,800,isAttended?"#fff":C.ink)}}>{isAttended?"参加予定に登録済み":"参加予定に登録する"}</span>
          {isAttended&&<span style={{...f(10,500,"rgba(255,255,255,0.7)")}}> タップで解除</span>}
        </button>

        {/* フォロー中参加者 */}
        {friends.length>0&&(
          <Card>
            <div style={{padding:"18px 20px 6px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{width:28,height:28,borderRadius:8,background:C.roseBg,display:"flex",alignItems:"center",justifyContent:"center"}}>{I.people(C.rose)}</div>
                <p style={{...f(13,800)}}>フォロワーが参加予定のイベント</p>
                <span style={{background:C.rose,color:"#fff",fontSize:10,fontWeight:800,minWidth:18,height:18,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{friends.length}</span>
              </div>
              {friends.map((u,i)=>{
                const loc = myLocation && myLocation[event.id] ? null : null;
                const demoLocs = {"u1":{area:"ステージ前",text:"雷電将軍きてます！",updatedAt:"13:24"},"u2":{area:"撮影エリアA",text:"",updatedAt:"13:41"},"u3":{area:"フードコート",text:"休憩中〜",updatedAt:"14:02"},"u4":{area:"入口付近",text:"",updatedAt:"13:15"}};
                const uloc = isToday ? demoLocs[u.id] : null;
                return (
                  <div key={u.id}>
                    <div onClick={()=>onOpenUser(u)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer"}}>
                      <AvatarCircle preset={u.preset} name={u.name} size={38}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{...f(13,700),marginBottom:2}}>@{u.name}</p>
                        {uloc ? (
                          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                            <span style={{background:C.blueBg,color:C.blue,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:99}}>{uloc.area}</span>
                            {uloc.text&&<span style={{...f(10,500,C.mid),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{uloc.text}</span>}
                            <span style={f(9,500,C.soft)}>{uloc.updatedAt}</span>
                          </div>
                        ) : (
                          <p style={{...f(11,500,C.soft),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.bio}</p>
                        )}
                      </div>
                      {I.chev()}
                    </div>
                    {i<friends.length-1&&<HR/>}
                  </div>
                );
              })}
              <div style={{height:12}}/>
            </div>
          </Card>
        )}

        {/* info */}
        <Card>
          {[[I.pin(C.soft),"会場",event.venue],[I.clock(C.soft),"時間",event.time],[I.ticket(C.soft),"参加費",event.ticket]].map(([icon,lbl,val],i)=>(
            <div key={i}><div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px"}}>
              <div style={{width:18,display:"flex",justifyContent:"center"}}>{icon}</div>
              <span style={{...f(11,500,C.soft),width:52}}>{lbl}</span>
              <span style={{...f(13,700),flex:1}}>{val}</span>
            </div>{i<3&&<HR mx={20}/>}</div>
          ))}
        </Card>

        {/* 詳細 */}
        <Card style={{padding:"18px 20px"}}>
          <p style={{...f(10,800,C.soft),letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>イベント詳細</p>
          <p style={{...f(13,500,C.mid),lineHeight:1.75}}>{event.desc}</p>
        </Card>

        <a href={event.url} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"16px",borderRadius:16,background:col,textDecoration:"none",boxShadow:`0 6px 20px ${col}44`}}>
          {I.link("#fff")}<span style={{...f(15,800,"#fff")}}>公式HPを見る</span>
        </a>
        <button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);}}
          style={{padding:"14px",borderRadius:14,border:`2px solid ${C.line}`,background:copied?C.blueBg:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.18s",marginBottom:6}}>
          {I.share(copied?C.blue:C.mid)}<span style={{...f(13,800,copied?C.blue:C.ink)}}>{copied?"コピーしました！":"シェアする"}</span>
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------


const HomeScreen = ({attended,onOpenEvent,onOpenNearby,onOpenAttended,myLocation,setMyLocation}) => {
  const attendingToday = todayEvents.filter(function(e){ return attended.has(e.id); });
  const friendEvents = [...new Set(FOLLOWING.flatMap(function(u){return u.attending;}))]
    .map(function(id){return ALL_EVENTS.find(function(e){return e.id===id;});})
    .filter(function(e){return e&&e.date>=TODAY;})
    .sort(function(a,b){return a.date-b.date;});

  const [homeTab, setHomeTab] = useState("home");
  const [locModal, setLocModal] = useState(null);
  const [locArea, setLocArea] = useState("");
  const [locText, setLocText] = useState("");
  const [locSent, setLocSent] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = function(area, ename) {
    setToast({area: area, ename: ename});
    setTimeout(function(){ setToast(null); }, 3500);
  };

  const openModal = function(eventId) {
    const cur = myLocation[eventId];
    setLocArea(cur ? cur.area : "");
    setLocText(cur ? cur.text : "");
    setLocSent(false);
    setLocModal(eventId);
  };
  const sendLoc = function() {
    if (!locArea && !locText.trim()) return;
    const now = new Date();
    const hm = now.getHours() + ":" + String(now.getMinutes()).padStart(2,"0");
    setMyLocation(function(p){ return Object.assign({}, p, {[locModal]:{area:locArea, text:locText.trim(), updatedAt:hm}}); });
    setLocSent(true);
    const ev = ALL_EVENTS.find(function(e){ return e.id === locModal; });
    const areaLabel = locArea || "場所";
    setTimeout(function(){
      setLocModal(null);
      showToast(areaLabel, ev ? ev.name : "");
    }, 600);
  };
  const clearLoc = function(eid, ev) {
    ev.stopPropagation();
    setMyLocation(function(p){ const n=Object.assign({},p); delete n[eid]; return n; });
  };

  return (
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
    <div style={{paddingBottom:110,position:"relative"}}>

      {toast !== null && (
        <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:200,pointerEvents:"none",width:"calc(100% - 32px)",maxWidth:380}}>
          <div style={{background:C.ink,borderRadius:16,padding:"13px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.25)"}}>
            <div style={{width:32,height:32,borderRadius:10,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.pin("#fff",14)}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{...f(12,900,"#fff"),marginBottom:2}}>場所を共有しました</p>
              <p style={{...f(11,500,"rgba(255,255,255,0.65)"),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{toast.ename} · {toast.area}</p>
            </div>
            <span style={{...f(10,700,"#22C55E")}}>✓</span>
          </div>
        </div>
      )}

      {locModal !== null && (
        <div style={{position:"absolute",top:0, left:0, right:0, bottom:0,zIndex:120,background:"rgba(22,19,74,0.55)",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:C.white,borderRadius:"24px 24px 0 0",padding:"22px 22px 48px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <p style={f(17,900)}>今どこにいる？</p>
                <p style={{...f(11,500,C.soft),marginTop:3}}>{ALL_EVENTS.find(function(e){return e.id===locModal;}) != null ? ALL_EVENTS.find(function(e){return e.id===locModal;}).name : ""}</p>
              </div>
              <button onClick={function(){setLocModal(null);}} style={{width:32,height:32,borderRadius:10,background:C.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.close(C.mid)}</button>
            </div>
            <p style={{...f(10,800,C.soft),letterSpacing:"0.08em",marginBottom:10}}>エリアを選ぶ</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
              {EVENT_AREAS.map(function(a){
                return (
                  <button key={a} onClick={function(){setLocArea(a);}}
                    style={{padding:"8px 14px",borderRadius:99,border:"none",background:locArea===a?C.blue:C.bg,color:locArea===a?"#fff":C.mid,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",transition:"all 0.15s"}}>
                    {a}
                  </button>
                );
              })}
            </div>
            <p style={{...f(10,800,C.soft),letterSpacing:"0.08em",marginBottom:8}}>ひとこと（任意）</p>
            <input value={locText} onChange={function(e){setLocText(e.target.value.slice(0,30));}}
              placeholder="例: 3人で集まってます！"
              style={{width:"100%",padding:"12px 14px",borderRadius:13,border:"2px solid "+C.line,fontSize:13,color:C.ink,fontFamily:"'Nunito',sans-serif",background:C.bg,boxSizing:"border-box",outline:"none",marginBottom:4}}/>
            <p style={{...f(9,500,C.soft),textAlign:"right",marginBottom:16}}>{locText.length}/30</p>
            <button onClick={sendLoc}
              style={{width:"100%",padding:"15px",borderRadius:15,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:900,color:"#fff",background:locSent?"#22C55E":(!locArea&&!locText.trim()?C.line:C.blue)}}>
              {locSent ? "送信しました！" : "フォロー中に知らせる"}
            </button>
          </div>
        </div>
      )}

      <div style={{background:C.white,padding:"52px 22px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div>
            <p style={{...f(11,600,C.soft),marginBottom:4,letterSpacing:"0.06em"}}>6月15日（土）</p>
            <h1 style={{...f(26,900),letterSpacing:"-0.03em",lineHeight:1.1}}>今日のコスプレ</h1>
          </div>
          <button style={{width:40,height:40,borderRadius:12,background:C.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.bell(C.mid)}</button>
        </div>
        <div style={{display:"flex",background:C.bg,borderRadius:14,padding:4,gap:4}}>
          <button onClick={function(){setHomeTab("home");}}
            style={{flex:1,padding:"10px 0",borderRadius:11,border:"none",background:homeTab==="home"?C.white:"transparent",color:homeTab==="home"?C.ink:C.mid,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:homeTab==="home"?"0 2px 8px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"}}>
            ホーム
          </button>
          <button onClick={function(){setHomeTab("attending");}}
            style={{flex:1,padding:"10px 0",borderRadius:11,border:"none",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",gap:5,
              background:homeTab==="attending"?C.rose:"transparent",
              color:homeTab==="attending"?"#fff":attendingToday.length>0?C.rose:C.mid,
              boxShadow:homeTab==="attending"?"0 2px 10px rgba(255,61,92,0.35)":"none"}}>
            {attendingToday.length>0 && homeTab!=="attending" && <span style={{width:6,height:6,borderRadius:"50%",background:C.rose,display:"inline-block"}}/>}
            参加中
            {attendingToday.length>0 && <span style={{background:homeTab==="attending"?"rgba(255,255,255,0.3)":C.rose,color:"#fff",fontSize:9,fontWeight:900,minWidth:16,height:16,borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{attendingToday.length}</span>}
          </button>
        </div>
        <div style={{height:16}}/>
      </div>

      {homeTab === "home" && (
        <div style={{padding:"0 16px 0",paddingTop:14,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",gap:10}}>
            <div onClick={onOpenNearby} style={{flex:3,background:C.blue,borderRadius:20,padding:"16px 20px",cursor:"pointer"}}>
              <p style={{...f(30,900,"#fff"),letterSpacing:"-0.04em",lineHeight:1,marginBottom:4}}>{upcomingEvents.length}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <p style={{...f(11,700,"rgba(255,255,255,0.75)"),letterSpacing:"0.02em"}}>周辺イベント</p>
                {I.chev("rgba(255,255,255,0.6)")}
              </div>
            </div>
            <div onClick={onOpenAttended} style={{flex:2,background:C.roseBg,borderRadius:20,padding:"16px 20px",cursor:"pointer"}}>
              <p style={{...f(30,900,C.rose),letterSpacing:"-0.04em",lineHeight:1,marginBottom:4}}>{attended.size}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <p style={{...f(11,700,C.rose+"AA"),letterSpacing:"0.02em"}}>参加予定</p>
                {I.chev(C.rose+"88")}
              </div>
            </div>
          </div>
          <Card>
            <div style={{padding:"18px 20px 6px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <p style={f(13,800)}>本日開催</p>
                <span style={{background:C.rose,color:"#fff",fontSize:9,fontWeight:900,padding:"3px 8px",borderRadius:99}}>LIVE</span>
              </div>
              {todayEvents.map(function(e,i){
                return (
                  <div key={e.id}>
                    <EventCard event={e} attended={attended.has(e.id)} onOpen={onOpenEvent}/>
                    {i<todayEvents.length-1 && <HR mx={20}/>}
                  </div>
                );
              })}
            </div>
          </Card>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"0 4px"}}>
              <p style={f(13,800)}>近くのイベント</p>
              <span onClick={onOpenNearby} style={{...f(12,700,C.blue),cursor:"pointer"}}>すべて見る</span>
            </div>
            <Card><div style={{padding:"6px 0"}}>
              {upcomingEvents.slice(0,3).map(function(e,i){
                return (
                  <div key={e.id}>
                    <EventCard event={e} attended={attended.has(e.id)} onOpen={onOpenEvent} showDate/>
                    {i<Math.min(3,upcomingEvents.length)-1 && <HR mx={20}/>}
                  </div>
                );
              })}
            </div></Card>
          </div>
          {friendEvents.length > 0 && (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 4px"}}>
                <p style={f(13,800)}>フォロワーが参加予定のイベント</p>
                <div style={{display:"flex"}}>
                  {FOLLOWING.slice(0,3).map(function(u,i){
                    return <div key={u.id} style={{width:20,height:20,borderRadius:"50%",background:C.blueBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,marginLeft:i?-6:0,border:"2px solid #fff"}}>{u.preset.emoji}</div>;
                  })}
                </div>
              </div>
              <Card><div style={{padding:"6px 0"}}>
                {friendEvents.map(function(e,i){
                  const who=FOLLOWING.filter(function(u){return u.attending.includes(e.id);});
                  return (
                    <div key={e.id}>
                      <div onClick={function(){onOpenEvent(e);}} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",cursor:"pointer"}}>
                        <div style={{width:46,height:46,borderRadius:14,background:eventColor(e.id)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}>
                          <div style={{width:14,height:14,borderRadius:"50%",background:eventColor(e.id)}}/>
                          <div style={{position:"absolute",bottom:-3,right:-3,fontSize:13}}>{who[0]?who[0].preset.emoji:""}</div>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{...f(13,800),marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</p>
                          <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                            <span style={{...f(10,700,eventColor(e.id))}}>{dateStr(e)}</span>
                            <span style={f(10,500,C.soft)}>·</span>
                            {who.slice(0,2).map(function(u){return <span key={u.id} style={{...f(10,700,C.mid)}}>@{u.name}</span>;})}
                            {who.length>2 && <span style={f(10,500,C.soft)}>他{who.length-2}人</span>}
                          </div>
                        </div>
                        {attended.has(e.id) && <AttendBadge small/>}
                        {I.chev()}
                      </div>
                      {i<friendEvents.length-1 && <HR mx={20}/>}
                    </div>
                  );
                })}
              </div></Card>
            </div>
          )}
        </div>
      )}

      {homeTab === "attending" && (
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {attendingToday.length === 0 ? (
            <div style={{padding:"14px 16px"}}>
              <Card style={{padding:"40px 20px"}}>
                <p style={{...f(14,700,C.mid),textAlign:"center",marginBottom:6}}>本日参加予定のイベントはありません</p>
                <p style={{...f(12,500,C.soft),textAlign:"center"}}>イベント詳細から参加予定に登録してね</p>
              </Card>
            </div>
          ) : (
            attendingToday.map(function(e){
              const myLoc = myLocation[e.id];
              const col = eventColor(e.id);
              const demoLocs = {"u1":{area:"ステージ前",text:"雷電将軍きてます！",updatedAt:"13:24"},"u2":{area:"撮影エリアA",text:"",updatedAt:"13:41"},"u3":{area:"フードコート",text:"休憩中〜",updatedAt:"14:02"},"u4":{area:"入口付近",text:"",updatedAt:"13:15"}};
              const friendsHere = FOLLOWING.filter(function(u){ return u.attending.includes(e.id); });
              return (
                <div key={e.id} style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:12}}>

                  <div style={{borderRadius:20,background:col,padding:"18px 20px",cursor:"pointer",position:"relative",overflow:"hidden"}} onClick={function(){onOpenEvent(e);}}>
                    <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:"rgba(255,255,255,0.9)",display:"inline-block"}}/>
                      <span style={{...f(9,900,"rgba(255,255,255,0.9)"),letterSpacing:"0.1em"}}>LIVE 参加中</span>
                    </div>
                    <p style={{...f(18,900,"#fff"),marginBottom:4,lineHeight:1.2}}>{e.name}</p>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      {I.pin("rgba(255,255,255,0.7)",11)}
                      <span style={{...f(11,600,"rgba(255,255,255,0.8)")}}>{e.venue}</span>
                    </div>
                  </div>

                  <Card>
                    <div style={{padding:"16px 20px 14px"}}>
                      <p style={{...f(10,800,C.soft),letterSpacing:"0.08em",marginBottom:12}}>自分の現在地</p>
                      {myLoc ? (
                        <div>
                          <div style={{background:C.blue+"0D",borderRadius:14,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:34,height:34,borderRadius:11,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{I.pin("#fff",14)}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                                <span style={{background:C.blue,color:"#fff",fontSize:10,fontWeight:900,padding:"2px 10px",borderRadius:99}}>{myLoc.area}</span>
                                <span style={{...f(9,500,C.soft)}}>{myLoc.updatedAt} 更新</span>
                              </div>
                              {myLoc.text ? <p style={{...f(12,600,C.ink)}}>{myLoc.text}</p> : null}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={function(ev){ev.stopPropagation();openModal(e.id);}} style={{flex:1,padding:"11px",borderRadius:13,background:C.blueBg,border:"none",cursor:"pointer",...f(12,800,C.blue)}}>場所を更新する</button>
                            <button onClick={function(ev){clearLoc(e.id,ev);}} style={{padding:"11px 16px",borderRadius:13,background:C.bg,border:"2px solid "+C.line,cursor:"pointer",...f(11,700,C.mid)}}>共有を止める</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={function(ev){ev.stopPropagation();openModal(e.id);}}
                          style={{width:"100%",padding:"13px",borderRadius:14,background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px "+C.blue+"44",boxSizing:"border-box"}}>
                          {I.pin("#fff",15)}
                          <span style={{...f(13,900,"#fff")}}>今いる場所をフォロワーに知らせる</span>
                        </button>
                      )}
                    </div>
                  </Card>

                  {friendsHere.length > 0 && (
                    <Card>
                      <div style={{padding:"16px 20px 6px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                          <p style={f(13,800)}>フォロワーの現在地</p>
                          <span style={{background:C.rose,color:"#fff",fontSize:9,fontWeight:900,minWidth:16,height:16,borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{friendsHere.length}</span>
                        </div>
                        {friendsHere.map(function(u,ui){
                          const uloc = demoLocs[u.id];
                          return (
                            <div key={u.id}>
                              <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0"}}>
                                <AvatarCircle preset={u.preset} name={u.name} size={36}/>
                                <div style={{flex:1,minWidth:0}}>
                                  <p style={{...f(12,800),marginBottom:3}}>@{u.name}</p>
                                  {uloc ? (
                                    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                                      <span style={{background:C.blueBg,color:C.blue,fontSize:10,fontWeight:800,padding:"2px 9px",borderRadius:99}}>{uloc.area}</span>
                                      {uloc.text ? <span style={{...f(10,500,C.mid),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{uloc.text}</span> : null}
                                      <span style={f(9,500,C.soft)}>{uloc.updatedAt}</span>
                                    </div>
                                  ) : (
                                    <span style={f(10,500,C.soft)}>場所未共有</span>
                                  )}
                                </div>
                              </div>
                              {ui < friendsHere.length-1 && <HR mx={0}/>}
                            </div>
                          );
                        })}
                        <div style={{height:10}}/>
                      </div>
                    </Card>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

    </div>

    </div>  );
};


// - MESSAGE -
const MessageScreen = ({user, onBack}) => {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([
    {from:"them", text:"こんにちは！今日のacosta来る予定ですか？", time:"13:10"},
    {from:"me",   text:"はい！14時ごろ着く予定です！", time:"13:15"},
    {from:"them", text:"じゃあ一緒に撮影しましょう！ステージ前にいます", time:"13:18"},
  ]);
  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    const hm = now.getHours()+":"+String(now.getMinutes()).padStart(2,"0");
    setMsgs(m=>[...m,{from:"me",text:text.trim(),time:hm}]);
    setText("");
  };
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <div style={{background:C.white,padding:"52px 20px 14px",borderBottom:"1px solid "+C.line,flexShrink:0}}>
        <BackBtn onBack={onBack}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:4}}>
          <AvatarCircle preset={user.preset} name={user.name} size={40}/>
          <div>
            <p style={f(15,900)}>@{user.name}</p>
            <p style={{...f(10,500,C.soft),marginTop:2}}>オンライン</p>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
            {m.from==="them"&&<AvatarCircle preset={user.preset} name={user.name} size={28}/>}
            <div style={{maxWidth:"72%"}}>
              <div style={{background:m.from==="me"?C.blue:C.white,borderRadius:m.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                <p style={{...f(13,600,m.from==="me"?"#fff":C.ink),lineHeight:1.5}}>{m.text}</p>
              </div>
              <p style={{...f(9,500,C.soft),marginTop:3,textAlign:m.from==="me"?"right":"left"}}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"10px 16px 28px",background:C.white,borderTop:"1px solid "+C.line,flexShrink:0,display:"flex",gap:10,alignItems:"flex-end"}}>
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")send();}}
          placeholder="メッセージを入力..."
          style={{flex:1,padding:"12px 16px",borderRadius:24,border:"2px solid "+C.line,fontSize:13,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none",background:C.bg}}
        />
        <button onClick={send} style={{width:42,height:42,borderRadius:14,background:text.trim()?C.blue:C.line,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.15s"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
};


const MapScreen = ({onOpenEvent,onOpenStudio,attended}) => {
  const [mapTab,setMapTab]=useState("event"); // studio hidden for now
  const [sel,setSel]=useState(null);
  const [sheet,setSheet]=useState(null);
  const ECOLS=[C.blue,C.rose,"#7C3AED",C.blue,C.rose];
  const SCOLS=[C.blue,C.rose,"#7C3AED"];
  const EPINS=[{x:110,y:90,label:"acosta!"},{x:275,y:60,label:"コスサミ"},{x:55,y:230,label:"コミケ"},{x:250,y:380,label:"ニコ超"},{x:120,y:550,label:"日橋フェスタ"}];
  const SPINS=[{x:168,y:78,label:"Studio Rei"},{x:280,y:148,label:"ARCH"},{x:76,y:200,label:"LUMI"}];
  const pins=mapTab==="event"?EPINS:SPINS;
  const cols=mapTab==="event"?ECOLS:SCOLS;

  const handlePin=(i)=>{
    setSel(i);
    setSheet(mapTab==="event"?upcomingEvents[i%upcomingEvents.length]:STUDIOS[i%STUDIOS.length]);
  };
  const closeSheet=()=>{ setSel(null); setSheet(null); };

  return (
    <div style={{position:"absolute",top:0, left:0, right:0, bottom:0,display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes bubblePop {
          0%   { transform:translate(-50%,-100%) scale(0.3); opacity:0; }
          65%  { transform:translate(-50%,-100%) scale(1.18); opacity:1; }
          82%  { transform:translate(-50%,-100%) scale(0.92); }
          100% { transform:translate(-50%,-100%) scale(1); }
        }
        @keyframes bubbleActivate {
          0%   { transform:translate(-50%,-100%) scale(1); }
          35%  { transform:translate(-50%,-100%) scale(1.25); }
          65%  { transform:translate(-50%,-100%) scale(0.92); }
          100% { transform:translate(-50%,-100%) scale(1.06); }
        }
        @keyframes sheetBounce {
          0%   { transform:translateY(110%); opacity:0.6; }
          58%  { transform:translateY(-16px); opacity:1; }
          76%  { transform:translateY(7px); }
          90%  { transform:translateY(-4px); }
          100% { transform:translateY(0); }
        }
        @keyframes locSheetUp {
            0%   { transform:translateY(70%); opacity:0.4; }
            60%  { transform:translateY(-10px); opacity:1; }
            80%  { transform:translateY(5px); }
            100% { transform:translateY(0); }
          }
        @keyframes myLocPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(255,61,92,0.4); }
          50%     { box-shadow:0 0 0 10px rgba(255,61,92,0); }
        }
      `}</style>



      {/* マップエリア */}
      <div style={{flex:1,background:"#DFE3F5",position:"relative",overflow:"hidden",minHeight:0}}>
        {/* マップSVG */}
        <svg style={{position:"absolute",top:0, left:0, right:0, bottom:0,width:"100%",height:"100%"}}>
          <defs>
            <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DFE3F5"/>
              <stop offset="100%" stopColor="#D2D7EE"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrad)"/>
          {/* 縦道 */}
          <path d="M 108 0 L 114 800" stroke="#B8BEDD" strokeWidth="22" fill="none"/>
          <path d="M 108 0 L 114 800" stroke="#E8EAF6" strokeWidth="14" fill="none"/>
          <path d="M 232 0 L 230 800" stroke="#B8BEDD" strokeWidth="14" fill="none"/>
          <path d="M 232 0 L 230 800" stroke="#E8EAF6" strokeWidth="9" fill="none"/>
          <path d="M 340 0 L 342 800" stroke="#B8BEDD" strokeWidth="10" fill="none"/>
          <path d="M 340 0 L 342 800" stroke="#E8EAF6" strokeWidth="6" fill="none"/>
          {/* 横道 */}
          <path d="M 0 148 Q 196 122 390 152" stroke="#B8BEDD" strokeWidth="28" fill="none"/>
          <path d="M 0 148 Q 196 122 390 152" stroke="#E8EAF6" strokeWidth="18" fill="none"/>
          <path d="M 0 148 Q 196 122 390 152" stroke="#D0D4EC" strokeWidth="1.5" fill="none" strokeDasharray="12 8"/>
          <path d="M 0 310 L 390 318" stroke="#B8BEDD" strokeWidth="20" fill="none"/>
          <path d="M 0 310 L 390 318" stroke="#E8EAF6" strokeWidth="12" fill="none"/>
          <path d="M 0 500 Q 200 488 390 502" stroke="#B8BEDD" strokeWidth="18" fill="none"/>
          <path d="M 0 500 Q 200 488 390 502" stroke="#E8EAF6" strokeWidth="11" fill="none"/>
          <path d="M 0 680 L 390 675" stroke="#B8BEDD" strokeWidth="14" fill="none"/>
          <path d="M 0 680 L 390 675" stroke="#E8EAF6" strokeWidth="8" fill="none"/>
          {/* 建物ブロック1 */}
          <rect x="10"  y="158" width="90"  height="58" rx="8" fill="#C2C8DF"/>
          <rect x="14"  y="162" width="38"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="56"  y="162" width="38"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="118" y="158" width="108" height="58" rx="8" fill="#C2C8DF"/>
          <rect x="122" y="162" width="48"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="174" y="162" width="44"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="248" y="162" width="130" height="48" rx="8" fill="#C2C8DF"/>
          <rect x="252" y="166" width="55"  height="18" rx="4" fill="#D0D6EC"/>
          <rect x="312" y="166" width="55"  height="18" rx="4" fill="#D0D6EC"/>
          {/* 建物ブロック2 */}
          <rect x="10"  y="330" width="90"  height="60" rx="8" fill="#C2C8DF"/>
          <rect x="14"  y="334" width="38"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="56"  y="334" width="38"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="10"  y="362" width="90"  height="22" rx="4" fill="#B8BEDD"/>
          <rect x="118" y="330" width="106" height="60" rx="8" fill="#C2C8DF"/>
          <rect x="122" y="334" width="44"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="170" y="334" width="44"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="248" y="330" width="130" height="60" rx="8" fill="#C2C8DF"/>
          <rect x="252" y="334" width="55"  height="22" rx="4" fill="#D0D6EC"/>
          <rect x="312" y="334" width="55"  height="22" rx="4" fill="#D0D6EC"/>
          {/* 建物ブロック3 */}
          <rect x="10"  y="520" width="90"  height="55" rx="8" fill="#C2C8DF"/>
          <rect x="14"  y="524" width="40"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="14"  y="548" width="82"  height="20" rx="4" fill="#B8BEDD"/>
          <rect x="118" y="520" width="106" height="55" rx="8" fill="#C2C8DF"/>
          <rect x="122" y="524" width="44"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="170" y="524" width="44"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="248" y="520" width="130" height="55" rx="8" fill="#C2C8DF"/>
          <rect x="252" y="524" width="55"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="312" y="524" width="55"  height="20" rx="4" fill="#D0D6EC"/>
          {/* 建物ブロック4 */}
          <rect x="10"  y="700" width="90"  height="55" rx="8" fill="#C2C8DF"/>
          <rect x="14"  y="704" width="38"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="56"  y="704" width="38"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="118" y="700" width="106" height="55" rx="8" fill="#C2C8DF"/>
          <rect x="122" y="704" width="44"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="248" y="700" width="130" height="55" rx="8" fill="#C2C8DF"/>
          <rect x="252" y="704" width="55"  height="20" rx="4" fill="#D0D6EC"/>
          <rect x="312" y="704" width="55"  height="20" rx="4" fill="#D0D6EC"/>
          {/* 公園 */}
          <ellipse cx="62"  cy="90"  rx="32" ry="25" fill="#B8D4BF" opacity="0.75"/>
          <ellipse cx="58"  cy="88"  rx="12" ry="10" fill="#A8C8AF" opacity="0.6"/>
          <ellipse cx="72"  cy="92"  rx="10" ry="8"  fill="#A8C8AF" opacity="0.6"/>
          <ellipse cx="318" cy="240" rx="28" ry="22" fill="#B8D4BF" opacity="0.65"/>
          <ellipse cx="314" cy="238" rx="11" ry="9"  fill="#A8C8AF" opacity="0.6"/>
          <ellipse cx="72"  cy="440" rx="26" ry="20" fill="#B8D4BF" opacity="0.6"/>
          <ellipse cx="68"  cy="438" rx="10" ry="8"  fill="#A8C8AF" opacity="0.55"/>
          <ellipse cx="310" cy="610" rx="24" ry="18" fill="#B8D4BF" opacity="0.6"/>
          <ellipse cx="190" cy="625" rx="22" ry="16" fill="#B8D4BF" opacity="0.55"/>

        </svg>

        {/* バブルピン */}
        {pins.map((p,i)=>{
          const isActive=sel===i;
          const col=cols[i%cols.length];
          return (
            <div key={`${mapTab}-pin-${i}`}
              onClick={()=>handlePin(i)}
              style={{
                position:"absolute", left:p.x, top:p.y,
                transform:"translate(-50%,-100%)",
                animation: isActive
                  ? "bubbleActivate 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards"
                  : `bubblePop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*0.09}s both`,
                cursor:"pointer", zIndex:isActive?10:5,
                display:"flex", flexDirection:"column", alignItems:"center",
              }}>
              {/* バブル */}
              <div style={{
                background: isActive ? col : C.white,
                color: isActive ? "#fff" : C.ink,
                fontSize:11, fontWeight:900,
                padding:"9px 16px",
                borderRadius:99,
                boxShadow: isActive
                  ? `0 8px 24px ${col}55, 0 3px 10px rgba(0,0,0,0.18)`
                  : "0 4px 16px rgba(22,19,74,0.14), 0 1px 4px rgba(0,0,0,0.08)",
                border: isActive ? `2px solid ${col}` : `2.5px solid ${col}44`,
                whiteSpace:"nowrap",
                fontFamily:"'Nunito',sans-serif",
                transition:"background 0.18s, color 0.18s, box-shadow 0.18s, border 0.18s",
                display:"flex", alignItems:"center", gap:6,
              }}>
                <span style={{
                  width:8, height:8, borderRadius:"50%",
                  background: isActive ? "rgba(255,255,255,0.8)" : col,
                  display:"inline-block", flexShrink:0,
                  boxShadow: isActive ? "none" : `0 0 0 3px ${col}22`,
                }}/>
                {p.label}
              </div>
              {/* しっぽ */}
              <div style={{
                width:0, height:0,
                borderLeft:"8px solid transparent",
                borderRight:"8px solid transparent",
                borderTop:`10px solid ${isActive ? col : C.white}`,
                marginTop:-1,
                filter: isActive ? `drop-shadow(0 3px 4px ${col}44)` : "drop-shadow(0 2px 2px rgba(0,0,0,0.1))",
              }}/>
            </div>
          );
        })}

        {/* 現在地 */}
        <div style={{position:"absolute",left:200,top:200,transform:"translate(-50%,-50%)",zIndex:8}}>
          <div style={{
            width:18, height:18, borderRadius:"50%",
            background:C.rose, border:"3px solid #fff",
            animation:"myLocPulse 2.2s ease-in-out infinite",
            boxShadow:"0 2px 8px rgba(255,61,92,0.4)",
          }}/>
        </div>

        {/* マップをタップして閉じる（シートが出てる時） */}
        {sheet&&(
          <div onClick={closeSheet} style={{position:"absolute",top:0, left:0, right:0, bottom:0,zIndex:1}}/>
        )}
      </div>

      {/* バウンスボトムシート */}
      {sheet&&(
        <div style={{
          position:"absolute", left:0, right:0, bottom:68, zIndex:30,
          animation:"sheetBounce 0.52s cubic-bezier(0.22,1,0.36,1) forwards",
          padding:"0 14px",
        }}>
          <div style={{background:C.white,borderRadius:26,boxShadow:"0 -4px 30px rgba(22,19,74,0.12),0 8px 40px rgba(0,0,0,0.14)",overflow:"hidden"}}>
            {/* ハンドル */}
            <div style={{display:"flex",justifyContent:"center",paddingTop:10,paddingBottom:2}}>
              <div style={{width:36,height:4,borderRadius:2,background:C.line}}/>
            </div>

            {mapTab==="event" ? (
              <div style={{padding:"10px 20px 18px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:10}}>
                  <div style={{width:52,height:52,borderRadius:16,background:eventColor(sheet.id)+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:eventColor(sheet.id)}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                      <p style={{...f(15,900),letterSpacing:"-0.01em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sheet.name}</p>
                      {attended.has(sheet.id)&&<AttendBadge small/>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                      {I.pin(C.soft,10)}
                      <span style={f(11,500,C.mid)}>{sheet.venue}</span>
                      <span style={f(10,400,C.soft)}>·</span>
                      <span style={{...f(11,800,eventColor(sheet.id))}}>{dateStr(sheet)}</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                  {[sheet.tag,sheet.dressing?"更衣室あり":null,sheet.ticket].filter(Boolean).map((t,i)=>(
                    <span key={i} style={{background:C.bg,color:C.mid,fontSize:10,fontWeight:700,padding:"5px 11px",borderRadius:99}}>{t}</span>
                  ))}
                </div>
                {/* フォロー中の現在地 */}
                {(()=>{
                  const here=FOLLOWING.filter(u=>u.location && u.location.eventId===sheet.id);
                  if(!here.length) return null;
                  return (
                    <div style={{background:C.bg,borderRadius:14,padding:"12px 14px",marginBottom:12}}>
                      <p style={{...f(10,800,C.soft),letterSpacing:"0.07em",marginBottom:10}}>フォロー中の現在地</p>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {here.map(u=>(
                          <div key={u.id} style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:30,height:30,borderRadius:"50%",background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:`2px solid ${C.line}`,flexShrink:0}}>{u.preset.emoji}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={f(12,800)}>@{u.name}</span>
                                <span style={{background:C.blueBg,color:C.blue,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:99}}>{u.location.area}</span>
                              </div>
                              {u.location.text&&<p style={{...f(10,500,C.mid),marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>「{u.location.text}」</p>}
                            </div>
                            <span style={f(9,500,C.soft)}>{u.location.updatedAt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {/* フォロー中の現在地 */}
                {(()=>{const here=FOLLOWING.filter(u=>u.location && u.location.eventId===sheet.id);return here.length>0&&(
                  <div style={{background:C.bg,borderRadius:14,padding:"10px 14px",marginBottom:12}}>
                    <p style={{...f(10,800,C.soft),letterSpacing:"0.06em",marginBottom:8}}>フォロー中の現在地</p>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {here.map(u=>(
                        <div key={u.id} style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:26,height:26,borderRadius:8,background:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>{u.preset.emoji}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              <span style={{...f(11,800,C.ink)}}>@{u.name}</span>
                              <span style={{background:C.blueBg,color:C.blue,fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:99}}>{u.location.area}</span>
                              {u.location.text&&<span style={{...f(10,500,C.mid),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>「{u.location.text}」</span>}
                            </div>
                            <p style={{...f(9,500,C.soft),marginTop:1}}>{u.location.updatedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );})()}
                <button onClick={()=>onOpenEvent(sheet)}
                  style={{width:"100%",padding:"14px",borderRadius:14,background:eventColor(sheet.id),border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 5px 18px ${eventColor(sheet.id)}44`}}>
                  <span style={{...f(14,800,"#fff")}}>詳細を見る</span>
                  {I.chev("#fff")}
                </button>
              </div>
            ) : (
              <div style={{padding:"10px 20px 18px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:10}}>
                  <div style={{width:52,height:52,borderRadius:16,background:cols[STUDIOS.findIndex(s=>s.id===sheet.id)%3]+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {I.camera(cols[STUDIOS.findIndex(s=>s.id===sheet.id)%3])}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                      <p style={{...f(15,900),letterSpacing:"-0.01em"}}>{sheet.name}</p>
                      <span style={{background:sheet.type==="貸切"?C.blueBg:C.roseBg,color:sheet.type==="貸切"?C.blue:C.rose,fontSize:9,fontWeight:800,padding:"3px 9px",borderRadius:99}}>{sheet.type}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      {I.pin(C.soft,10)}<span style={f(11,500,C.mid)}>{sheet.area}</span>
                      <span style={f(10,400,C.soft)}>·</span>
                      <span style={{...f(11,800,C.blue)}}>{sheet.hourly}</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {[[I.clock(C.soft),"営業時間",sheet.hours],[I.user(C.soft,12),"定員",sheet.capacity]].map(([icon,lbl,val],i)=>(
                    <div key={i} style={{flex:1,background:C.bg,borderRadius:13,padding:"10px 13px",display:"flex",alignItems:"center",gap:8}}>
                      {icon}
                      <div>
                        <p style={{...f(9,700,C.soft),marginBottom:2}}>{lbl}</p>
                        <p style={f(12,700)}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>onOpenStudio(sheet)}
                  style={{width:"100%",padding:"14px",borderRadius:14,background:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 5px 18px ${C.blue}44`}}>
                  <span style={{...f(14,800,"#fff")}}>詳細を見る</span>
                  {I.chev("#fff")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// - PROFILE -
const ProfileScreen = ({attended,onOpenEvent,onOpenFollowing}) => {
  const attendedList=ALL_EVENTS.filter(e=>attended.has(e.id));

  const [profile,setProfile]=useState({name:"raiden_cos",tag:"東京 · 原神 · スタジオ派",bio:"コスプレ歴5年。原神メインで週1でイベント参加してます⚡",preset:AVATAR_PRESETS[5],sns:{twitter:"@raiden_cos",instagram:"raiden_cosplay",tiktok:""}});
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(null);
  const [pickerOpen,setPickerOpen]=useState(false);
  const openEdit=()=>{setDraft({...profile,sns:{...profile.sns}});setPickerOpen(false);setEditing(true);};
  const saveEdit=()=>{setProfile({...draft});setEditing(false);};

  return (
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
    <div style={{paddingBottom:110,position:"relative"}}>
      {/* 編集モーダル */}
      {editing&&(
        <div style={{position:"absolute",top:0, left:0, right:0, bottom:0,zIndex:110,background:"rgba(22,19,74,0.6)",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:C.white,borderRadius:"24px 24px 0 0",padding:"24px 22px 50px",maxHeight:"90%",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h3 style={{...f(17,900)}}>プロフィール編集</h3>
              <button onClick={()=>setEditing(false)} style={{width:32,height:32,borderRadius:10,background:C.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.close(C.mid)}</button>
            </div>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{display:"inline-block",position:"relative",cursor:"pointer"}} onClick={()=>setPickerOpen(p=>!p)}>
                <AvatarCircle preset={draft.preset} name={draft.name} size={76}/>
                <div style={{position:"absolute",bottom:0,right:0,width:24,height:24,borderRadius:12,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",border:"2.5px solid #fff"}}>{I.plus("#fff")}</div>
              </div>
              <p style={{...f(11,600,C.soft),marginTop:10}}>タップしてアイコンを変更</p>
            </div>
            {pickerOpen&&(
              <div style={{marginBottom:24}}>
                <p style={{...f(10,800,C.soft),letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>アイコンを選ぶ</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                  {AVATAR_PRESETS.map(p=>(<button key={p.id} onClick={()=>setDraft(d=>({...d,preset:p}))} style={{aspectRatio:"1",borderRadius:16,background:((draft.preset&&draft.preset.id===p.id)?C.blueBg:C.bg),border:`2.5px solid ${((draft.preset&&draft.preset.id===p.id)?C.blue:"transparent")}`,cursor:"pointer",fontSize:28,display:"flex",alignItems:"center",justifyContent:"center"}}>{p.emoji}</button>))}
                  <button style={{aspectRatio:"1",borderRadius:16,background:C.bg,border:`2px dashed ${C.line}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>{I.plus(C.soft)}<span style={{...f(9,700,C.soft)}}>画像</span></button>
                </div>
              </div>
            )}
            {[["表示名","name","例: raiden_cos"],["タグライン","tag","例: 東京 · 原神 · スタジオ派"]].map(([lbl,key,ph])=>(
              <div key={key} style={{marginBottom:16}}>
                <p style={{...f(11,800,C.mid),letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>{lbl}</p>
                <input value={draft[key]} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))} placeholder={ph}
                  style={{width:"100%",padding:"13px 16px",borderRadius:13,border:`2px solid ${C.line}`,fontSize:14,fontWeight:600,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none",background:C.bg,boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <p style={{...f(11,800,C.mid),letterSpacing:"0.06em",textTransform:"uppercase"}}>自己紹介</p>
                <span style={{...f(10,600,C.soft)}}>{draft.bio.length}/60</span>
              </div>
              <textarea value={draft.bio} onChange={e=>setDraft(d=>({...d,bio:e.target.value.slice(0,60)}))} rows={3} placeholder="ひとことプロフィールを書いてみましょう"
                style={{width:"100%",padding:"13px 16px",borderRadius:13,border:`2px solid ${C.line}`,fontSize:13,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none",background:C.bg,resize:"none",lineHeight:1.65,boxSizing:"border-box"}}/>
            </div>
            <p style={{...f(11,800,C.mid),letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>SNS リンク</p>
            {[{key:"twitter",label:"X / Twitter"},{key:"instagram",label:"Instagram"},{key:"tiktok",label:"TikTok"}].map(({key,label})=>(
              <div key={key} style={{marginBottom:12}}>
                <p style={{...f(10,700,C.soft),marginBottom:6}}>{label}</p>
                <input value={draft.sns[key]} onChange={e=>setDraft(d=>({...d,sns:{...d.sns,[key]:e.target.value}}))} placeholder="@username または URL"
                  style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${C.line}`,fontSize:13,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none",background:C.bg,boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginTop:16}}>
              <button onClick={saveEdit} style={{width:"100%",padding:"15px",borderRadius:15,background:C.blue,border:"none",cursor:"pointer",...f(14,900,"#fff"),boxShadow:`0 6px 20px ${C.blue}44`}}>保存する</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:`linear-gradient(160deg,${C.blue} 0%,#1A3FCC 100%)`,padding:"52px 22px 28px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:20}}>
          <AvatarCircle preset={profile.preset} name={profile.name} size={64}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:0}}>
              <h2 style={{...f(20,900,"#fff"),letterSpacing:"-0.01em",margin:0,lineHeight:1.2}}>{profile.name}</h2>
              <button onClick={openEdit} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:99,background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer"}}>
                {I.edit("#fff")}<span style={{...f(11,700,"#fff")}}>編集</span>
              </button>
            </div>
            <p style={{...f(11,700,"rgba(255,255,255,0.55)"),marginBottom:3}}>@{profile.name}</p>
            <p style={{...f(12,600,"rgba(255,255,255,0.8)"),marginBottom:profile.bio?5:0}}>{profile.tag}</p>
            {profile.bio&&<p style={{...f(12,500,"rgba(255,255,255,0.7)"),lineHeight:1.55}}>{profile.bio}</p>}
          </div>
        </div>
        <button onClick={onOpenFollowing}
          style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:16,background:"rgba(255,255,255,0.18)",border:"none",cursor:"pointer",width:"100%"}}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.people("#fff")}</div>
          <span style={{...f(13,800,"#fff"),flex:1,textAlign:"left"}}>フォロー中</span>
          <span style={{...f(13,700,"rgba(255,255,255,0.8)")}}>{FOLLOWING.length}人</span>
          {I.chev("rgba(255,255,255,0.6)")}
        </button>
      </div>

      <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:12}}>
        {/* SNS */}
        {Object.values(profile.sns).some(v=>v)?(
          <Card style={{padding:"16px 20px"}}>
            <p style={{...f(10,800,C.soft),letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>SNS</p>
            <SNSLinks sns={profile.sns}/>
          </Card>
        ):(
          <button onClick={openEdit} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px 20px",background:C.white,border:`2px dashed ${C.line}`,borderRadius:20,cursor:"pointer",width:"100%"}}>
            {I.plus(C.soft)}<span style={{...f(13,600,C.mid)}}>SNSリンクを追加する</span>
          </button>
        )}

        {/* 自分の参加予定 */}
        <Card>
          <div style={{padding:"18px 20px 6px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:8,background:C.blueBg,display:"flex",alignItems:"center",justifyContent:"center"}}>{I.check(C.blue,14)}</div>
              <p style={{...f(13,800)}}>参加予定イベント</p>
              {attendedList.length>0&&<span style={{background:C.blue,color:"#fff",fontSize:10,fontWeight:800,minWidth:18,height:18,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{attendedList.length}</span>}
            </div>
            {attendedList.length===0
              ?<div style={{padding:"20px 0 16px",textAlign:"center"}}>
                <p style={f(13,700,C.mid)}>参加予定のイベントはありません</p>
                <p style={{...f(11,500,C.soft),marginTop:4}}>イベント詳細画面から登録できます</p>
              </div>
              :attendedList.map((e,i)=>(<div key={e.id}><EventCard event={e} attended onOpen={onOpenEvent} showDate/>{i<attendedList.length-1&&<HR mx={20}/>}</div>))
            }
            <div style={{height:8}}/>
          </div>
        </Card>

        <button style={{display:"flex",alignItems:"center",gap:8,padding:"16px 20px",background:C.white,border:"none",borderRadius:16,cursor:"pointer",width:"100%"}}>
          {I.door(C.rose)}<span style={f(14,700,C.rose)}>ログアウト</span>
        </button>
      </div>
    </div>

    </div>  );
};


function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 120),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1250),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(() => { onDone && onDone(); }, 3100),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: "absolute", top:0, left:0, right:0, bottom:0,
      background: "#2B5BFF",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 10,
      opacity: phase >= 4 ? 0 : 1,
      transition: phase >= 4 ? "opacity 0.55s ease-in-out" : "none",
      pointerEvents: phase >= 4 ? "none" : "auto",
    }}>
      {/* Circle decorations */}
      <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.1)", top:-80, right:-80, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.07)", bottom:60, left:-60, pointerEvents:"none" }}/>

      {/* Icon */}
      <div style={{
        marginBottom: 20,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "scale(1)" : "scale(0)",
        transition: "opacity 0.3s, transform 0.5s cubic-bezier(0.34,1.4,0.64,1)",
      }}>
        <div style={{ width:96, height:96, borderRadius:28, background:"white", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 16px 48px rgba(0,0,0,0.2)" }}>
          <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
            <path d="M26 2C14.4 2 5 11.4 5 23c0 15 21 31 21 31s21-16 21-31C47 11.4 37.6 2 26 2z" fill="#2B5BFF"/>
            <circle cx="26" cy="22" r="9" fill="white"/>
            <path d="M26 18.5c-0.9-2-3.8-2-3.8 1.2 0 1.9 3.8 4.8 3.8 4.8s3.8-2.9 3.8-4.8c0-3.2-2.9-3.2-3.8-1.2z" fill="#FF3D5C"/>
          </svg>
        </div>
      </div>

      {/* Font load */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');`}</style>

      {/* App name */}
      <div style={{
        marginBottom: 10,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "translateY(0) scale(1)" : "translateY(20px) scale(0.85)",
        transition: "opacity 0.4s, transform 0.5s cubic-bezier(0.34,1.4,0.64,1)",
      }}>
        <p style={{ fontSize:44, fontWeight:900, color:"white", letterSpacing:"-0.04em", lineHeight:1, margin:0, fontFamily:"'Nunito',sans-serif" }}>CosMap</p>
      </div>

      {/* Tagline */}
      <div style={{
        marginBottom: 64,
        opacity: phase >= 3 ? 0.65 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s, transform 0.4s ease-out",
      }}>
        <p style={{ fontSize:12, fontWeight:800, color:"white", letterSpacing:"0.2em", margin:0, textAlign:"center" }}>COSPLAY EVENT MAP</p>
      </div>

      {/* Dots */}
      <div style={{ position:"absolute", bottom:60, display:"flex", gap:8, opacity: phase >= 3 ? 1 : 0, transition:"opacity 0.4s" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"rgba(255,255,255,0.8)" }}/>
        ))}
      </div>
    </div>
  );
}


const IconMap = () => (
  <svg width="168" height="168" viewBox="0 0 168 168" fill="none">
    {/* Map card */}
    <rect x="16" y="28" width="136" height="112" rx="18" fill={C.white}/>
    <rect x="16" y="28" width="136" height="112" rx="18" stroke={C.line} strokeWidth="1.5"/>
    {/* Road H */}
    <rect x="16" y="78" width="136" height="9" fill={C.bg}/>
    {/* Road V */}
    <rect x="78" y="28" width="9" height="112" fill={C.bg}/>
    {/* Park block */}
    <rect x="24" y="36" width="46" height="34" rx="8" fill="#E8F5E9" opacity="0.8"/>
    {/* Building block */}
    <rect x="98" y="96" width="44" height="34" rx="8" fill={C.bg}/>
    {/* Pin 1 - main blue */}
    <g filter="url(#ps1)">
      <path d="M84 14C74.1 14 66 22.1 66 32c0 13.5 18 28 18 28s18-14.5 18-28C102 22.1 93.9 14 84 14z" fill={C.blue}/>
      <circle cx="84" cy="31" r="8" fill={C.white}/>
      <path d="M84 26.5c-.9-1.8-3.6-1.8-3.6 1 0 1.5 3.6 4 3.6 4s3.6-2.5 3.6-4c0-2.8-2.7-2.8-3.6-1z" fill={C.blue}/>
    </g>
    {/* Pin 2 - rose */}
    <g opacity="0.85">
      <path d="M38 54C33 54 29 58 29 63c0 8 9 15 9 15s9-7 9-15C47 58 43 54 38 54z" fill={C.rose}/>
      <circle cx="38" cy="62" r="5" fill={C.white}/>
    </g>
    {/* Pin 3 - violet */}
    <g opacity="0.75">
      <path d="M128 96c-4.4 0-8 3.6-8 8 0 6.5 8 13 8 13s8-6.5 8-13c0-4.4-3.6-8-8-8z" fill={C.violet}/>
      <circle cx="128" cy="103" r="4" fill={C.white}/>
    </g>
    {/* Current location pulse */}
    <circle cx="84" cy="106" r="16" fill={C.blue} opacity="0.08"/>
    <circle cx="84" cy="106" r="9"  fill={C.blue} opacity="0.15"/>
    <circle cx="84" cy="106" r="4"  fill={C.blue}/>
    <circle cx="84" cy="106" r="2"  fill={C.white}/>
    <defs>
      <filter id="ps1" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor={C.blue} floodOpacity="0.35"/>
      </filter>
    </defs>
  </svg>
);

const IconShare = () => (
  <svg width="168" height="168" viewBox="0 0 168 168" fill="none">
    {/* Center phone */}
    <rect x="56" y="22" width="56" height="104" rx="14" fill={C.white}/>
    <rect x="56" y="22" width="56" height="104" rx="14" stroke={C.line} strokeWidth="1.5"/>
    {/* Screen */}
    <rect x="62" y="36" width="44" height="76" rx="9" fill={C.bg}/>
    {/* Mini map on screen */}
    <rect x="66" y="40" width="36" height="28" rx="6" fill={C.violet} opacity="0.1"/>
    <rect x="66" y="40" width="36" height="28" rx="6" stroke={C.violet} strokeWidth="1" opacity="0.2"/>
    {/* Avatar A on map */}
    <circle cx="76" cy="52" r="5" fill={C.blue}/>
    <circle cx="76" cy="52" r="2.5" fill={C.white}/>
    {/* Avatar B on map */}
    <circle cx="93" cy="56" r="5" fill={C.rose}/>
    <circle cx="93" cy="56" r="2.5" fill={C.white}/>
    {/* Chat bubble */}
    <rect x="66" y="76" width="24" height="13" rx="6" fill={C.violet}/>
    <rect x="78" y="94" width="20" height="13" rx="6" fill={C.line}/>
    {/* Notch */}
    <rect x="78" y="24" width="12" height="4" rx="2" fill={C.line}/>
    {/* Left user badge */}
    <circle cx="26" cy="84" r="20" fill={C.blue} opacity="0.1"/>
    <circle cx="26" cy="84" r="13" fill={C.blue}/>
    <circle cx="26" cy="80" r="5.5" fill={C.white}/>
    <path d="M14 94c0-7 5.4-10 12-10s12 3 12 10" fill={C.white} opacity="0.8"/>
    {/* Pulse rings left */}
    <circle cx="26" cy="84" r="18" stroke={C.blue} strokeWidth="1.5" opacity="0.25" strokeDasharray="4 3"/>
    <circle cx="26" cy="84" r="24" stroke={C.blue} strokeWidth="1"   opacity="0.12" strokeDasharray="4 3"/>
    {/* Right user badge */}
    <circle cx="142" cy="90" r="20" fill={C.rose} opacity="0.1"/>
    <circle cx="142" cy="90" r="13" fill={C.rose}/>
    <circle cx="142" cy="86" r="5.5" fill={C.white}/>
    <path d="M130 100c0-7 5.4-10 12-10s12 3 12 10" fill={C.white} opacity="0.8"/>
    {/* Pulse rings right */}
    <circle cx="142" cy="90" r="18" stroke={C.rose} strokeWidth="1.5" opacity="0.25" strokeDasharray="4 3"/>
    <circle cx="142" cy="90" r="24" stroke={C.rose} strokeWidth="1"   opacity="0.12" strokeDasharray="4 3"/>
    {/* Connecting dots */}
    {[0,1,2].map(i => (
      <circle key={i} cx={46 + i*4} cy={84} r="2" fill={C.blue} opacity={0.4 + i*0.15}/>
    ))}
    {[0,1,2].map(i => (
      <circle key={i} cx={122 - i*4} cy={90} r="2" fill={C.rose} opacity={0.4 + i*0.15}/>
    ))}
  </svg>
);

const IconStart = () => (
  <svg width="168" height="168" viewBox="0 0 168 168" fill="none">
    {/* Big circle bg */}
    <circle cx="84" cy="84" r="60" fill={C.bg}/>
    {/* CosMap pin */}
    <g filter="url(#ps2)">
      <path d="M84 32C70.2 32 59 43.2 59 57c0 18 25 38 25 38s25-20 25-38C109 43.2 97.8 32 84 32z" fill={C.blue}/>
      <circle cx="84" cy="56" r="11" fill={C.white}/>
      <path d="M84 50c-1.1-2.2-4.4-2.2-4.4 1.3 0 1.9 4.4 4.9 4.4 4.9s4.4-3 4.4-4.9c0-3.5-3.3-3.5-4.4-1.3z" fill={C.blue}/>
    </g>
    {/* Stars around */}
    {[
      { x:38,  y:52,  s:10, c:C.rose,   op:0.9 },
      { x:130, y:48,  s:8,  c:C.violet, op:0.8 },
      { x:32,  y:112, s:7,  c:C.violet, op:0.7 },
      { x:136, y:108, s:9,  c:C.rose,   op:0.85},
      { x:84,  y:132, s:8,  c:C.blue,   op:0.6 },
    ].map((s,i) => (
      <text key={i} x={s.x} y={s.y} textAnchor="middle"
        fontSize={s.s} fill={s.c} opacity={s.op} fontWeight="900">✦</text>
    ))}
    {/* CosMap text */}
    <text x="84" y="116" textAnchor="middle"
      fontSize="18" fontWeight="900" fill={C.ink}
      fontFamily="Nunito,sans-serif" letterSpacing="-0.5">CosMap</text>
    <defs>
      <filter id="ps2" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor={C.blue} floodOpacity="0.3"/>
      </filter>
    </defs>
  </svg>
);

const SLIDES = [
  {
    id:     0,
    color:  C.blue,
    icon:   <IconMap />,
    title:  "近くのイベントを\nすぐ見つけよう",
    sub:    "コスプレイベントをマップで一覧表示。今日どこで開催されてるか、一目でわかる。",
    cta:    "次へ",
  },
  {
    id:     1,
    color:  C.rose,
    icon:   <IconShare />,
    title:  "イベント中も\n友達とリアルタイムで繋がる",
    sub:    "会場で友達が今どこにいるか共有。「どこにいる？」がなくなる。",
    cta:    "次へ",
  },
  {
    id:     2,
    color:  C.violet,
    icon:   <IconStart />,
    title:  "さあ、\nはじめよう",
    sub:    "コスプレイベントをもっと楽しく。アカウントを作成して、仲間と繋がろう。",
    cta:    "アカウントを作成",
  },
];

function OnboardingScreen({ onDone }) {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(null);
  const touchStart = useRef(null);

  var SLIDES = [
    { id:0, color:"#2B5BFF", title:"近くのイベントを\nすぐ見つけよう", sub:"コスプレイベントをマップで一覧表示。今日どこで開催されてるか、一目でわかる。" },
    { id:1, color:"#FF3D5C", title:"イベント中も\n友達とリアルタイムで繋がる", sub:"会場でフォロー中の友達が今どこにいるか共有。「どこにいる？」がなくなる。" },
    { id:2, color:"#6C3FF5", title:"さあ、\nはじめよう", sub:"コスプレイベントをもっと楽しく。アカウントを作成して、仲間と繋がろう。" },
  ];

  var s = SLIDES[cur];
  var isLast = cur === SLIDES.length - 1;

  var goTo = function(idx) {
    if (idx === cur) return;
    setDir(idx > cur ? "left" : "right");
    setCur(idx);
  };
  var next = function() { if (cur < SLIDES.length - 1) goTo(cur + 1); };
  var skip = function() { goTo(SLIDES.length - 1); };

  var onTouchStart = function(e) { touchStart.current = e.touches[0].clientX; };
  var onTouchEnd = function(e) {
    if (!touchStart.current) return;
    var d = touchStart.current - e.changedTouches[0].clientX;
    if (d > 50 && cur < SLIDES.length - 1) goTo(cur + 1);
    if (d < -50 && cur > 0) goTo(cur - 1);
    touchStart.current = null;
  };

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:C.white,overflow:"hidden",fontFamily:"'Nunito',sans-serif"}}>

      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:s.color,transition:"background 0.4s ease"}}/>

      {!isLast && (
        <button onClick={skip} style={{position:"absolute",top:58,right:24,zIndex:10,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:99,padding:"6px 15px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",letterSpacing:"0.04em"}}>
          スキップ
        </button>
      )}

      <div key={cur} style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{marginTop:72,width:196,height:196,borderRadius:40,background:"rgba(255,255,255,0.18)",border:"1.5px solid rgba(255,255,255,0.32)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.16)"}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {cur === 0 && (
              <g>
                <rect x="8" y="14" width="64" height="52" rx="9" fill="rgba(255,255,255,0.9)"/>
                <path d="M40 7C29.5 7 21 15.5 21 26c0 14 19 27 19 27s19-13 19-27C59 15.5 50.5 7 40 7z" fill="#2B5BFF"/>
                <circle cx="40" cy="25" r="7" fill="white"/>
                <path d="M40 21c-.8-1.6-3.2-1.6-3.2 1 0 1.4 3.2 3.6 3.2 3.6s3.2-2.2 3.2-3.6c0-3.1-2.4-3.1-3.2-1z" fill="#2B5BFF"/>
                <circle cx="22" cy="46" r="5" fill="#FF3D5C" opacity="0.8"/>
                <circle cx="58" cy="52" r="5" fill="#6C3FF5" opacity="0.8"/>
              </g>
            )}
            {cur === 1 && (
              <g>
                <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
                <circle cx="40" cy="40" r="5" fill="white"/>
                <circle cx="16" cy="36" r="10" fill="rgba(255,255,255,0.9)"/>
                <circle cx="16" cy="36" r="4" fill="#FF3D5C"/>
                <circle cx="64" cy="44" r="10" fill="rgba(255,255,255,0.9)"/>
                <circle cx="64" cy="44" r="4" fill="#FF3D5C"/>
                <line x1="26" y1="36" x2="35" y2="39" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="3 2"/>
                <line x1="54" y1="44" x2="45" y2="41" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="3 2"/>
              </g>
            )}
            {cur === 2 && (
              <g>
                <circle cx="40" cy="40" r="28" fill="rgba(255,255,255,0.15)"/>
                <path d="M40 16C27.3 16 17 26.3 17 39c0 17.5 23 25 23 25s23-7.5 23-25C63 26.3 52.7 16 40 16z" fill="white"/>
                <circle cx="40" cy="38" r="8" fill="#6C3FF5"/>
                <path d="M40 34c-.7-1.4-2.8-1.4-2.8.9 0 1.2 2.8 3.1 2.8 3.1s2.8-1.9 2.8-3.1c0-2.3-2.1-2.3-2.8-.9z" fill="white"/>
              </g>
            )}
          </svg>
        </div>

        <div style={{marginTop:32,padding:"0 36px",textAlign:"center"}}>
          <h1 style={{fontSize:26,fontWeight:900,color:"#fff",letterSpacing:"-0.03em",lineHeight:1.3,margin:"0 0 10px",whiteSpace:"pre-line"}}>{s.title}</h1>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.78)",lineHeight:1.7,margin:0}}>{s.sub}</p>
        </div>
      </div>

      <div style={{position:"absolute",bottom:48,left:0,right:0,display:"flex",flexDirection:"column",alignItems:"center",gap:20,padding:"0 32px"}}>
        <div style={{display:"flex",gap:8}}>
          {SLIDES.map(function(_, i) {
            return (
              <button key={i} onClick={function() { goTo(i); }} style={{width:i===cur?22:8,height:8,borderRadius:99,background:i===cur?"#fff":"rgba(255,255,255,0.35)",border:"none",cursor:"pointer",padding:0,transition:"all 0.32s"}}/>
            );
          })}
        </div>
        <button onClick={isLast ? function() { onDone && onDone(); } : next}
          style={{width:"100%",padding:"17px 0",borderRadius:16,background:"#fff",border:"none",color:s.color,fontSize:16,fontWeight:900,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 8px 28px rgba(0,0,0,0.18)"}}>
          {isLast ? "アカウントを作成" : "次へ"}
        </button>
      </div>
    </div>
  );
}

function AuthScreen({ onDone }) {
  var [pressed, setPressed] = useState(null);

  var handleLogin = function(method) {
    setPressed(method);
    setTimeout(function() { onDone && onDone(); }, 700);
  };

  return (
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:C.white,display:"flex",flexDirection:"column",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:"#2B5BFF",flex:"0 0 52%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",width:360,height:360,borderRadius:"50%",background:"rgba(255,255,255,0.06)",top:-100,right:-80}}/>
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.05)",bottom:-40,left:-40}}/>
        <div style={{width:88,height:88,borderRadius:26,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.2)",marginBottom:24}}>
          <svg width="48" height="52" viewBox="0 0 48 52" fill="none">
            <path d="M24 2C12.4 2 3 11.4 3 23c0 15 21 29 21 29s21-14 21-29C45 11.4 35.6 2 24 2z" fill="#2B5BFF"/>
            <circle cx="24" cy="22" r="9" fill="white"/>
            <path d="M24 17.5c-1-2-3.8-2-3.8 1.1 0 1.7 3.8 4.4 3.8 4.4s3.8-2.7 3.8-4.4c0-3.1-2.8-3.1-3.8-1.1z" fill="#2B5BFF"/>
          </svg>
        </div>
        <p style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-0.04em",lineHeight:1,margin:0}}>CosMap</p>
        <p style={{fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.65)",letterSpacing:"0.18em",marginTop:8}}>COSPLAY EVENT MAP</p>
      </div>

      <div style={{flex:1,padding:"36px 32px 44px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:900,color:C.ink,letterSpacing:"-0.03em",margin:"0 0 8px"}}>はじめましょう</h2>
          <p style={{fontSize:13,fontWeight:600,color:C.mid,lineHeight:1.65,margin:0}}>ログイン・新規登録どちらも同じボタンから。</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <button onClick={function() { handleLogin("apple"); }}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px 0",borderRadius:16,background:pressed==="apple"?"#111":C.ink,border:"none",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 6px 20px rgba(22,19,74,0.25)"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.28.07 2.17.74 2.94.76.91-.17 1.79-.86 2.98-.92 1.28.05 2.24.53 2.89 1.38-2.57 1.5-1.94 5.04.58 5.99-.43 1.18-.99 2.35-2.39 3.67zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Appleでつづける
          </button>
          <button onClick={function() { handleLogin("google"); }}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px 0",borderRadius:16,background:"#fff",border:"2px solid "+C.line,color:C.ink,fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"'Nunito',sans-serif",boxShadow:"0 4px 14px rgba(0,0,0,0.06)"}}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでつづける
          </button>
        </div>

        <p style={{fontSize:11,fontWeight:600,color:C.soft,textAlign:"center",lineHeight:1.6,margin:0}}>
          続けることで<span style={{color:C.blue,cursor:"pointer"}}>利用規約</span>および<span style={{color:C.blue,cursor:"pointer"}}>プライバシーポリシー</span>に同意したことになります
        </p>
      </div>
    </div>
  );
}

var SETUP_AVATAR_PRESETS = [
  {id:"p1",emoji:"⚡",bg:"#EDE9FF"},{id:"p2",emoji:"🌸",bg:"#FFE4F0"},
  {id:"p3",emoji:"🌀",bg:"#E0F2FE"},{id:"p4",emoji:"🍊",bg:"#FFF3E0"},
  {id:"p5",emoji:"⚔️",bg:"#F3F4F6"},{id:"p6",emoji:"🦋",bg:"#FFE4E4"},
  {id:"p7",emoji:"🌙",bg:"#EDE9FF"},{id:"p8",emoji:"🔥",bg:"#FFF0E0"},
  {id:"p9",emoji:"🐉",bg:"#E8F5E9"},{id:"p10",emoji:"👾",bg:"#EDE9FF"},
  {id:"p11",emoji:"🎭",bg:"#FFF3E0"},{id:"p12",emoji:"🌊",bg:"#E0F2FE"},
];

function ProfileSetupScreen({ onDone }) {
  var [step, setStep] = useState(1);
  var [handle, setHandle] = useState("");
  var [dispName, setDisp] = useState("");
  var [avatarType, setAvType] = useState("preset");
  var [avatar, setAvatar] = useState(SETUP_AVATAR_PRESETS[0]);

  var canNext = function() {
    if (step === 1) return handle.length >= 6 && dispName.length >= 1;
    return true;
  };

  var progressW = (step / 2 * 100) + "%";

  return (
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:C.white,display:"flex",flexDirection:"column",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{background:"#2B5BFF",padding:"52px 28px 24px",flexShrink:0}}>
        <div style={{height:4,background:"rgba(255,255,255,0.2)",borderRadius:99,marginBottom:20,overflow:"hidden"}}>
          <div style={{height:"100%",background:"#fff",width:progressW,borderRadius:99,transition:"width 0.45s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:32}}>
          {[{num:1,label:"基本情報"},{num:2,label:"アイコン"}].map(function(s) {
            return (
              <div key={s.num} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:step>=s.num?"#fff":"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {step > s.num
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#2B5BFF" strokeWidth="2" strokeLinecap="round"/></svg>
                    : <span style={{fontSize:10,fontWeight:900,color:step>=s.num?"#2B5BFF":"rgba(255,255,255,0.6)"}}>{s.num}</span>
                  }
                </div>
                <span style={{fontSize:11,fontWeight:800,color:step>=s.num?"#fff":"rgba(255,255,255,0.5)"}}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"28px 28px 0"}}>
        {step === 1 && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div>
              <h2 style={{fontSize:22,fontWeight:900,color:C.ink,letterSpacing:"-0.03em",margin:"0 0 6px"}}>基本情報を設定しよう</h2>
              <p style={{fontSize:13,fontWeight:600,color:C.mid,margin:0}}>あとから変更できます</p>
            </div>
            <div>
              <p style={{fontSize:12,fontWeight:800,color:C.mid,margin:"0 0 6px",letterSpacing:"0.04em"}}>ユーザーID</p>
              <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:14,padding:"0 14px",height:52,border:"2px solid "+(handle.length>0?C.blue:"transparent")}}>
                <span style={{fontSize:15,fontWeight:800,color:C.blue,marginRight:2}}>@</span>
                <input value={handle} onChange={function(e){ setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").toLowerCase()); }}
                  placeholder="raiden_cos" maxLength={20}
                  style={{flex:1,border:"none",background:"transparent",fontSize:15,fontWeight:700,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none"}}/>
                <span style={{fontSize:11,fontWeight:700,color:C.soft}}>{handle.length}/20</span>
              </div>
              {handle.length > 0 && (
                <p style={{fontSize:11,fontWeight:700,color:handle.length>=6?C.blue:C.rose,margin:"4px 0 0"}}>{handle.length>=6?"このIDは使用できます":"6文字以上入力してください"}</p>
              )}
              {handle.length === 0 && (
                <p style={{fontSize:11,fontWeight:600,color:C.soft,margin:"4px 0 0"}}>6文字以上・英数字とアンダースコア（_）のみ使用可</p>
              )}
            </div>
            <div>
              <p style={{fontSize:12,fontWeight:800,color:C.mid,margin:"0 0 6px",letterSpacing:"0.04em"}}>表示名</p>
              <div style={{display:"flex",alignItems:"center",background:C.bg,borderRadius:14,padding:"0 14px",height:52,border:"2px solid "+(dispName.length>0?C.blue:"transparent")}}>
                <input value={dispName} onChange={function(e){ setDisp(e.target.value); }}
                  placeholder="例：雷電コスプレイヤー" maxLength={20}
                  style={{flex:1,border:"none",background:"transparent",fontSize:15,fontWeight:700,color:C.ink,fontFamily:"'Nunito',sans-serif",outline:"none"}}/>
                <span style={{fontSize:11,fontWeight:700,color:C.soft}}>{dispName.length}/20</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div>
              <h2 style={{fontSize:22,fontWeight:900,color:C.ink,letterSpacing:"-0.03em",margin:"0 0 6px"}}>アイコンを設定しよう</h2>
              <p style={{fontSize:13,fontWeight:600,color:C.mid,margin:0}}>プリセットか写真から選べます</p>
            </div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <div style={{width:96,height:96,borderRadius:28,background:avatarType==="preset"?avatar.bg:C.blueBg,border:"3px solid "+C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,boxShadow:"0 8px 24px rgba(43,91,255,0.22)"}}>
                {avatarType==="preset" ? avatar.emoji : "📷"}
              </div>
            </div>
            <div style={{display:"flex",background:C.bg,borderRadius:12,padding:4,gap:4}}>
              {[["preset","プリセット"],["photo","写真"]].map(function(item) {
                return (
                  <button key={item[0]} onClick={function(){ setAvType(item[0]); }}
                    style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:800,background:avatarType===item[0]?"#fff":"transparent",color:avatarType===item[0]?C.blue:C.soft,transition:"all 0.2s"}}>
                    {item[1]}
                  </button>
                );
              })}
            </div>
            {avatarType === "preset" && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
                {SETUP_AVATAR_PRESETS.map(function(a) {
                  return (
                    <button key={a.id} onClick={function(){ setAvatar(a); }}
                      style={{aspectRatio:"1",borderRadius:16,background:a.bg,border:"2.5px solid "+(avatar.id===a.id?C.blue:"transparent"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",transition:"all 0.18s"}}>
                      {a.emoji}
                    </button>
                  );
                })}
              </div>
            )}
            {avatarType === "photo" && (
              <button onClick={function(){ alert("カメラロールを開く"); }}
                style={{padding:"20px 0",borderRadius:16,background:C.blueBg,border:"2px dashed "+C.blue,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:800,color:C.blue,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                写真を選ぶ
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{padding:"20px 28px 44px",flexShrink:0}}>
        {step > 1 && (
          <button onClick={function(){ setStep(function(s){ return s-1; }); }}
            style={{background:"none",border:"none",fontSize:13,fontWeight:700,color:C.soft,cursor:"pointer",display:"block",marginBottom:12,padding:"4px 0",fontFamily:"'Nunito',sans-serif"}}>
            ← 戻る
          </button>
        )}
        <button onClick={function(){
            if (!canNext()) return;
            if (step < 2) { setStep(function(s){ return s+1; }); }
            else { onDone && onDone(); }
          }}
          style={{width:"100%",padding:"17px 0",borderRadius:16,background:canNext()?C.blue:C.line,border:"none",color:"#fff",fontSize:16,fontWeight:900,cursor:canNext()?"pointer":"default",fontFamily:"'Nunito',sans-serif",boxShadow:canNext()?"0 8px 24px rgba(43,91,255,0.44)":"none",transition:"all 0.2s"}}>
          {step < 2 ? "次へ →" : "CosMapをはじめる!"}
        </button>
      </div>
    </div>
  );
}

// - TAB BAR -
const TABS=[{id:"home",label:"ホーム",fn:I.home},{id:"map",label:"マップ",fn:I.map},{id:"search",label:"検索",fn:c=>I.search(c,22)},{id:"profile",label:"マイページ",fn:c=>I.user(c,22)}];
const TabBar=({active,onChange,attendedCount})=>(
  <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.white,borderTop:`2px solid ${C.line}`,display:"flex",padding:"10px 16px 28px",gap:8,zIndex:100}}>
    {TABS.map(t=>{
      const on=active===t.id;
      return (
        <button key={t.id} onClick={()=>onChange(t.id)}
          style={{flex:on?2:1,border:"none",background:on?C.blue:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:on?8:0,padding:"12px 0",borderRadius:99,position:"relative",transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div style={{position:"relative",flexShrink:0}}>
            {t.fn(on?"#fff":C.soft)}

          </div>
          {on&&<span style={{fontSize:12,fontWeight:900,color:"#fff",fontFamily:"'Nunito',sans-serif",whiteSpace:"nowrap"}}>{t.label}</span>}
        </button>
      );
    })}
  </div>
);

// - ROOT -

export default function CosMap(){
  // appPhase: "splash" | "onboarding" | "auth" | "profile-setup" | "main"
  const [appPhase, setAppPhase] = useState("splash");
  const [tab,setTab]=useState("home");
  const [stack,setStack]=useState([]);
  const [attended,setAttended]=useState(new Set([3]));
  const [myLocation,setMyLocation]=useState({});
  const push=(type,data=null)=>setStack(s=>[...s,{type,data}]);
  const pop=()=>setStack(s=>s.slice(0,-1));
  const toggleAttend=id=>setAttended(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#2B2562",padding:20}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { display:none; }
        button { outline:none; }
        input, textarea { outline:none; }
        @keyframes phaseIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
      `}</style>
      <div style={{position:"absolute",top:24}}>
        <p style={{margin:0,fontSize:11,fontWeight:800,letterSpacing:"0.14em",color:"rgba(255,255,255,0.35)",fontFamily:"'Nunito',sans-serif",textTransform:"uppercase",textAlign:"center"}}>CosMap — v16</p>
      </div>
      <div style={{width:390,height:844,background:C.bg,borderRadius:52,overflow:"hidden",position:"relative",boxShadow:"0 40px 100px rgba(0,0,0,0.5),0 10px 30px rgba(0,0,0,0.3),inset 0 0 0 1.5px rgba(255,255,255,0.15)"}}>

        {/* ── PRE-MAIN PHASES ── */}
        {appPhase === "splash" && (
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:300,background:"#2B5BFF"}}>
            <SplashScreen onDone={() => setAppPhase("onboarding")} />
          </div>
        )}
        {appPhase === "onboarding" && (
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:300,background:C.white}}>
            <OnboardingScreen onDone={() => setAppPhase("auth")} />
          </div>
        )}
        {appPhase === "auth" && (
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:300,background:C.white}}>
            <AuthScreen onDone={() => setAppPhase("profile-setup")} />
          </div>
        )}
        {appPhase === "profile-setup" && (
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,zIndex:300,background:C.white}}>
            <ProfileSetupScreen onDone={() => setAppPhase("main")} />
          </div>
        )}

        {/* ── MAIN APP ── */}
        {appPhase === "main" && (
          <div style={{position:"absolute",top:0, left:0, right:0, bottom:0,animation:"phaseIn 0.4s ease-out"}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:126,height:36,background:"#0D0B18",borderRadius:"0 0 24px 24px",zIndex:200}}/>
            <div style={{position:"absolute",top:13,left:0,right:0,display:"flex",justifyContent:"space-between",padding:"0 28px",zIndex:201,pointerEvents:"none"}}>
              <span style={{fontSize:11,fontWeight:800,color:C.ink,fontFamily:"'Nunito',sans-serif"}}>9:41</span>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <svg width="15" height="11" viewBox="0 0 30 22" fill={C.ink}><rect x="0" y="8" width="5" height="14" rx="1.5"/><rect x="8" y="5" width="5" height="17" rx="1.5"/><rect x="16" y="2" width="5" height="20" rx="1.5"/><rect x="24" y="0" width="5" height="22" rx="1.5"/></svg>
                <svg width="17" height="11" viewBox="0 0 34 22" fill="none"><rect x="1" y="1" width="28" height="20" rx="3" stroke={C.ink} strokeWidth="2"/><rect x="29" y="6" width="4" height="10" rx="2" fill={C.ink}/><rect x="3" y="3" width="21" height="16" rx="2" fill={C.ink}/></svg>
              </div>
            </div>
            <div style={{position:"absolute",top:0, left:0, right:0, bottom:0,display:"flex",flexDirection:"column"}}>
              {tab==="home"&&<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}><HomeScreen attended={attended} onOpenEvent={e=>push("event",e)} onOpenNearby={()=>push("nearby")} onOpenAttended={()=>push("attended")} myLocation={myLocation} setMyLocation={setMyLocation}/></div>}
              {tab==="search"&&<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}><SearchScreen onOpenUser={u=>push("user",u)} onOpenEvent={e=>push("event",e)}/></div>}
              {tab==="map"&&<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}><MapScreen attended={attended} onOpenEvent={e=>push("event",e)} onOpenStudio={s=>push("studio",s)}/></div>}
              {tab==="profile"&&<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}><ProfileScreen attended={attended} onOpenEvent={e=>push("event",e)} onOpenFollowing={()=>push("following")}/></div>}
              <TabBar active={tab} onChange={t=>{setTab(t);setStack([]);}} attendedCount={attended.size}/>
            </div>
            {stack.map((item,i)=>(
              <div key={i} style={{position:"absolute",top:0, left:0, right:0, bottom:0,background:C.bg,zIndex:200+i,overflowY:"auto",display:"flex",flexDirection:"column",scrollbarWidth:"none"}}>
                {item.type==="event"     &&<EventDetail event={item.data} isAttended={attended.has(item.data.id)} onToggleAttend={()=>toggleAttend(item.data.id)} onBack={pop} onOpenUser={u=>push("user",u)} myLocation={myLocation}/>}
                {item.type==="studio"    &&<StudioDetail studio={item.data} onBack={pop}/>}
                {item.type==="message"   &&<MessageScreen user={item.data} onBack={pop}/>}
                {item.type==="user"      &&<UserDetail user={item.data} onBack={pop} onOpenEvent={e=>push("event",e)} onOpenMsg={u=>push("message",u)} myAttended={attended}/>}
                {item.type==="following" &&<FollowingScreen onBack={pop} onOpenUser={u=>push("user",u)} myLocation={myLocation} attended={attended}/>}
                {item.type==="nearby"    &&<NearbyScreen attended={attended} onBack={pop} onOpenEvent={e=>push("event",e)}/>}
                {item.type==="attended"  &&<AttendedScreen attended={attended} onBack={pop} onOpenEvent={e=>push("event",e)}/>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
