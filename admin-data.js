// Shared helpers + demo data for the admin backend pages
// (dashboard.html, manage-scholarships.html, applicants.html, review.html,
// recipients.html, reports.html, system-users.html).

const BASE_ADMIN_EMAILS = ['thanachit.suang@mail.kmutt.ac.th', 'tassawan.com2547@gmail.com'];
const EXTRA_ADMINS_KEY = 'sms_extra_admins';
const AUTH_EMAIL_KEY = 'sms_current_email';
const APPLICANTS_KEY = 'sms_applicants';

function loadExtraAdmins() {
  try { return JSON.parse(localStorage.getItem(EXTRA_ADMINS_KEY) || '[]'); }
  catch { return []; }
}
function saveExtraAdmins(list) {
  localStorage.setItem(EXTRA_ADMINS_KEY, JSON.stringify(list));
}
function allAdminEmails() {
  return BASE_ADMIN_EMAILS.concat(loadExtraAdmins());
}
function isAdminEmail(email) {
  return allAdminEmails().includes((email || '').trim().toLowerCase());
}
function getCurrentEmail() {
  return (localStorage.getItem(AUTH_EMAIL_KEY) || '').trim().toLowerCase();
}

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
function formatThaiDate(yyyyMmDd) {
  if (!yyyyMmDd) return '-';
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
}
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ===== Applicants: seeded once, then persisted in localStorage ===== */
const REQUIRED_DOCS = ['ใบแสดงผลการเรียน', 'สำเนาบัตรประชาชน', 'เอกสารรับรองรายได้'];

function seedApplicants() {
  const rows = [
    ['นายกิตติพงษ์ วงศ์สุวรรณ', 'วิศวกรรมคอมพิวเตอร์', 3, 'ทุนเรียนดี', '3.82', 'pending', '2026-08-01', 0],
    ['นางสาวปิยะดา แสงทอง', 'วิศวกรรมไฟฟ้า', 2, 'ทุนบริษัท SCG', '3.45', 'approved', '2026-07-10', 0],
    ['นายธนกร ศรีสมบูรณ์', 'วิศวกรรมเครื่องกล', 4, 'ทุนบริษัท ปตท.', '3.15', 'rejected', '2026-07-05', 0],
    ['นางสาวสุพิชญา ใจดี', 'วิศวกรรมโยธา', 3, 'ทุนเรียนดี', '3.90', 'pending', '2026-08-05', 1],
    ['นายอนุชา พัฒนกิจ', 'วิศวกรรมคอมพิวเตอร์', 2, 'ทุนบริษัท SCG', '3.30', 'approved', '2026-07-15', 0],
    ['นางสาวรัตนาภรณ์ ชูเกียรติ', 'วิศวกรรมไฟฟ้า', 4, 'ทุนบริษัท ปตท.', '3.60', 'pending', '2026-08-03', 0],
    ['นายภานุวัฒน์ เลิศไพบูลย์', 'วิศวกรรมเครื่องกล', 3, 'ทุนเรียนดี', '2.95', 'rejected', '2026-07-08', 0],
    ['นางสาวชลธิชา บุญมี', 'วิศวกรรมโยธา', 2, 'ทุนบริษัท SCG', '3.55', 'approved', '2026-07-12', 0],
    ['นายวรากร ทองสุข', 'วิศวกรรมคอมพิวเตอร์', 4, 'ทุนบริษัท ปตท.', '3.70', 'pending', '2026-08-06', 2],
    ['นางสาวเบญจมาศ ศรีวิไล', 'วิศวกรรมไฟฟ้า', 3, 'ทุนเรียนดี', '3.40', 'approved', '2026-07-18', 0],
    ['นายกฤษณะ มั่นคง', 'วิศวกรรมเครื่องกล', 2, 'ทุนบริษัท SCG', '3.10', 'pending', '2026-08-07', 0],
    ['นางสาวนภัสสร แก้วมณี', 'วิศวกรรมโยธา', 4, 'ทุนบริษัท ปตท.', '3.25', 'rejected', '2026-07-09', 0]
  ];

  return rows.map((r, i) => {
    const missingCount = r[7];
    const submittedDocs = missingCount === 0 ? REQUIRED_DOCS.slice() : REQUIRED_DOCS.slice(0, REQUIRED_DOCS.length - missingCount);
    return {
      id: 'app' + (i + 1),
      name: r[0],
      dept: r[1],
      year: r[2],
      scholarship: r[3],
      gpa: r[4],
      status: r[5],
      appliedAt: r[6],
      approvedAt: r[5] === 'approved' ? r[6] : null,
      docs: submittedDocs
    };
  });
}

function loadApplicants() {
  const raw = localStorage.getItem(APPLICANTS_KEY);
  if (raw === null) {
    const seeded = seedApplicants();
    localStorage.setItem(APPLICANTS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try { return JSON.parse(raw); }
  catch { return []; }
}
function saveApplicants(list) {
  localStorage.setItem(APPLICANTS_KEY, JSON.stringify(list));
}

/* ===== Shared admin shell wiring (sidebar toggle + user email) ===== */
function initAdminShell() {
  const menu = document.getElementById('adminMenu');
  const scrim = document.getElementById('menuScrim');
  const button = document.getElementById('menuButton');
  function toggleMenu(show) {
    menu.classList.toggle('open', show);
    scrim.classList.toggle('open', show);
    button.setAttribute('aria-expanded', show);
  }
  button.onclick = () => toggleMenu(!menu.classList.contains('open'));
  scrim.onclick = () => toggleMenu(false);

  const nameEl = document.getElementById('adminUserName');
  if (nameEl) nameEl.textContent = getCurrentEmail() || 'ผู้ดูแลระบบ';
}
