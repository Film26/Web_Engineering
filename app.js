const menu=document.querySelector('.mobile-menu');
const nav=document.querySelector('.nav');
if(menu){menu.addEventListener('click',()=>nav.classList.toggle('open'))}

// Add the dashboard entry to all public-page menus without duplicating it.
if(nav&&!nav.querySelector('[href="dashboard.html"]')){
  const dashboard=document.createElement('a');
  dashboard.href='dashboard.html';
  dashboard.textContent='Dashboard';
  const login=nav.querySelector('.login-link');
  nav.insertBefore(dashboard,login||null);
}

// Demo-only login: opens the dashboard. Replace this with KMUTT SSO integration later.
const loginForm=document.querySelector('.login-card form');
if(loginForm){loginForm.onsubmit=(event)=>{event.preventDefault();window.location.href='dashboard.html';};}
