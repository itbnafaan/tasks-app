/* ============================================================
   المنظومة المدرسية الشاملة - مدرسة عثمان بن عفان الابتدائية
   ============================================================ */

// ===== CLOUD SYNC (Supabase) =====
const SUPABASE_URL = 'https://kirfodiouhrxnhxvkdvf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcmZvZGlvdWhyeG5oeHZrZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzI0NjcsImV4cCI6MjA5NzY0ODQ2N30.Wn9T1U-_M6QpYIOMev8Fc8N2BCh69iId7qefytH9g50';
const CLOUD_ROW_ID = 'main';
let supa = null;
let applyingRemote = false;
let cloudSaveTimer = null;
try { if (window.supabase) supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch (e) { console.warn('Supabase init failed', e); }

// ===== CONSTANTS =====
const C = { navy:'#0F2849', gold:'#C9A227', teal:'#1D9E75', red:'#C0392B', amber:'#E0A100', blue:'#2563A8', bg:'#F5F7FA', border:'#E3E8EF', muted:'#64748b' };
const SCHOOL = { name:'مدرسة عثمان بن عفان الابتدائية', edu:'إدارة تعليم جدة', ministry:'وزارة التعليم', principal:'الأستاذ طلال حضيض السلمي' };
const FOOTER = 'تصميم وإعداد عبدالله العتيبي';
function footerHTML(){ return 'تصميم وإعداد <a href="mailto:abdullah@alotaibi.sa" style="color:inherit">عبدالله العتيبي</a>'; }
const STORAGE_KEY = 'obf_school_system_v1';
const DAYS = ['sun','mon','tue','wed','thu'];
const DAY_AR = { sun:'الأحد', mon:'الاثنين', tue:'الثلاثاء', wed:'الأربعاء', thu:'الخميس' };
const GRADES = ['الأول','الثاني','الثالث','الرابع','الخامس','السادس'];
const SECTIONS_CLASS = ['أ','ب','ج','د','ه','و'];

const NAV = [
  { id:'dashboard', label:'لوحة المعلومات', icon:'📊' },
  { id:'meetingRoom', label:'غرفة الاجتماعات', icon:'🗣️' },
  { id:'messages', label:'الرسائل الخاصة', icon:'✉️' },
  { id:'studentFiles', label:'ملفات الطلاب', icon:'🗂️' },
  { id:'beneficiary', label:'خدمة المستفيد', icon:'🛎️' },
  { id:'attendance', label:'الحضور والغياب', icon:'🗓️' },
  { id:'students', label:'إدارة الطلاب', icon:'🎓' },
  { id:'staff', label:'الموظفون والمهام', icon:'🧑‍🏫' },
  { id:'teacherAbsence', label:'غياب المعلمين والفاقد', icon:'📉' },
  { id:'counselor', label:'الموجه الطلابي', icon:'🧭' },
  { id:'behavior', label:'السلوك والمواظبة', icon:'⚖️' },
  { id:'deputyEdu', label:'وكيل الشؤون التعليمية', icon:'📚' },
  { id:'deputyStudent', label:'وكيل شؤون الطلاب', icon:'🤝' },
  { id:'deputySchool', label:'وكيل الشؤون المدرسية', icon:'🏫' },
  { id:'techVisits', label:'الزيارة الفنية', icon:'🔬' },
  { id:'committees', label:'اللجان', icon:'🧑‍🤝‍🧑' },
  { id:'commsHub', label:'الاتصال المؤسسي', icon:'📣' },
  { id:'reports', label:'التقارير', icon:'📈' },
  { id:'users', label:'المستخدمون', icon:'👥' },
  { id:'log', label:'سجل الحركات', icon:'📜' },
  { id:'settings', label:'الإعدادات', icon:'⚙️' }
];
const ALL_SECTIONS = NAV.map(n=>n.id);

const ROLES = {
  admin:   { label:'مسؤول النظام', sections:'ALL' },
  manager: { label:'مدير المدرسة', sections:'ALL' },
  deputyEdu:     { label:'وكيل الشؤون التعليمية', sections:['deputyEdu','meetingRoom','messages','techVisits'] },
  deputyStudent: { label:'وكيل شؤون الطلاب', sections:['deputyStudent','behavior','meetingRoom','messages','studentFiles','techVisits'] },
  deputySchool:  { label:'وكيل الشؤون المدرسية', sections:['deputySchool','teacherAbsence','meetingRoom','messages','techVisits'] },
  counselor: { label:'الموجه الطلابي', sections:['counselor','meetingRoom','messages','studentFiles'] },
  beneficiary: { label:'موظف خدمة المستفيد', sections:['beneficiary','meetingRoom','messages'] },
  attendance: { label:'راصد الحضور', sections:['attendance','meetingRoom','messages'] },
  staff: { label:'منسوب', sections:['staff','meetingRoom','messages'] }
};

const DEDUCT = { 1:1, 2:2, 3:3, 4:10, 5:15 };
const PROBLEMS = {
  1: ['عدم الالتزام بالزي المدرسي','إهمال أداء الواجبات','عدم إحضار الكتب والأدوات','الخروج من الفصل دون إذن','إثارة الفوضى داخل الفصل','التأخر المتكرر عن الطابور'],
  2: ['العبث بممتلكات المدرسة','إتلاف ممتلكات الزملاء','الغش في الاختبارات','الكتابة على الجدران والطاولات','استخدام ألفاظ غير لائقة'],
  3: ['التلفظ بألفاظ نابية','التشاجر مع الزملاء','إحضار مواد غير مسموح بها','التحرش اللفظي بالزملاء','تكرار مشكلات الدرجة الثانية'],
  4: ['الاعتداء بالضرب على زميل','إحضار أدوات حادة','التدخين داخل المدرسة','التخريب المتعمد للممتلكات','التنمّر المتكرر','إساءة استخدام التقنية'],
  5: ['الاعتداء الجسدي الجسيم','حيازة مواد ممنوعة/مخدرة','التهديد باستخدام سلاح','نشر محتوى مسيء','الاعتداء على منسوبي المدرسة']
};
const PROBLEMS_STAFF = {
  4: ['التطاول اللفظي على أحد منسوبي المدرسة','عدم الامتثال لتعليمات الهيئة الإدارية'],
  5: ['الاعتداء على أحد منسوبي المدرسة','تهديد أحد منسوبي المدرسة']
};
const PROCEDURES = {
  1: ['تنبيه الطالب شفهياً دون حسم من درجة السلوك','تنبيه الطالب شفهياً دون حسم مع إشعار ولي الأمر هاتفياً','حسم (1) درجة وإشعار ولي الأمر وأخذ تعهد','حسم (1) درجة واستدعاء ولي الأمر وأخذ تعهد خطي'],
  2: ['حسم (2) درجة وإشعار ولي الأمر هاتفياً','حسم (2) درجة واستدعاء ولي الأمر وأخذ تعهد','حسم (2) درجة واستدعاء ولي الأمر وتحويل الحالة للموجه الطلابي','حسم (2) درجة وعقد جلسة مع لجنة التوجيه الطلابي'],
  3: ['حسم (3) درجات واستدعاء ولي الأمر وأخذ تعهد','حسم (3) درجات وعقد جلسة لجنة التوجيه ووضع خطة علاجية','حسم (3) درجات وتحويل الحالة لمكتب التعليم','حسم (3) درجات ونقل الطالب لمدرسة أخرى بقرار من الإدارة'],
  4: ['حسم (10) درجات وعقد جلسة لجنة التوجيه واستدعاء ولي الأمر وأخذ تعهد','حسم (10) درجات وإحالة الحالة لمكتب التعليم/الأمن والسلامة','حسم (10) درجات ونقل الطالب لمدرسة أخرى','حسم (10) درجات وإحالة الحالة للجهات المختصة'],
  5: ['حسم (15) درجة وإحالة فورية للجنة التوجيه ومكتب التعليم واستدعاء ولي الأمر','حسم (15) درجة والتبليغ الفوري لمركز البلاغات 1919 والجهات الأمنية','حسم (15) درجة ونقل الطالب/إيقافه وفق ما تقرره الجهات المختصة','حسم (15) درجة وإحالة الحالة كاملةً للجهات الأمنية والقضائية']
};
const MERITS = [
  { label:'الانضباط والمواظبة التامة', pts:6 },
  { label:'المشاركة المجتمعية', pts:6 },
  { label:'الأنشطة المدرسية', pts:4 },
  { label:'المساهمات والمبادرات', pts:2 },
  { label:'توصية لجنة التوجيه الطلابي', pts:6 }
];

// ===== UTIL =====
async function sha256(text){ const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join(''); }
function randSalt(){ const a=new Uint8Array(16); crypto.getRandomValues(a); return [...a].map(b=>b.toString(16).padStart(2,'0')).join(''); }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function todayStr(){ const d=new Date(); return d.toISOString().slice(0,10); }
function nowTime(){ const d=new Date(); return d.toTimeString().slice(0,5); }
function fmtDate(s){ if(!s) return '—'; const d=new Date(s+'T00:00'); if(isNaN(d)) return s; return d.toLocaleDateString('ar-SA-u-ca-gregory',{year:'numeric',month:'2-digit',day:'2-digit'}); }
function dowKey(dateStr){ const d=new Date(dateStr+'T00:00'); const map=['sun','mon','tue','wed','thu','fri','sat']; return map[d.getDay()]; }
function nowStamp(){ const d=new Date(); return d.toLocaleDateString('ar-SA-u-ca-gregory',{year:'numeric',month:'2-digit',day:'2-digit'})+' '+d.toTimeString().slice(0,5); }
function withTimeout(promise, ms){ return Promise.race([promise, new Promise((_,rej)=> setTimeout(()=>rej(new Error('timeout')), ms))]); }

// ===== DATA STORE =====
function defaultStore(){
  return {
    _v:1,
    settings:{ schoolName:SCHOOL.name, principal:SCHOOL.principal, edu:SCHOOL.edu, logo:'', termStart:todayStr(), dashCfg:null },
    users:[], employees:[], students:[],
    visitors:[], lateArrivals:[], earlyLeaves:[],
    attendance:{}, periodIncidents:{}, tasks:[], achievements:[],
    teacherAbsences:[], counselCases:[], behaviorNotes:[], behaviorRecords:[], meritRecords:[],
    classroomVisits:[], studentFollowups:[], facilities:[],
    meetings:[], circulars:[], privateMessages:[], studentDocuments:[], committees:[], commsActivities:[], techVisits:[],
    log:[]
  };
}
function mergeWithDefaults(s){
  const base = defaultStore();
  if(!s || typeof s!=='object') return base;
  for(const k in base){ if(!(k in s)) s[k]=base[k]; }
  if(!s.settings) s.settings=base.settings;
  for(const k in base.settings){ if(!(k in s.settings)) s.settings[k]=base.settings[k]; }
  return s;
}
function isValidStore(s){ return !!(s && Array.isArray(s.users) && s.settings); }

let DB = defaultStore();

function loadLocal(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    DB = raw ? mergeWithDefaults(JSON.parse(raw)) : defaultStore();
  }catch(e){ DB = defaultStore(); }
}
function saveLocal(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }catch(e){ toast('تعذّر الحفظ: مساحة التخزين ممتلئة','red'); } }
function persist(){ saveLocal(); cloudSave(); }
function update(fn){ fn(DB); persist(); }
function logAction(action){
  DB.log.unshift({ id:uid(), user: USER?USER.username:'—', action, time:new Date().toISOString() });
  if(DB.log.length>600) DB.log.length=600;
  persist();
}

function cloudSave(){
  if(!supa || applyingRemote) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(async ()=>{
    try{
      setCloudStatus('saving');
      const { error } = await supa.from('app_data').upsert({ id: CLOUD_ROW_ID, data: DB, updated_at: new Date().toISOString() });
      if(error) throw error;
      setCloudStatus('synced');
    }catch(e){ console.warn('Cloud save error', e); setCloudStatus('offline'); }
  }, 700);
}
async function cloudLoadRaw(){
  const { data, error } = await supa.from('app_data').select('data').eq('id', CLOUD_ROW_ID).maybeSingle();
  if(error) throw error;
  return data ? data.data : null;
}
function cloudSubscribe(){
  if(!supa) return;
  supa.channel('app_data_changes')
    .on('postgres_changes', { event:'*', schema:'public', table:'app_data', filter:'id=eq.'+CLOUD_ROW_ID }, (payload)=>{
      if(payload.new && isValidStore(payload.new.data)){
        applyingRemote = true;
        DB = mergeWithDefaults(payload.new.data);
        try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }catch(e){}
        renderRoot();
        applyingRemote = false;
        setCloudStatus('synced');
      }
    }).subscribe();
}
const CLOUD_STATUS_MAP = { synced:{t:'☁️ متزامن',c:'#16a34a'}, saving:{t:'⏳ يحفظ...',c:'#d97706'}, offline:{t:'⚠️ يعمل محلياً',c:'#dc2626'}, loading:{t:'⏳ جارٍ التحميل...',c:'#d97706'} };
let CLOUD_STATE = null;
function setCloudStatus(state){
  CLOUD_STATE = state;
  const el = document.getElementById('cloud-status');
  if(!el) return;
  const s = CLOUD_STATUS_MAP[state] || CLOUD_STATUS_MAP.offline;
  el.textContent = s.t; el.style.color = s.c;
}
function cloudStatusHTML(){
  const s = CLOUD_STATE ? (CLOUD_STATUS_MAP[CLOUD_STATE]||CLOUD_STATUS_MAP.offline) : null;
  return `<span id="cloud-status" class="cloud-status" style="color:${s?s.c:C.muted}">${s?esc(s.t):''}</span>`;
}

// ===== UI STATE =====
let READY = false;
let VIEW = 'login';
let USER = null, SESSION = null;
let SECTION = 'dashboard';
let SIDEBAR_OPEN = false;
let FORM = {}, FILTERS = {}, SUBTAB = {};
let TOASTS = [];
let LOGIN_U = '', LOGIN_P = '', LOGIN_YEAR = '1448', LOGIN_TERM = 'الأول';

// ===== LOGIN SESSION PERSISTENCE (8 ساعات = فترة الدوام) =====
const LOGIN_SESSION_KEY = 'obf_school_login_session_v1';
const LOGIN_SESSION_HOURS = 8;
function saveLoginSession(u){
  try{ localStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify({ userId:u.id, year:LOGIN_YEAR+'هـ', term:LOGIN_TERM, expiresAt: Date.now() + LOGIN_SESSION_HOURS*3600*1000 })); }catch(e){}
}
function clearLoginSession(){ try{ localStorage.removeItem(LOGIN_SESSION_KEY); }catch(e){} }
function restoreLoginSession(){
  let saved;
  try{ saved = JSON.parse(localStorage.getItem(LOGIN_SESSION_KEY)||'null'); }catch(e){ saved = null; }
  if(!saved || !saved.expiresAt || saved.expiresAt <= Date.now()){ clearLoginSession(); return false; }
  const u = DB.users.find(x=> x.id===saved.userId && x.active);
  if(!u){ clearLoginSession(); return false; }
  USER = u; SESSION = { year: saved.year||LOGIN_YEAR, term: saved.term||LOGIN_TERM };
  VIEW = u.isDefaultPw ? 'forcePw' : 'app'; SECTION = firstSection(u);
  return true;
}

function setF(k,v){ FORM[k]=v; }
function clearF(){ FORM={}; }
function setFilter(k,v){ FILTERS[k]=v; }
function setSub(sec,v){ SUBTAB[sec]=v; }

function rolePerms(role){
  const r = ROLES[role]; if(!r) return {};
  const secs = r.sections==='ALL' ? [...ALL_SECTIONS] : [...r.sections];
  const p={}; ALL_SECTIONS.forEach(s=> p[s]= secs.includes(s)); return p;
}
function can(section){
  if(!USER) return false;
  if(section==='dashboard') return !!USER.canDashboard;
  if(USER.role==='admin'||USER.role==='manager') return true;
  return !!(USER.perms && USER.perms[section]);
}
function navFor(){ return NAV.filter(n=>can(n.id)); }
function firstSection(u){ if(u.canDashboard) return 'dashboard'; const n=NAV.find(x=> u.perms&&u.perms[x.id]); return n?n.id:'dashboard'; }

function toast(msg,color){
  color = color||'teal';
  const id=uid();
  TOASTS.push({id,msg,color});
  renderToasts();
  setTimeout(()=>{ TOASTS=TOASTS.filter(t=>t.id!==id); renderToasts(); }, 3200);
}
function renderToasts(){
  const wrap = document.getElementById('toast-wrap');
  if(!wrap) return;
  wrap.innerHTML = TOASTS.map(t=>`<div class="toast" style="background:${C[t.color]||C.teal}">${esc(t.msg)}</div>`).join('');
}

async function ensureDefaultUsers(){
  if(DB.users && DB.users.length) return;
  const mk = async (username, role, pw) => {
    const salt = randSalt();
    return { id:uid(), username, role, salt, hash:await sha256(salt+pw), employeeId:'', active:true, perms:rolePerms(role), isDefaultPw:true, canDashboard: role==='admin'||role==='manager' };
  };
  DB.users.push(await mk('admin','admin','admin1234'));
  DB.users.push(await mk('manager','manager','manager1234'));
  persist();
}

async function doLogin(){
  const u = DB.users.find(x=> x.username===LOGIN_U.trim());
  if(!u){ toast('اسم المستخدم غير موجود','red'); return; }
  if(!u.active){ toast('هذا الحساب معطّل','red'); return; }
  const h = await sha256(u.salt+LOGIN_P);
  if(h!==u.hash){ toast('كلمة المرور غير صحيحة','red'); return; }
  USER = u; SESSION = { year:LOGIN_YEAR+'هـ', term:LOGIN_TERM };
  VIEW = u.isDefaultPw ? 'forcePw' : 'app'; SECTION=firstSection(u); LOGIN_P='';
  saveLoginSession(u);
  logAction('تسجيل الدخول');
  renderRoot();
  if(!u.isDefaultPw) toast('مرحباً بك، تم تسجيل الدخول');
}
async function forcePwSubmit(){
  const p1 = FORM.fpNew||'', p2 = FORM.fpConfirm||'';
  if(p1.length<6){ toast('كلمة المرور الجديدة قصيرة (6 أحرف على الأقل)','red'); return; }
  if(p1!==p2){ toast('كلمتا المرور غير متطابقتين','red'); return; }
  const salt = randSalt(); const hash = await sha256(salt+p1);
  update(d=>{ const t=d.users.find(x=>x.id===USER.id); t.salt=salt; t.hash=hash; t.isDefaultPw=false; });
  USER = DB.users.find(x=>x.id===USER.id);
  FORM = {}; VIEW='app';
  logAction('تغيير كلمة المرور المؤقتة');
  toast('تم تعيين كلمة المرور، مرحباً بك');
  renderRoot();
}
function logout(){
  logAction('تسجيل الخروج');
  clearLoginSession();
  USER=null; SESSION=null; VIEW='login'; FORM={}; SIDEBAR_OPEN=false;
  renderRoot();
}
async function changePassword(){
  const oldP = FORM.oldP||'', newP = FORM.newP||'';
  const h = await sha256(USER.salt+oldP);
  if(h!==USER.hash){ toast('كلمة المرور الحالية غير صحيحة','red'); return; }
  if(newP.length<6){ toast('كلمة المرور الجديدة قصيرة (6 أحرف على الأقل)','red'); return; }
  const salt=randSalt(); const nh=await sha256(salt+newP);
  update(d=>{ const t=d.users.find(x=>x.id===USER.id); t.salt=salt; t.hash=nh; t.isDefaultPw=false; });
  USER = DB.users.find(x=>x.id===USER.id);
  FORM.oldP=''; FORM.newP='';
  logAction('تغيير كلمة المرور');
  toast('تم تغيير كلمة المرور');
  rerenderSection();
}

// ===== RENDER ENGINE =====
function renderRoot(){
  const root = document.getElementById('root');
  if(!READY){ root.innerHTML = '<div class="loading">…جارٍ التحميل</div>'; return; }
  root.innerHTML = VIEW==='login' ? renderLogin() : VIEW==='forcePw' ? renderForcePw() : renderApp();
  renderToasts();
}
function renderForcePw(){
  return `<div class="login-wrap"><div class="login-card">
    <div class="login-head">
      <img src="icon-512.png" alt="" class="login-logo">
      <div class="m">${esc(SCHOOL.ministry)} · ${esc(SCHOOL.edu)}</div>
      <div class="b">${esc(SCHOOL.name)}</div>
      <div class="rule"></div>
    </div>
    <div class="login-body">
      <h2>يجب تعيين كلمة مرور جديدة</h2>
      <p style="font-size:13px;color:${C.muted};margin:0 0 14px">هذا حساب بكلمة مرور مؤقتة. لمتابعة استخدام النظام، عيّن كلمة مرور جديدة خاصة بك.</p>
      ${fieldWrap('كلمة المرور الجديدة', `<input type="password" class="ctl" value="${esc(FORM.fpNew||'')}" oninput="setF('fpNew',this.value);">`)}
      <div style="margin-top:14px">${fieldWrap('تأكيد كلمة المرور', `<input type="password" class="ctl" value="${esc(FORM.fpConfirm||'')}" oninput="setF('fpConfirm',this.value);" onkeydown="if(event.key==='Enter')forcePwSubmit();">`)}</div>
      <button class="login-btn" style="margin-top:16px" onclick="forcePwSubmit()">حفظ ومتابعة</button>
      <button class="btn btn-ghost" style="margin-top:10px;width:100%" onclick="logout()">تسجيل الخروج</button>
    </div>
    <div class="login-foot">${footerHTML()}</div>
  </div></div>`;
}
function rerenderSection(){
  const root = document.getElementById('section-body');
  if(!root){ renderRoot(); return; }
  const active = document.activeElement;
  let focusId=null, selStart=null, selEnd=null;
  if(active && root.contains(active) && active.id){
    focusId = active.id;
    if('selectionStart' in active){ try{ selStart=active.selectionStart; selEnd=active.selectionEnd; }catch(e){} }
  }
  const scroller = document.getElementById('main-scroll');
  const scrollTop = scroller ? scroller.scrollTop : 0;
  root.innerHTML = renderSectionBody();
  if(scroller) scroller.scrollTop = scrollTop;
  if(focusId){
    const el = document.getElementById(focusId);
    if(el){ el.focus(); if(selStart!=null && el.setSelectionRange){ try{ el.setSelectionRange(selStart, selEnd); }catch(e){} } }
  }
}
function navTo(id){
  if(!can(id)) return;
  SECTION=id; FORM={}; SIDEBAR_OPEN=false;
  renderRoot();
}
function toggleSidebar(){ SIDEBAR_OPEN=!SIDEBAR_OPEN; renderRoot(); }

// ===== SHARED UI BUILDERS =====
function card(title, body, actions){
  const head = (title||actions) ? `<div class="card-head">${title?`<h3 class="card-title">${esc(title)}</h3>`:'<span></span>'}${actions?`<div class="card-actions">${actions}</div>`:''}</div>` : '';
  return `<section class="card">${head}${body}</section>`;
}
function btn(label, onclick, kind){
  kind = kind||'primary';
  return `<button class="btn btn-${kind}" onclick="${onclick}">${esc(label)}</button>`;
}
function fieldWrap(label, controlHtml){ return `<label class="field">${esc(label)}${controlHtml}</label>`; }
function pill(text,color){ color=color||C.navy; return `<span class="pill" style="background:${color}1a;color:${color}">${esc(text)}</span>`; }
function stat(label,value,color){ color=color||C.navy; return `<div class="stat-tile"><div class="lbl">${esc(label)}</div><div class="val" style="color:${color}">${esc(value)}</div><div class="bar" style="background:${color}"></div></div>`; }
function barChart(title, items){
  const max = Math.max(1, ...items.map(i=>i.value));
  const bars = items.map(it=> `<div class="chart-bar-col">
      <div class="chart-bar-val">${esc(it.value)}</div>
      <div class="chart-bar" style="height:${Math.round(it.value/max*110)||(it.value?4:0)}px;background:${it.color||C.blue}"></div>
      <div class="chart-bar-lbl">${esc(it.label)}</div>
    </div>`).join('');
  return `<div class="chart-card"><div class="chart-title">${esc(title)}</div><div class="chart-bars">${bars}</div></div>`;
}
function tableHTML(cols, rows, cellFn){
  if(!rows.length) return `<div class="tbl-empty">لا توجد بيانات</div>`;
  const thead = '<tr>'+cols.map(c=>`<th>${esc(c)}</th>`).join('')+'</tr>';
  const tbody = rows.map((r,ri)=> '<tr>'+cols.map((c,ci)=>`<td>${cellFn(r,ci,ri)}</td>`).join('')+'</tr>').join('');
  return `<div class="tbl-wrap"><table><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}
function subTabsHTML(sec, tabs){
  const cur = SUBTAB[sec] || tabs[0][0];
  return `<div class="subtabs">${tabs.map(t=>`<button class="subtab-btn ${cur===t[0]?'active':''}" onclick="setSub('${sec}','${t[0]}');rerenderSection();">${esc(t[1])}</button>`).join('')}</div>`;
}
function dateFiltered(list){
  const from = FILTERS.from || todayStr(); const to = FILTERS.to || todayStr(); const q = (FILTERS.q||'').trim();
  return list.filter(r=>{ const d=r.date||''; const inRange = d>=from && d<=to; const mq = !q || JSON.stringify(r).includes(q); return inRange && mq; });
}
function filterBarHTML(){
  return `<div class="filter-bar">
    ${fieldWrap('من تاريخ', `<input type="date" class="ctl" value="${esc(FILTERS.from||todayStr())}" onchange="setFilter('from',this.value);rerenderSection();">`)}
    ${fieldWrap('إلى تاريخ', `<input type="date" class="ctl" value="${esc(FILTERS.to||todayStr())}" onchange="setFilter('to',this.value);rerenderSection();">`)}
    ${fieldWrap('بحث بالاسم', `<input type="text" class="ctl" value="${esc(FILTERS.q||'')}" placeholder="اكتب اسماً…" oninput="setFilter('q',this.value);rerenderSection();">`)}
  </div>`;
}

// generic field control renderer for form configs
function renderFieldControl(f){
  const id='ff_'+f.k;
  if(f.type==='select'){
    const opts = typeof f.options==='function'? f.options() : (f.options||[]);
    let optHtml = `<option value="">${esc(f.ph||'— اختر —')}</option>`;
    opts.forEach(o=>{ const v = typeof o==='string'?o:o.v; const l = typeof o==='string'?o:o.l; optHtml += `<option value="${esc(v)}" ${FORM[f.k]===v?'selected':''}>${esc(l)}</option>`; });
    return `<select id="${id}" class="ctl" onchange="setF('${f.k}',this.value);rerenderSection();">${optHtml}</select>`;
  }
  if(f.type==='studentSearch'){
    const q = FORM[f.k]||'';
    const exact = DB.students.some(s=>s.name===q);
    const matches = (q && !exact) ? DB.students.filter(s=>s.name.startsWith(q)).slice(0,30) : [];
    const dropdown = matches.length ? `<div class="search-dropdown">${matches.map(s=>`<div class="search-item" onclick="setF('${f.k}', ${esc(JSON.stringify(s.name))});rerenderSection();">${esc(s.name)}</div>`).join('')}</div>` : '';
    return `<div style="position:relative">
      <input type="text" id="${id}" class="ctl" placeholder="${esc(f.ph||'اكتب اسم الطالب…')}" value="${esc(q)}" autocomplete="off"
        oninput="setF('${f.k}',this.value);rerenderSection();">
      ${dropdown}
    </div>`;
  }
  if(f.type==='textarea'){
    return `<textarea id="${id}" class="ctl" rows="3" placeholder="${esc(f.ph||'')}" oninput="setF('${f.k}',this.value);">${esc(FORM[f.k]||'')}</textarea>`;
  }
  if(f.type==='date'){
    if(FORM[f.k]==null) FORM[f.k]=todayStr();
    return `<input type="date" id="${id}" class="ctl" value="${esc(FORM[f.k])}" onchange="setF('${f.k}',this.value);rerenderSection();">`;
  }
  if(f.type==='time'){
    if(FORM[f.k]==null) FORM[f.k]=nowTime();
    return `<input type="time" id="${id}" class="ctl" value="${esc(FORM[f.k])}" onchange="setF('${f.k}',this.value);rerenderSection();">`;
  }
  return `<input type="${f.type||'text'}" id="${id}" class="ctl" value="${esc(FORM[f.k]||'')}" placeholder="${esc(f.ph||'')}" oninput="setF('${f.k}',this.value);">`;
}

// ===== CSV / PRINT =====
function exportCSV(filename, headers, rows){
  let csv='﻿'+headers.join(',')+'\n';
  rows.forEach(r=> csv+= r.map(c=> '"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')+'\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename+'.csv'; a.click(); URL.revokeObjectURL(url);
  toast('تم تصدير الملف');
}
function printReport(title, meta, cols, rows, opts){
  opts = opts||{};
  const st = DB.settings;
  const logo = st.logo? `<img src="${st.logo}" style="height:64px;object-fit:contain">` : '';
  const metaHtml = meta && meta.length ? '<div class="meta">'+meta.map(m=>'<span><b>'+esc(m[0])+':</b> '+esc(m[1])+'</span>').join('')+'</div>' : '';
  let table='';
  if(cols){
    table='<table><thead><tr>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+
      rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  }
  const extra = opts.html||'';
  const w = window.open('','_blank');
  if(!w){ toast('يرجى السماح بالنوافذ المنبثقة للطباعة','red'); return; }
  const css='body{font-family:Cairo,sans-serif;color:#0F2849;margin:0;padding:28px 34px}'+
    '.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0F2849;padding-bottom:12px}'+
    '.hdr .c{text-align:center;flex:1;line-height:1.7}.hdr .c .m{font-size:13px}.hdr .c .b{font-weight:800;font-size:16px}'+
    '.hdr .s{width:80px;text-align:center}'+
    'h1{font-size:19px;text-align:center;margin:20px 0 6px}'+
    '.meta{display:flex;flex-wrap:wrap;gap:8px 22px;justify-content:center;font-size:13px;color:#334;margin-bottom:16px}'+
    'table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:10px}'+
    'th,td{border:1px solid #cbd3df;padding:7px 9px;text-align:right}th{background:#F1F5FB;font-weight:700}'+
    'tr:nth-child(even) td{background:#fafbfd}'+
    '.sign{display:flex;justify-content:space-between;margin-top:46px;font-size:13px}'+
    '.sign div{width:44%;text-align:center;line-height:2.4}'+
    '.sign .ln{border-top:1px dotted #0F2849;margin-top:34px;padding-top:6px}'+
    '.ft{margin-top:34px;border-top:1px solid #E3E8EF;padding-top:10px;text-align:center;font-size:11px;color:#64748b}'+
    '.formbox{border:1px solid #cbd3df;border-radius:8px;padding:14px 16px;margin-top:12px;font-size:13px;line-height:2}'+
    '.formbox .row{display:flex;gap:16px;margin-bottom:6px}.formbox .row b{min-width:150px}'+
    '@media print{body{padding:14px}button{display:none}}';
  const doc='<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>'+esc(title)+'</title>'+
    '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">'+
    '<style>'+css+'</style></head><body>'+
    '<div class="hdr"><div class="s">'+logo+'</div>'+
    '<div class="c"><div class="m">المملكة العربية السعودية</div><div class="m">'+esc(st.edu||SCHOOL.edu)+' · '+esc(SCHOOL.ministry)+'</div><div class="b">'+esc(st.schoolName||SCHOOL.name)+'</div></div>'+
    '<div class="s"></div></div>'+
    '<h1>'+esc(title)+'</h1>'+metaHtml+table+extra+
    '<div class="sign"><div>معدّ التقرير<div class="ln">الاسم / التوقيع</div></div>'+
    '<div>مدير المدرسة<div class="ln">'+esc(st.principal||SCHOOL.principal)+'</div></div></div>'+
    '<div class="ft">'+esc(FOOTER)+' · تاريخ الطباعة: '+new Date().toLocaleString('ar-SA-u-ca-gregory')+'</div>'+
    '<'+'script>window.onload=function(){setTimeout(function(){window.print()},400)}<'+'/script>'+
    '</body></html>';
  w.document.write(doc); w.document.close();
}

// ===== LOGIN VIEW =====
function renderLogin(){
  const anyDefault = DB.users.some(u=>u.isDefaultPw);
  return `<div class="login-wrap"><div class="login-card">
    <div class="login-head">
      <img src="icon-512.png" alt="" class="login-logo">
      <div class="m">${esc(SCHOOL.ministry)} · ${esc(SCHOOL.edu)}</div>
      <div class="b">${esc(SCHOOL.name)}</div>
      <div class="rule"></div>
    </div>
    <div class="login-body">
      <h2>تسجيل الدخول إلى المنظومة</h2>
      ${fieldWrap('اسم المستخدم', `<input class="ctl" id="loginU" value="${esc(LOGIN_U)}" oninput="LOGIN_U=this.value;" placeholder="admin">`)}
      <div style="margin-top:14px">${fieldWrap('كلمة المرور', `<input type="password" class="ctl" id="loginP" value="${esc(LOGIN_P)}" oninput="LOGIN_P=this.value;" onkeydown="if(event.key==='Enter')doLogin();" placeholder="••••••••">`)}</div>
      <div class="login-row">
        ${fieldWrap('العام الدراسي', `<select class="ctl" onchange="LOGIN_YEAR=this.value;">${['1448','1449','1450','1451'].map(y=>`<option value="${y}" ${LOGIN_YEAR===y?'selected':''}>${y}هـ</option>`).join('')}</select>`)}
        ${fieldWrap('الفصل الدراسي', `<select class="ctl" onchange="LOGIN_TERM=this.value;">${['الأول','الثاني'].map(t=>`<option value="${t}" ${LOGIN_TERM===t?'selected':''}>${t}</option>`).join('')}</select>`)}
      </div>
      <button class="login-btn" onclick="doLogin()">دخول</button>
      ${anyDefault?`<div class="login-hint"><b>حسابات افتراضية (تختفي بعد تغيير كلمتها):</b><br>المسؤول — <code>admin / admin1234</code><br>مدير المدرسة — <code>manager / manager1234</code></div>`:''}
    </div>
    <div class="login-foot">${footerHTML()}</div>
  </div></div>`;
}

// ===== APP SHELL =====
function renderApp(){
  const nav = navFor();
  const navHtml = nav.map(n=> `<button class="nav-item ${SECTION===n.id?'active':''}" onclick="navTo('${n.id}')"><span class="ic">${n.icon}</span><span>${esc(n.label)}</span></button>`).join('');
  const title = (NAV.find(n=>n.id===SECTION)||{}).label||'';
  return `<div class="app-shell">
    <div class="sidebar-backdrop ${SIDEBAR_OPEN?'show':''}" onclick="toggleSidebar()"></div>
    <aside class="sidebar ${SIDEBAR_OPEN?'open':''}">
      <div class="sidebar-head"><div class="b">${esc(SCHOOL.name)}</div><div class="m">${esc(SCHOOL.edu)}</div></div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-foot">${footerHTML()}</div>
    </aside>
    <div class="main-col">
      <header class="topbar">
        <div class="topbar-title"><button class="hamburger" onclick="toggleSidebar()">☰</button>${esc(title)}</div>
        <div class="topbar-user">
          ${cloudStatusHTML()}
          <div class="info"><div class="name">${esc(USER.username==='admin'?'المسؤول':USER.username)}</div><div class="role">${esc((ROLES[USER.role]||{}).label||USER.role)} · ${esc(SESSION.year)} · الفصل ${esc(SESSION.term)}</div></div>
          <div class="avatar">${esc((USER.username[0]||'م').toUpperCase())}</div>
          <button class="logout-btn" onclick="logout()">خروج</button>
        </div>
      </header>
      <main class="content" id="main-scroll">
        <div id="section-body">${renderSectionBody()}</div>
      </main>
    </div>
  </div>`;
}
function renderSectionBody(){
  if(!can(SECTION)) return `<div class="no-access">لا تملك صلاحية الوصول إلى هذا القسم</div>`;
  const map = {
    dashboard:secDashboard, meetingRoom:secMeetingRoom, messages:secMessages, studentFiles:secStudentFiles, beneficiary:secBeneficiary, attendance:secAttendance, students:secStudents,
    staff:secStaff, teacherAbsence:secTeacherAbsence, counselor:secCounselor, behavior:secBehavior,
    deputyEdu:secDeputyEdu, deputyStudent:secDeputyStudent, deputySchool:secDeputySchool,
    committees:secCommittees, commsHub:secCommsHub, reports:secReports, techVisits:secTechVisits,
    users:secUsers, log:secLog, settings:secSettings
  };
  const fn = map[SECTION];
  return fn ? fn() : '';
}

// ===== DASHBOARD =====
function absCountForDay(d){ let n=0; Object.keys(DB.attendance).forEach(k=>{ if(k.startsWith(d+'|')){ Object.values(DB.attendance[k]).forEach(v=>{ if(v.day==='absent') n++; }); } }); return n; }
function lostForDay(d){ let n=0; DB.teacherAbsences.filter(a=>a.date===d).forEach(a=>{ const cov=Object.values(a.covers||{}).filter(Boolean).length; n+=Math.max(0,(a.missing||0)-cov); }); return n; }
function dueToday(){
  const t=todayStr(); const out=[];
  DB.tasks.filter(x=>x.due===t && x.status!=='مكتملة').forEach(x=>out.push('مهمة: '+x.title+' (مكلَّف: '+x.assignee+')'));
  DB.counselCases.filter(x=>x.followDate===t && x.status!=='مغلقة').forEach(x=>out.push('متابعة حالة: '+x.student));
  return out;
}
function secDashboard(){
  const t = todayStr();
  const late = DB.lateArrivals.filter(x=>x.date===t);
  const early = DB.earlyLeaves.filter(x=>x.date===t);
  const visToday = DB.visitors.filter(x=>x.date===t);
  let absentToday=0, partial=0;
  Object.keys(DB.attendance).forEach(k=>{ if(k.startsWith(t+'|')){ const rec=DB.attendance[k]; Object.values(rec).forEach(v=>{ if(v.day==='absent') absentToday++; if(v.periods&&v.periods.some(p=>p==='غ')) partial++; }); } });
  const openCases = DB.counselCases.filter(c=>c.status!=='مغلقة').length;
  const runningTasks = DB.tasks.filter(x=>x.status==='جارية').length;
  let lostToday=0; DB.teacherAbsences.filter(x=>x.date===t).forEach(a=>{ const covered=Object.values(a.covers||{}).filter(Boolean).length; lostToday+=Math.max(0,(a.missing||0)-covered); });

  const stats=[
    ['الطلاب', DB.students.length, C.navy],['المنسوبون', DB.employees.length, C.blue],
    ['غائبو اليوم', absentToday, C.red],['المتأخرون اليوم', late.length, C.amber],
    ['الاستئذان اليوم', early.length, C.gold],['الغياب الجزئي', partial, C.red],
    ['زوار اليوم', visToday.length, C.teal],['الحالات الإرشادية المفتوحة', openCases, C.blue],
    ['المهام الجارية', runningTasks, C.amber],['الفاقد التعليمي اليوم', lostToday, C.red]
  ];
  const days7=[...Array(7)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10); });
  const FULLDAY={sun:'الأحد',mon:'الاثنين',tue:'الثلاثاء',wed:'الأربعاء',thu:'الخميس',fri:'الجمعة',sat:'السبت'};
  const lbl=d=>(FULLDAY[dowKey(d)]||'').slice(0,3);
  const series=(list)=> days7.map(d=>({label:lbl(d),value:list.filter(x=>x.date===d).length,color:C.blue}));
  const tasksByStatus=['جارية','مكتملة','متأخرة'].map((st,i)=>({label:st,value:DB.tasks.filter(x=>x.status===st).length,color:[C.amber,C.teal,C.red][i]}));
  const casesByStatus=['جديدة','قيد المتابعة','مغلقة'].map((st,i)=>({label:st,value:DB.counselCases.filter(x=>x.status===st).length,color:[C.blue,C.amber,C.teal][i]}));
  const behByDeg=[1,2,3,4,5].map(d=>({label:'د'+d,value:DB.behaviorRecords.filter(x=>+x.degree===d).length,color:[C.gold,C.amber,C.blue,C.red,'#7a1f16'][d-1]}));
  const visitsByDep=[['تعليمية',DB.classroomVisits.length],['طلابية',DB.studentFollowups.length],['مدرسية',DB.facilities.length]].map((x,i)=>({label:x[0],value:x[1],color:[C.blue,C.teal,C.gold][i]}));

  const cfg = FORM.dashCfg || DB.settings.dashCfg || { charts:['visitors','late','early','absence','lost','tasks','cases','behavior','deputies'] };
  const chartDefs = {
    visitors:['الزوار — آخر 7 أيام',series(DB.visitors)], late:['التأخر الصباحي — 7 أيام',series(DB.lateArrivals)],
    early:['الاستئذان — 7 أيام',series(DB.earlyLeaves)], absence:['غياب الطلاب — 7 أيام', days7.map(d=>({label:lbl(d),value:absCountForDay(d),color:C.red}))],
    lost:['الفاقد التعليمي — 7 أيام', days7.map(d=>({label:lbl(d),value:lostForDay(d),color:C.red}))],
    tasks:['المهام حسب الحالة',tasksByStatus], cases:['الحالات الإرشادية',casesByStatus],
    behavior:['المشكلات السلوكية حسب الدرجة',behByDeg], deputies:['أعمال الوكلاء الثلاثة',visitsByDep]
  };
  const isAdmin = USER.canDashboard && (USER.role==='admin'||USER.role==='manager');

  let html = `<div class="stats-grid">${stats.map(s=>stat(s[0],s[1],s[2])).join('')}</div>`;
  if(isAdmin){
    const toggles = Object.keys(chartDefs).map(k=>`<label class="chart-toggle"><input type="checkbox" ${cfg.charts.includes(k)?'checked':''} onchange="dashToggleChart('${k}',this.checked)"> ${esc(chartDefs[k][0])}</label>`).join('');
    html += card('تخصيص لوحة المعلومات', `<div class="chart-toggle-grid">${toggles}</div><div class="row-gap">${btn('حفظ التخصيص','dashSaveConfig()','gold')}</div>`);
  }
  html += `<div class="charts-grid">${cfg.charts.filter(k=>chartDefs[k]).map(k=>barChart(chartDefs[k][0],chartDefs[k][1])).join('')}</div>`;
  const due = dueToday();
  html += `<div class="two-col">
    ${card('متابعات مستحقة اليوم', due.length? `<ul class="plain-list">${due.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>` : `<div style="color:${C.muted};font-size:13.5px">لا توجد متابعات مستحقة اليوم</div>`)}
    ${card('آخر الحركات', `<ul class="plain-list small">${DB.log.slice(0,8).map(l=>`<li>${esc(l.user)} — ${esc(l.action)} · ${esc(new Date(l.time).toLocaleTimeString('ar-SA'))}</li>`).join('')}</ul>`)}
  </div>`;
  return html;
}
function dashToggleChart(k,checked){
  const cfg = FORM.dashCfg || DB.settings.dashCfg || { charts:['visitors','late','early','absence','lost','tasks','cases','behavior','deputies'] };
  const nc = checked? [...cfg.charts,k] : cfg.charts.filter(x=>x!==k);
  FORM.dashCfg = { charts:nc };
  rerenderSection();
}
function dashSaveConfig(){
  const cfg = FORM.dashCfg || DB.settings.dashCfg;
  update(d=>{ d.settings.dashCfg = cfg; });
  toast('تم حفظ تخصيص اللوحة');
}

// ===== GENERIC CRUD SECTION ENGINE =====
const GENERIC_CONFIGS = {
  visitors: { key:'visitors', title:'سجل الزوار', dateFilter:true, print:true, csv:true, logAdd:'تسجيل زائر',
    fields:[ {k:'name',label:'اسم الزائر',required:true},
      {k:'purpose',label:'الغرض',type:'select',options:['زيارة المدير','زيارة الموجه الطلابي','وكيل شؤون الطلاب','الصيانة','أخرى'],required:true},
      {k:'purposeOther',label:'تفصيل الغرض',when:f=>f.purpose==='أخرى'},
      {k:'org',label:'الجهة'},
      {k:'nationalId',label:'رقم الهوية'}, {k:'phone',label:'رقم الجوال',type:'tel'},
      {k:'inTime',label:'وقت الدخول',type:'time'}, {k:'date',label:'التاريخ',type:'date'} ],
    onCreate:(rec)=>{ if(rec.purpose==='أخرى'&&rec.purposeOther) rec.purpose='أخرى: '+rec.purposeOther; },
    cols:[ {k:'name',label:'الاسم',render:r=>esc(r.name)},{k:'purpose',label:'الغرض',render:r=>esc(r.purpose)},{k:'org',label:'الجهة',render:r=>esc(r.org||'—')},
      {k:'nationalId',label:'رقم الهوية',render:r=>esc(r.nationalId||'—')},{k:'phone',label:'رقم الجوال',render:r=>esc(r.phone||'—')},
      {k:'inTime',label:'الدخول',render:r=>esc(r.inTime||'—')},
      {k:'outTime',label:'الخروج',render:r=> r.outTime? esc(r.outTime) : `<button class="btn btn-teal btn-sm" onclick="visitorCheckout('${r.id}')">تسجيل خروج</button>`},
      {k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  lateArrivals: { key:'lateArrivals', title:'الطلاب المتأخرون صباحاً', dateFilter:true, print:true, csv:true, logAdd:'تسجيل تأخر طالب',
    fields:[ {k:'name',label:'اسم الطالب',type:'studentSearch',required:true},
      {k:'time',label:'الوقت',type:'time'},
      {k:'reason',label:'سبب التأخر',type:'select',options:['بدون عذر','ظرف أسري','مواصلات','نوم متأخر','موعد طبي','أخرى'],required:true},
      {k:'reasonOther',label:'تفصيل السبب',when:f=>f.reason==='أخرى'},
      {k:'date',label:'التاريخ',type:'date'} ],
    extra:f=>{ if(!f.name) return ''; const s=DB.students.find(x=>x.name===f.name); if(!s) return '';
      return `<div class="info-box" style="margin-top:10px">الصف/الفصل: <b>${esc(s.grade+'/'+s.section)}</b> · جوال ولي الأمر: <b>${esc(s.guardianPhone||'—')}</b></div>`; },
    onCreate:(rec)=>{ if(rec.reason==='أخرى'&&rec.reasonOther) rec.reason='أخرى: '+rec.reasonOther;
      const s=DB.students.find(x=>x.name===rec.name); rec.gradeSec = s? (s.grade+'/'+s.section) : ''; rec.guardianPhone = s? (s.guardianPhone||'') : ''; },
    cols:[ {k:'name',label:'الطالب',render:r=>esc(r.name)},{k:'gradeSec',label:'الصف/الفصل',render:r=>esc(r.gradeSec||'—')},
      {k:'guardianPhone',label:'جوال ولي الأمر',render:r=>esc(r.guardianPhone||'—')},{k:'time',label:'الوقت',render:r=>esc(r.time||'—')},{k:'reason',label:'السبب',render:r=>esc(r.reason)},
      {label:'تكرار التأخر',render:r=>{ const m=lateCounter(); return pill('×'+(m[r.name]||1), (m[r.name]||1)>=3?C.red:C.amber); }},
      {k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  earlyLeaves: { key:'earlyLeaves', title:'الاستئذان', dateFilter:true, print:true, csv:true, logAdd:'تسجيل استئذان',
    fields:[ {k:'name',label:'الطالب',type:'studentSearch',required:true},
      {k:'receiver',label:'المستلم',required:true}, {k:'relation',label:'صلة القرابة',required:true}, {k:'time',label:'الوقت',type:'time'},
      {k:'reason',label:'السبب',type:'select',options:['ظرف صحي','موعد طبي','ظرف أسري','مغادرة مبكرة','أخرى'],required:true},
      {k:'reasonOther',label:'اكتب السبب',type:'textarea',when:f=>f.reason==='أخرى'},
      {k:'date',label:'التاريخ',type:'date'} ],
    extra:f=>{ if(!f.name) return ''; const s=DB.students.find(x=>x.name===f.name); if(!s) return '';
      return `<div class="info-box" style="margin-top:10px">الصف/الفصل: <b>${esc(s.grade+'/'+s.section)}</b> · جوال ولي الأمر: <b>${esc(s.guardianPhone||'—')}</b></div>`; },
    onCreate:(rec)=>{ if(rec.reason==='أخرى'&&rec.reasonOther) rec.reason='أخرى: '+rec.reasonOther;
      const s=DB.students.find(x=>x.name===rec.name); rec.gradeSec = s? (s.grade+'/'+s.section) : ''; rec.guardianPhone = s? (s.guardianPhone||'') : ''; },
    cols:[ {k:'name',label:'الطالب',render:r=>esc(r.name)},{k:'gradeSec',label:'الصف/الفصل',render:r=>esc(r.gradeSec||'—')},
      {k:'receiver',label:'المستلم',render:r=>esc(r.receiver)},{k:'relation',label:'صلة القرابة',render:r=>esc(r.relation||'—')},
      {k:'time',label:'الوقت',render:r=>esc(r.time||'—')},{k:'reason',label:'السبب',render:r=>esc(r.reason)},{k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  tasks: { key:'tasks', title:'المهام', print:true, csv:true, logAdd:'إضافة مهمة',
    fields:[ {k:'title',label:'عنوان المهمة',required:true},{k:'assignee',label:'المكلَّف',type:'select',options:()=>DB.employees.map(e=>e.name),required:true},
      {k:'due',label:'تاريخ الاستحقاق',type:'date'},{k:'progress',label:'نسبة الإنجاز %',type:'number'},{k:'status',label:'الحالة',type:'select',options:['جارية','مكتملة','متأخرة'],required:true} ],
    cols:[ {k:'title',label:'المهمة',render:r=>esc(r.title)},{k:'assignee',label:'المكلَّف',render:r=>esc(r.assignee)},{k:'due',label:'الاستحقاق',render:r=>fmtDate(r.due)},
      {label:'الإنجاز',render:r=>`<div style="display:flex;align-items:center;gap:6px;min-width:100px"><div style="flex:1;height:7px;background:${C.border};border-radius:5px"><div style="width:${r.progress||0}%;height:100%;background:${C.teal};border-radius:5px"></div></div>${r.progress||0}%</div>`},
      {label:'الحالة',render:r=>pill(r.status, r.status==='مكتملة'?C.teal:r.status==='متأخرة'?C.red:C.amber)} ] },
  achievements: { key:'achievements', title:'الإنجازات', print:true, csv:true, logAdd:'توثيق إنجاز',
    fields:[ {k:'name',label:'المنسوب',type:'select',options:()=>DB.employees.map(e=>e.name),required:true},{k:'title',label:'الإنجاز',required:true},
      {k:'desc',label:'التفاصيل',type:'textarea'},{k:'date',label:'التاريخ',type:'date'} ],
    cols:[ {k:'name',label:'المنسوب',render:r=>esc(r.name)},{k:'title',label:'الإنجاز',render:r=>esc(r.title)},{k:'desc',label:'التفاصيل',render:r=>esc(r.desc||'—')},{k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  classroomVisits: { key:'classroomVisits', title:'الزيارات الصفية ومتابعة التحضير', print:true, csv:true, logAdd:'زيارة صفية',
    fields:[ {k:'teacher',label:'المعلم',type:'select',options:()=>DB.employees.map(e=>e.name),required:true},
      {k:'subject',label:'المادة',required:true},{k:'grade',label:'الصف/الفصل'},{k:'rating',label:'التقدير',type:'select',options:['ممتاز','جيد جداً','جيد','يحتاج دعماً'],required:true},
      {k:'prep',label:'التحضير والتقويم',type:'select',options:['منتظم','يحتاج متابعة']},{k:'notes',label:'الملاحظات',type:'textarea'},{k:'date',label:'التاريخ',type:'date'} ],
    cols:[ {k:'teacher',label:'المعلم',render:r=>esc(r.teacher)},{k:'subject',label:'المادة',render:r=>esc(r.subject)},{k:'grade',label:'الصف',render:r=>esc(r.grade||'—')},
      {label:'التقدير',render:r=>pill(r.rating, r.rating==='ممتاز'?C.teal:r.rating==='يحتاج دعماً'?C.red:C.amber)},{k:'prep',label:'التحضير',render:r=>esc(r.prep||'—')},{k:'notes',label:'ملاحظات',render:r=>esc(r.notes||'—')},{k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  studentFollowups: { key:'studentFollowups', title:'المتابعات الطلابية والبرامج', print:true, csv:true, logAdd:'متابعة طلابية',
    fields:[ {k:'type',label:'النوع',type:'select',options:['متابعة مواظبة','متابعة سلوك','برنامج طلابي','تكريم وتحفيز','اجتماع أولياء أمور'],required:true},
      {k:'title',label:'العنوان',required:true},{k:'target',label:'الفئة المستهدفة'},{k:'notes',label:'التفاصيل',type:'textarea'},{k:'date',label:'التاريخ',type:'date'} ],
    cols:[ {k:'type',label:'النوع',render:r=>esc(r.type)},{k:'title',label:'العنوان',render:r=>esc(r.title)},{k:'target',label:'المستهدف',render:r=>esc(r.target||'—')},{k:'notes',label:'التفاصيل',render:r=>esc(r.notes||'—')},{k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  facilities: { key:'facilities', title:'التجهيزات والصيانة والأمن والسلامة', print:true, csv:true, edit:true, logAdd:'بند تجهيزات/صيانة',
    fields:[ {k:'item',label:'البند',required:true},{k:'cat',label:'التصنيف',type:'select',options:['تجهيزات','صيانة','أمن وسلامة']},
      {k:'location',label:'الموقع'},{k:'status',label:'الحالة',type:'select',options:['جديد','قيد التنفيذ','منجز'],required:true},{k:'notes',label:'ملاحظات',type:'textarea'},{k:'date',label:'التاريخ',type:'date'} ],
    cols:[ {k:'item',label:'البند',render:r=>esc(r.item)},{k:'cat',label:'التصنيف',render:r=>esc(r.cat||'—')},{k:'location',label:'الموقع',render:r=>esc(r.location||'—')},
      {label:'الحالة',render:r=>pill(r.status, r.status==='منجز'?C.teal:r.status==='قيد التنفيذ'?C.amber:C.blue)},{k:'notes',label:'ملاحظات',render:r=>esc(r.notes||'—')},{k:'date',label:'التاريخ',render:r=>fmtDate(r.date)} ] },
  committees: { key:'committees', title:'اللجان المدرسية', print:true, csv:true, edit:true, logAdd:'إضافة لجنة',
    fields:[ {k:'name',label:'اسم اللجنة',required:true},{k:'head',label:'رئيس اللجنة'},
      {k:'tasks',label:'مهام اللجنة',type:'textarea',required:true},
      {k:'members',label:'أعضاء اللجنة',type:'textarea',required:true,ph:'اكتب كل عضو في سطر مستقل'},
      {k:'date',label:'تاريخ التشكيل',type:'date'} ],
    cols:[ {k:'name',label:'اسم اللجنة',render:r=>esc(r.name)},{k:'head',label:'رئيس اللجنة',render:r=>esc(r.head||'—')},
      {k:'tasks',label:'المهام',render:r=>esc(r.tasks)},
      {label:'عدد الأعضاء',render:r=>(r.members||'').split('\n').map(x=>x.trim()).filter(Boolean).length},
      {k:'date',label:'تاريخ التشكيل',render:r=>fmtDate(r.date)},
      {label:'طباعة',render:r=>`<button class="btn btn-gold btn-sm" onclick="committeePrint('${r.id}')">طباعة</button>`} ] }
};
function secCommittees(){ return genericSectionHTML('committees'); }
function committeePrint(id){
  const c = (DB.committees||[]).find(x=>x.id===id); if(!c) return;
  const members = (c.members||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const meta = [['اسم اللجنة',c.name],['رئيس اللجنة',c.head||'—'],['تاريخ التشكيل',fmtDate(c.date)],['عدد الأعضاء',members.length]];
  const extra = `<div class="formbox"><b>مهام اللجنة:</b><br>${esc(c.tasks)}</div>`;
  printReport('لجنة: '+c.name, meta, ['#','اسم العضو','التوقيع'], members.map((n,i)=>[i+1,n,'']), {html:extra});
}
function lateCounter(){ const m={}; DB.lateArrivals.forEach(r=> m[r.name]=(m[r.name]||0)+1); return m; }
function visitorCheckout(id){ update(d=>{ const x=d.visitors.find(v=>v.id===id); if(x) x.outTime=nowTime(); }); toast('تم تسجيل الخروج'); rerenderSection(); }

// ===== COMMS HUB (الاتصال المؤسسي) =====
function secCommsHub(){
  const editing = !!FORM.chEditId;
  let html = card(editing?'تعديل نشاط':'إضافة نشاط', `<div class="form-grid">
      ${fieldWrap('نوع النشاط', renderFieldControl({k:'chType',type:'select',options:['إعلان','برنامج']}))}
      ${fieldWrap('العنوان', renderFieldControl({k:'chTitle'}))}
      ${fieldWrap('رابط إلكتروني', renderFieldControl({k:'chLink',type:'url',ph:'https://…'}))}
      ${fieldWrap('التاريخ', renderFieldControl({k:'chDate',type:'date'}))}
    </div>
    ${fieldWrap('الوصف', renderFieldControl({k:'chDesc',type:'textarea'}))}
    <label style="font-size:13px;font-weight:600;display:block;margin-top:10px">صورة (اختياري، ≤ 400KB): <input type="file" accept="image/*" onchange="commsImageSelect(this.files[0])" style="font-size:12px"></label>
    ${FORM.chImage?`<img src="${FORM.chImage}" style="max-height:120px;border-radius:8px;border:1px solid ${C.border};margin-top:8px;display:block">`:''}
    <div class="row-gap">${btn(editing?'حفظ التعديل':'حفظ',"commsSave()",'primary')}${btn('مسح',"clearF();rerenderSection();",'ghost')}</div>`);

  const list = (DB.commsActivities||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const printBar = `<div class="form-grid" style="margin-bottom:10px">${fieldWrap('نطاق الطباعة', renderFieldControl({k:'chPrintScope',type:'select',options:[{v:'all',l:'الكل'},{v:'إعلان',l:'الإعلانات فقط'},{v:'برنامج',l:'البرامج فقط'}]}))}</div>
    <div class="row-gap">${btn('طباعة التقرير',"commsPrint()",'gold')}</div>`;

  if(!list.length){ html += card('الأنشطة المسجلة', printBar + `<div style="color:${C.muted};padding:20px;text-align:center">لا توجد أنشطة مسجلة</div>`); return html; }

  const itemsHtml = list.map(a=>`
    <div class="formbox" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div>
          <div style="display:flex;align-items:center;gap:8px">${pill(a.type, a.type==='برنامج'?C.teal:C.blue)}<b>${esc(a.title)}</b></div>
          <div style="color:${C.muted};font-size:12px;margin-top:4px">${fmtDate(a.date)}</div>
        </div>
        <div class="td-actions">${btn('تعديل',`commsEdit('${a.id}')`,'ghost')}${btn('حذف',`commsDelete('${a.id}')`,'red')}</div>
      </div>
      ${a.desc?`<div style="margin-top:8px;white-space:pre-wrap">${esc(a.desc)}</div>`:''}
      ${a.link?`<div style="margin-top:6px"><a href="${esc(a.link)}" target="_blank" rel="noopener" style="color:${C.blue}">${esc(a.link)}</a></div>`:''}
      ${a.image?`<img src="${a.image}" style="max-width:260px;border-radius:8px;border:1px solid ${C.border};margin-top:8px;cursor:zoom-in" onclick="window.open('${a.image}','_blank')">`:''}
    </div>`).join('');
  html += card('الأنشطة المسجلة ('+list.length+')', printBar + itemsHtml);
  return html;
}
function commsImageSelect(file){
  if(!file) return;
  if(file.size>400*1024){ toast('حجم الصورة يتجاوز 400KB','red'); return; }
  if(!file.type.startsWith('image/')){ toast('يُسمح بالصور فقط','red'); return; }
  const rd = new FileReader();
  rd.onload = e=>{ setF('chImage', e.target.result); rerenderSection(); };
  rd.readAsDataURL(file);
}
function commsEdit(id){
  const rec = (DB.commsActivities||[]).find(x=>x.id===id); if(!rec) return;
  FORM = { chEditId:id, chType:rec.type, chTitle:rec.title, chLink:rec.link, chDate:rec.date, chDesc:rec.desc, chImage:rec.image };
  rerenderSection();
}
function commsSave(){
  if(!FORM.chTitle){ toast('يرجى تعبئة العنوان','red'); return; }
  const type = FORM.chType||'إعلان';
  if(FORM.chEditId){
    update(d=>{ const rec=(d.commsActivities||[]).find(x=>x.id===FORM.chEditId); if(!rec) return;
      rec.type=type; rec.title=FORM.chTitle; rec.link=FORM.chLink||''; rec.date=FORM.chDate||todayStr(); rec.desc=FORM.chDesc||''; rec.image=FORM.chImage||''; });
    logAction('تعديل نشاط اتصال مؤسسي: '+FORM.chTitle);
    clearF(); toast('تم التعديل'); rerenderSection();
    return;
  }
  const rec = { id:uid(), type, title:FORM.chTitle, link:FORM.chLink||'', date:FORM.chDate||todayStr(), desc:FORM.chDesc||'', image:FORM.chImage||'', createdBy:USER.username };
  update(d=>{ if(!d.commsActivities) d.commsActivities=[]; d.commsActivities.unshift(rec); });
  logAction('إضافة نشاط اتصال مؤسسي: '+rec.title);
  clearF(); toast('تمت الإضافة'); rerenderSection();
}
function commsDelete(id){
  update(d=>{ d.commsActivities = (d.commsActivities||[]).filter(x=>x.id!==id); });
  toast('تم الحذف'); rerenderSection();
}
function commsPrint(){
  const scope = FORM.chPrintScope||'all';
  let list = (DB.commsActivities||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(scope!=='all') list = list.filter(a=>a.type===scope);
  const title = scope==='all' ? 'تقرير الإعلانات والبرامج' : (scope==='برنامج' ? 'تقرير البرامج' : 'تقرير الإعلانات');
  const meta = [['عدد العناصر', list.length]];
  const extra = list.map(a=>`<div class="formbox" style="margin-top:10px">
      <div style="font-weight:700">${esc(a.type)} — ${esc(a.title)} <span style="color:#64748b;font-weight:400;font-size:12px">(${fmtDate(a.date)})</span></div>
      ${a.desc?`<div style="margin-top:6px">${esc(a.desc)}</div>`:''}
      ${a.link?`<div style="margin-top:6px">الرابط: ${esc(a.link)}</div>`:''}
      ${a.image?`<img src="${a.image}" style="max-width:260px;margin-top:8px;border-radius:6px">`:''}
    </div>`).join('') || '<p style="color:#64748b;font-size:13px">لا توجد عناصر</p>';
  printReport(title, meta, null, null, {html: extra});
}

// ===== الزيارة الفنية (بطاقة تشخيص قياس التحصيل) =====
const TECH_VISIT_METHODS = ['الزيارة الصفية والاجتماع بالمعلم','معرفة مدى مشاركته في الأنشطة الخارجية للمادة','الاطلاع على الإعداد الكتابي للدرس','مناقشة مدير المدرسة','إجراء اختبار قصير للطلاب','الاطلاع على الواجبات والتطبيقات','زيارة الموجه الطلابي','الاطلاع على التقويم والاختبارات'];
const TECH_VISIT_CATEGORIES = [
  { key:'resp', label:'المسؤولية', items:['تطبيق قواعد السلوك الوظيفي وأخلاقيات مهنة التعليم'] },
  { key:'comm', label:'التواصل والتعاون', items:['التعاون الإيجابي في بيئة العمل','الالتزام بآداب الحوار شفهياً وكتابياً'] },
  { key:'prof', label:'التطوير المهني', items:['الالتزام بخطة التطوير المهني','تبادل الخبرات المهنية والتخصصية مع زملائه وتفعيل مجتمعات التعلم المهنية','تقديم إنتاج معرفي'] },
  { key:'plan', label:'التخطيط والإعداد للدرس', items:['تصميم خطة فصلية للمقرر','التخطيط للدرس وفق منهجية علمية واضحة'] },
  { key:'strat', label:'تطبيق إستراتيجيات التعلم', items:['التهيئة المناسبة لدعم أهداف التعلم','تنفيذ درس يحقق أهداف التعلم','توظيف تقنيات ووسائل تعليمية تحقق أهداف التعلم','استخدام منصات وتطبيقات التعليم عن بعد بما يربط بأنماط الطلاب واحتياجاتهم','تقديم مادة علمية صحيحة ترتبط بأهداف التعلم وتناسب خبرات الطلاب','تطبيق إستراتيجيات تعليمية متنوعة تحقق أهداف التعلم بما يناسب أنماط الطلاب المختلفة','ربط الدرس بواقع الحياة وتكامله مع المواد الأخرى'] },
  { key:'apply', label:'تطبيقات التعلم', items:['طرح أسئلة صفية مناسبة مع مراعاتها للفروق الفردية','إشراك الطلاب في أنشطة الدرس بما يحقق العدالة بينهم'] },
  { key:'eval', label:'تقويم التعلم', items:['تشخيص مستويات الطلاب بأساليب وأدوات متنوعة','بناء خطة متكاملة لتعزيز الطلاب وفق احتياجهم مع مراعاة التميز ومعالجة الضعف','توظيف التطبيقات الصفية والمنزلية في تقويم الطلاب مع مراعاة مستوياتهم'] },
  { key:'env', label:'بيئة التعلم', items:['تهيئة بيئة تعليمية مناسبة بنائية ومعززة ومحفزة للتعلم','إدارة مشاركات واستفسارات الطلاب الصوتية والمكتوبة بفاعلية','إدارة واستثمار وقت التعلم بكفاءة عالية'] },
  { key:'ach', label:'التحصيل الدراسي', items:['مستوى تفاعل الطلاب خلال الدرس','مستوى تحصيل الطلاب العلمي'] }
];
function techVisitCatScore(cat){
  const vals = cat.items.map((_,i)=> +(FORM['tv_'+cat.key+'_'+i]||0)).filter(v=>v>0);
  if(!vals.length) return 0;
  return Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10;
}
function techVisitTeacherPick(v){
  const e = DB.employees.find(x=>x.id===v);
  FORM.tvTeacherId = v;
  if(e){ FORM.tvNationality=e.nationality||''; FORM.tvQual=e.qualification||''; FORM.tvQualYear=e.qualYear||''; FORM.tvSpec=e.specialization||''; FORM.tvTeachField=e.teachingField||''; FORM.tvHireDate=e.hireDateSchool||''; }
  rerenderSection();
}
function techVisitToggleMethod(m){
  FORM.tvMethods = FORM.tvMethods||[];
  const i = FORM.tvMethods.indexOf(m);
  if(i>-1) FORM.tvMethods.splice(i,1); else FORM.tvMethods.push(m);
  rerenderSection();
}
function secTechVisits(){
  const editing = !!FORM.tvEditId;
  const teacher = DB.employees.find(e=>e.id===FORM.tvTeacherId);
  let html = card(editing?'تعديل زيارة فنية':'إضافة زيارة فنية', `
    <div class="form-grid">
      ${fieldWrap('اسم المعلم', `<select class="ctl" onchange="techVisitTeacherPick(this.value)"><option value="">— اختر —</option>${DB.employees.map(e=>`<option value="${e.id}" ${FORM.tvTeacherId===e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select>`)}
      ${fieldWrap('تاريخ الزيارة', renderFieldControl({k:'tvDate',type:'date'}))}
      ${fieldWrap('رقم الزيارة', renderFieldControl({k:'tvNumber'}))}
      ${fieldWrap('نوع الزيارة', renderFieldControl({k:'tvCategory',type:'select',options:['إشرافية','تعاونية','تبادلية']}))}
      ${fieldWrap('نوع الحضور', renderFieldControl({k:'tvAttendMode',type:'select',options:['حضوري','عن بعد']}))}
      ${fieldWrap('هل المعلم جديد على المادة؟', renderFieldControl({k:'tvNewToSubject',type:'select',options:[{v:'نعم',l:'نعم'},{v:'لا',l:'لا'}]}))}
    </div>
    ${teacher?`<div class="info-box" style="margin-top:10px">بيانات المعلم (من ملف الموظف — قابلة للتعديل هنا لهذه الزيارة فقط)</div>`:''}
    <div class="form-grid" style="margin-top:10px">
      ${fieldWrap('الجنسية', renderFieldControl({k:'tvNationality'}))}
      ${fieldWrap('المؤهل', renderFieldControl({k:'tvQual'}))}
      ${fieldWrap('سنة التخرج', renderFieldControl({k:'tvQualYear'}))}
      ${fieldWrap('التخصص', renderFieldControl({k:'tvSpec'}))}
      ${fieldWrap('مجال التدريس', renderFieldControl({k:'tvTeachField'}))}
      ${fieldWrap('تاريخ المباشرة في المدرسة', renderFieldControl({k:'tvHireDate',type:'date'}))}
    </div>
    <div style="margin-top:16px;font-size:13px;font-weight:700">الأساليب التي اتبعها المشرف للتعرف على المستوى</div>
    <div class="perm-grid" style="margin-top:8px">${TECH_VISIT_METHODS.map(m=>`<label class="perm-item"><input type="checkbox" ${(FORM.tvMethods||[]).includes(m)?'checked':''} onchange="techVisitToggleMethod(${esc(JSON.stringify(m))})"> ${esc(m)}</label>`).join('')}</div>
    ${fieldWrap('أساليب أخرى', renderFieldControl({k:'tvMethodsOther'}))}

    <div style="margin-top:16px;font-size:13px;font-weight:700">البيانات الأساسية</div>
    <div class="form-grid" style="margin-top:8px">
      ${fieldWrap('الصف', renderFieldControl({k:'tvGrade',type:'select',options:GRADES}))}
      ${fieldWrap('الفصل', renderFieldControl({k:'tvSection',type:'select',options:SECTIONS_CLASS}))}
      ${fieldWrap('الحصة', renderFieldControl({k:'tvPeriod'}))}
      ${fieldWrap('المادة', renderFieldControl({k:'tvSubject'}))}
      ${fieldWrap('عنوان الدرس', renderFieldControl({k:'tvLesson'}))}
      ${fieldWrap('عدد طلاب الفصل', renderFieldControl({k:'tvTotal',type:'number'}))}
      ${fieldWrap('عدد الحضور', renderFieldControl({k:'tvPresent',type:'number'}))}
      ${fieldWrap('عدد الغياب', renderFieldControl({k:'tvAbsent',type:'number'}))}
      ${fieldWrap('الغرض من الزيارة', renderFieldControl({k:'tvPurpose'}))}
    </div>

    <div style="margin-top:18px;font-size:13px;font-weight:700">التقييم (مستوى الأداء: 5 ممتاز – 4 جيد جدًا – 3 جيد – 2 مقبول – 1 ضعيف)</div>
    ${TECH_VISIT_CATEGORIES.map(cat=>`
      <div class="tbl-wrap" style="margin-top:10px">
        <table><thead><tr><th style="min-width:220px">${esc(cat.label)} — الدرجة: ${techVisitCatScore(cat)}</th><th>5</th><th>4</th><th>3</th><th>2</th><th>1</th></tr></thead>
        <tbody>${cat.items.map((it,i)=>`<tr><td style="text-align:right">${esc(it)}</td>${[5,4,3,2,1].map(v=>`<td style="text-align:center"><input type="radio" name="tv_${cat.key}_${i}" value="${v}" ${+(FORM['tv_'+cat.key+'_'+i]||0)===v?'checked':''} onchange="setF('tv_${cat.key}_${i}','${v}');rerenderSection();"></td>`).join('')}</tr>`).join('')}</tbody></table>
      </div>`).join('')}

    <div style="margin-top:18px;font-size:13px;font-weight:700">التوصيات والدعم</div>
    <div class="form-grid" style="margin-top:8px">
      ${fieldWrap('مستوى تنفيذ التوصيات السابقة', renderFieldControl({k:'tvImplementLevel',type:'textarea'}))}
      ${fieldWrap('مواطن القوة والتميز', renderFieldControl({k:'tvStrengths',type:'textarea'}))}
      ${fieldWrap('الدعم والخبرات المقدمة من المشرف', renderFieldControl({k:'tvSupport',type:'textarea'}))}
      ${fieldWrap('التوصيات', renderFieldControl({k:'tvRecommendations',type:'textarea'}))}
    </div>
    <div class="form-grid" style="margin-top:8px">
      ${fieldWrap('يستفاد من المعلم في', renderFieldControl({k:'tvBenefitFrom'}))}
      ${fieldWrap('توصيات (ملخص)', renderFieldControl({k:'tvRecsSummary'}))}
    </div>

    <div style="margin-top:18px;font-size:13px;font-weight:700">الاحتياجات والبرامج المقترحة</div>
    <div class="tbl-wrap" style="margin-top:8px"><table><thead><tr><th>م</th><th>الاحتياجات</th><th>البرامج المقترحة/للمتابعة/للتطوير</th></tr></thead><tbody>
      ${[1,2,3,4,5,6].map(n=>`<tr><td>${n}</td><td>${renderFieldControl({k:'tvNeed'+n})}</td><td>${renderFieldControl({k:'tvProg'+n})}</td></tr>`).join('')}
    </tbody></table></div>

    <div class="form-grid" style="margin-top:16px">
      ${fieldWrap('المشرف التربوي', renderFieldControl({k:'tvSupervisor',ph:USER.username}))}
    </div>
    <div class="row-gap" style="margin-top:14px">${btn(editing?'حفظ التعديل':'حفظ الزيارة','techVisitSubmit()','primary')}${btn('مسح','clearF();rerenderSection();','ghost')}</div>
  `);

  const list = (DB.techVisits||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const rowsHtml = list.map((v,i)=>`<tr><td>${i+1}</td><td>${esc(v.teacherName)}</td><td>${esc(v.subject||'—')}</td><td>${fmtDate(v.date)}</td><td>${esc(v.number||'—')}</td>
    <td><div class="td-actions">${btn('طباعة',`techVisitPrint('${v.id}')`,'gold')}${btn('تعديل',`techVisitEdit('${v.id}')`,'ghost')}${btn('حذف',`techVisitDelete('${v.id}')`,'red')}</div></td></tr>`).join('');
  const listBody = list.length
    ? `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>المعلم</th><th>المادة</th><th>التاريخ</th><th>رقم الزيارة</th><th>إجراء</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`
    : `<div style="color:${C.muted};padding:20px;text-align:center">لا توجد زيارات مسجّلة</div>`;
  html += card('الزيارات الفنية المسجّلة ('+list.length+')', listBody);
  return html;
}
function techVisitSubmit(){
  const f = FORM;
  if(!f.tvTeacherId){ toast('يرجى اختيار المعلم','red'); return; }
  const teacher = DB.employees.find(e=>e.id===f.tvTeacherId);
  const ratings = {};
  TECH_VISIT_CATEGORIES.forEach(cat=>{ ratings[cat.key] = cat.items.map((_,i)=> +(f['tv_'+cat.key+'_'+i]||0)); });
  const needs = [1,2,3,4,5,6].map(n=>({need:f['tvNeed'+n]||'', program:f['tvProg'+n]||''})).filter(x=>x.need||x.program);
  const rec = {
    id: f.tvEditId || uid(),
    teacherId: f.tvTeacherId, teacherName: teacher?teacher.name:'',
    nationality:f.tvNationality||'', qualification:f.tvQual||'', qualYear:f.tvQualYear||'', specialization:f.tvSpec||'', teachingField:f.tvTeachField||'', hireDateSchool:f.tvHireDate||'',
    date: f.tvDate||todayStr(), number:f.tvNumber||'', category:f.tvCategory||'إشرافية', attendMode:f.tvAttendMode||'حضوري', newToSubject:f.tvNewToSubject||'لا',
    methods:(f.tvMethods||[]).slice(), methodsOther:f.tvMethodsOther||'',
    grade:f.tvGrade||'', section:f.tvSection||'', period:f.tvPeriod||'', subject:f.tvSubject||'', lesson:f.tvLesson||'', total:f.tvTotal||'', present:f.tvPresent||'', absent:f.tvAbsent||'', purpose:f.tvPurpose||'',
    ratings,
    implementLevel:f.tvImplementLevel||'', strengths:f.tvStrengths||'', support:f.tvSupport||'', recommendations:f.tvRecommendations||'', benefitFrom:f.tvBenefitFrom||'', recsSummary:f.tvRecsSummary||'',
    needs,
    supervisor: f.tvSupervisor || USER.username, createdBy: USER.username
  };
  if(f.tvEditId){
    update(d=>{ const i=d.techVisits.findIndex(x=>x.id===f.tvEditId); if(i>-1) d.techVisits[i]=rec; });
    logAction('تعديل زيارة فنية: '+rec.teacherName);
    toast('تم التعديل');
  } else {
    update(d=>{ d.techVisits=[rec, ...(d.techVisits||[])]; });
    logAction('إضافة زيارة فنية: '+rec.teacherName);
    toast('تم حفظ الزيارة');
  }
  clearF(); rerenderSection();
}
function techVisitEdit(id){
  const v = (DB.techVisits||[]).find(x=>x.id===id); if(!v) return;
  const ff = { tvEditId:v.id, tvTeacherId:v.teacherId, tvDate:v.date, tvNumber:v.number, tvCategory:v.category, tvAttendMode:v.attendMode, tvNewToSubject:v.newToSubject,
    tvNationality:v.nationality, tvQual:v.qualification, tvQualYear:v.qualYear, tvSpec:v.specialization, tvTeachField:v.teachingField, tvHireDate:v.hireDateSchool,
    tvMethods:(v.methods||[]).slice(), tvMethodsOther:v.methodsOther,
    tvGrade:v.grade, tvSection:v.section, tvPeriod:v.period, tvSubject:v.subject, tvLesson:v.lesson, tvTotal:v.total, tvPresent:v.present, tvAbsent:v.absent, tvPurpose:v.purpose,
    tvImplementLevel:v.implementLevel, tvStrengths:v.strengths, tvSupport:v.support, tvRecommendations:v.recommendations, tvBenefitFrom:v.benefitFrom, tvRecsSummary:v.recsSummary,
    tvSupervisor:v.supervisor };
  TECH_VISIT_CATEGORIES.forEach(cat=> cat.items.forEach((_,i)=>{ ff['tv_'+cat.key+'_'+i] = (v.ratings&&v.ratings[cat.key]&&v.ratings[cat.key][i]) || ''; }));
  (v.needs||[]).forEach((n,i)=>{ ff['tvNeed'+(i+1)]=n.need; ff['tvProg'+(i+1)]=n.program; });
  FORM = ff; rerenderSection();
}
function techVisitDelete(id){ update(d=>{ d.techVisits=(d.techVisits||[]).filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
function techVisitPrint(id){
  const v = (DB.techVisits||[]).find(x=>x.id===id); if(!v) return;
  const meta = [['اسم المعلم رباعياً',v.teacherName],['الجنسية',v.nationality||'—'],['المؤهل وتاريخه',(v.qualification||'—')+' '+(v.qualYear||'')],
    ['التخصص',v.specialization||'—'],['مجال التدريس',v.teachingField||'—'],['تاريخ المباشرة في المدرسة',fmtDate(v.hireDateSchool)],['تاريخ الزيارة',fmtDate(v.date)],['رقم الزيارة',v.number||'—']];
  const methodsHtml = `<div class="formbox"><b>الأساليب التي اتبعها المشرف للتعرف على المستوى:</b><br>${esc((v.methods||[]).join('، ')||'—')}${v.methodsOther?' — '+esc(v.methodsOther):''}</div>`;
  const basicRows = [['الصف/الفصل',(v.grade||'—')+' / '+(v.section||'—')],['الحصة',v.period||'—'],['المادة',v.subject||'—'],['عنوان الدرس',v.lesson||'—'],
    ['عدد طلاب الفصل',v.total||'—'],['عدد الحضور',v.present||'—'],['عدد الغياب',v.absent||'—'],['نوع الزيارة',v.category||'—'],['نوع الحضور',v.attendMode||'—'],
    ['هل المعلم جديد على المادة؟',v.newToSubject||'—'],['الغرض من الزيارة',v.purpose||'—']];
  const basicHtml = '<h1 style="font-size:15px;margin-top:18px">البيانات الأساسية</h1><table><tbody>'+basicRows.map(r=>`<tr><td style="font-weight:700">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')+'</tbody></table>';
  const catsHtml = TECH_VISIT_CATEGORIES.map(cat=>{
    const scores = cat.items.map((_,i)=> (v.ratings&&v.ratings[cat.key]&&v.ratings[cat.key][i])||0);
    const avg = scores.filter(s=>s>0).length ? Math.round((scores.filter(s=>s>0).reduce((a,b)=>a+b,0)/scores.filter(s=>s>0).length)*10)/10 : 0;
    return `<h1 style="font-size:14px;margin-top:16px">${esc(cat.label)} — الدرجة: ${avg}</h1><table><thead><tr><th>عنصر التقييم</th><th>التقدير</th></tr></thead><tbody>${cat.items.map((it,i)=>`<tr><td>${esc(it)}</td><td>${scores[i]||'—'}</td></tr>`).join('')}</tbody></table>`;
  }).join('');
  const recsHtml = `<h1 style="font-size:15px;margin-top:18px">التوصيات والدعم</h1><table><tbody>
    <tr><td style="font-weight:700">مستوى تنفيذ التوصيات السابقة</td><td>${esc(v.implementLevel||'—')}</td></tr>
    <tr><td style="font-weight:700">مواطن القوة والتميز</td><td>${esc(v.strengths||'—')}</td></tr>
    <tr><td style="font-weight:700">الدعم والخبرات المقدمة من المشرف</td><td>${esc(v.support||'—')}</td></tr>
    <tr><td style="font-weight:700">التوصيات</td><td>${esc(v.recommendations||'—')}</td></tr>
    <tr><td style="font-weight:700">يستفاد من المعلم في</td><td>${esc(v.benefitFrom||'—')}</td></tr>
    <tr><td style="font-weight:700">توصيات (ملخص)</td><td>${esc(v.recsSummary||'—')}</td></tr>
  </tbody></table>`;
  const needsHtml = (v.needs&&v.needs.length) ? '<h1 style="font-size:15px;margin-top:18px">الاحتياجات والبرامج المقترحة</h1><table><thead><tr><th>م</th><th>الاحتياجات</th><th>البرامج المقترحة</th></tr></thead><tbody>'+
    v.needs.map((n,i)=>`<tr><td>${i+1}</td><td>${esc(n.need||'—')}</td><td>${esc(n.program||'—')}</td></tr>`).join('')+'</tbody></table>' : '';
  const footer = `<div class="row-gap" style="margin-top:26px;justify-content:space-between;display:flex">
    <div>المعلم: ${esc(v.teacherName)}</div><div>مدير المدرسة: ${esc(DB.settings.principal||'—')}</div><div>المشرف التربوي: ${esc(v.supervisor||'—')}</div>
  </div>`;
  printReport('بطاقة تشخيص قياس التحصيل — زيارة فنية', meta, null, null, {html: methodsHtml+basicHtml+catsHtml+recsHtml+needsHtml+footer});
}

function genericSectionHTML(cfgKey){
  const cfg = GENERIC_CONFIGS[cfgKey];
  const list = DB[cfg.key] || [];
  const rows = cfg.dateFilter ? dateFiltered(list) : list;
  const editing = !!(cfg.edit && FORM.genEditKey===cfgKey && FORM.genEditId);
  if(editing && FORM.genEditLoaded!==FORM.genEditId){
    const rec = list.find(r=>r.id===FORM.genEditId);
    if(rec){ cfg.fields.forEach(f=>{ FORM[f.k]=rec[f.k]; }); FORM.genEditLoaded=FORM.genEditId; }
  }
  const formFields = cfg.fields.filter(f=> !f.when || f.when(FORM)).map(f=>fieldWrap(f.label, renderFieldControl(f))).join('');
  const extraHtml = cfg.extra ? cfg.extra(FORM) : '';
  const formBody = `<div class="form-grid">${formFields}</div>${extraHtml}
    <div class="row-gap">${btn(editing?'حفظ التعديل':'حفظ',`genericSubmit('${cfgKey}')`,'primary')}${btn('مسح',"clearF();rerenderSection();",'ghost')}</div>`;
  const cols = cfg.cols.map(c=>c.label).concat('إجراء');
  const tbl = tableHTML(cols, rows, (r,ci)=>{
    if(ci<cfg.cols.length){ const c=cfg.cols[ci]; return c.render? c.render(r) : esc(r[c.k]==null?'':r[c.k]); }
    return cfg.edit
      ? `<div class="td-actions">${btn('تعديل',`genericEdit('${cfgKey}','${r.id}')`,'ghost')}${btn('حذف',`genericDelete('${cfg.key}','${r.id}')`,'red')}</div>`
      : `<button class="btn btn-red btn-sm" onclick="genericDelete('${cfg.key}','${r.id}')">حذف</button>`;
  });
  const listBody = (cfg.dateFilter?filterBarHTML():'') + tbl;
  let actions='';
  if(cfg.csv) actions += `<button class="btn btn-ghost btn-sm" onclick="genericExportCSV('${cfgKey}')">تصدير CSV</button>`;
  if(cfg.print) actions += `<button class="btn btn-gold btn-sm" onclick="genericPrint('${cfgKey}')">طباعة</button>`;
  return card(cfg.formTitle||((editing?'تعديل — ':'إضافة — ')+cfg.title), formBody) + card(cfg.title, listBody, actions);
}
function genericEdit(cfgKey, id){
  FORM = { genEditKey:cfgKey, genEditId:id };
  rerenderSection();
}
function genericSubmit(cfgKey){
  const cfg = GENERIC_CONFIGS[cfgKey];
  for(const f of cfg.fields){
    if(f.when && !f.when(FORM)) continue;
    if(f.required && !FORM[f.k]){ toast('يرجى تعبئة: '+f.label,'red'); return; }
  }
  if(cfg.edit && FORM.genEditKey===cfgKey && FORM.genEditId){
    update(d=>{ const rec=d[cfg.key].find(r=>r.id===FORM.genEditId); if(!rec) return;
      cfg.fields.forEach(f=>{ rec[f.k] = FORM[f.k] || ''; });
      if(cfg.onCreate) cfg.onCreate(rec, FORM);
    });
    logAction('تعديل سجل في '+cfg.title);
    clearF();
    toast('تم التعديل');
    rerenderSection();
    return;
  }
  const rec = { id:uid(), date: FORM.date || todayStr() };
  cfg.fields.forEach(f=>{ rec[f.k] = FORM[f.k] || ''; });
  if(cfg.onCreate) cfg.onCreate(rec, FORM);
  update(d=>{ d[cfg.key] = [rec, ...(d[cfg.key]||[])]; });
  logAction(cfg.logAdd || ('إضافة سجل في '+cfg.title));
  clearF();
  toast('تمت الإضافة');
  rerenderSection();
}
function genericDelete(key,id){
  update(d=>{ d[key] = d[key].filter(x=>x.id!==id); });
  toast('تم الحذف');
  rerenderSection();
}
function genericExportCSV(cfgKey){
  const cfg = GENERIC_CONFIGS[cfgKey]; const list = DB[cfg.key]||[]; const rows = cfg.dateFilter? dateFiltered(list): list;
  exportCSV(cfg.title, cfg.cols.map(c=>c.label), rows.map(r=>cfg.cols.map(c=> r[c.k]==null?'':r[c.k])));
}
function genericPrint(cfgKey){
  const cfg = GENERIC_CONFIGS[cfgKey]; const list = DB[cfg.key]||[]; const rows = cfg.dateFilter? dateFiltered(list): list;
  const meta = cfg.dateFilter? [['الفترة', fmtDate(FILTERS.from||todayStr())+' — '+fmtDate(FILTERS.to||todayStr())],['عدد السجلات', rows.length]] : [['عدد السجلات', rows.length]];
  printReport('تقرير — '+cfg.title, meta, cfg.cols.map(c=>c.label), rows.map(r=>cfg.cols.map(c=> r[c.k]||'—')));
}

// ===== MEETING ROOM (اجتماعات / تعاميم) =====
function isMgmtUser(){ return !!USER && (USER.role==='admin'||USER.role==='manager'||USER.meetingRoomManager===true); }

function secMeetingRoom(){
  const tab = SUBTAB.meetingRoom||'meetings';
  const tabs=[['meetings','الاجتماعات'],['circulars','التعاميم']];
  const body = tab==='circulars' ? circularsTabHTML() : meetingsTabHTML();
  return subTabsHTML('meetingRoom',tabs) + body;
}

// ---- الاجتماعات ----
function meetingsTabHTML(){
  const mgmt = isMgmtUser();
  let html='';
  if(mgmt){
    const invitees = FORM.mInvitees||[];
    const usersHtml = DB.users.filter(u=>u.active).map(u=>{
      const checked = invitees.includes(u.id)?'checked':'';
      return `<label class="invitee-chip"><input type="checkbox" ${checked} onchange="toggleInvitee('${u.id}')"> ${esc(u.username)} <span style="color:${C.muted}">(${esc((ROLES[u.role]||{}).label||u.role)})</span></label>`;
    }).join('');
    html += card('إضافة اجتماع', `<div class="form-grid">
        ${fieldWrap('رقم الاجتماع', renderFieldControl({k:'mNumber',ph:'مثال: 1'}))}
        ${fieldWrap('عنوان الاجتماع', renderFieldControl({k:'mTitle',ph:'مثال: اجتماع مجلس المعلمين'}))}
        ${fieldWrap('التاريخ', renderFieldControl({k:'mDate',type:'date'}))}
        ${fieldWrap('الوقت', renderFieldControl({k:'mTime',type:'time'}))}
        ${fieldWrap('المكان / رابط الاتصال', renderFieldControl({k:'mLocation',ph:'قاعة الاجتماعات أو رابط اتصال'}))}
        ${fieldWrap('السماح للمدعوين بالرد والتعليق', renderFieldControl({k:'mAllowReplies',type:'select',options:[{v:'yes',l:'نعم'},{v:'no',l:'لا — عرض فقط'}]}))}
      </div>
      ${fieldWrap('جدول الأعمال / التفاصيل', renderFieldControl({k:'mAgenda',type:'textarea'}))}
      ${fieldWrap('التوصيات', renderFieldControl({k:'mRecommendations',type:'textarea'}))}
      <div class="field"><span style="display:block;margin-bottom:6px">دعوة الأعضاء المسجلين</span><div class="invitee-list">${usersHtml||'لا يوجد مستخدمون مسجلون'}</div></div>
      <div class="row-gap">${btn('إرسال الدعوة وإضافة الاجتماع',"meetingAdd()",'primary')}${btn('مسح',"clearF();rerenderSection();",'ghost')}</div>`);
  }
  const list = (DB.meetings||[]).filter(m=> mgmt || (m.invitees||[]).includes(USER.id)).slice().sort((a,b)=> (b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
  if(!list.length){ html += card('الاجتماعات', `<div style="color:${C.muted};padding:20px;text-align:center">لا توجد اجتماعات${mgmt?'':' مُدرَج فيها اسمك حالياً'}</div>`); return html; }
  html += list.map(m=>{
    const inviteeNames = (m.invitees||[]).map(iid=>{ const u=DB.users.find(x=>x.id===iid); return u?u.username:null; }).filter(Boolean);
    const canReply = m.allowReplies || mgmt;
    const replies = (m.replies||[]).map(r=> `<div class="chat-msg"><b>${esc(r.username)}</b> <span style="color:${C.muted};font-size:12px">${esc(r.time)}</span><div>${esc(r.text)}</div></div>`).join('') || `<div style="color:${C.muted};font-size:13px">لا توجد ردود بعد</div>`;
    return card((m.number?'#'+esc(m.number)+' — ':'')+esc(m.title), `
      <div style="color:${C.muted};font-size:13px;margin-bottom:8px">${fmtDate(m.date)} · ${esc(m.time||'—')} ${m.location?'· '+esc(m.location):''}</div>
      ${m.agenda?`<div style="margin-bottom:10px;white-space:pre-wrap">${esc(m.agenda)}</div>`:''}
      ${m.recommendations?`<div style="margin-bottom:10px;background:#F8FAFC;border:1px dashed ${C.border};border-radius:10px;padding:10px 14px"><b>التوصيات:</b><div style="white-space:pre-wrap;margin-top:4px">${esc(m.recommendations)}</div></div>`:''}
      <div style="font-size:13px;color:${C.muted};margin-bottom:10px">المدعوون: ${inviteeNames.length?esc(inviteeNames.join('، ')):'—'} &nbsp; ${pill(m.allowReplies?'الرد متاح للمدعوين':'الرد للإدارة فقط', m.allowReplies?C.teal:C.muted)}</div>
      <div class="chat-thread">${replies}</div>
      ${canReply?`<div class="row-gap" style="margin-top:8px"><input class="ctl" id="reply_${m.id}" placeholder="اكتب رداً…" value="${esc(FORM['reply_'+m.id]||'')}" oninput="setF('reply_${m.id}',this.value)" onkeydown="if(event.key==='Enter')meetingReply('${m.id}');"><button class="btn btn-primary btn-sm" onclick="meetingReply('${m.id}')">إرسال</button></div>`:''}
    `, mgmt?`<button class="btn btn-gold btn-sm" onclick="meetingPrint('${m.id}')">طباعة محضر وتوقيع الحضور</button><button class="btn btn-red btn-sm" onclick="meetingDelete('${m.id}')">حذف</button>`:'');
  }).join('');
  return html;
}
function meetingPrint(id){
  const m = (DB.meetings||[]).find(x=>x.id===id); if(!m) return;
  const inviteeNames = (m.invitees||[]).map(iid=>{ const u=DB.users.find(x=>x.id===iid); return u?u.username:null; }).filter(Boolean);
  const meta = [['رقم الاجتماع',m.number||'—'],['التاريخ',fmtDate(m.date)],['الوقت',m.time||'—'],['المكان',m.location||'—'],['عدد الحضور',inviteeNames.length]];
  let extra = m.agenda? `<div class="formbox"><b>جدول الأعمال / التفاصيل:</b><br>${esc(m.agenda)}</div>` : '';
  if(m.recommendations) extra += `<div class="formbox" style="margin-top:10px"><b>التوصيات:</b><br>${esc(m.recommendations)}</div>`;
  printReport('محضر اجتماع: '+m.title, meta, ['#','اسم العضو','التوقيع'], inviteeNames.map((n,i)=>[i+1,n,'']), {html:extra});
}
function toggleInvitee(uid){ FORM.mInvitees = FORM.mInvitees||[]; const i=FORM.mInvitees.indexOf(uid); if(i>-1) FORM.mInvitees.splice(i,1); else FORM.mInvitees.push(uid); }
function meetingAdd(){
  if(!isMgmtUser()) return;
  if(!FORM.mTitle||!FORM.mDate){ toast('يرجى تعبئة عنوان الاجتماع والتاريخ','red'); return; }
  const rec = { id:uid(), number:FORM.mNumber||'', title:FORM.mTitle, date:FORM.mDate, time:FORM.mTime||'', location:FORM.mLocation||'', agenda:FORM.mAgenda||'', recommendations:FORM.mRecommendations||'',
    allowReplies: FORM.mAllowReplies==='yes', invitees: FORM.mInvitees||[], createdBy: USER.username, replies:[] };
  update(d=>{ d.meetings = [rec, ...(d.meetings||[])]; });
  logAction('إضافة اجتماع: '+rec.title);
  clearF();
  toast('تمت إضافة الاجتماع وإرسال الدعوات');
  rerenderSection();
}
function meetingReply(id){
  const text = (FORM['reply_'+id]||'').trim();
  if(!text) return;
  update(d=>{ const m=d.meetings.find(x=>x.id===id); if(!m) return; if(!m.replies) m.replies=[]; m.replies.push({id:uid(), userId:USER.id, username:USER.username, text, time:nowStamp()}); });
  setF('reply_'+id,'');
  rerenderSection();
}
function meetingDelete(id){
  if(!isMgmtUser()) return;
  update(d=>{ d.meetings = d.meetings.filter(x=>x.id!==id); });
  toast('تم حذف الاجتماع');
  rerenderSection();
}

// ---- التعاميم ----
function circularsTabHTML(){
  const mgmt = isMgmtUser();
  let html='';
  if(mgmt){
    const targets = FORM.cTargets||[];
    const usersHtml = DB.users.filter(u=>u.active).map(u=>{
      const checked = targets.includes(u.id)?'checked':'';
      return `<label class="invitee-chip"><input type="checkbox" ${checked} onchange="toggleCircularTarget('${u.id}')"> ${esc(u.username)}</label>`;
    }).join('');
    html += card('إصدار تعميم', `<div class="form-grid">
        ${fieldWrap('عنوان التعميم', renderFieldControl({k:'cTitle',ph:'عنوان التعميم'}))}
        ${fieldWrap('التاريخ', renderFieldControl({k:'cDate',type:'date'}))}
        ${fieldWrap('الجمهور المستهدف', renderFieldControl({k:'cAudience',type:'select',options:[{v:'all',l:'الجميع'},{v:'group',l:'مجموعة محددة'}]}))}
      </div>
      ${fieldWrap('نص التعميم', renderFieldControl({k:'cBody',type:'textarea'}))}
      ${FORM.cAudience==='group'?`<div class="field"><span style="display:block;margin-bottom:6px">اختر المستلمين</span><div class="invitee-list">${usersHtml||'لا يوجد مستخدمون مسجلون'}</div></div>`:''}
      <label style="font-size:13px;font-weight:600;display:block;margin-top:10px">صورة التعميم (اختياري، ≤ 400KB): <input type="file" accept="image/*" onchange="circularImageSelect(this.files[0])" style="font-size:12px"></label>
      ${FORM.cImage?`<img src="${FORM.cImage}" style="max-height:120px;border-radius:8px;border:1px solid ${C.border};margin-top:8px;display:block">`:''}
      <div class="row-gap">${btn('نشر التعميم',"circularAdd()",'primary')}${btn('مسح',"clearF();rerenderSection();",'ghost')}</div>`);
  }
  const list = (DB.circulars||[]).filter(c=> mgmt || c.audience!=='group' || (c.targets||[]).includes(USER.id)).slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  if(!list.length){ html += card('التعاميم', `<div style="color:${C.muted};padding:20px;text-align:center">لا توجد تعاميم</div>`); return html; }
  html += list.map(c=>{
    const isTarget = c.audience!=='group' || (c.targets||[]).includes(USER.id);
    const acked = (c.ackBy||[]).includes(USER.id);
    const ackAction = (!mgmt && isTarget) ? (acked? `<div class="row-gap" style="margin-top:8px">${pill('تم الاطلاع ✓',C.teal)}</div>` : `<div class="row-gap" style="margin-top:8px"><button class="btn btn-teal btn-sm" onclick="circularAck('${c.id}')">تم الاطلاع</button></div>`) : '';
    const totalTargets = c.audience==='group' ? (c.targets||[]).length : DB.users.filter(u=>u.active).length;
    const ackSummary = mgmt ? `<div style="font-size:12px;color:${C.muted};margin-top:8px">اطّلع عليه ${( c.ackBy||[]).length} من ${totalTargets}</div>` : '';
    return card(esc(c.title), `
      <div style="color:${C.muted};font-size:13px;margin-bottom:8px">${fmtDate(c.date)} · بواسطة ${esc(c.createdBy)} · ${c.audience==='group'?'مجموعة محددة':'الجميع'}</div>
      <div style="white-space:pre-wrap">${esc(c.body)}</div>
      ${c.image?`<img src="${c.image}" style="max-width:100%;border-radius:8px;border:1px solid ${C.border};margin-top:10px;cursor:zoom-in" onclick="window.open('${c.image}','_blank')">`:''}
      ${ackSummary}${ackAction}
    `, mgmt?`<button class="btn btn-red btn-sm" onclick="circularDelete('${c.id}')">حذف</button>`:'');
  }).join('');
  return html;
}
function toggleCircularTarget(uid){ FORM.cTargets = FORM.cTargets||[]; const i=FORM.cTargets.indexOf(uid); if(i>-1) FORM.cTargets.splice(i,1); else FORM.cTargets.push(uid); }
function circularImageSelect(file){
  if(!file) return;
  if(file.size>400*1024){ toast('حجم الصورة يتجاوز 400KB','red'); return; }
  if(!file.type.startsWith('image/')){ toast('يُسمح بالصور فقط','red'); return; }
  const rd = new FileReader();
  rd.onload = e=>{ setF('cImage', e.target.result); rerenderSection(); };
  rd.readAsDataURL(file);
}
function circularAdd(){
  if(!isMgmtUser()) return;
  if(!FORM.cTitle||!FORM.cBody){ toast('يرجى تعبئة عنوان التعميم ونصه','red'); return; }
  const audience = FORM.cAudience==='group' ? 'group' : 'all';
  const rec = { id:uid(), title:FORM.cTitle, body:FORM.cBody, date:FORM.cDate||todayStr(), createdBy:USER.username, image:FORM.cImage||'',
    audience, targets: audience==='group'? (FORM.cTargets||[]) : [], ackBy:[] };
  update(d=>{ d.circulars = [rec, ...(d.circulars||[])]; });
  logAction('إصدار تعميم: '+rec.title);
  clearF();
  toast('تم نشر التعميم');
  rerenderSection();
}
function circularAck(id){
  update(d=>{ const c=d.circulars.find(x=>x.id===id); if(!c) return; c.ackBy=c.ackBy||[]; if(!c.ackBy.includes(USER.id)) c.ackBy.push(USER.id); });
  toast('تم تسجيل الاطلاع');
  rerenderSection();
}
function circularDelete(id){
  if(!isMgmtUser()) return;
  update(d=>{ d.circulars = d.circulars.filter(x=>x.id!==id); });
  toast('تم حذف التعميم');
  rerenderSection();
}

// ===== PRIVATE MESSAGES (رسائل خاصة بين المستخدمين) =====
function secMessages(){
  const other = FORM.pmWith;
  if(other) return pmThreadHTML(other);
  return pmInboxHTML();
}
function pmInboxHTML(){
  const msgs = DB.privateMessages||[];
  const mine = msgs.filter(m=> m.fromId===USER.id || m.toId===USER.id);
  const byPartner = {};
  mine.forEach(m=>{
    const partnerId = m.fromId===USER.id? m.toId : m.fromId;
    const partnerName = m.fromId===USER.id? m.toName : m.fromName;
    if(!byPartner[partnerId]) byPartner[partnerId] = { id:partnerId, name:partnerName, last:m, unread:0 };
    if(!byPartner[partnerId].last || (m.time||'') > (byPartner[partnerId].last.time||'')) byPartner[partnerId].last = m;
    if(m.toId===USER.id && !m.read) byPartner[partnerId].unread++;
  });
  const convos = Object.values(byPartner).sort((a,b)=> (b.last.time||'').localeCompare(a.last.time||''));
  const otherUsers = DB.users.filter(u=>u.id!==USER.id && u.active);

  let html = card('رسالة جديدة', `<div class="form-grid">
      ${fieldWrap('إلى', renderFieldControl({k:'pmTo',type:'select',options:otherUsers.map(u=>({v:u.id,l:u.username}))}))}
    </div>
    ${fieldWrap('نص الرسالة', renderFieldControl({k:'pmNewText',type:'textarea'}))}
    <div class="row-gap">${btn('إرسال','pmSendNew()','primary')}</div>`);

  if(!convos.length){ html += card('صندوق الرسائل', `<div style="color:${C.muted};padding:20px;text-align:center">لا توجد رسائل بعد</div>`); return html; }
  const items = convos.map(c=> `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 4px;border-bottom:1px solid ${C.border};cursor:pointer" onclick="pmOpen('${c.id}')">
      <div><b>${esc(c.name)}</b><div style="font-size:12px;color:${C.muted};margin-top:2px">${esc((c.last.text||'').slice(0,60))}</div></div>
      <div style="display:flex;align-items:center;gap:8px">${c.unread?pill(c.unread,C.red):''}<span style="color:${C.muted};font-size:11px">${esc(c.last.time||'')}</span></div>
    </div>`).join('');
  html += card('صندوق الرسائل', items);
  return html;
}
function pmSendNew(){
  const toId = FORM.pmTo; const text = (FORM.pmNewText||'').trim();
  if(!toId||!text){ toast('اختر المستلم واكتب الرسالة','red'); return; }
  const toUser = DB.users.find(u=>u.id===toId); if(!toUser) return;
  update(d=>{ d.privateMessages = [...(d.privateMessages||[]), {id:uid(), fromId:USER.id, fromName:USER.username, toId, toName:toUser.username, text, time:nowStamp(), read:false}]; });
  FORM.pmNewText=''; FORM.pmWith=toId;
  toast('تم الإرسال');
  rerenderSection();
}
function pmOpen(id){
  FORM.pmWith=id;
  update(d=>{ (d.privateMessages||[]).forEach(m=>{ if(m.toId===USER.id && m.fromId===id && !m.read) m.read=true; }); });
  rerenderSection();
}
function pmBack(){ FORM.pmWith=null; rerenderSection(); }
function pmThreadHTML(otherId){
  const other = DB.users.find(u=>u.id===otherId);
  const msgs = (DB.privateMessages||[]).filter(m=> (m.fromId===USER.id&&m.toId===otherId) || (m.fromId===otherId&&m.toId===USER.id))
    .slice().sort((a,b)=> (a.time||'').localeCompare(b.time||''));
  const list = msgs.length? msgs.map(m=>{
    const mine = m.fromId===USER.id;
    return `<div class="chat-msg ${mine?'mine':''}"><div><b>${esc(m.fromName)}</b> <span style="color:${C.muted};font-size:12px">${esc(m.time)}</span></div><div>${esc(m.text)}</div></div>`;
  }).join('') : `<div style="color:${C.muted};padding:20px;text-align:center">لا توجد رسائل بعد</div>`;
  return `<div class="row-gap" style="margin-bottom:14px">${btn('رجوع للصندوق','pmBack()','ghost')}</div>` +
    card(other?esc(other.username):'مستخدم', `
      <div class="chat-thread" id="pmThread">${list}</div>
      <div class="row-gap" style="margin-top:10px">
        <input class="ctl" id="pmInput" placeholder="اكتب رداً…" value="${esc(FORM.pmReplyText||'')}" oninput="setF('pmReplyText',this.value)" onkeydown="if(event.key==='Enter')pmReply('${otherId}');">
        <button class="btn btn-primary btn-sm" onclick="pmReply('${otherId}')">إرسال</button>
      </div>`);
}
function pmReply(otherId){
  const other = DB.users.find(u=>u.id===otherId); if(!other) return;
  const text = (FORM.pmReplyText||'').trim(); if(!text) return;
  update(d=>{ d.privateMessages = [...(d.privateMessages||[]), {id:uid(), fromId:USER.id, fromName:USER.username, toId:otherId, toName:other.username, text, time:nowStamp(), read:false}]; });
  setF('pmReplyText','');
  rerenderSection();
  const th=document.getElementById('pmThread'); if(th) th.scrollTop = th.scrollHeight;
}

// ===== BENEFICIARY =====
function secBeneficiary(){
  const tab = SUBTAB.beneficiary||'visitors';
  const tabs=[['visitors','الزوار'],['late','الطلاب المتأخرون'],['early','الاستئذان']];
  const keyMap={visitors:'visitors',late:'lateArrivals',early:'earlyLeaves'};
  return subTabsHTML('beneficiary',tabs) + genericSectionHTML(keyMap[tab]);
}

// ===== ATTENDANCE =====
function secAttendance(){
  const tab = SUBTAB.attendance||'daily';
  const attTabs = [['daily','الرصد اليومي'],['incidents','تسجيل حالات الحصص اليومية'],['report','تقارير الحضور']];
  if(tab==='report') return subTabsHTML('attendance',attTabs) + attendanceReport();
  if(tab==='incidents') return subTabsHTML('attendance',attTabs) + secAttIncidents();
  const date = FORM.attDate||todayStr(); const grade=FORM.attGrade||''; const sec=FORM.attSec||'';
  let html = subTabsHTML('attendance',attTabs);
  html += card('اختيار اليوم والفصل', `<div class="form-grid">
    ${fieldWrap('التاريخ', `<input type="date" class="ctl" value="${esc(date)}" onchange="setF('attDate',this.value);rerenderSection();">`)}
    ${fieldWrap('الصف', renderFieldControl({k:'attGrade',type:'select',options:GRADES}))}
    ${fieldWrap('الفصل', renderFieldControl({k:'attSec',type:'select',options:SECTIONS_CLASS}))}
  </div>`);
  if(!(grade&&sec)){ html += `<div style="color:${C.muted};padding:30px;text-align:center">اختر الصف والفصل لعرض قائمة الطلاب</div>`; return html; }

  const roster = DB.students.filter(s=>s.grade===grade&&s.section===sec);
  const akey = date+'|'+grade+'|'+sec;
  const rec = DB.attendance[akey]||{};
  const dayStates=[['present','حاضر',C.teal],['absent','غائب',C.red],['late','متأخر',C.amber],['excused','بعذر',C.blue]];
  const cycle=['ح','غ','ت','ع','س']; const cycleColor={'ح':C.teal,'غ':C.red,'ت':C.amber,'ع':C.blue,'س':C.gold};

  let cP=0,cA=0,cL=0,cE=0,cPerm=0,cPartial=0;
  roster.forEach(s=>{ const r=rec[s.id]; if(!r) return; if(r.day==='present')cP++; if(r.day==='absent')cA++; if(r.day==='late')cL++; if(r.day==='excused')cE++; if(r.periods){ if(r.periods.includes('س'))cPerm++; if(r.periods.includes('غ'))cPartial++; } });

  html += `<div class="legend-row">${[['حاضر',C.teal],['غائب يوم كامل',C.red],['متأخر',C.amber],['بعذر',C.blue],['استئذان',C.gold],['غياب جزئي','#7a1f16']].map(l=>`<span class="legend-item"><span class="legend-dot" style="background:${l[1]}"></span>${esc(l[0])}</span>`).join('')}</div>`;
  html += `<div class="stats-grid">${[['حاضر',cP,C.teal],['غائب',cA,C.red],['متأخر',cL,C.amber],['بعذر',cE,C.blue],['استئذان',cPerm,C.gold],['غياب جزئي',cPartial,'#7a1f16']].map(s=>stat(s[0],s[1],s[2])).join('')}</div>`;

  let body;
  if(!roster.length){ body = `<div style="color:${C.muted};padding:20px;text-align:center">لا يوجد طلاب في هذا الفصل — أضف طلاباً من «إدارة الطلاب»</div>`; }
  else{
    const rowsHtml = roster.map((s,i)=>{
      const r = rec[s.id]||{day:'',periods:['','','','','','']};
      const dayBtns = dayStates.map(ds=>`<button class="day-btn" style="border:1px solid ${ds[2]};background:${r.day===ds[0]?ds[2]:'#fff'};color:${r.day===ds[0]?'#fff':ds[2]}" onclick="attSetDay('${akey}','${s.id}','${ds[0]}')">${esc(ds[1])}</button>`).join('');
      const perBtns = [0,1,2,3,4,5].map(pi=>{ const v=r.periods?r.periods[pi]:''; return `<button class="period-btn" title="الحصة ${pi+1}" style="border:1px solid ${v?cycleColor[v]:C.border};background:${v?cycleColor[v]:'#fff'};color:${v?'#fff':C.muted}" onclick="attCyclePeriod('${akey}','${s.id}',${pi})">${esc(v||(pi+1))}</button>`; }).join('');
      return `<tr><td>${i+1}</td><td style="font-weight:600;white-space:nowrap">${esc(s.name)}</td><td><div class="day-row">${dayBtns}</div></td><td><div class="period-row">${perBtns}</div></td></tr>`;
    }).join('');
    body = `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>الطالب</th><th>اليوم كاملاً</th><th>الحصص (١ ← ٦)</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
      <div class="row-gap">${btn('طباعة كشف الغياب اليومي',`printDailyAbsence('${date}','${grade}','${sec}')`,'gold')}</div>`;
  }
  html += card('رصد الحضور — '+grade+' / '+sec+' — '+fmtDate(date), body);
  return html;
}
function attSetDay(akey,sid,v){
  update(d=>{ if(!d.attendance[akey]) d.attendance[akey]={}; if(!d.attendance[akey][sid]) d.attendance[akey][sid]={day:'',periods:['','','','','','']}; d.attendance[akey][sid].day=v; });
  rerenderSection();
}
function attCyclePeriod(akey,sid,pi){
  const cycle=['ح','غ','ت','ع','س'];
  update(d=>{ if(!d.attendance[akey]) d.attendance[akey]={}; if(!d.attendance[akey][sid]) d.attendance[akey][sid]={day:'',periods:['','','','','','']}; const cur=d.attendance[akey][sid].periods[pi]; const idx=cycle.indexOf(cur); d.attendance[akey][sid].periods[pi]=cycle[(idx+1)%cycle.length]; });
  rerenderSection();
}
function printDailyAbsence(date,grade,sec){
  const akey = date+'|'+grade+'|'+sec;
  const rec = DB.attendance[akey]||{};
  const roster = DB.students.filter(s=>s.grade===grade&&s.section===sec);
  const map={present:'حاضر',absent:'غائب',late:'متأخر',excused:'بعذر'};
  const rows = roster.filter(s=>{ const r=rec[s.id]; return r && (r.day==='absent'||r.day==='late'||(r.periods&&r.periods.some(p=>p&&p!=='ح'))); })
    .map((s,i)=>{ const r=rec[s.id]; return [i+1,s.name,grade+'/'+sec,map[r.day]||'—',(r.periods||[]).map((p,idx)=>p?('ح'+(idx+1)+':'+p):'').filter(Boolean).join('  ')||'—', s.guardianPhone||'—']; });
  printReport('كشف الغياب اليومي', [['التاريخ',fmtDate(date)],['الفصل',grade+' / '+sec],['عدد الحالات',rows.length]],
    ['#','الطالب','الصف/الفصل','حالة اليوم','تفصيل الحصص','جوال ولي الأمر'], rows);
}
const PERIOD_INCIDENT_TYPES = ['','هروب','التأخر عن الحصة','إثارة الفوضى','أخرى'];
function emptyPeriodIncident(){ return {types:['','','','','',''],notes:['','','','','',''],positive:[false,false,false,false,false,false]}; }
function aiEnsure(d,akey,sid){ if(!d.periodIncidents) d.periodIncidents={}; if(!d.periodIncidents[akey]) d.periodIncidents[akey]={}; if(!d.periodIncidents[akey][sid]) d.periodIncidents[akey][sid]=emptyPeriodIncident(); return d.periodIncidents[akey][sid]; }
function secAttIncidents(){
  const date = FORM.aiDate||todayStr(); const grade=FORM.aiGrade||''; const sec=FORM.aiSec||'';
  let html = card('اختيار اليوم والفصل', `<div class="form-grid">
    ${fieldWrap('التاريخ', `<input type="date" class="ctl" value="${esc(date)}" onchange="setF('aiDate',this.value);rerenderSection();">`)}
    ${fieldWrap('الصف', renderFieldControl({k:'aiGrade',type:'select',options:GRADES}))}
    ${fieldWrap('الفصل', renderFieldControl({k:'aiSec',type:'select',options:SECTIONS_CLASS}))}
  </div>`);
  if(!(grade&&sec)){ html += `<div style="color:${C.muted};padding:30px;text-align:center">اختر الصف والفصل لعرض قائمة الطلاب</div>`; return html; }
  const roster = DB.students.filter(s=>s.grade===grade&&s.section===sec);
  const akey = date+'|'+grade+'|'+sec;
  const rec = (DB.periodIncidents||{})[akey]||{};
  let body;
  if(!roster.length){ body = `<div style="color:${C.muted};padding:20px;text-align:center">لا يوجد طلاب في هذا الفصل — أضف طلاباً من «إدارة الطلاب»</div>`; }
  else{
    const rowsHtml = roster.map((s,i)=>{
      const r = rec[s.id]||emptyPeriodIncident();
      const cells = [0,1,2,3,4,5].map(pi=>{
        const t = r.types[pi]||''; const note = r.notes[pi]||''; const pos = !!r.positive[pi];
        const sel = `<select class="ctl" style="font-size:12px;padding:3px 4px" onchange="aiSetType('${akey}','${s.id}',${pi},this.value)">${PERIOD_INCIDENT_TYPES.map(tp=>`<option value="${esc(tp)}" ${t===tp?'selected':''}>${esc(tp||'—')}</option>`).join('')}</select>`;
        const noteInput = t==='أخرى' ? `<input type="text" class="ctl" style="font-size:12px;padding:3px 4px;margin-top:3px" placeholder="وصف الحدث" value="${esc(note)}" onchange="aiSetNote('${akey}','${s.id}',${pi},this.value)">` : '';
        const posBtn = `<button class="period-btn" title="سلوك إيجابي" style="margin-top:3px;border:1px solid ${C.teal};background:${pos?C.teal:'#fff'};color:${pos?'#fff':C.teal}" onclick="aiTogglePositive('${akey}','${s.id}',${pi})">⭐</button>`;
        return `<td style="min-width:130px">${sel}${noteInput}<div style="margin-top:3px">${posBtn}</div></td>`;
      }).join('');
      return `<tr><td>${i+1}</td><td style="font-weight:600;white-space:nowrap">${esc(s.name)}</td>${cells}</tr>`;
    }).join('');
    body = `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>الطالب</th>${[1,2,3,4,5,6].map(n=>`<th>الحصة ${n}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></div>
      <div class="row-gap">${btn('طباعة تقرير الحصص اليومي',`printPeriodIncidents('${date}','${grade}','${sec}')`,'gold')}</div>`;
  }
  html += card('تسجيل حالات الحصص اليومية — '+grade+' / '+sec+' — '+fmtDate(date), body);
  return html;
}
function aiSetType(akey,sid,pi,v){
  update(d=>{ const r=aiEnsure(d,akey,sid); r.types[pi]=v; if(v!=='أخرى') r.notes[pi]=''; });
  rerenderSection();
}
function aiSetNote(akey,sid,pi,v){
  update(d=>{ aiEnsure(d,akey,sid).notes[pi]=v; });
}
function aiTogglePositive(akey,sid,pi){
  update(d=>{ const r=aiEnsure(d,akey,sid); r.positive[pi]=!r.positive[pi]; });
  rerenderSection();
}
function printPeriodIncidents(date,grade,sec){
  const akey = date+'|'+grade+'|'+sec;
  const rec = (DB.periodIncidents||{})[akey]||{};
  const roster = DB.students.filter(s=>s.grade===grade&&s.section===sec);
  const rows = roster.filter(s=>{ const r=rec[s.id]; return r && (r.types.some(Boolean) || r.positive.some(Boolean)); })
    .map((s,i)=>{
      const r=rec[s.id];
      const incidents = r.types.map((t,idx)=> t ? ('ح'+(idx+1)+': '+t+(t==='أخرى'&&r.notes[idx]?' — '+r.notes[idx]:'')) : '').filter(Boolean).join('  ');
      const positives = r.positive.map((p,idx)=>p?('ح'+(idx+1)):'').filter(Boolean).join('، ');
      return [i+1, s.name, grade+'/'+sec, incidents||'—', positives||'—'];
    });
  printReport('تقرير حالات الحصص اليومية', [['التاريخ',fmtDate(date)],['الفصل',grade+' / '+sec],['عدد الحالات',rows.length]],
    ['#','الطالب','الصف/الفصل','الحالات المسجلة','سلوك إيجابي'], rows);
}
function attendanceReport(){
  const grade=FILTERS.rGrade||''; const sec=FILTERS.rSec||''; const from=FILTERS.from||DB.settings.termStart||todayStr(); const to=FILTERS.to||todayStr();
  const roster = (grade&&sec)? DB.students.filter(s=>s.grade===grade&&s.section===sec):DB.students;
  const data = roster.map(s=>{
    let absent=0,excused=0,late=0,perm=0,partial=0,total=0,present=0;
    Object.keys(DB.attendance).forEach(k=>{ const parts=k.split('|'); const d=parts[0]; if(d<from||d>to) return; const r=DB.attendance[k][s.id]; if(!r) return; total++;
      if(r.day==='absent')absent++; else if(r.day==='excused')excused++; else if(r.day==='late'){late++;present++;} else if(r.day==='present')present++;
      if(r.periods){ if(r.periods.includes('س'))perm++; partial+= r.periods.filter(p=>p==='غ').length; } });
    const rate = total? Math.round(present/total*100):0;
    return {s,absent,excused,late,perm,partial,rate,total};
  });
  const html = `<div class="form-grid" style="margin-bottom:14px">
    ${fieldWrap('من تاريخ', `<input type="date" class="ctl" value="${esc(from)}" onchange="setFilter('from',this.value);rerenderSection();">`)}
    ${fieldWrap('إلى تاريخ', `<input type="date" class="ctl" value="${esc(to)}" onchange="setFilter('to',this.value);rerenderSection();">`)}
    ${fieldWrap('الصف', `<select class="ctl" onchange="setFilter('rGrade',this.value);rerenderSection();"><option value="">الكل</option>${GRADES.map(g=>`<option value="${g}" ${grade===g?'selected':''}>${g}</option>`).join('')}</select>`)}
    ${fieldWrap('الفصل', `<select class="ctl" onchange="setFilter('rSec',this.value);rerenderSection();"><option value="">الكل</option>${SECTIONS_CLASS.map(g=>`<option value="${g}" ${sec===g?'selected':''}>${g}</option>`).join('')}</select>`)}
  </div>` + tableHTML(['الطالب','أيام الغياب','غياب بعذر','مرات التأخر','استئذان','حصص جزئية','نسبة الحضور'], data, (r,ci)=>{
    switch(ci){ case 0:return esc(r.s.name); case 1:return r.absent; case 2:return r.excused; case 3:return r.late; case 4:return r.perm; case 5:return r.partial;
      case 6:return `<div style="display:flex;align-items:center;gap:8px;min-width:120px"><div style="flex:1;height:8px;background:${C.border};border-radius:5px;overflow:hidden"><div style="width:${r.rate}%;height:100%;background:${r.rate>=90?C.teal:r.rate>=75?C.amber:C.red}"></div></div><span style="font-weight:700;font-size:12px">${r.rate}%</span></div>`; default:return ''; }
  }) + `<div class="row-gap">
    ${btn('تصدير CSV',"attReportCSV()",'ghost')}
    ${btn('طباعة',"attReportPrint()",'gold')}
  </div>`;
  return card('تقارير الحضور والغياب', html);
}
function attReportData(){
  const grade=FILTERS.rGrade||''; const sec=FILTERS.rSec||''; const from=FILTERS.from||DB.settings.termStart||todayStr(); const to=FILTERS.to||todayStr();
  const roster = (grade&&sec)? DB.students.filter(s=>s.grade===grade&&s.section===sec):DB.students;
  return roster.map(s=>{
    let absent=0,excused=0,late=0,perm=0,partial=0,total=0,present=0;
    Object.keys(DB.attendance).forEach(k=>{ const d=k.split('|')[0]; if(d<from||d>to) return; const r=DB.attendance[k][s.id]; if(!r) return; total++;
      if(r.day==='absent')absent++; else if(r.day==='excused')excused++; else if(r.day==='late'){late++;present++;} else if(r.day==='present')present++;
      if(r.periods){ if(r.periods.includes('س'))perm++; partial+= r.periods.filter(p=>p==='غ').length; } });
    const rate= total? Math.round(present/total*100):0;
    return {s,absent,excused,late,perm,partial,rate};
  });
}
function attReportCSV(){
  const data = attReportData();
  exportCSV('تقرير الحضور',['الطالب','غياب','غياب بعذر','تأخر','استئذان','جزئي','نسبة الحضور'],data.map(r=>[r.s.name,r.absent,r.excused,r.late,r.perm,r.partial,r.rate+'%']));
}
function attReportPrint(){
  const data = attReportData(); const from=FILTERS.from||DB.settings.termStart||todayStr(); const to=FILTERS.to||todayStr(); const grade=FILTERS.rGrade||''; const sec=FILTERS.rSec||'';
  printReport('تقرير الحضور والغياب',[['الفترة',fmtDate(from)+' — '+fmtDate(to)],['النطاق',(grade||'كل الصفوف')+' '+(sec||'')]],
    ['الطالب','غياب','بعذر','تأخر','استئذان','جزئي','نسبة%'],data.map(r=>[r.s.name,r.absent,r.excused,r.late,r.perm,r.partial,r.rate+'%']));
}

// ===== STUDENTS =====
function secStudents(){
  const f = FORM;
  let html = card(f.editId?'تعديل طالب':'إضافة طالب', `<div class="form-grid">
      ${fieldWrap('اسم الطالب', renderFieldControl({k:'sName'}))}
      ${fieldWrap('الصف', renderFieldControl({k:'sGrade',type:'select',options:GRADES}))}
      ${fieldWrap('الفصل', renderFieldControl({k:'sSec',type:'select',options:SECTIONS_CLASS}))}
      ${fieldWrap('جوال ولي الأمر', renderFieldControl({k:'sPhone',type:'tel',ph:'05xxxxxxxx'}))}
    </div>
    <div class="row-gap">${btn(f.editId?'حفظ التعديل':'حفظ','studentSubmit()','primary')}${btn('مسح','clearF();rerenderSection();','ghost')}</div>`);
  html += card('استيراد من ملف CSV', `<p style="font-size:13px;color:${C.muted};margin:0 0 10px">الأعمدة بالترتيب: اسم، صف، فصل، جوال — يدعم الترميز العربي (BOM).</p>
    <input type="file" accept=".csv" onchange="importStudents(this.files[0])" style="font-size:13px">`);
  html += card('قائمة الطلاب ('+DB.students.length+')', tableHTML(['#','الاسم','الصف','الفصل','جوال ولي الأمر','إجراء'], DB.students, (r,ci,ri)=>{
    switch(ci){ case 0:return ri+1; case 1:return esc(r.name); case 2:return esc(r.grade); case 3:return esc(r.section); case 4:return esc(r.guardianPhone||'—');
      case 5:return `<div class="td-actions">${btn('تعديل',`studentEdit('${r.id}')`,'ghost')}${btn('حذف',`studentDelete('${r.id}')`,'red')}</div>`; default:return ''; }
  }), btn('تصدير CSV','studentsExportCSV()','ghost'));
  return html;
}
function studentSubmit(){
  const f = FORM;
  if(!f.sName||!f.sGrade||!f.sSec){ toast('الاسم والصف والفصل مطلوبة','red'); return; }
  if(f.editId){
    update(d=>{ const s=d.students.find(x=>x.id===f.editId); s.name=f.sName; s.grade=f.sGrade; s.section=f.sSec; s.guardianPhone=f.sPhone||''; });
    logAction('تعديل طالب'); toast('تم التعديل');
  } else {
    update(d=>{ d.students.unshift({id:uid(),name:f.sName,grade:f.sGrade,section:f.sSec,guardianPhone:f.sPhone||''}); });
    logAction('إضافة طالب'); toast('تمت الإضافة');
  }
  clearF(); rerenderSection();
}
function studentEdit(id){
  const s = DB.students.find(x=>x.id===id); if(!s) return;
  FORM = { editId:id, sName:s.name, sGrade:s.grade, sSec:s.section, sPhone:s.guardianPhone };
  rerenderSection();
}
function studentDelete(id){ update(d=>{ d.students=d.students.filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
function studentsExportCSV(){ exportCSV('الطلاب',['اسم','صف','فصل','جوال'],DB.students.map(s=>[s.name,s.grade,s.section,s.guardianPhone])); }
function importStudents(file){
  if(!file) return; const rd=new FileReader();
  rd.onload = e=>{
    let txt = e.target.result; if(txt.charCodeAt(0)===0xFEFF) txt=txt.slice(1);
    const lines = txt.split(/\r?\n/).filter(l=>l.trim()); let added=0;
    const start = /اسم|name/i.test(lines[0])?1:0; const rows=[];
    for(let i=start;i<lines.length;i++){ const p=lines[i].split(',').map(x=>x.replace(/^"|"$/g,'').trim()); if(!p[0]) continue;
      rows.push({id:uid(),name:p[0],grade:p[1]||'الأول',section:p[2]||'أ',guardianPhone:p[3]||''}); added++; }
    update(d=>{ d.students=[...rows,...d.students]; });
    logAction('استيراد '+added+' طالب'); toast('تم استيراد '+added+' طالب'); rerenderSection();
  };
  rd.readAsText(file,'utf-8');
}

// ===== STAFF =====
function secStaff(){
  const tab = SUBTAB.staff||'emp';
  const tabs=[['emp','الموظفون'],['tasks','المهام'],['ach','الإنجازات']];
  let content;
  if(tab==='emp') content = staffEmployees();
  else if(tab==='tasks') content = genericSectionHTML('tasks');
  else content = genericSectionHTML('achievements');
  return subTabsHTML('staff',tabs) + content;
}
function staffEmployees(){
  const f = FORM;
  const pinField = d=>`<input type="number" min="0" max="8" class="ctl" style="text-align:center" value="${esc(f['p_'+d]||'')}" oninput="setF('p_${d}',this.value);">`;
  let html = card(f.editId?'تعديل موظف':'إضافة موظف', `<div class="form-grid">
      ${fieldWrap('الاسم', renderFieldControl({k:'eName'}))}
      ${fieldWrap('المسمى', renderFieldControl({k:'eTitle'}))}
      ${fieldWrap('القسم', renderFieldControl({k:'eDept'}))}
      ${fieldWrap('الجوال', renderFieldControl({k:'ePhone',type:'tel',ph:'05xxxxxxxx'}))}
    </div>
    <div style="margin-top:14px;font-size:12.5px;font-weight:700">بيانات إضافية (تُستخدم في نموذج الزيارة الفنية)</div>
    <div class="form-grid" style="margin-top:8px">
      ${fieldWrap('الجنسية', renderFieldControl({k:'eNationality'}))}
      ${fieldWrap('المؤهل', renderFieldControl({k:'eQual',ph:'بكالوريوس تربية…'}))}
      ${fieldWrap('سنة التخرج', renderFieldControl({k:'eQualYear'}))}
      ${fieldWrap('التخصص', renderFieldControl({k:'eSpec'}))}
      ${fieldWrap('مجال التدريس', renderFieldControl({k:'eTeachField'}))}
      ${fieldWrap('تاريخ المباشرة في المدرسة', renderFieldControl({k:'eHireDate',type:'date'}))}
    </div>
    <div style="margin-top:14px;font-size:12.5px;font-weight:700">عدد الحصص لكل يوم (لاحتساب الفاقد التعليمي)</div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:8px;max-width:520px">${DAYS.map(d=>fieldWrap(DAY_AR[d], pinField(d))).join('')}</div>
    <div class="row-gap">${btn(f.editId?'حفظ التعديل':'حفظ','empSubmit()','primary')}${btn('مسح','clearF();rerenderSection();','ghost')}</div>`);
  html += card('إضافة المعلمين دفعة واحدة', `<p style="font-size:13px;color:${C.muted};margin:0 0 8px">سطر لكل معلم. يمكن كتابة الحصص بعده بفواصل: <code>الاسم، 5، 4، 6، 5، 4</code></p>
    ${renderFieldControl({k:'bulk',type:'textarea',ph:'خالد أحمد، 5، 4، 6، 5، 4'})}
    <div class="row-gap">${btn('إضافة الدفعة','empBulkAdd()','gold')}</div>`);
  html += card('استيراد من ملف CSV', `<p style="font-size:13px;color:${C.muted};margin:0 0 10px">الأعمدة بالترتيب: اسم، جوال، المسمى (اختياري) — يدعم الترميز العربي (BOM).</p>
    <input type="file" accept=".csv" onchange="importEmployees(this.files[0])" style="font-size:13px">`);
  html += card('قائمة الموظفين ('+DB.employees.length+')', tableHTML(['الاسم','المسمى','القسم','الجوال','مجموع الحصص/أسبوع','إجراء'], DB.employees, (r,ci)=>{
    const tot = DAYS.reduce((a,d)=>a+((r.periods&&r.periods[d])||0),0);
    switch(ci){ case 0:return esc(r.name); case 1:return esc(r.title||'—'); case 2:return esc(r.dept||'—'); case 3:return esc(r.phone||'—'); case 4:return tot;
      case 5:return `<div class="td-actions">${btn('التقرير الشامل',`openEmpProfile('${r.id}')`,'gold')}${btn('تعديل',`empEdit('${r.id}')`,'ghost')}${btn('حذف',`empDelete('${r.id}')`,'red')}</div>`; default:return ''; }
  }));
  return html;
}
async function empSubmit(){
  const f = FORM;
  if(!f.eName){ toast('الاسم مطلوب','red'); return; }
  const periods={}; DAYS.forEach(d=> periods[d]= +(f['p_'+d]||0));
  const extra = {nationality:f.eNationality||'', qualification:f.eQual||'', qualYear:f.eQualYear||'', specialization:f.eSpec||'', teachingField:f.eTeachField||'', hireDateSchool:f.eHireDate||''};
  if(f.editId){
    update(d=>{ const e=d.employees.find(x=>x.id===f.editId); Object.assign(e,{name:f.eName,title:f.eTitle||'',dept:f.eDept||'',phone:f.ePhone||'',periods,...extra}); });
    toast('تم التعديل');
  } else {
    const emp = {id:uid(),name:f.eName,title:f.eTitle||'',dept:f.eDept||'',phone:f.ePhone||'',periods,...extra};
    const acct = await makeAccountForEmployee(emp, new Set(DB.users.map(u=>u.username)));
    update(d=>{ d.employees.unshift(emp); if(acct.ok) d.users.push(acct.user); });
    logAction('إضافة موظف');
    if(acct.ok) toast('تمت الإضافة وإنشاء حساب دخول برقم الجوال');
    else if(acct.reason==='no-phone') toast('تمت الإضافة (لم يُنشأ حساب دخول — الجوال فارغ)','amber');
    else toast('تمت الإضافة (لم يُنشأ حساب دخول — الرقم مستخدم مسبقاً لحساب آخر)','amber');
  }
  clearF(); rerenderSection();
}
function empEdit(id){
  const r = DB.employees.find(x=>x.id===id); if(!r) return;
  const ff = { editId:r.id, eName:r.name, eTitle:r.title, eDept:r.dept, ePhone:r.phone,
    eNationality:r.nationality||'', eQual:r.qualification||'', eQualYear:r.qualYear||'', eSpec:r.specialization||'', eTeachField:r.teachingField||'', eHireDate:r.hireDateSchool||'' };
  DAYS.forEach(d=> ff['p_'+d]=r.periods?r.periods[d]:0);
  FORM = ff; rerenderSection();
}
function empDelete(id){ update(d=>{ d.employees=d.employees.filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
async function makeAccountForEmployee(emp, takenUsernames){
  const phone = (emp.phone||'').trim();
  if(!phone) return {ok:false, reason:'no-phone'};
  if(takenUsernames.has(phone)) return {ok:false, reason:'dup'};
  const salt = randSalt(); const hash = await sha256(salt+'123456');
  return { ok:true, user:{ id:uid(), username:phone, role:'staff', salt, hash, employeeId:emp.id, active:true, perms:rolePerms('staff'), isDefaultPw:true, canDashboard:false } };
}
async function importEmployees(file){
  if(!file) return; const rd=new FileReader();
  rd.onload = async e=>{
    let txt = e.target.result; if(txt.charCodeAt(0)===0xFEFF) txt=txt.slice(1);
    const lines = txt.split(/\r?\n/).filter(l=>l.trim()); let added=0;
    const start = /اسم|name/i.test(lines[0])?1:0; const rows=[];
    for(let i=start;i<lines.length;i++){ const p=lines[i].split(',').map(x=>x.replace(/^"|"$/g,'').trim()); if(!p[0]) continue;
      rows.push({id:uid(),name:p[0],title:p[2]||'معلم',dept:'',phone:p[1]||'',periods:{}}); added++; }
    const takenUsernames = new Set(DB.users.map(u=>u.username));
    const newUsers = [];
    for(const emp of rows){ const acct = await makeAccountForEmployee(emp, takenUsernames); if(acct.ok){ newUsers.push(acct.user); takenUsernames.add(acct.user.username); } }
    update(d=>{ d.employees=[...rows,...d.employees]; d.users=[...d.users,...newUsers]; });
    logAction('استيراد '+added+' موظف'); toast('تم استيراد '+added+' موظف، وإنشاء '+newUsers.length+' حساب دخول برقم الجوال'); rerenderSection();
  };
  rd.readAsText(file,'utf-8');
}
function empBulkAdd(){
  const txt = FORM.bulk||'';
  if(!txt.trim()){ toast('الصق الأسماء أولاً','red'); return; }
  const lines = txt.split(/\r?\n/).filter(l=>l.trim()); let n=0; const recs=[];
  lines.forEach(l=>{ const p=l.split(/[،,]/).map(x=>x.trim()); const name=p[0]; if(!name) return; const periods={}; DAYS.forEach((d,i)=> periods[d]= +(p[i+1]||0));
    recs.push({id:uid(),name,title:'معلم',dept:'',phone:'',periods}); n++; });
  update(d=>{ d.employees=[...recs,...d.employees]; });
  logAction('إضافة '+n+' معلم دفعة'); clearF(); toast('تمت إضافة '+n+' معلم'); rerenderSection();
}

// ===== TEACHER ABSENCE =====
function secTeacherAbsence(){
  if(FORM.empProfileId) return empProfileHTML(FORM.empProfileId);
  const tab = SUBTAB.teacherAbsence||'record';
  if(tab==='report') return subTabsHTML('teacherAbsence',[['record','التسجيل وسد الانتظار'],['report','تقرير الفاقد']]) + lostReport();
  const f = FORM;
  const emp = DB.employees.find(e=>e.id===f.taEmp);
  const date = f.taDate||todayStr(); const dk=dowKey(date);
  const missing = (f.taType==='غياب يوم كامل' && emp)? (emp.periods[dk]||0) : (f.taType==='غياب عن حصص'? +(f.taMissing||0) : 0);

  let html = subTabsHTML('teacherAbsence',[['record','التسجيل وسد الانتظار'],['report','تقرير الفاقد']]);
  let body = `<div class="form-grid">
    ${fieldWrap('الموظف', renderFieldControl({k:'taEmp',type:'select',options:DB.employees.map(e=>({v:e.id,l:e.name}))}))}
    ${fieldWrap('نوع الحالة', renderFieldControl({k:'taType',type:'select',options:['غياب يوم كامل','غياب عن حصص','تأخر صباحي','استئذان خروج مبكر']}))}
    ${fieldWrap('التاريخ', `<input type="date" class="ctl" value="${esc(date)}" onchange="setF('taDate',this.value);rerenderSection();">`)}
    ${fieldWrap('العذر', renderFieldControl({k:'taExcused',type:'select',options:['بدون عذر','بعذر']}))}
    ${f.taType==='غياب عن حصص'? fieldWrap('عدد الحصص المفقودة', renderFieldControl({k:'taMissing',type:'number'})):''}
  </div>`;
  if(f.taType==='غياب يوم كامل' && emp){
    body += `<div class="warn-box">الحصص المفقودة محسوبة تلقائياً من نصاب المعلم يوم ${esc(DAY_AR[dk]||'—')}: <b>${missing}</b> حصص</div>`;
  }
  if(missing>0){
    body += `<div style="margin-top:14px"><div style="font-size:13px;font-weight:700;margin-bottom:8px">سدّ الانتظار — اختر منفّذاً لكل حصة</div><div class="form-grid">`;
    for(let i=1;i<=missing;i++){
      body += fieldWrap('الحصة '+i, renderFieldControl({k:'cov_'+i,type:'select',options:DB.employees.filter(e=>e.id!==f.taEmp).map(e=>({v:e.name,l:e.name})),ph:'بدون سد'}));
    }
    body += `</div>`;
  }
  body += `<div class="row-gap">${btn('حفظ الحالة','taSubmit()','primary')}${btn('مسح','clearF();rerenderSection();','ghost')}</div>`;
  html += card('تسجيل حالة غياب/تأخر معلم', body);

  html += card('سجل حالات المعلمين', tableHTML(['الموظف','النوع','التاريخ','العذر','مفقودة','مسدودة','فاقد فعلي','إجراء'], DB.teacherAbsences, (r,ci)=>{
    const cov = Object.values(r.covers||{}).filter(Boolean).length; const net=Math.max(0,(r.missing||0)-cov);
    switch(ci){ case 0:return r.empId? `<a href="#" onclick="event.preventDefault();openEmpProfile('${r.empId}')" style="color:${C.blue};font-weight:600">${esc(r.empName)}</a>` : esc(r.empName); case 1:return esc(r.type); case 2:return fmtDate(r.date); case 3:return pill(r.excused?'بعذر':'بدون عذر',r.excused?C.teal:C.red);
      case 4:return r.missing||0; case 5:return cov; case 6:return pill(net, net?C.red:C.teal);
      case 7:return btn('حذف',`taDelete('${r.id}')`,'red'); default:return ''; }
  }));
  return html;
}
function taSubmit(){
  const f = FORM;
  if(!f.taEmp||!f.taType){ toast('اختر الموظف ونوع الحالة','red'); return; }
  const emp = DB.employees.find(e=>e.id===f.taEmp);
  const date = f.taDate||todayStr(); const dk=dowKey(date);
  const missing = (f.taType==='غياب يوم كامل' && emp)? (emp.periods[dk]||0) : (f.taType==='غياب عن حصص'? +(f.taMissing||0) : 0);
  const covers={}; for(let i=1;i<=missing;i++){ covers[i]=f['cov_'+i]||''; }
  update(d=>{ d.teacherAbsences.unshift({id:uid(),empId:f.taEmp,empName:emp?emp.name:'',type:f.taType,date,excused:f.taExcused==='بعذر',missing:missing||0,covers}); });
  logAction('تسجيل حالة معلم: '+f.taType); clearF(); toast('تم التسجيل'); rerenderSection();
}
function taDelete(id){ update(d=>{ d.teacherAbsences=d.teacherAbsences.filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
function openEmpProfile(id, keepSection){ if(!keepSection) SECTION='teacherAbsence'; SIDEBAR_OPEN=false; FORM={empProfileId:id}; renderRoot(); }
function closeEmpProfile(){ FORM={}; renderRoot(); }
function secReports(){
  if(FORM.empProfileId) return `<div class="row-gap" style="margin-bottom:14px">${btn('رجوع للتقارير','closeEmpProfile()','ghost')}</div>` + empProfileHTML(FORM.empProfileId);
  const tab = SUBTAB.reports||'student';
  const tabs=[['student','تقرير الطالب'],['teacher','تقرير المعلم']];
  if(tab==='teacher'){
    const rowsHtml = DB.employees.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${esc(r.title||'—')}</td><td>${esc(r.dept||'—')}</td><td><button class="btn btn-gold btn-sm" onclick="openEmpProfile('${r.id}',true)">فتح التقرير الشامل</button></td></tr>`).join('');
    const body = DB.employees.length
      ? `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>الاسم</th><th>المسمى</th><th>القسم</th><th>التقرير</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`
      : `<div style="color:${C.muted};padding:20px;text-align:center">لا يوجد موظفون مسجّلون</div>`;
    return subTabsHTML('reports',tabs) + card('تقرير المعلم — اختر معلماً أو موظفاً', body);
  }
  return subTabsHTML('reports',tabs) + secStudentFiles();
}
function empProfileStats(id, emp){
  const from = FILTERS.pFrom || DB.settings.termStart || todayStr();
  const to = FILTERS.pTo || todayStr();
  const abs = DB.teacherAbsences.filter(a=> (a.empId===id || a.empName===emp.name) && a.date>=from && a.date<=to);
  let fullDays=0,late=0,perm=0,missingTotal=0,coveredTotal=0;
  abs.forEach(a=>{ if(a.type==='غياب يوم كامل')fullDays++; if(a.type==='تأخر صباحي')late++; if(a.type==='استئذان خروج مبكر')perm++;
    missingTotal += a.missing||0; coveredTotal += Object.values(a.covers||{}).filter(Boolean).length; });
  const netLost = Math.max(0, missingTotal-coveredTotal);
  let coveredForOthers = 0;
  DB.teacherAbsences.filter(a=>a.date>=from&&a.date<=to).forEach(a=>{ Object.values(a.covers||{}).forEach(n=>{ if(n===emp.name) coveredForOthers++; }); });
  const tasks = DB.tasks.filter(t=>t.assignee===emp.name);
  const achievements = (DB.achievements||[]).filter(a=>a.name===emp.name && a.date>=from && a.date<=to);
  const visits = (DB.classroomVisits||[]).filter(v=>v.teacher===emp.name && v.date>=from && v.date<=to);
  const techVisits = (DB.techVisits||[]).filter(v=>v.teacherId===id && v.date>=from && v.date<=to);
  const linkedUser = DB.users.find(u=>u.employeeId===id);
  const activity = linkedUser ? DB.log.filter(l=> l.user===linkedUser.username && l.time && l.time.slice(0,10)>=from && l.time.slice(0,10)<=to) : [];
  return {from, to, abs, fullDays, late, perm, missingTotal, coveredTotal, netLost, coveredForOthers, tasks, achievements, visits, techVisits, linkedUser, activity};
}
function empProfileHTML(id){
  const emp = DB.employees.find(e=>e.id===id);
  if(!emp){ FORM.empProfileId=null; return `<div class="no-access">الموظف غير موجود</div>`; }
  const s = empProfileStats(id, emp);
  const tasksDone = s.tasks.filter(t=>t.status==='مكتملة').length;
  let html = `<div class="row-gap" style="margin-bottom:14px">${btn('رجوع','closeEmpProfile()','ghost')}</div>`;
  html += card(esc(emp.name), `
    <div style="color:${C.muted};font-size:13px;margin-bottom:14px">${esc(emp.title||'—')} ${emp.dept?'· '+esc(emp.dept):''} ${emp.phone?'· '+esc(emp.phone):''}</div>
    <div class="form-grid" style="margin-bottom:14px">
      ${fieldWrap('من تاريخ', `<input type="date" class="ctl" value="${esc(s.from)}" onchange="setFilter('pFrom',this.value);rerenderSection();">`)}
      ${fieldWrap('إلى تاريخ', `<input type="date" class="ctl" value="${esc(s.to)}" onchange="setFilter('pTo',this.value);rerenderSection();">`)}
    </div>
    <div class="stats-grid">${[
      ['غياب يوم كامل',s.fullDays,C.red],['تأخر صباحي',s.late,C.amber],['استئذان',s.perm,C.blue],
      ['فاقد فعلي (حصص)',s.netLost,s.netLost?C.red:C.teal],['سدّ الانتظار لمعلمين آخرين',s.coveredForOthers,C.teal],
      ['مهام مكتملة',tasksDone+'/'+s.tasks.length,C.teal]
    ].map(x=>stat(x[0],x[1],x[2])).join('')}</div>
    <div class="row-gap">${btn('طباعة التقرير الشامل',`empProfilePrint('${id}')`,'gold')}</div>
  `);
  html += card('سجل الغياب والتأخر ('+s.abs.length+')', tableHTML(['التاريخ','النوع','العذر','مفقودة','مسدودة'], s.abs, (r,ci)=>{
    const cov = Object.values(r.covers||{}).filter(Boolean).length;
    switch(ci){ case 0:return fmtDate(r.date); case 1:return esc(r.type); case 2:return pill(r.excused?'بعذر':'بدون عذر',r.excused?C.teal:C.red); case 3:return r.missing||0; case 4:return cov; default:return ''; }
  }));
  html += card('المهام ('+s.tasks.length+')', tableHTML(['المهمة','الاستحقاق','الإنجاز','الحالة'], s.tasks, (r,ci)=>{
    switch(ci){ case 0:return esc(r.title); case 1:return fmtDate(r.due); case 2:return (r.progress||0)+'%'; case 3:return pill(r.status, r.status==='مكتملة'?C.teal:r.status==='متأخرة'?C.red:C.amber); default:return ''; }
  }));
  html += card('الإنجازات ('+s.achievements.length+')', tableHTML(['الإنجاز','التفاصيل','التاريخ'], s.achievements, (r,ci)=>{
    switch(ci){ case 0:return esc(r.title); case 1:return esc(r.desc||'—'); case 2:return fmtDate(r.date); default:return ''; }
  }));
  html += card('الزيارات الصفية ('+s.visits.length+')', tableHTML(['المادة','الصف','التقدير','التاريخ'], s.visits, (r,ci)=>{
    switch(ci){ case 0:return esc(r.subject); case 1:return esc(r.grade||'—'); case 2:return pill(r.rating, r.rating==='ممتاز'?C.teal:r.rating==='يحتاج دعماً'?C.red:C.amber); case 3:return fmtDate(r.date); default:return ''; }
  }));
  html += card('الزيارات الفنية ('+s.techVisits.length+')', tableHTML(['المادة','رقم الزيارة','النوع','التاريخ','إجراء'], s.techVisits, (r,ci)=>{
    switch(ci){ case 0:return esc(r.subject||'—'); case 1:return esc(r.number||'—'); case 2:return esc(r.category||'—'); case 3:return fmtDate(r.date);
      case 4:return `<button class="btn btn-gold btn-sm" onclick="techVisitPrint('${r.id}')">طباعة</button>`; default:return ''; }
  }));
  const activityBody = s.linkedUser
    ? tableHTML(['الحركة','الوقت'], s.activity, (r,ci)=> ci===0? esc(r.action) : esc(new Date(r.time).toLocaleString('ar-SA-u-ca-gregory')))
    : `<div style="color:${C.muted};padding:14px;text-align:center">لا يوجد حساب مستخدم مرتبط بهذا الموظف لعرض حركاته في النظام</div>`;
  html += card('سجل الحركات والإجراءات في النظام ('+s.activity.length+')', activityBody);
  return html;
}
function empProfilePrint(id){
  const emp = DB.employees.find(e=>e.id===id); if(!emp) return;
  const s = empProfileStats(id, emp);
  const meta = [['المسمى',emp.title||'—'],['القسم',emp.dept||'—'],['الفترة',fmtDate(s.from)+' — '+fmtDate(s.to)],
    ['غياب يوم كامل',s.fullDays],['تأخر',s.late],['استئذان',s.perm],['فاقد فعلي',s.netLost],['سدّ لمعلمين آخرين',s.coveredForOthers]];
  const section = (title, cols, rows) => `<h1 style="font-size:15px;margin-top:24px">${esc(title)} (${rows.length})</h1>` +
    (rows.length? '<table><thead><tr>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c==null?'—':c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'
      : '<p style="color:#64748b;font-size:13px">لا يوجد</p>');
  const extra = section('سجل الغياب والتأخر', ['التاريخ','النوع','العذر','مفقودة','مسدودة'],
      s.abs.map(a=>[fmtDate(a.date), a.type, a.excused?'بعذر':'بدون عذر', a.missing||0, Object.values(a.covers||{}).filter(Boolean).length]))
    + section('المهام', ['المهمة','الاستحقاق','الإنجاز','الحالة'], s.tasks.map(t=>[t.title, fmtDate(t.due), (t.progress||0)+'%', t.status]))
    + section('الإنجازات', ['الإنجاز','التفاصيل','التاريخ'], s.achievements.map(a=>[a.title, a.desc||'—', fmtDate(a.date)]))
    + section('الزيارات الصفية', ['المادة','الصف','التقدير','التاريخ'], s.visits.map(v=>[v.subject, v.grade||'—', v.rating, fmtDate(v.date)]))
    + section('الزيارات الفنية', ['المادة','رقم الزيارة','النوع','التاريخ'], s.techVisits.map(v=>[v.subject||'—', v.number||'—', v.category||'—', fmtDate(v.date)]))
    + section('سجل الحركات والإجراءات في النظام', ['الحركة','الوقت'], s.activity.map(a=>[a.action, new Date(a.time).toLocaleString('ar-SA-u-ca-gregory')]));
  printReport('التقرير الشامل — '+emp.name, meta, null, null, {html: extra});
}
function lostReport(){
  const from = FILTERS.from||DB.settings.termStart||todayStr(); const to=FILTERS.to||todayStr();
  const inRange = DB.teacherAbsences.filter(a=>a.date>=from&&a.date<=to);
  const byEmp={}; const coverCount={};
  inRange.forEach(a=>{ if(!byEmp[a.empName]) byEmp[a.empName]={fullDays:0,late:0,perm:0,missing:0,covered:0};
    const b=byEmp[a.empName]; if(a.type==='غياب يوم كامل')b.fullDays++; if(a.type==='تأخر صباحي')b.late++; if(a.type==='استئذان خروج مبكر')b.perm++;
    b.missing+=a.missing||0; const cov=Object.values(a.covers||{}).filter(Boolean); b.covered+=cov.length;
    cov.forEach(name=> coverCount[name]=(coverCount[name]||0)+1); });
  const rows = Object.keys(byEmp).map(name=>{ const b=byEmp[name]; const net=Math.max(0,b.missing-b.covered); const rate=b.missing?Math.round(b.covered/b.missing*100):0; return {name,fullDays:b.fullDays,late:b.late,perm:b.perm,missing:b.missing,covered:b.covered,net,rate}; });
  const covRows = Object.keys(coverCount).map(n=>({name:n,count:coverCount[n]})).sort((a,b)=>b.count-a.count);
  let html = `<div class="form-grid" style="margin-bottom:14px">
    ${fieldWrap('من تاريخ', `<input type="date" class="ctl" value="${esc(from)}" onchange="setFilter('from',this.value);rerenderSection();">`)}
    ${fieldWrap('إلى تاريخ', `<input type="date" class="ctl" value="${esc(to)}" onchange="setFilter('to',this.value);rerenderSection();">`)}
  </div>` + tableHTML(['الموظف','غياب كامل','تأخر','استئذان','مفقودة','مسدودة','فاقد فعلي','نسبة السد'], rows, (r,ci)=>{
    switch(ci){ case 0:{ const e=DB.employees.find(x=>x.name===r.name); return e? `<a href="#" onclick="event.preventDefault();openEmpProfile('${e.id}')" style="color:${C.blue};font-weight:600">${esc(r.name)}</a>` : esc(r.name); } case 1:return r.fullDays; case 2:return r.late; case 3:return r.perm; case 4:return r.missing; case 5:return r.covered; case 6:return pill(r.net,r.net?C.red:C.teal);
      case 7:return `<div style="display:flex;align-items:center;gap:6px;min-width:90px"><div style="flex:1;height:7px;background:${C.border};border-radius:5px"><div style="width:${r.rate}%;height:100%;background:${r.rate>=80?C.teal:C.amber};border-radius:5px"></div></div>${r.rate}%</div>`; default:return ''; }
  }) + `<div class="row-gap">${btn('تصدير CSV','lostReportCSV()','ghost')}${btn('طباعة','lostReportPrint()','gold')}</div>`;
  html = card('تقرير الفاقد التعليمي', html);
  html += card('توزيع حصص الانتظار على المنفّذين (للعدالة)', tableHTML(['المنفّذ','عدد حصص الانتظار'], covRows, (r,ci)=> ci===0?esc(r.name):pill(r.count,C.blue)));
  return html;
}
function lostReportData(){
  const from = FILTERS.from||DB.settings.termStart||todayStr(); const to=FILTERS.to||todayStr();
  const inRange = DB.teacherAbsences.filter(a=>a.date>=from&&a.date<=to);
  const byEmp={}; const coverCount={};
  inRange.forEach(a=>{ if(!byEmp[a.empName]) byEmp[a.empName]={fullDays:0,late:0,perm:0,missing:0,covered:0};
    const b=byEmp[a.empName]; if(a.type==='غياب يوم كامل')b.fullDays++; if(a.type==='تأخر صباحي')b.late++; if(a.type==='استئذان خروج مبكر')b.perm++;
    b.missing+=a.missing||0; const cov=Object.values(a.covers||{}).filter(Boolean); b.covered+=cov.length;
    cov.forEach(name=> coverCount[name]=(coverCount[name]||0)+1); });
  const rows = Object.keys(byEmp).map(name=>{ const b=byEmp[name]; const net=Math.max(0,b.missing-b.covered); const rate=b.missing?Math.round(b.covered/b.missing*100):0; return {name,fullDays:b.fullDays,late:b.late,perm:b.perm,missing:b.missing,covered:b.covered,net,rate}; });
  const covRows = Object.keys(coverCount).map(n=>({name:n,count:coverCount[n]})).sort((a,b)=>b.count-a.count);
  return {rows, covRows, from, to};
}
function lostReportCSV(){ const {rows}=lostReportData(); exportCSV('تقرير الفاقد',['الموظف','غياب كامل','تأخر','استئذان','مفقودة','مسدودة','فاقد','نسبة السد'],rows.map(r=>[r.name,r.fullDays,r.late,r.perm,r.missing,r.covered,r.net,r.rate+'%'])); }
function lostReportPrint(){
  const {rows, covRows, from, to} = lostReportData();
  printReport('تقرير الفاقد التعليمي',[['الفترة',fmtDate(from)+' — '+fmtDate(to)]],['الموظف','غياب كامل','تأخر','استئذان','مفقودة','مسدودة','فاقد','نسبة السد'],
    rows.map(r=>[r.name,r.fullDays,r.late,r.perm,r.missing,r.covered,r.net,r.rate+'%']),
    {html:'<h1 style="font-size:15px;margin-top:24px">توزيع حصص الانتظار على المنفّذين</h1><table><thead><tr><th>المنفّذ</th><th>عدد حصص الانتظار</th></tr></thead><tbody>'+covRows.map(c=>'<tr><td>'+esc(c.name)+'</td><td>'+c.count+'</td></tr>').join('')+'</tbody></table>'});
}

// ===== COUNSELOR =====
function secCounselor(){
  const tab = SUBTAB.counselor||'cases';
  const tabs=[['cases','الحالات الفردية'],['behavior','السلوك والمواظبة'],['letters','الخطابات'],['plan','خطة تعديل السلوك']];
  const alert = `<div class="alert-box"><b>تنبيه (المادة 35): </b>الموجّه الطلابي لا يُشرك في رصد درجات السلوك ولا تنفيذ الحسم، ودوره دراسة الحالة وعلاجها.</div>`;
  let content;
  if(tab==='cases') content = counselCasesHTML();
  else if(tab==='behavior') content = counselorBehaviorView();
  else if(tab==='letters') content = counselorLetters();
  else content = behaviorPlan();
  return subTabsHTML('counselor',tabs) + alert + content;
}
function counselorBehaviorView(){
  const list = (DB.behaviorRecords||[]).slice();
  const tbl = tableHTML(['الطالب','الدرجة','المشكلة','الإجراء المطبّق','الحسم','التاريخ'], list, (r,ci)=>{
    switch(ci){ case 0:return esc(r.student); case 1:return pill('الدرجة '+r.degree,[C.gold,C.amber,C.blue,C.red,'#7a1f16'][r.degree-1]); case 2:return esc(r.problem);
      case 3:return `<span style="font-size:12.5px">${esc(r.procedure)}</span>`; case 4:return r.deduct?('−'+r.deduct):'—'; case 5:return fmtDate(r.date); default:return ''; }
  });
  return card('سجل المشكلات السلوكية (عرض فقط — يُسجَّل من وكيل شؤون الطلاب)', tbl, btn('طباعة','behaviorPrintRecords()','gold'));
}
function counselCasesHTML(){
  const f = FORM;
  const editing = !!f.ccEditId;
  if(!editing && f.ccStatus==null) f.ccStatus='جديدة';
  const closing = f.ccStatus==='مغلقة';
  let html = card(editing?'تعديل الحالة':'إضافة حالة إرشادية', `<div class="form-grid">
      ${fieldWrap('الطالب', renderFieldControl({k:'ccStudent',type:'select',options:DB.students.map(s=>s.name)}))}
      ${fieldWrap('نوع الحالة', renderFieldControl({k:'ccType',type:'select',options:['سلوكية','دراسية','نفسية/اجتماعية','صحية','أسرية','أخرى']}))}
      ${fieldWrap('تاريخ المتابعة', renderFieldControl({k:'ccFollow',type:'date'}))}
      ${fieldWrap('حالة الدراسة', renderFieldControl({k:'ccStatus',type:'select',options:['جديدة','قيد المتابعة','مغلقة']}))}
    </div>
    ${fieldWrap('وصف الحالة', renderFieldControl({k:'ccDesc',type:'textarea'}))}
    ${closing? fieldWrap('الإنجاز / نتيجة الحالة عند الإغلاق', renderFieldControl({k:'ccResolution',type:'textarea'})) : ''}
    <div class="row-gap">${btn(editing?'حفظ التعديل':'حفظ','counselCaseSubmit()','primary')}${btn('مسح',"clearF();rerenderSection();",'ghost')}</div>`);

  const list = DB.counselCases||[];
  html += card('الحالات الفردية ('+list.length+')', tableHTML(['الطالب','النوع','الوصف','المتابعة','الحالة','الإنجاز','إجراء'], list, (r,ci)=>{
    switch(ci){ case 0:return esc(r.student); case 1:return esc(r.type); case 2:return esc(r.desc||'—'); case 3:return fmtDate(r.followDate);
      case 4:return pill(r.status, r.status==='مغلقة'?C.teal:r.status==='قيد المتابعة'?C.amber:C.blue);
      case 5:return esc(r.resolution||'—');
      case 6:return `<div class="td-actions">${btn('تعديل',`counselCaseEdit('${r.id}')`,'ghost')}${btn('حذف',`counselCaseDelete('${r.id}')`,'red')}</div>`; default:return ''; }
  }), btn('طباعة','counselCasesPrint()','gold'));
  return html;
}
function counselCaseSubmit(){
  const f = FORM;
  if(!f.ccStudent||!f.ccType){ toast('اختر الطالب ونوع الحالة','red'); return; }
  if(f.ccEditId){
    update(d=>{ const c=d.counselCases.find(x=>x.id===f.ccEditId); Object.assign(c,{student:f.ccStudent,type:f.ccType,desc:f.ccDesc||'',followDate:f.ccFollow||'',status:f.ccStatus||'جديدة',resolution:f.ccResolution||''}); });
    logAction('تعديل حالة إرشادية'); toast('تم التعديل');
  } else {
    update(d=>{ d.counselCases.unshift({id:uid(),student:f.ccStudent,type:f.ccType,desc:f.ccDesc||'',followDate:f.ccFollow||'',status:f.ccStatus||'جديدة',resolution:f.ccResolution||''}); });
    logAction('إضافة حالة إرشادية'); toast('تمت الإضافة');
  }
  clearF(); rerenderSection();
}
function counselCaseEdit(id){
  const c = DB.counselCases.find(x=>x.id===id); if(!c) return;
  FORM = { ccEditId:id, ccStudent:c.student, ccType:c.type, ccDesc:c.desc, ccFollow:c.followDate, ccStatus:c.status, ccResolution:c.resolution };
  rerenderSection();
}
function counselCaseDelete(id){ update(d=>{ d.counselCases=d.counselCases.filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
function counselCasesPrint(){
  printReport('الحالات الفردية',[['العدد',DB.counselCases.length]],['الطالب','النوع','الوصف','المتابعة','الحالة','الإنجاز'],
    DB.counselCases.map(r=>[r.student,r.type,r.desc||'—',fmtDate(r.followDate),r.status,r.resolution||'—']));
}
function counselorLetters(){
  const f = FORM;
  const letters = [
    {id:'summon',t:'استدعاء ولي أمر',body:s=>'نظراً لأهمية التعاون بين المدرسة والأسرة، نأمل حضوركم إلى المدرسة لمناقشة أمور تتعلق بابنكم الطالب / '+s.student+' في الصف '+s.grade+'، وذلك يوم ______ الموافق ______ الساعة ______.'},
    {id:'notice',t:'إشعار ولي أمر',body:s=>'نفيدكم بأن ابنكم الطالب / '+s.student+' بالصف '+s.grade+' قد صدر منه ما يلي: '+(f.lNote||'______')+'. نأمل متابعته وتوجيهه، شاكرين تعاونكم.'},
    {id:'thanks',t:'خطاب شكر وتحفيز',body:s=>'يسرّ إدارة المدرسة أن تتقدم بالشكر للطالب / '+s.student+' بالصف '+s.grade+' لتميّزه وحُسن سلوكه، سائلين الله له دوام التوفيق.'}
  ];
  const sel = DB.students.find(s=>s.name===f.lStudent); const grade = sel?sel.grade:'______';
  let html = card('إصدار خطاب', `<div class="form-grid">
      ${fieldWrap('الطالب', renderFieldControl({k:'lStudent',type:'select',options:DB.students.map(s=>s.name)}))}
      ${fieldWrap('نوع الخطاب', renderFieldControl({k:'lType',type:'select',options:letters.map(l=>({v:l.id,l:l.t}))}))}
      ${fieldWrap('ملاحظة (لخطاب الإشعار)', renderFieldControl({k:'lNote'}))}
    </div>
    <div class="row-gap">${btn('طباعة الخطاب','counselorPrintLetter()','gold')}</div>`);
  html += card('الخطابات المتاحة', `<ul class="plain-list">${letters.map(l=>`<li>${esc(l.t)}</li>`).join('')}</ul>`);
  return html;
}
function counselorPrintLetter(){
  const f = FORM;
  const letters = [
    {id:'summon',t:'استدعاء ولي أمر',body:s=>'نظراً لأهمية التعاون بين المدرسة والأسرة، نأمل حضوركم إلى المدرسة لمناقشة أمور تتعلق بابنكم الطالب / '+s.student+' في الصف '+s.grade+'، وذلك يوم ______ الموافق ______ الساعة ______.'},
    {id:'notice',t:'إشعار ولي أمر',body:s=>'نفيدكم بأن ابنكم الطالب / '+s.student+' بالصف '+s.grade+' قد صدر منه ما يلي: '+(f.lNote||'______')+'. نأمل متابعته وتوجيهه، شاكرين تعاونكم.'},
    {id:'thanks',t:'خطاب شكر وتحفيز',body:s=>'يسرّ إدارة المدرسة أن تتقدم بالشكر للطالب / '+s.student+' بالصف '+s.grade+' لتميّزه وحُسن سلوكه، سائلين الله له دوام التوفيق.'}
  ];
  const L = letters.find(l=>l.id===f.lType);
  if(!L||!f.lStudent){ toast('اختر الطالب ونوع الخطاب','red'); return; }
  const sel = DB.students.find(s=>s.name===f.lStudent); const grade = sel?sel.grade:'______';
  printReport(L.t,[['التاريخ',fmtDate(todayStr())]],null,null,{html:'<div class="formbox" style="line-height:2.6;font-size:14px">'+esc(L.body({student:f.lStudent,grade}))+'</div>'});
  update(d=>{ d.studentDocuments=[...(d.studentDocuments||[]), {id:uid(), student:f.lStudent, type:L.t, date:todayStr(), createdBy:USER.username}]; });
}
function behaviorPlan(){
  const fields = [['pStudent','الطالب','select'],['pProblem','المشكلة ودرجتها','text'],['pDesc','وصف المشكلة','textarea'],
    ['pSigns','المظاهر السلوكية','textarea'],['pBefore','المثيرات القبلية','textarea'],['pAfter','المثيرات البعدية','textarea'],
    ['pGain','ما يحققه الطالب من السلوك','textarea'],['pPrev','الإجراءات السابقة','textarea'],['pWanted','السلوك المرغوب (إجرائياً)','textarea'],
    ['pActions','الإجراءات المستخدمة','textarea'],['pPeriod','فترة الخطة','text']];
  const body = `<div class="form-grid">${fields.map(fl=> fieldWrap(fl[1], fl[2]==='select'? renderFieldControl({k:fl[0],type:'select',options:DB.students.map(s=>s.name)}) : renderFieldControl({k:fl[0],type:fl[2]}))).join('')}</div>
    <div class="row-gap">${btn('طباعة الخطة','printBehaviorPlan()','gold')}</div>`;
  return card('خطة تعديل السلوك (النموذج الرسمي)', body);
}
function printBehaviorPlan(){
  const f = FORM;
  if(!f.pStudent){ toast('اختر الطالب','red'); return; }
  const rows = [['الطالب',f.pStudent],['المشكلة ودرجتها',f.pProblem],['وصف المشكلة',f.pDesc],['المظاهر السلوكية',f.pSigns],
    ['المثيرات القبلية',f.pBefore],['المثيرات البعدية',f.pAfter],['ما يحققه الطالب',f.pGain],['الإجراءات السابقة',f.pPrev],
    ['السلوك المرغوب إجرائياً',f.pWanted],['الإجراءات المستخدمة',f.pActions],['فترة الخطة',f.pPeriod]];
  printReport('خطة تعديل السلوك',[['التاريخ',fmtDate(todayStr())]],null,null,{html:'<div class="formbox">'+rows.map(r=>'<div class="row"><b>'+esc(r[0])+':</b><span>'+esc(r[1]||'______')+'</span></div>').join('')+'</div>'});
}

// ===== BEHAVIOR =====
function secBehavior(){
  const tab = SUBTAB.behavior||'record';
  const tabs=[['record','رصد المشكلات'],['merit','السلوك المتميز'],['attend','المواظبة'],['forms','النماذج الرسمية']];
  let content;
  if(tab==='record') content = behaviorRecord();
  else if(tab==='merit') content = behaviorMerit();
  else if(tab==='attend') content = behaviorAttendance();
  else content = behaviorForms();
  return subTabsHTML('behavior',tabs) + content;
}
function behaviorRecord(){
  const f = FORM;
  const degree = +f.bDegree||0;
  const probList = degree? [...(PROBLEMS[degree]||[]), ...((degree>=4&&PROBLEMS_STAFF[degree])?PROBLEMS_STAFF[degree]:[])] : [];
  const prior = (f.bStudent&&f.bProblem)? DB.behaviorRecords.filter(r=>r.student===f.bStudent&&r.problem===f.bProblem).length : 0;
  const procIdx = Math.min(prior, (PROCEDURES[degree]||[]).length-1);
  const suggested = degree? (PROCEDURES[degree]||[])[procIdx] : '';

  let body = `<div class="info-box">درجة السلوك تبدأ من (100): سلوك إيجابي (80) يُمنح تلقائياً + سلوك متميز حتى (20). الحسم حسب الدرجة: الأولى 1 · الثانية 2 · الثالثة 3 · الرابعة 10 · الخامسة 15. (وفق قواعد وزارة التعليم — الإصدار الخامس 1447هـ).</div>
    <div class="form-grid">
      ${fieldWrap('الطالب', renderFieldControl({k:'bStudent',type:'select',options:DB.students.map(s=>s.name)}))}
      ${fieldWrap('الدرجة', renderFieldControl({k:'bDegree',type:'select',options:[{v:'1',l:'الأولى (حسم 1)'},{v:'2',l:'الثانية (حسم 2)'},{v:'3',l:'الثالثة (حسم 3)'},{v:'4',l:'الرابعة (حسم 10)'},{v:'5',l:'الخامسة (حسم 15)'}]}))}
      ${degree>0? fieldWrap('المشكلة', renderFieldControl({k:'bProblem',type:'select',options:probList})):''}
    </div>`;
  if(f.bStudent&&f.bProblem){
    body += `<div style="margin-top:14px;background:#F8FAFC;border:1px dashed ${C.border};border-radius:10px;padding:12px 16px;font-size:13px;line-height:1.9">
      <div>تكرار هذه المشكلة لهذا الطالب: <b style="color:${C.red}">×${prior+1}</b></div>
      <div style="margin-top:6px">الإجراء المقترح (${['الأول','الثاني','الثالث','الرابع'][procIdx]}): </div>
      <div style="margin-top:4px;font-weight:700;color:${C.navy}">${esc(suggested)}</div>
      ${(degree===1&&prior<2)?`<div style="margin-top:6px;color:${C.teal};font-weight:700">ملاحظة: الإجراءان الأول والثاني في الدرجة الأولى تنبيه شفهي بلا حسم.</div>`:''}
      ${degree>=4?`<div style="margin-top:8px;color:${C.red};font-weight:700">⚠ في الدرجات العليا وحالات الإيذاء والإهمال يجب التبليغ الفوري لمركز البلاغات 1919 والجهات الأمنية.</div>`:''}
    </div>`;
  }
  body += `<div class="row-gap">${btn('رصد المشكلة وتطبيق الإجراء','behaviorSubmit()','primary')}</div>`;

  let html = card('رصد مشكلة سلوكية', body);
  html += card('سجل المشكلات السلوكية', tableHTML(['الطالب','الدرجة','المشكلة','الإجراء المطبّق','الحسم','التاريخ','إجراء'], DB.behaviorRecords, (r,ci)=>{
    switch(ci){ case 0:return esc(r.student); case 1:return pill('الدرجة '+r.degree,[C.gold,C.amber,C.blue,C.red,'#7a1f16'][r.degree-1]); case 2:return esc(r.problem);
      case 3:return `<span style="font-size:12.5px">${esc(r.procedure)}</span>`; case 4:return r.deduct?('−'+r.deduct):'—'; case 5:return fmtDate(r.date);
      case 6:return btn('حذف',`behaviorDelete('${r.id}')`,'red'); default:return ''; }
  }), btn('طباعة سجل المشكلات','behaviorPrintRecords()','gold'));
  return html;
}
function behaviorSubmit(){
  const f = FORM;
  const degree = +f.bDegree||0;
  if(!f.bStudent||!degree||!f.bProblem){ toast('اختر الطالب والدرجة والمشكلة','red'); return; }
  const prior = DB.behaviorRecords.filter(r=>r.student===f.bStudent&&r.problem===f.bProblem).length;
  const procIdx = Math.min(prior, (PROCEDURES[degree]||[]).length-1);
  const suggested = (PROCEDURES[degree]||[])[procIdx];
  update(d=>{ d.behaviorRecords.unshift({id:uid(),student:f.bStudent,degree,problem:f.bProblem,procedure:suggested,deduct: (degree===1&&prior<2)?0:DEDUCT[degree],date:todayStr()}); });
  logAction('رصد مشكلة سلوكية درجة '+degree);
  FORM = { bDegree:f.bDegree };
  toast('تم رصد المشكلة'); rerenderSection();
}
function behaviorDelete(id){ update(d=>{ d.behaviorRecords=d.behaviorRecords.filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
function behaviorPrintRecords(){
  printReport('سجل المشكلات السلوكية',[['العدد',DB.behaviorRecords.length]],['الطالب','الدرجة','المشكلة','الإجراء','الحسم','التاريخ'],
    DB.behaviorRecords.map(r=>[r.student,r.degree,r.problem,r.procedure,r.deduct?('−'+r.deduct):'—',fmtDate(r.date)]));
}
function studentBehaviorScore(name){
  let sc=80; DB.behaviorRecords.filter(r=>r.student===name).forEach(r=>sc-=r.deduct||0);
  let merit=0; (DB.meritRecords||[]).filter(r=>r.student===name).forEach(r=>merit+=r.pts||0); sc+=Math.min(20,merit);
  return Math.max(0,Math.min(100,sc));
}
function behaviorMerit(){
  const list = DB.meritRecords||[];
  let html = card('رصد السلوك المتميز والتعويض', `<div class="form-grid">
      ${fieldWrap('الطالب', renderFieldControl({k:'mStudent',type:'select',options:DB.students.map(s=>s.name)}))}
      ${fieldWrap('الممارسة', renderFieldControl({k:'mType',type:'select',options:MERITS.map(m=>({v:m.label,l:m.label+' ('+m.pts+' درجات)'}))}))}
    </div>
    <div class="row-gap">${btn('رصد','meritSubmit()','teal')}</div>`);
  html += card('سجل السلوك المتميز', tableHTML(['الطالب','الممارسة','الدرجات','رصيد السلوك الحالي','التاريخ','إجراء'], list, (r,ci)=>{
    switch(ci){ case 0:return esc(r.student); case 1:return esc(r.type); case 2:return pill('+'+r.pts,C.teal); case 3:return pill(studentBehaviorScore(r.student)+'/100',C.navy); case 4:return fmtDate(r.date);
      case 5:return btn('حذف',`meritDelete('${r.id}')`,'red'); default:return ''; }
  }));
  return html;
}
function meritSubmit(){
  const f = FORM;
  if(!f.mStudent||!f.mType){ toast('اختر الطالب والممارسة','red'); return; }
  const m = MERITS.find(x=>x.label===f.mType);
  update(d=>{ if(!d.meritRecords) d.meritRecords=[]; d.meritRecords.unshift({id:uid(),student:f.mStudent,type:f.mType,pts:m?m.pts:0,date:todayStr()}); });
  logAction('رصد سلوك متميز'); clearF(); toast('تم الرصد'); rerenderSection();
}
function meritDelete(id){ update(d=>{ d.meritRecords=(d.meritRecords||[]).filter(x=>x.id!==id); }); toast('تم الحذف'); rerenderSection(); }
function behaviorAttendance(){
  const termStart = DB.settings.termStart||todayStr();
  const days = new Set(); Object.keys(DB.attendance).forEach(k=>days.add(k.split('|')[0]));
  const totalDays = days.size||1;
  const rows = DB.students.map(s=>{
    let noExcuse=0;
    Object.keys(DB.attendance).forEach(k=>{ const d=k.split('|')[0]; if(d<termStart) return; const r=DB.attendance[k][s.id]; if(r&&r.day==='absent') noExcuse++; });
    const score = Math.max(0,100-noExcuse);
    const pct = Math.round(noExcuse/totalDays*100);
    let due=''; if(noExcuse>=10)due='الإجراء عند 10 أيام'; else if(noExcuse>=5)due='الإجراء عند 5 أيام'; else if(noExcuse>=3)due='الإجراء عند 3 أيام';
    const deprive = pct>10;
    return {s,noExcuse,score,pct,due,deprive};
  }).filter(r=>r.noExcuse>0);
  const html = `<div class="info-box">درجة المواظبة (100) يُحسم منها درجة عن كل يوم غياب بدون عذر ابتداءً من بداية الفصل (${fmtDate(termStart)}). تنبيه الإجراء المستحق عند 3 و5 و10 أيام، وإنذار الحرمان من الانتقال عند تجاوز الغياب 10% من أيام العام.</div>` +
    tableHTML(['الطالب','أيام الغياب بدون عذر','نسبة الغياب','درجة المواظبة','الإجراء المستحق'], rows, (r,ci)=>{
      switch(ci){ case 0:return esc(r.s.name); case 1:return r.noExcuse; case 2:return pill(r.pct+'%', r.deprive?C.red:C.muted);
        case 3:return pill(r.score+'/100', r.score>=90?C.teal:r.score>=80?C.amber:C.red);
        case 4:return (r.due?pill(r.due,C.amber):'')+(r.deprive?`<div style="margin-top:4px">${pill('إنذار حرمان من الانتقال',C.red)}</div>`:''); default:return ''; }
    }) + `<div class="row-gap">${btn('طباعة كشف المواظبة','behaviorAttPrint()','gold')}</div>`;
  return card('المواظبة — محتسبة تلقائياً من التحضير اليومي', html);
}
function behaviorAttPrint(){
  const termStart = DB.settings.termStart||todayStr();
  const days = new Set(); Object.keys(DB.attendance).forEach(k=>days.add(k.split('|')[0]));
  const totalDays = days.size||1;
  const rows = DB.students.map(s=>{
    let noExcuse=0;
    Object.keys(DB.attendance).forEach(k=>{ const d=k.split('|')[0]; if(d<termStart) return; const r=DB.attendance[k][s.id]; if(r&&r.day==='absent') noExcuse++; });
    const score = Math.max(0,100-noExcuse); const due = noExcuse>=10?'الإجراء عند 10 أيام':noExcuse>=5?'الإجراء عند 5 أيام':noExcuse>=3?'الإجراء عند 3 أيام':'';
    return {s,noExcuse,score,due};
  }).filter(r=>r.noExcuse>0);
  printReport('كشف المواظبة',[['بداية الفصل',fmtDate(termStart)]],['الطالب','أيام الغياب بدون عذر','درجة المواظبة','الإجراء'], rows.map(r=>[r.s.name,r.noExcuse,r.score+'/100',r.due||'—']));
}
function behaviorForms(){
  const f = FORM;
  const forms = [
    {id:'notice',t:'إشعار ولي أمر بمشكلة سلوكية',html:()=>{ const st=f.fStudent||'______'; return '<div class="formbox"><div class="row"><b>الطالب:</b><span>'+esc(st)+'</span></div><div class="row"><b>المشكلة:</b><span>'+esc(f.fText||'______')+'</span></div><div class="row"><b>الإجراء المتخذ:</b><span>______</span></div><p style="margin-top:16px;line-height:2.4">نأمل من ولي الأمر الاطلاع والتوجيه والتوقيع بالعلم.</p></div>'; }},
    {id:'pledge',t:'تعهد سلوكي',html:()=>{ const st=f.fStudent||'______'; return '<div class="formbox" style="line-height:2.6">أتعهد أنا الطالب / '+esc(st)+' بالالتزام بأنظمة المدرسة وحُسن السلوك وعدم تكرار المخالفة، وفي حال الإخلال أتحمّل ما يترتب على ذلك من إجراءات.<br><br>توقيع الطالب: ______ &nbsp;&nbsp; توقيع ولي الأمر: ______</div>'; }},
    {id:'committee',t:'محضر اجتماع لجنة التوجيه الطلابي',html:()=>'<div class="formbox"><div class="row"><b>التاريخ:</b><span>'+fmtDate(todayStr())+'</span></div><div class="row"><b>الموضوع:</b><span>'+esc(f.fText||'______')+'</span></div></div><table style="margin-top:12px"><thead><tr><th>م</th><th>العضو</th><th>الصفة</th><th>التوقيع</th></tr></thead><tbody>'+['مدير المدرسة (رئيساً)','الوكيل','الموجه الطلابي','معلم','ولي أمر'].map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(r)+'</td><td></td><td></td></tr>').join('')+'</tbody></table>'},
    {id:'commit',t:'تعهد الالتزام بالحضور',html:()=>{ const st=f.fStudent||'______'; return '<div class="formbox" style="line-height:2.6">أتعهد أنا ولي أمر الطالب / '+esc(st)+' بمتابعة انتظام ابني في الحضور وعدم الغياب دون عذر مقبول، علماً بأن تجاوز نسبة الغياب قد يؤدي إلى الحرمان من الانتقال.<br><br>ولي الأمر: ______ &nbsp; الجوال: ______ &nbsp; التوقيع: ______</div>'; }}
  ];
  window.__BEHAVIOR_FORMS = forms;
  const body = `<div class="form-grid" style="margin-bottom:14px">
      ${fieldWrap('الطالب/الموضوع', renderFieldControl({k:'fStudent',type:'select',options:DB.students.map(s=>s.name)}))}
      ${fieldWrap('نص/ملاحظة', renderFieldControl({k:'fText'}))}
    </div>
    <div class="row-gap">${forms.map(fm=>btn(fm.t,`printBehaviorForm('${fm.id}')`,'gold')).join('')}</div>
    <div class="row-gap">${btn('سجل المشكلات السلوكية','behaviorPrintRecords()','ghost')}</div>`;
  return card('النماذج الرسمية للطباعة', body);
}
function printBehaviorForm(id){
  const forms = window.__BEHAVIOR_FORMS||[];
  const fm = forms.find(x=>x.id===id); if(!fm) return;
  printReport(fm.t,[['التاريخ',fmtDate(todayStr())]],null,null,{html:fm.html()});
  if(FORM.fStudent){
    update(d=>{ d.studentDocuments=[...(d.studentDocuments||[]), {id:uid(), student:FORM.fStudent, type:fm.t, date:todayStr(), createdBy:USER.username}]; });
  }
}

// ===== STUDENT FILES (ملف مرجعي شامل لكل طالب) =====
function secStudentFiles(){
  const q = FORM.sfQuery||'';
  let html = card('البحث عن طالب', renderFieldControl({k:'sfQuery',type:'studentSearch',ph:'اكتب اسم الطالب…'}));
  const student = DB.students.find(s=>s.name===q);
  if(!student) return html;
  html += studentFileHTML(student);
  return html;
}
function studentFileStats(s){
  const name = s.name;
  let absent=0, late=0, excused=0, partial=0, totalDays=0;
  Object.keys(DB.attendance||{}).forEach(k=>{
    const rec = DB.attendance[k][s.id]; if(!rec) return;
    totalDays++;
    if(rec.day==='absent') absent++; else if(rec.day==='excused') excused++; else if(rec.day==='late') late++;
    if(rec.periods && rec.periods.some(p=>p==='غ')) partial++;
  });
  const lateArr = (DB.lateArrivals||[]).filter(r=>r.name===name).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  const earlyArr = (DB.earlyLeaves||[]).filter(r=>r.name===name).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  const behavior = (DB.behaviorRecords||[]).filter(r=>r.student===name).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  const cases = (DB.counselCases||[]).filter(r=>r.student===name);
  const docs = (DB.studentDocuments||[]).filter(r=>r.student===name).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  const score = studentBehaviorScore(name);
  return {totalDays, absent, late, excused, partial, lateArr, earlyArr, behavior, cases, docs, score};
}
function studentFileHTML(s){
  const st = studentFileStats(s);
  let html = card(esc(s.name), `
    <div style="color:${C.muted};font-size:13px;margin-bottom:14px">الصف/الفصل: <b>${esc(s.grade+'/'+s.section)}</b> · جوال ولي الأمر: <b>${esc(s.guardianPhone||'—')}</b></div>
    <div class="stats-grid">${[
      ['غياب',st.absent,C.red],['تأخر يومي',st.late,C.amber],['غياب بعذر',st.excused,C.blue],['غياب جزئي',st.partial,'#7a1f16'],
      ['تأخر صباحي',st.lateArr.length,C.amber],['استئذان',st.earlyArr.length,C.gold],
      ['مشكلات سلوكية',st.behavior.length,st.behavior.length?C.red:C.teal],['درجة السلوك',st.score,st.score>=80?C.teal:st.score>=60?C.amber:C.red],
      ['حالات إرشادية',st.cases.length,C.blue],['خطابات ونماذج صادرة',st.docs.length,C.blue]
    ].map(x=>stat(x[0],x[1],x[2])).join('')}</div>
    <div class="row-gap">${btn('طباعة الملف الكامل',`studentFilePrint('${s.id}')`,'gold')}</div>
  `);
  html += card('التأخر الصباحي ('+st.lateArr.length+')', tableHTML(['التاريخ','الوقت','السبب'], st.lateArr, (r,ci)=>{
    switch(ci){ case 0:return fmtDate(r.date); case 1:return esc(r.time||'—'); case 2:return esc(r.reason||'—'); default:return ''; }
  }));
  html += card('الاستئذان ('+st.earlyArr.length+')', tableHTML(['التاريخ','الوقت','المستلم','صلة القرابة','السبب'], st.earlyArr, (r,ci)=>{
    switch(ci){ case 0:return fmtDate(r.date); case 1:return esc(r.time||'—'); case 2:return esc(r.receiver||'—'); case 3:return esc(r.relation||'—'); case 4:return esc(r.reason||'—'); default:return ''; }
  }));
  html += card('المشكلات السلوكية ('+st.behavior.length+')', tableHTML(['الدرجة','المشكلة','الإجراء المطبّق','الحسم','التاريخ'], st.behavior, (r,ci)=>{
    switch(ci){ case 0:return pill('الدرجة '+r.degree,[C.gold,C.amber,C.blue,C.red,'#7a1f16'][r.degree-1]); case 1:return esc(r.problem); case 2:return `<span style="font-size:12.5px">${esc(r.procedure)}</span>`; case 3:return r.deduct?('−'+r.deduct):'—'; case 4:return fmtDate(r.date); default:return ''; }
  }));
  html += card('الحالات الإرشادية ('+st.cases.length+')', tableHTML(['النوع','الوصف','المتابعة','الحالة','الإنجاز'], st.cases, (r,ci)=>{
    switch(ci){ case 0:return esc(r.type); case 1:return esc(r.desc||'—'); case 2:return fmtDate(r.followDate); case 3:return pill(r.status, r.status==='مغلقة'?C.teal:r.status==='قيد المتابعة'?C.amber:C.blue); case 4:return esc(r.resolution||'—'); default:return ''; }
  }));
  html += card('الخطابات والنماذج الصادرة ('+st.docs.length+')', tableHTML(['النوع','التاريخ','بواسطة'], st.docs, (r,ci)=>{
    switch(ci){ case 0:return esc(r.type); case 1:return fmtDate(r.date); case 2:return esc(r.createdBy); default:return ''; }
  }));
  return html;
}
function studentFilePrint(id){
  const s = DB.students.find(x=>x.id===id); if(!s) return;
  const st = studentFileStats(s);
  const meta = [['الصف/الفصل',s.grade+'/'+s.section],['جوال ولي الأمر',s.guardianPhone||'—'],
    ['غياب',st.absent],['تأخر يومي',st.late],['تأخر صباحي',st.lateArr.length],['استئذان',st.earlyArr.length],
    ['مشكلات سلوكية',st.behavior.length],['درجة السلوك',st.score]];
  const section = (title, cols, rows) => `<h1 style="font-size:15px;margin-top:24px">${esc(title)} (${rows.length})</h1>` +
    (rows.length? '<table><thead><tr>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c==null?'—':c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'
      : '<p style="color:#64748b;font-size:13px">لا يوجد</p>');
  const extra = section('التأخر الصباحي', ['التاريخ','الوقت','السبب'], st.lateArr.map(r=>[fmtDate(r.date), r.time||'—', r.reason||'—']))
    + section('الاستئذان', ['التاريخ','الوقت','المستلم','صلة القرابة','السبب'], st.earlyArr.map(r=>[fmtDate(r.date), r.time||'—', r.receiver||'—', r.relation||'—', r.reason||'—']))
    + section('المشكلات السلوكية', ['الدرجة','المشكلة','الإجراء','الحسم','التاريخ'], st.behavior.map(r=>['الدرجة '+r.degree, r.problem, r.procedure, r.deduct?('−'+r.deduct):'—', fmtDate(r.date)]))
    + section('الحالات الإرشادية', ['النوع','الوصف','الحالة','الإنجاز'], st.cases.map(r=>[r.type, r.desc||'—', r.status, r.resolution||'—']))
    + section('الخطابات والنماذج الصادرة', ['النوع','التاريخ','بواسطة'], st.docs.map(r=>[r.type, fmtDate(r.date), r.createdBy]));
  printReport('الملف المرجعي — '+s.name, meta, null, null, {html: extra});
}

// ===== DEPUTIES =====
function secDeputyEdu(){ return genericSectionHTML('classroomVisits'); }
function secDeputyStudent(){ return genericSectionHTML('studentFollowups'); }
function secDeputySchool(){ return genericSectionHTML('facilities'); }

// ===== USERS =====
function secUsers(){
  const f = FORM;
  const perms = f.uPerms||{};
  let html = card('إضافة حساب سريع', `<div class="form-grid">
      ${fieldWrap('اسم المستخدم', renderFieldControl({k:'uName'}))}
      ${fieldWrap('كلمة المرور', renderFieldControl({k:'uPass',type:'password'}))}
      ${fieldWrap('الدور', `<select class="ctl" onchange="userRoleChange(this.value)"><option value="">— اختر —</option>${Object.keys(ROLES).map(r=>`<option value="${r}" ${f.uRole===r?'selected':''}>${esc(ROLES[r].label)}</option>`).join('')}</select>`)}
      ${fieldWrap('ربط بموظف', renderFieldControl({k:'uEmp',type:'select',options:DB.employees.map(e=>({v:e.id,l:e.name}))}))}
    </div>
    ${f.uRole? `<div style="margin-top:16px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">شبكة الصلاحيات التفصيلية (قالب الدور مُعبّأ — يمكن التعديل)</div>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:10px;font-weight:700;color:${C.navy}">
        <input type="checkbox" ${(f.uDash===true||f.uRole==='admin'||f.uRole==='manager')?'checked':''} onchange="setF('uDash',this.checked);rerenderSection();"> منح صلاحية لوحة المعلومات
      </label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:10px;font-weight:700;color:${C.navy}">
        <input type="checkbox" ${f.uMeetingMgr===true?'checked':''} onchange="setF('uMeetingMgr',this.checked);rerenderSection();"> منح صلاحية إدارة غرفة الاجتماعات (اجتماعات وتعاميم كاملة)
      </label>
      <div class="perm-grid">${NAV.filter(n=>n.id!=='dashboard').map(n=>`<label class="perm-item"><input type="checkbox" ${perms[n.id]?'checked':''} onchange="userPermToggle('${n.id}',this.checked)"> ${esc(n.label)}</label>`).join('')}</div>
    </div>`:''}
    <div class="row-gap">${btn('إنشاء الحساب','userCreate()','primary')}</div>`);
  html += card('الحسابات ('+DB.users.length+')', tableHTML(['المستخدم','الدور','لوحة المعلومات','إدارة الاجتماعات','الحالة','إجراء'], DB.users, (r,ci)=>{
    switch(ci){ case 0:return esc(r.username); case 1:return esc(ROLES[r.role]?ROLES[r.role].label:r.role); case 2:return r.canDashboard?pill('نعم',C.teal):pill('لا',C.muted);
      case 3:return r.meetingRoomManager?pill('نعم',C.teal):pill('لا',C.muted);
      case 4:return pill(r.active?'مفعّل':'معطّل', r.active?C.teal:C.red);
      case 5:{
        let out = `<div class="td-actions">${btn(r.active?'تعطيل':'تفعيل',`userToggleActive('${r.id}')`,'ghost')}${btn('لوحة',`userToggleDash('${r.id}')`,'ghost')}${btn('إدارة الاجتماعات',`userToggleMeetingMgr('${r.id}')`,'ghost')}${btn('إعادة تعيين كلمة المرور',`userResetPassword('${r.id}')`,'gold')}`;
        if(r.username!=='admin') out += btn('حذف',`userDelete('${r.id}')`,'red');
        return out+'</div>';
      }
      default:return ''; }
  }));
  return html;
}
function userRoleChange(v){ FORM.uRole=v; FORM.uPerms=rolePerms(v); FORM.uDash = v==='admin'||v==='manager'; rerenderSection(); }
function userPermToggle(id,checked){ FORM.uPerms = { ...(FORM.uPerms||{}), [id]:checked }; rerenderSection(); }
async function userCreate(){
  const f = FORM;
  if(!f.uName||!f.uPass||!f.uRole){ toast('اسم المستخدم وكلمة المرور والدور مطلوبة','red'); return; }
  if(DB.users.some(u=>u.username===f.uName.trim())){ toast('اسم المستخدم موجود مسبقاً','red'); return; }
  const salt = randSalt(); const hash = await sha256(salt+f.uPass);
  const perms = f.uPerms || rolePerms(f.uRole);
  update(d=>{ d.users.push({id:uid(),username:f.uName.trim(),role:f.uRole,salt,hash,employeeId:f.uEmp||'',active:true,perms,isDefaultPw:false,canDashboard: f.uDash===true || f.uRole==='admin'||f.uRole==='manager', meetingRoomManager: f.uMeetingMgr===true}); });
  logAction('إنشاء حساب: '+f.uName); clearF(); toast('تم إنشاء الحساب'); rerenderSection();
}
function userToggleActive(id){
  if(id===USER.id){ toast('لا يمكن تعطيل حسابك الحالي','red'); return; }
  update(d=>{ const u=d.users.find(x=>x.id===id); u.active=!u.active; }); toast('تم التحديث'); rerenderSection();
}
function userToggleDash(id){ update(d=>{ const u=d.users.find(x=>x.id===id); u.canDashboard=!u.canDashboard; }); toast('تم تحديث صلاحية اللوحة'); rerenderSection(); }
function userToggleMeetingMgr(id){ update(d=>{ const u=d.users.find(x=>x.id===id); u.meetingRoomManager=!u.meetingRoomManager; }); toast('تم تحديث صلاحية إدارة غرفة الاجتماعات'); rerenderSection(); }
function userDelete(id){
  if(id===USER.id){ toast('لا يمكن حذف حسابك','red'); return; }
  update(d=>{ d.users=d.users.filter(u=>u.id!==id); }); toast('تم الحذف'); rerenderSection();
}
async function userResetPassword(id){
  const u = DB.users.find(x=>x.id===id); if(!u) return;
  if(!confirm('سيتم إعادة كلمة مرور «'+u.username+'» إلى الرقم الافتراضي 123456، وسيُطلب منه تعيين كلمة جديدة عند الدخول. متابعة؟')) return;
  const salt = randSalt(); const hash = await sha256(salt+'123456');
  update(d=>{ const t=d.users.find(x=>x.id===id); t.salt=salt; t.hash=hash; t.isDefaultPw=true; });
  logAction('إعادة تعيين كلمة مرور: '+u.username);
  toast('تم إعادة تعيين كلمة المرور إلى 123456');
  rerenderSection();
}

// ===== LOG =====
function secLog(){
  return card('سجل الحركات (آخر '+DB.log.length+' حركة، بحد أقصى 600)', tableHTML(['المستخدم','الحركة','الوقت'], DB.log, (r,ci)=> ci===0?esc(r.user):ci===1?esc(r.action):esc(new Date(r.time).toLocaleString('ar-SA-u-ca-gregory'))),
    btn('تصدير CSV','logExportCSV()','ghost'));
}
function logExportCSV(){ exportCSV('سجل الحركات',['المستخدم','الحركة','الوقت'],DB.log.map(l=>[l.user,l.action,new Date(l.time).toLocaleString('ar-SA-u-ca-gregory')])); }

// ===== SETTINGS =====
function secSettings(){
  const st = DB.settings; const f = FORM; const isAdmin = USER.role==='admin'||USER.role==='manager';
  let html = card('بيانات المدرسة', `<div class="form-grid">
      ${fieldWrap('اسم المدرسة', `<input class="ctl" value="${esc(f.setName!=null?f.setName:st.schoolName)}" oninput="setF('setName',this.value);">`)}
      ${fieldWrap('مدير المدرسة', `<input class="ctl" value="${esc(f.setPrincipal!=null?f.setPrincipal:st.principal)}" oninput="setF('setPrincipal',this.value);">`)}
      ${fieldWrap('إدارة التعليم', `<input class="ctl" value="${esc(f.setEdu!=null?f.setEdu:st.edu)}" oninput="setF('setEdu',this.value);">`)}
      ${fieldWrap('تاريخ بداية الفصل', `<input type="date" class="ctl" value="${esc(f.setTerm!=null?f.setTerm:st.termStart)}" onchange="setF('setTerm',this.value);">`)}
    </div>
    <div style="margin-top:14px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      ${btn('حفظ','settingsSave()','primary')}
      <div style="display:flex;align-items:center;gap:10px">
        ${st.logo?`<img src="${st.logo}" style="height:44px;border-radius:8px;border:1px solid ${C.border}">`:''}
        <label style="font-size:13px;font-weight:600">شعار المدرسة (صورة ≤ 400KB): <input type="file" accept="image/*" onchange="settingsUploadLogo(this.files[0])" style="font-size:12px"></label>
      </div>
    </div>`);
  html += card('تغيير كلمة المرور', `<div class="form-grid">
      ${fieldWrap('كلمة المرور الحالية', renderFieldControl({k:'oldP',type:'password'}))}
      ${fieldWrap('كلمة المرور الجديدة', renderFieldControl({k:'newP',type:'password'}))}
    </div>
    <div class="row-gap">${btn('تغيير','changePassword()','gold')}</div>`);
  if(isAdmin){
    html += card('النسخ الاحتياطي وتصفير النظام', `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        ${btn('تصدير نسخة JSON','settingsBackup()','teal')}
        <label style="font-size:13px;font-weight:600;border:1px solid ${C.border};border-radius:9px;padding:9px 14px;cursor:pointer">استيراد نسخة JSON<input type="file" accept=".json" onchange="settingsRestore(this.files[0])" style="display:none"></label>
      </div>
      <div style="margin-top:16px;border-top:1px solid ${C.border};padding-top:16px">
        ${btn('تصفير النظام (تأكيد مزدوج)','settingsReset()','red')}
      </div>`);
    html += card('حالة المزامنة السحابية', `<div style="font-size:13px;color:${C.muted};line-height:1.9">${supa? 'المزامنة السحابية مفعّلة — تتزامن البيانات فورياً بين جميع الأجهزة المتصلة بنفس النظام.' : 'المزامنة السحابية غير متاحة حالياً — يعمل النظام محلياً على هذا الجهاز فقط.'}</div>`);
    html += card('بيانات تجريبية للاختبار', `<p style="font-size:13px;color:${C.muted};margin:0 0 10px">يضيف مجموعة أسماء تجريبية لمعلمين وموظفين إداريين وطلاب موزّعين على الصفوف والفصول، لتجربة أقسام النظام دون التأثير على أي بيانات موجودة.</p>
      ${btn('توليد بيانات تجريبية','seedDemoData()','teal')}`);
  }
  return html;
}
function seedDemoData(){
  if(!confirm('سيتم إضافة أسماء تجريبية لمعلمين وموظفين وطلاب للتجربة، دون حذف أي بيانات موجودة. هل تريد المتابعة؟')) return;
  const firstNames = ['عبدالله','محمد','عبدالعزيز','فيصل','سلطان','تركي','بندر','سعود','خالد','ناصر','فهد','سالم','ماجد','يوسف','عمر','إبراهيم','عبدالرحمن','وليد','طلال','حمد','بدر','راكان','مشعل','نواف','عبدالإله','زياد','أحمد','عبدالمجيد','رائد','سامي','تميم','عدنان','فارس','مازن','هشام'];
  const familyNames = ['القحطاني','الغامدي','الزهراني','العتيبي','الحربي','المطيري','الشهري','العنزي','الدوسري','السبيعي','البقمي','الرشيدي','الشمري','الجهني','السلمي'];
  const rndPhone = ()=> '05'+String(Math.floor(10000000+Math.random()*89999999));
  const teacherDefs = [
    ['أحمد سالم القحطاني','معلم لغتي','قسم اللغة العربية'],
    ['خالد عبدالله الغامدي','معلم رياضيات','قسم الرياضيات'],
    ['فهد ناصر الزهراني','معلم علوم','قسم العلوم'],
    ['عبدالرحمن محمد العتيبي','معلم تربية إسلامية وقرآن كريم','قسم التربية الإسلامية'],
    ['سلطان عمر الحربي','معلم لغة إنجليزية','قسم اللغة الإنجليزية'],
    ['بندر سعيد المطيري','معلم تربية بدنية','قسم النشاط'],
    ['ماجد فيصل الشهري','معلم حاسب آلي','قسم الحاسب'],
    ['يوسف تركي العنزي','معلم تربية فنية','قسم النشاط'],
    ['طلال حمد الدوسري','معلم لغتي','قسم اللغة العربية'],
    ['وليد راكان السبيعي','معلم رياضيات','قسم الرياضيات']
  ];
  const staffDefs = [
    ['سعود عبدالعزيز البقمي','وكيل الشؤون التعليمية','الإدارة المدرسية'],
    ['ناصر خالد الرشيدي','وكيل شؤون الطلاب','الإدارة المدرسية'],
    ['عبدالمجيد سالم الشمري','وكيل الشؤون المدرسية','الإدارة المدرسية'],
    ['زياد فهد الجهني','موجه طلابي','الإرشاد الطلابي'],
    ['رائد محمد السلمي','سكرتير المدرسة','الشؤون الإدارية'],
    ['مشعل عبدالله القحطاني','حارس أمن','الأمن والسلامة']
  ];
  const newEmployees = [
    ...teacherDefs.map(([name,title,dept])=>({id:uid(),name,title,dept,phone:rndPhone(),periods:{sun:5,mon:5,tue:4,wed:5,thu:4}})),
    ...staffDefs.map(([name,title,dept])=>({id:uid(),name,title,dept,phone:rndPhone(),periods:{sun:0,mon:0,tue:0,wed:0,thu:0}}))
  ];
  const sections = ['أ','ب','ج'];
  const newStudents = [];
  let fi=0, mi=1, li=0;
  GRADES.forEach(grade=>{
    sections.forEach(section=>{
      for(let i=0;i<4;i++){
        const name = firstNames[fi%firstNames.length]+' '+firstNames[mi%firstNames.length]+' '+familyNames[li%familyNames.length];
        fi+=3; mi+=5; li+=1;
        newStudents.push({id:uid(),name,grade,section,guardianPhone:rndPhone()});
      }
    });
  });
  update(d=>{ d.employees=[...newEmployees,...d.employees]; d.students=[...newStudents,...d.students]; });
  logAction('توليد بيانات تجريبية: '+newEmployees.length+' موظف/معلم، '+newStudents.length+' طالب');
  toast('تمت إضافة '+newEmployees.length+' موظف و'+newStudents.length+' طالب تجريبي');
  rerenderSection();
}
function settingsSave(){
  const f = FORM; const st = DB.settings;
  update(d=>{ d.settings.schoolName=f.setName||st.schoolName; d.settings.principal=f.setPrincipal||st.principal; d.settings.edu=f.setEdu||st.edu; d.settings.termStart=f.setTerm||st.termStart; });
  logAction('تحديث الإعدادات'); toast('تم حفظ الإعدادات'); rerenderSection();
}
function settingsUploadLogo(file){
  if(!file) return;
  if(file.size>400*1024){ toast('حجم الصورة يتجاوز 400KB','red'); return; }
  if(!file.type.startsWith('image/')){ toast('يُسمح بالصور فقط','red'); return; }
  const rd = new FileReader();
  rd.onload = e=>{ update(d=>{ d.settings.logo=e.target.result; }); toast('تم رفع الشعار'); rerenderSection(); };
  rd.readAsDataURL(file);
}
function settingsBackup(){
  const blob = new Blob([JSON.stringify(DB,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='backup_'+todayStr()+'.json'; a.click(); URL.revokeObjectURL(url);
  toast('تم تصدير النسخة الاحتياطية');
}
function settingsRestore(file){
  if(!file) return; const rd = new FileReader();
  rd.onload = e=>{
    try{
      const obj = JSON.parse(e.target.result);
      if(!isValidStore(obj)) throw 0;
      DB = mergeWithDefaults(obj);
      persist();
      toast('تم استيراد النسخة الاحتياطية');
      rerenderSection();
    }catch(err){ toast('ملف غير صالح','red'); }
  };
  rd.readAsText(file);
}
function settingsReset(){
  if(!confirm('تأكيد أول: هل تريد تصفير النظام؟ ستُحذف كل البيانات.')) return;
  if(!confirm('تأكيد نهائي: لا يمكن التراجع بعد هذه الخطوة. متابعة؟')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ===== BOOT =====
async function boot(){
  loadLocal();
  renderRoot();
  if(supa){
    setCloudStatus('loading');
    try{
      const remote = await withTimeout(cloudLoadRaw(), 8000);
      if(isValidStore(remote)){ DB = mergeWithDefaults(remote); saveLocal(); }
      setCloudStatus('synced');
    }catch(e){ console.warn('Cloud load error', e); setCloudStatus('offline'); }
  }
  await ensureDefaultUsers();
  restoreLoginSession();
  READY = true;
  renderRoot();
  if(supa) cloudSubscribe();
}
document.addEventListener('DOMContentLoaded', boot);

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{ navigator.serviceWorker.register('./service-worker.js').catch(()=>{}); });
}
