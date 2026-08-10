const menu=document.querySelector('.mobile-menu');
const nav=document.querySelector('.nav');
if(menu){menu.addEventListener('click',()=>nav.classList.toggle('open'))}

// Emails allowed into the executive Dashboard (backend admin accounts only).
// Kept in sync with the guard script in dashboard.html <head>.
const ADMIN_EMAILS=['thanachit.suang@mail.kmutt.ac.th','tassawan.com2547@gmail.com'];
const AUTH_EMAIL_KEY='sms_current_email';

function getCurrentEmail(){return(localStorage.getItem(AUTH_EMAIL_KEY)||'').trim().toLowerCase()}
function isAdminEmail(email){return ADMIN_EMAILS.includes((email||'').trim().toLowerCase())}

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
