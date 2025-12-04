// Basic interactivity for forms, nav, and download features.
// Put this in scripts.js and ensure it's referenced with defer in HTML.

// Utility: get and set local storage key for reports
const STORAGE_KEY = 'okoa_reports_v1';
function loadReports(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }catch(e){
    return [];
  }
}
function saveReports(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// set year
document.getElementById('year').textContent = new Date().getFullYear();

// nav toggle for mobile
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primary-nav');
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  primaryNav.classList.toggle('open');
});

// ANONYMOUS FORM
const anonForm = document.getElementById('anonForm');
const anonStatus = document.getElementById('anonStatus');
const downloadBtn = document.getElementById('downloadReports');
const clearBtn = document.getElementById('clearReports');

anonForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('incidentType').value;
  const details = document.getElementById('details').value.trim();
  const anonymous = document.getElementById('anonymousToggle').checked;

  if(!type || !details){
    anonStatus.textContent = 'Please fill required fields.';
    anonStatus.style.color = 'crimson';
    return;
  }

  const reports = loadReports();
  const record = {
    id: Math.random().toString(36).slice(2,9),
    type,
    details,
    anonymous,
    timestamp: new Date().toISOString()
  };
  reports.push(record);
  saveReports(reports);

  anonStatus.style.color = 'green';
  anonStatus.textContent = `Saved report (${record.id}). You can download or clear later.`;

  // Reset fields (preserve anonymous toggle state)
  document.getElementById('incidentType').value = '';
  document.getElementById('details').value = '';
});

// Download reports as CSV
downloadBtn.addEventListener('click', () => {
  const reports = loadReports();
  if(!reports.length){
    alert('No saved reports');
    return;
  }
  // create CSV
  const header = ['id','type','details','anonymous','timestamp'];
  const rows = reports.map(r => header.map(h=> JSON.stringify(r[h] ?? '')).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `okoa_reports_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Clear saved reports with confirmation
clearBtn.addEventListener('click', () => {
  if(confirm('Clear all saved reports locally? This cannot be undone.')){
    saveReports([]);
    document.getElementById('anonStatus').textContent = 'All local reports cleared.';
  }
});

// MISSING CHILD FORM
const missingForm = document.getElementById('missingForm');
const missingStatus = document.getElementById('missingStatus');
const copyReportBtn = document.getElementById('copyReport');

missingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const childName = document.getElementById('childName').value.trim();
  const age = document.getElementById('age').value.trim();
  const lastSeen = document.getElementById('lastSeen').value.trim();
  const photoUrl = document.getElementById('photoUrl').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();

  if(!childName || !lastSeen){
    missingStatus.style.color = 'crimson';
    missingStatus.textContent = 'Please provide child description and last seen location/time.';
    return;
  }

  // Build a share-ready message
  const msgLines = [
    'MISSING CHILD REPORT',
    `Name/Desc: ${childName}`,
    `Age: ${age || 'N/A'}`,
    `Last seen: ${lastSeen}`,
    `Photo: ${photoUrl || 'N/A'}`,
    `Contact: ${contactInfo || 'Anonymous'}`,
    `Reported: ${new Date().toLocaleString()}`
  ];
  // Store locally in the same storage for tracing (optional)
  const reports = loadReports();
  reports.push({ id: Math.random().toString(36).slice(2,9), type:'missing', payload: msgLines.join(' | '), timestamp: new Date().toISOString() });
  saveReports(reports);

  missingStatus.style.color = 'green';
  missingStatus.textContent = 'Report saved locally. Use "Copy for WhatsApp / Email" to share quickly.';

  // Reset fields
  missingForm.reset();
});

copyReportBtn.addEventListener('click', () => {
  const childName = document.getElementById('childName').value.trim() || '[no name provided]';
  const age = document.getElementById('age').value.trim() || 'N/A';
  const lastSeen = document.getElementById('lastSeen').value.trim() || 'N/A';
  const photoUrl = document.getElementById('photoUrl').value.trim() || 'N/A';
  const contactInfo = document.getElementById('contactInfo').value.trim() || 'Anonymous';
  const msg = [
    'MISSING CHILD REPORT',
    `Name/Desc: ${childName}`,
    `Age: ${age}`,
    `Last seen: ${lastSeen}`,
    `Photo: ${photoUrl}`,
    `Contact: ${contactInfo}`,
    `Reported: ${new Date().toLocaleString()}`
  ].join('\n');

  navigator.clipboard && navigator.clipboard.writeText(msg)
    .then(() => {
      missingStatus.style.color = 'green';
      missingStatus.textContent = 'Report copied to clipboard. Paste into WhatsApp or an email.';
    })
    .catch(() => {
      // fallback: open mailto
      const mailto = `mailto:?subject=${encodeURIComponent('Missing Child Report')}&body=${encodeURIComponent(msg)}`;
      window.open(mailto, '_blank');
    });
});

// Small UX: smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(href.length > 1){
      e.preventDefault();
      const el = document.querySelector(href);
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'start'});
        // close mobile nav if open
        if(primaryNav.classList.contains('open')){
          primaryNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded','false');
        }
      }
    }
  });
});

// Basic keyboard accessibility: close nav on escape
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    if(primaryNav.classList.contains('open')){
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      navToggle.focus();
    }
  }
});