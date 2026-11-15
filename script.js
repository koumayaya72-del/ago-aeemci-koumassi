/**
 * ==========================================================================
 * PORTAIL OFFICIEL A.G.O. 2026 — SOUS-COMITÉ AEEMCI DE KOUMASSI
 * Sous la Présidence effective du Frère SOW Mohamed
 * Script d'interaction épuré, sobre et professionnel :
 * - Compte à rebours dynamique
 * - Filtres du Bureau Exécutif par département
 * - Confirmation statutaire (RSVP) connectée à Supabase Cloud
 * - Génération instantanée du Pass Officiel avec QR Code
 * - Copie rapide des numéros Wave / Mobile Money
 * - Partage WhatsApp et impression
 * ==========================================================================
 */

const CONFIG = {
  // Date officielle de l'Assemblée Générale Ordinaire
  targetDate: new Date('2026-11-28T08:00:00'),
  // Numéro WhatsApp officiel du Comité d'Organisation / Secrétariat
  whatsappPhone: '2250711985810',
  // Titre pour le partage
  eventTitle: "Assemblée Générale Ordinaire — AEEMCI Sous-Comité de Koumassi",
  eventUrl: window.location.href
};

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScrollReveal();
  initBureauFilter();
  initRsvpForm();
  initCopyButtons();
  initShareFeatures();
});

/* ==========================================================================
   1. COMPTE À REBOURS DYNAMIQUE JUSQU'AU 28 NOVEMBRE 2026 À 08H00
   ========================================================================== */
function initCountdown() {
  const elDays = document.getElementById('countDays');
  const elHours = document.getElementById('countHours');
  const elMinutes = document.getElementById('countMinutes');
  const elSeconds = document.getElementById('countSeconds');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  function update() {
    const now = new Date().getTime();
    const diff = CONFIG.targetDate.getTime() - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    elDays.textContent = String(d).padStart(2, '0');
    elHours.textContent = String(h).padStart(2, '0');
    elMinutes.textContent = String(m).padStart(2, '0');
    elSeconds.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. FILTRES DYNAMIQUES DU BUREAU EXÉCUTIF
   ========================================================================== */
function initBureauFilter() {
  const filterButtons = document.querySelectorAll('.bureau-filter-btn');
  const memberCards = document.querySelectorAll('.member-card');

  if (!filterButtons.length || !memberCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      memberCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });
}

/* ==========================================================================
   3. APPARITION DOUCE AU SCROLL (SCROLL REVEAL)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  function checkReveal() {
    const triggerBottom = window.innerHeight * 0.92;
    reveals.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < triggerBottom) {
        el.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  checkReveal();
}

/* ==========================================================================
   4. ENREGISTREMENT STATUTAIRE (RSVP) & GÉNÉRATION DU PASS QR CODE
   ========================================================================== */
function initRsvpForm() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const passModal = document.getElementById('passModalBackdrop');
  const btnClosePassModal = document.getElementById('btnClosePassModal');
  const btnPrintPassPdf = document.getElementById('btnPrintPassPdf');
  const btnPassNotifyWa = document.getElementById('btnPassNotifyWa');

  // Fermeture du Modal Pass
  if (btnClosePassModal && passModal) {
    btnClosePassModal.addEventListener('click', () => {
      passModal.classList.remove('active');
    });
    passModal.addEventListener('click', (e) => {
      if (e.target === passModal) {
        passModal.classList.remove('active');
      }
    });
  }

  // Impression / Téléchargement PDF du Pass
  if (btnPrintPassPdf) {
    btnPrintPassPdf.addEventListener('click', () => {
      document.body.classList.add('print-badge-active');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-badge-active');
      }, 1200);
    });
  }

  // Soumission du formulaire d'inscription
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvpName').value.trim();
    const role = document.getElementById('rsvpRole').value;
    const section = document.getElementById('rsvpSection').value.trim();
    const attendance = document.getElementById('rsvpAttendance').value;
    const phone = document.getElementById('rsvpPhone').value.trim();
    const messageNotes = document.getElementById('rsvpMessage').value.trim();

    if (!name) {
      showToast('Veuillez renseigner votre nom complet.');
      return;
    }

    // 1. Enregistrement dans la Base de Données (Cloud Supabase ou Secours Local)
    let delegue = null;
    if (typeof ajouterInscriptionAGO === 'function') {
      try {
        delegue = await ajouterInscriptionAGO({
          nom: name,
          role: role,
          section: section,
          presence: attendance,
          telephone: phone,
          message: messageNotes
        });
      } catch (err) {
        console.warn("Erreur Supabase, secours local actif:", err);
      }
    }

    // Fallback matricule si besoin
    if (!delegue || !delegue.matricule) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      delegue = {
        matricule: 'AGO-KMSSI-26-' + code,
        nom: name,
        role: role,
        section: section || 'Sous-Comité Koumassi',
        emarge: false
      };
    }

    // 2. Remplissage des champs visuels du Pass Officiel
    const passMatricule = document.getElementById('passMatricule');
    const passNom = document.getElementById('passNom');
    const passRole = document.getElementById('passRole');
    const passSection = document.getElementById('passSection');
    const passStatusPill = document.getElementById('passStatusPill');

    if (passMatricule) passMatricule.textContent = delegue.matricule;
    if (passNom) passNom.textContent = delegue.nom;
    if (passRole) passRole.textContent = delegue.role;
    if (passSection) passSection.textContent = delegue.section || 'Sous-Comité Koumassi';
    if (passStatusPill) {
      passStatusPill.textContent = delegue.emarge ? "Présence Validée" : "En attente d'émargement";
    }

    // 3. Rendu dynamique du QR Code autonome
    const qrCanvas = document.getElementById('passQrCodeCanvas');
    if (qrCanvas && typeof QRCode !== 'undefined') {
      qrCanvas.innerHTML = '';
      const qrPayload = `${delegue.matricule}|${delegue.nom}|${delegue.section || 'Sous-Comité Koumassi'}|${delegue.role}`;
      new QRCode(qrCanvas, {
        text: qrPayload,
        width: 130,
        height: 130,
        colorDark: '#051D14',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    // 4. Lien de notification WhatsApp
    if (btnPassNotifyWa) {
      let waText = `🏛️ *CONFIRMATION STATUTAIRE & PASS D'ÉMARGEMENT*\n`;
      waText += `*A.G.O. AEEMCI KOUMASSI 2026*\n`;
      waText += `*Sous la Présidence du Frère SOW Mohamed*\n`;
      waText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      waText += `🎟️ *Matricule Officiel :* ${delegue.matricule}\n`;
      waText += `👤 *Nom & Prénoms :* ${delegue.nom}\n`;
      waText += `🏷️ *Qualité :* ${delegue.role}\n`;
      waText += `🏢 *Section :* ${delegue.section || 'Non précisée'}\n`;
      waText += `📱 *Contact :* ${phone || 'Non précisé'}\n`;
      waText += `📍 *Lieu :* Cantine du Lycée Municipal de Koumassi (LMK)\n`;
      waText += `📅 *Date :* Samedi 28 Novembre 2026 à 08h00 GMT\n`;
      if (messageNotes) {
        waText += `💬 *Note :* "${messageNotes}"\n`;
      }
      waText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      waText += `_Mon Pass officiel avec QR Code a été généré avec succès._`;

      btnPassNotifyWa.href = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(waText)}`;
    }

    // 5. Affichage du Modal Pass
    if (passModal) {
      passModal.classList.add('active');
    }

    showToast(`Inscription validée ! Matricule : ${delegue.matricule}`);
  });
}

/* ==========================================================================
   5. COPIE DU NUMÉRO WAVE / MOBILE MONEY
   ========================================================================= */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Numéro copié : ${textToCopy}`);
        }).catch(() => {
          showToast(`Numéro : ${textToCopy}`);
        });
      }
    });
  });
}

/* ==========================================================================
   6. PARTAGE SOCIAL & IMPRESSION
   ========================================================================== */
function initShareFeatures() {
  const shareBtn = document.getElementById('btnShareWhatsApp');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareText = `🏛️ *CONVOCATION OFFICIELLE — ASSEMBLÉE GÉNÉRALE ORDINAIRE (A.G.O.)*\n\n` +
        `L'AEEMCI Sous-Comité de Koumassi a l'honneur de vous convier à sa session statutaire sous la Présidence effective du *Frère SOW Mohamed*.\n\n` +
        `📅 *Date :* Samedi 28 Novembre 2026 à 08h00 GMT\n` +
        `📍 *Lieu :* Cantine du Lycée Municipal de Koumassi (LMK) — Abidjan\n\n` +
        `Découvrez le bureau exécutif, l'ordre du jour et confirmez votre présence ici :\n` +
        `${window.location.href}`;

      const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank');
    });
  }

  const printBtn = document.getElementById('btnPrintConvocation');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   7. NOTIFICATION TOAST
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
