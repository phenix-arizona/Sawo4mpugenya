/* ═══════════════════════════════════════════════
   SAWO 4 UGENYA — Campaign Website Scripts
   js/main.js
   ═══════════════════════════════════════════════ */

/* ── BACKEND URL ────────────────────────────── */
const BACKEND_URL = 'https://sawo-backend.onrender.com'; // ← update if your Render URL differs

/* ── MOBILE NAV ─────────────────────────────── */
const hamburger      = document.getElementById('hamburger');
const navDrawer      = document.getElementById('navDrawer');
const drawerOverlay  = document.getElementById('drawerOverlay');
const closeDrawerBtn = document.getElementById('closeDrawer');

hamburger.addEventListener('click', openNav);
closeDrawerBtn.addEventListener('click', closeNav);
drawerOverlay.addEventListener('click', closeNav);

// Close drawer when any drawer link is clicked
navDrawer.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', closeNav)
);

function openNav() {
  navDrawer.classList.add('open');
  drawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  navDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── NAVBAR SCROLL EFFECT ───────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.background = 'rgba(10,10,10,0.97)';
  } else {
    navbar.style.background = 'rgba(10,10,10,0.85)';
  }
});

/* ── SCROLL REVEAL ──────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        siblings.forEach((el, i) => {
          el.style.transitionDelay = `${i * 0.07}s`;
        });
      }
    });
  },
  { threshold: 0.1 }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ── TOAST NOTIFICATION ─────────────────────── */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ── DONATION AMOUNT SELECTOR ───────────────── */
function setAmount(value, btn) {
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const input = document.getElementById('donateAmount');
  input.value = value;
  if (value === '') input.focus();
}

/* ── FORMAT KENYAN PHONE TO SAFARICOM FORMAT ── */
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  return null;
}

/* ── INITIATE M-PESA DONATION ───────────────── */
async function initiateDonation() {
  const amountInput = document.getElementById('donateAmount');
  const phoneInput  = document.getElementById('donatePhone');
  const nameInput   = document.getElementById('donateName');
  const btn         = document.querySelector('#donate .donate-btn');

  const amount   = parseInt(amountInput.value);
  const rawPhone = phoneInput.value.trim();

  // Validate amount
  if (!amount || amount < 10) {
    showToast('⚠️ Please enter a valid amount (min KES 10)');
    amountInput.focus();
    return;
  }

  // Validate phone
  if (!rawPhone) {
    showToast('⚠️ Please enter your M-Pesa phone number');
    phoneInput.focus();
    return;
  }
  const phone = formatPhone(rawPhone);
  if (!phone) {
    showToast('⚠️ Enter a valid Kenyan number e.g. 0712 345 678');
    phoneInput.focus();
    return;
  }

  // Loading state
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Sending M-Pesa prompt...';
  btn.disabled  = true;

  try {
    const res = await fetch(`${BACKEND_URL}/mpesa/stkpush`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone:  phone,
        amount: amount,
        name:   nameInput?.value.trim() || 'Anonymous'
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Payment request failed.');
    }

    showToast(`📱 Check your phone! M-Pesa prompt sent to ${rawPhone.slice(0, 4)}****`);
    amountInput.value = '';
    phoneInput.value  = '';
    if (nameInput) nameInput.value = '';

  } catch (err) {
    console.error('Donation error:', err);
    // Network failure vs server error
    if (err instanceof TypeError && err.message.includes('fetch')) {
      showToast('❌ Cannot reach server. Check your connection and try again.');
    } else {
      showToast('❌ ' + (err.message || 'Payment failed. Please try again.'));
    }
  } finally {
    btn.innerHTML = originalText;
    btn.disabled  = false;
  }
}

/* ── VOLUNTEER FORM SUBMIT ───────────────────── */
async function submitVolunteer(e) {
  const btn    = e.currentTarget;
  const form   = btn.closest('.contact-form');
  const inputs = form.querySelectorAll('input, select');

  // Collect values
  const firstName = inputs[0]?.value.trim() || '';
  const lastName  = inputs[1]?.value.trim() || '';
  const rawPhone  = inputs[2]?.value.trim() || '';
  const email     = inputs[3]?.value.trim() || '';
  const ward      = form.querySelector('select[name="ward"]')?.value   || inputs[4]?.value || 'Not specified';
  const role      = form.querySelector('select[name="role"]')?.value   || inputs[5]?.value || 'Not specified';

  // Validate
  if (!firstName) {
    showToast('⚠️ Please enter your first name');
    inputs[0].focus();
    return;
  }
  if (!rawPhone) {
    showToast('⚠️ Please enter your phone number');
    inputs[2].focus();
    return;
  }
  const phone = formatPhone(rawPhone);
  if (!phone) {
    showToast('⚠️ Enter a valid Kenyan number e.g. 0712 345 678');
    inputs[2].focus();
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Registering...';
  btn.disabled  = true;

  try {
    const res = await fetch(`${BACKEND_URL}/volunteers`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, phone, email, ward, role })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    btn.innerHTML      = '✅ Registered! Asante sana!';
    btn.style.background = '#009950';
    showToast('🎉 Welcome to the Ugenya movement! We will reach out soon.');

    // Reset form after 4 seconds
    setTimeout(() => {
      btn.innerHTML      = originalText;
      btn.style.background = '';
      btn.disabled       = false;
      inputs.forEach(input => {
        if (input.tagName === 'SELECT') input.selectedIndex = 0;
        else input.value = '';
      });
    }, 4000);

  } catch (err) {
    console.error('Volunteer error:', err);
    if (err.message.includes('already registered')) {
      showToast('ℹ️ This number is already registered. Asante!');
    } else if (err instanceof TypeError && err.message.includes('fetch')) {
      showToast('❌ Cannot reach server. Check your connection.');
    } else {
      showToast('❌ ' + (err.message || 'Registration failed. Try again.'));
    }
    btn.innerHTML = originalText;
    btn.disabled  = false;
  }
}

/* ── ACTIVE NAV LINK ON SCROLL ──────────────── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color   = a.getAttribute('href') === `#${id}` ? 'var(--green)' : '';
          a.style.opacity = a.getAttribute('href') === `#${id}` ? '1' : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach(s => sectionObserver.observe(s));