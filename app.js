const menu=document.querySelector('.mobile-menu');
const nav=document.querySelector('.nav');
if(menu){menu.addEventListener('click',()=>nav.classList.toggle('open'))}

// Emails allowed into the executive Dashboard (backend admin accounts only).
// Kept in sync with the guard script in each admin page's <head>.
const ADMIN_EMAILS=['thanachit.suang@mail.kmutt.ac.th','tassawan.com2547@gmail.com'];
const AUTH_EMAIL_KEY='sms_current_email';
const EXTRA_ADMINS_KEY='sms_extra_admins';

function getCurrentEmail(){return(localStorage.getItem(AUTH_EMAIL_KEY)||'').trim().toLowerCase()}
function loadExtraAdmins(){try{return JSON.parse(localStorage.getItem(EXTRA_ADMINS_KEY)||'[]')}catch{return[]}}
function isAdminEmail(email){return ADMIN_EMAILS.concat(loadExtraAdmins()).includes((email||'').trim().toLowerCase())}

// Only show the Dashboard entry to logged-in admin accounts.
if(nav&&isAdminEmail(getCurrentEmail())&&!nav.querySelector('[href="dashboard.html"]')){
  const dashboard=document.createElement('a');
  dashboard.href='dashboard.html';
  dashboard.textContent='Dashboard';
  const login=nav.querySelector('.login-link');
  nav.insertBefore(dashboard,login||null);
}

// Demo-only login: remembers the entered email and routes admin accounts to the
// Dashboard. Replace this with real KMUTT SSO integration later.
const loginForm=document.querySelector('.login-card form');
if(loginForm){
  loginForm.onsubmit=(event)=>{
    event.preventDefault();
    const emailInput=loginForm.querySelector('input[type="email"]');
    const email=emailInput?emailInput.value.trim():'';
    localStorage.setItem(AUTH_EMAIL_KEY,email);
    if(isAdminEmail(email)){
      window.location.href='dashboard.html';
    }else{
      alert('เข้าสู่ระบบสำเร็จ (ตัวอย่าง) บัญชีนี้เป็นบัญชีนักศึกษา จึงไม่มีสิทธิ์เข้าหน้า Dashboard ผู้บริหาร');
      window.location.href='index.html';
    }
  };
}

// Render scholarships published from the admin "จัดการทุนการศึกษา" page
// (manage-scholarships.html) alongside the static demo cards on this page.
const cardsContainer=document.querySelector('.cards');
if(cardsContainer){
  function escapeHtml(str){return String(str||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function parseLocalDate(yyyyMmDd){const[y,m,d]=yyyyMmDd.split('-').map(Number);return new Date(y,m-1,d)}
  function daysUntil(deadline){
    const now=new Date();
    const today0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const deadline0=new Date(deadline.getFullYear(),deadline.getMonth(),deadline.getDate());
    return Math.round((deadline0-today0)/86400000);
  }

  let uploaded=[];
  try{uploaded=JSON.parse(localStorage.getItem('sms_scholarships')||'[]')}catch{uploaded=[]}

  uploaded
    .filter(s=>s.deadline&&daysUntil(parseLocalDate(s.deadline))>=0)
    .forEach(s=>{
      const days=daysUntil(parseLocalDate(s.deadline));
      const soon=days<=5;
      const card=document.createElement('article');
      card.className='card';
      card.innerHTML=`<h3>${escapeHtml(s.name)}</h3>
        <p class="small muted">${escapeHtml(s.org||s.description||'')}</p>
        <span class="tag ${soon?'soon':'open'}">${soon?`ปิดรับในอีก ${days} วัน`:'เปิดรับสมัคร'}</span>
        <div class="card-bottom">
          <span class="small">${escapeHtml(s.amount||'')}</span>
          <a class="text-link" href="${s.fileData}" target="_blank" rel="noopener">ดูประกาศ (PDF) →</a>
        </div>`;
      cardsContainer.appendChild(card);
    });
}
