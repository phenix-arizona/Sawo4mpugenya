/* ═══════════════════════════════════════════════
   AMARA 4 UGENYA — Campaign Website Scripts
   js/main.js
   ═══════════════════════════════════════════════ */

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
        // Stagger children if grid
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
  // Deactivate all buttons
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
  // Activate clicked
  btn.classList.add('active');
  // Set input
  const input = document.getElementById('donateAmount');
  input.value = value;
  if (value === '') input.focus();
}

/* ── FORMAT KENYAN PHONE TO SAFARICOM FORMAT ── */
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return '254' + digits.slice(1);
  }
  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('7') && digits.length === 9) {
    return '254' + digits;
  }
  return null;
}

/* ── INITIATE M-PESA DONATION ───────────────── */
async function initiateDonation() {
  const amountInput = document.getElementById('donateAmount');
  const phoneInput  = document.getElementById('donatePhone');
  const btn         = document.querySelector('#donate .donate-btn');

  const amount = parseInt(amountInput.value);
  const rawPhone = phoneInput.value.trim();

  // Validate
  if (!amount || amount < 10) {
    showToast('⚠️ Please enter a valid amount (min KES 10)');
    amountInput.focus();
    return;
  }
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
  btn.disabled = true;

  try {
    /* ── CONNECT TO YOUR DARAJA BACKEND HERE ──────────────────────
    
       Replace this block with a real fetch call to your backend:

       const res = await fetch('https://api.yoursite.co.ke/mpesa/stkpush', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           phone:       phone,          // e.g. "254712345678"
           amount:      amount,          // e.g. 500
           accountRef:  'AMARA4UGENYA', // shows on M-Pesa receipt
           description: 'Campaign Donation - Ugenya MP 2027'
         })
       });

       const data = await res.json();
       if (!res.ok) throw new Error(data.message || 'Payment failed');

       Daraja STK Push requirements:
       ─────────────────────────────
       1. Safaricom Developer account → developer.safaricom.co.ke
       2. Register a Paybill or Buy Goods Till number
       3. Get Consumer Key + Consumer Secret (sandbox → then production)
       4. Backend endpoints needed:
          a) POST /auth   → fetch OAuth token (expires every 3600s)
          b) POST /stkpush → call BusinessPayBill or CustomerPayBillOnline
          c) POST /callback → receive Safaricom payment confirmation
       5. Your callback URL must be publicly accessible (use ngrok for dev)

    ─────────────────────────────────────────────────────────────── */

    // SIMULATION (remove when backend is ready)
    await new Promise(resolve => setTimeout(resolve, 2500));

    showToast(`📱 Check your phone! M-Pesa prompt sent to ${rawPhone.slice(0,4)}****`);
    amountInput.value = '';
    phoneInput.value = '';
    document.getElementById('donateName').value = '';

  } catch (err) {
    showToast('❌ Payment failed. Please try again or call our hotline.');
    console.error('Daraja error:', err);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/* ── VOLUNTEER FORM SUBMIT ───────────────────── */
function submitVolunteer(e) {
  const btn = e.currentTarget;

  // Simple validation: check first input (first name)
  const inputs = btn.closest('.contact-form').querySelectorAll('input, select');
  const firstName = inputs[0].value.trim();
  const phone     = inputs[2].value.trim();

  if (!firstName) {
    showToast('⚠️ Please enter your first name');
    inputs[0].focus();
    return;
  }
  if (!phone) {
    showToast('⚠️ Please enter your phone number');
    inputs[2].focus();
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = '✅ Registered! Asante sana!';
  btn.style.background = '#009950';
  btn.disabled = true;

  showToast('🎉 Welcome to the Ugenya movement! We will reach out soon.');

  // Reset after 4 seconds
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.background = '';
    btn.disabled = false;
    // Clear form
    inputs.forEach(input => {
      if (input.tagName === 'SELECT') input.selectedIndex = 0;
      else input.value = '';
    });
  }, 4000);
}

/* ── ACTIVE NAV LINK ON SCROLL ──────────────── */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color    = a.getAttribute('href') === `#${id}` ? 'var(--green)' : '';
          a.style.opacity  = a.getAttribute('href') === `#${id}` ? '1' : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach(s => sectionObserver.observe(s));
