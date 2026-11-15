/**
 * ==========================================================================
 * PORTAIL OFFICIEL A.G.O. — SOUS-COMITÉ AEEMCI DE KOUMASSI
 * Sous la Présidence du Frère SOW Mohamed
 * Script d'interaction : Enveloppe 3D, Synthétiseur Web Audio, Compte à rebours,
 * Filtres dynamiques du Bureau Exécutif, Génération du Pass QR Code,
 * Système d'émargement & Scanner Caméra de la Commission Accueil, Quorum en direct.
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

let audioCtx = null;
let isAudioPlaying = false;
let ambientInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initEnvelopeOpening();
  initCountdown();
  initScrollReveal();
  initAudioToggle();
  initBureauFilter();
  initRsvpForm();
  initCopyButtons();
  initShareFeatures();
  initScannerModule();
});

/* ==========================================================================
   1. OUVERTURE SOLENNELLE 3D DU SCEAU ET DE L'ENVELOPPE
   ========================================================================== */
function initEnvelopeOpening() {
  const seal = document.getElementById('waxSeal');
  const envelope = document.getElementById('envelopeWrapper');
  const introScreen = document.getElementById('introScreen');
  const prompt = document.getElementById('introPrompt');

  if (!seal || !envelope || !introScreen) return;

  function triggerOpen() {
    playSolemnChime();

    seal.classList.add('cracked');
    envelope.classList.add('opening');
    if (prompt) prompt.style.opacity = '0';

    setTimeout(() => {
      introScreen.classList.add('opened');
      toggleAudio(true);
    }, 700);
  }

  seal.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerOpen();
  });

  const btnOpenDirect = document.getElementById('btnOpenDirect');
  if (btnOpenDirect) {
    btnOpenDirect.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerOpen();
    });
  }

  envelope.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!introScreen.classList.contains('opened')) {
      triggerOpen();
    }
  });

  introScreen.addEventListener('click', () => {
    if (!introScreen.classList.contains('opened')) {
      triggerOpen();
    }
  });

  seal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerOpen();
    }
  });
}

/* ==========================================================================
   2. SYNTHÈSE SONORE WEB AUDIO (CARILLON SOLENNEL, HARMONIE & SCAN BEEPS)
   ========================================================================== */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSolemnChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [349.23, 440.00, 523.25, 659.25, 783.99]; // Fa, La, Do, Mi, Sol
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.14);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.14 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.14 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 1.45);
    });
  } catch (err) {
    console.warn('Audio non supporté :', err);
  }
}

function playGentleHarmonics() {
  try {
    const ctx = getAudioContext();
    if (!ctx || !isAudioPlaying) return;

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // Do Maj
      [349.23, 440.00, 523.25, 698.46], // Fa Maj
      [392.00, 493.88, 587.33, 783.99], // Sol Maj
      [329.63, 392.00, 493.88, 659.25]  // Mi min
    ];

    const chord = chords[Math.floor(Math.random() * chords.length)];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.18 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 2.6);
    });
  } catch (e) {}
}

function playScanBeep(success) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (success) {
      // Bip mélodieux aigu de validation
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Bip d'avertissement grave
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {}
}

function initAudioToggle() {
  const toggleBtns = document.querySelectorAll('.nav-audio-btn, #audioToggle');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleAudio(!isAudioPlaying);
    });
  });
}

function toggleAudio(enable) {
  isAudioPlaying = enable;
  const toggleBtns = document.querySelectorAll('.nav-audio-btn, #audioToggle');

  toggleBtns.forEach(btn => {
    if (isAudioPlaying) {
      btn.classList.add('playing');
    } else {
      btn.classList.remove('playing');
    }
  });

  if (isAudioPlaying) {
    playGentleHarmonics();
    if (ambientInterval) clearInterval(ambientInterval);
    ambientInterval = setInterval(playGentleHarmonics, 3400);
  } else {
    if (ambientInterval) clearInterval(ambientInterval);
  }
}

/* ==========================================================================
   3. COMPTE À REBOURS DYNAMIQUE EN DIRECT
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minEl = document.getElementById('countMinutes');
  const secEl = document.getElementById('countSeconds');

  if (!daysEl) return;

  function update() {
    const now = new Date().getTime();
    const distance = CONFIG.targetDate.getTime() - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minEl.textContent = '00';
      secEl.textContent = '00';
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minEl.textContent = String(m).padStart(2, '0');
    secEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   4. FILTRAGE DYNAMIQUE DES MEMBRES DU BUREAU
   ========================================================================== */
function initBureauFilter() {
  const filterButtons = document.querySelectorAll('.bureau-filter-btn');
  const memberCards = document.querySelectorAll('.member-card');

  if (!filterButtons.length || !memberCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      memberCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   5. ANIMATIONS D'APPARITION AU DÉFILEMENT (REVEAL)
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   6. ENREGISTREMENT STATUTAIRE & GÉNÉRATION DU PASS QR CODE (PDF)
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
  form.addEventListener('submit', (e) => {
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

    // 1. Enregistrement dans la Base de Données Locale
    let delegue = null;
    if (typeof ajouterInscriptionAGO === 'function') {
      delegue = ajouterInscriptionAGO({
        nom: name,
        role: role,
        section: section,
        presence: attendance,
        telephone: phone,
        message: messageNotes
      });
    } else {
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

    // 3. Rendu dynamique du QR Code
    const qrCanvas = document.getElementById('passQrCodeCanvas');
    if (qrCanvas && typeof QRCode !== 'undefined') {
      qrCanvas.innerHTML = '';
      new QRCode(qrCanvas, {
        text: delegue.matricule,
        width: 140,
        height: 140,
        colorDark: '#051D14',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    // 4. Lien de notification WhatsApp
    if (btnPassNotifyWa) {
      let waText = `🏛️ *CONFIRMATION STATUTAIRE & PASS D'ÉMARGEMENT*\n`;
      waText += `*A.G.O. AEEMCI KOUMASSI 2026*\n`;
      waText += `*Sous la Présidence du Frère SOW Mohamed*\n`;
      waText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      waText += `🎫 *Matricule Officiel :* ${delegue.matricule}\n`;
      waText += `👤 *Nom & Prénoms :* ${delegue.nom}\n`;
      waText += `🏷️ *Qualité :* ${delegue.role}\n`;
      waText += `🏢 *Section :* ${delegue.section || 'Non précisée'}\n`;
      waText += `📱 *Contact :* ${phone || 'Non précisé'}\n`;
      waText += `📍 *Lieu :* Lycée Municipal de Koumassi (LMK) — Cantine\n`;
      waText += `📅 *Date :* Samedi 28 Novembre 2026 à 08h00 GMT\n`;
      if (messageNotes) {
        waText += `💬 *Note :* "${messageNotes}"\n`;
      }
      waText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      waText += `_Mon Pass officiel avec QR Code d'émargement a été généré avec succès._`;

      btnPassNotifyWa.href = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(waText)}`;
    }

    // 5. Affichage du Modal Pass
    if (passModal) {
      passModal.classList.add('active');
    }

    playSolemnChime();
    showToast(`Inscription validée ! Matricule : ${delegue.matricule}`);
  });
}

/* ==========================================================================
   7. MODULE COMMISSION ACCUEIL : SCANNER QR CODE & ÉMARGEMENT EN DIRECT
   ========================================================================== */
function initScannerModule() {
  const btnOpenScanner = document.getElementById('btnOpenScanner');
  const btnCloseScannerModal = document.getElementById('btnCloseScannerModal');
  const scannerModal = document.getElementById('scannerModalBackdrop');
  const btnToggleCamera = document.getElementById('btnToggleCamera');
  const manualInput = document.getElementById('manualCheckinInput');
  const btnManualValider = document.getElementById('btnManualValider');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const resultCard = document.getElementById('scanResultCard');
  const resultTitle = document.getElementById('scanResultTitle');
  const resultDesc = document.getElementById('scanResultDesc');
  const tableBody = document.getElementById('registreTableBody');

  let html5QrScanner = null;
  let isCameraScanning = false;
  let lastScannedCode = '';
  let lastScanTimestamp = 0;

  function refreshScannerUI() {
    updateQuorumStats();
    renderRegistreTable();
  }

  function updateQuorumStats() {
    if (typeof calculerStatistiquesAGO !== 'function') return;
    const stats = calculerStatistiquesAGO();

    const elTotal = document.getElementById('statTotalInscrits');
    const elEmarges = document.getElementById('statTotalEmarges');
    const elSections = document.getElementById('statSectionsCount');
    const elStatus = document.getElementById('statQuorumStatus');
    const boxQuorum = document.getElementById('statQuorumBox');

    if (elTotal) elTotal.textContent = stats.total;
    if (elEmarges) elEmarges.textContent = stats.emarges;
    if (elSections) elSections.textContent = `${stats.sectionsRepresentees} / 21`;

    if (elStatus && boxQuorum) {
      if (stats.quorumAtteint) {
        elStatus.textContent = 'ATTEINT (2/3)';
        elStatus.style.color = '#0E733D';
        boxQuorum.style.background = '#E8F8EE';
        boxQuorum.style.borderColor = '#2ECC71';
      } else {
        elStatus.textContent = `EN COURS (${stats.sectionsRepresentees}/${stats.quorumObjectif})`;
        elStatus.style.color = '#8C5305';
        boxQuorum.style.background = '#FFF7E6';
        boxQuorum.style.borderColor = '#F39C12';
      }
    }
  }

  function renderRegistreTable() {
    if (!tableBody || typeof getRegistreAGO !== 'function') return;
    const registre = getRegistreAGO();

    if (!registre.length) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 20px;">Aucun délégué enregistré dans le registre.</td></tr>`;
      return;
    }

    tableBody.innerHTML = registre.map(d => {
      const badgeClass = d.emarge ? 'badge-emarge' : 'badge-attente';
      const badgeLabel = d.emarge ? '✅ Présent' : '⏳ En attente';
      const dateEmarge = d.date_emargement || '-';
      const actionBtn = !d.emarge 
        ? `<button type="button" class="btn-quick-emarge" data-matricule="${d.matricule}" style="background:#104F36; color:#FFF; border:none; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer; margin-left:6px; font-weight:700;">Émarger</button>` 
        : '';

      return `
        <tr>
          <td><strong style="font-family: monospace; color: #104F36;">${d.matricule}</strong></td>
          <td><strong>${d.nom}</strong></td>
          <td>${d.section || '-'}</td>
          <td style="font-size: 11px;">${d.role || '-'}</td>
          <td>
            <span class="${badgeClass}">${badgeLabel}</span>
            ${actionBtn}
          </td>
          <td style="font-size: 11.5px; color: #555;">${dateEmarge}</td>
        </tr>
      `;
    }).join('');

    // Raccourcis de validation directe par ligne
    const quickBtns = tableBody.querySelectorAll('.btn-quick-emarge');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mat = btn.getAttribute('data-matricule');
        traiterMatricule(mat);
      });
    });
  }

  function traiterMatricule(rawCode) {
    if (!rawCode) return;
    let matricule = rawCode.trim();

    // Gestion du code si contenu dans une URL ou format query
    if (matricule.includes('matricule=')) {
      matricule = matricule.split('matricule=')[1].split('&')[0];
    } else if (matricule.includes('/')) {
      matricule = matricule.split('/').pop();
    }

    // 1. Recherche par matricule
    let res = validerEmargementParMatricule(matricule);

    // 2. Si non trouvé par matricule direct, recherche souple par nom
    if (res.introuvable && typeof getRegistreAGO === 'function') {
      const all = getRegistreAGO();
      const match = all.find(item => item.nom.toLowerCase().includes(matricule.toLowerCase()));
      if (match) {
        res = validerEmargementParMatricule(match.matricule);
      }
    }

    if (!resultCard || !resultTitle || !resultDesc) return;

    resultCard.classList.remove('success', 'warning', 'error');

    if (res.success) {
      playScanBeep(true);
      resultCard.classList.add('success');
      resultTitle.innerHTML = `<span>✅ ÉMARGEMENT VALIDÉ AVEC SUCCÈS</span>`;
      resultDesc.innerHTML = `<strong>${res.delegue.nom}</strong> (${res.delegue.role})<br>Section : <strong>${res.delegue.section}</strong> • Matricule : <code>${res.delegue.matricule}</code><br><span style="font-size: 11px; color: #0E6234;">Présence confirmée et comptabilisée pour le Quorum.</span>`;
      showToast(`Présence validée : ${res.delegue.nom}`);
    } else if (res.dejaEmarge) {
      playScanBeep(false);
      resultCard.classList.add('warning');
      resultTitle.innerHTML = `<span>⚠️ DÉLÉGUÉ DÉJÀ ÉMARGÉ</span>`;
      resultDesc.innerHTML = `<strong>${res.delegue.nom}</strong> (${res.delegue.section}) a déjà validé sa présence le <strong>${res.delegue.date_emargement}</strong>.<br><span style="font-size: 11px;">Ce badge a déjà été scanné à l'accueil.</span>`;
      showToast(`Attention : Délégué déjà émargé !`);
    } else {
      playScanBeep(false);
      resultCard.classList.add('error');
      resultTitle.innerHTML = `<span>❌ MATRICULE OU NOM NON RECONNU</span>`;
      resultDesc.innerHTML = `Le code ou nom <strong>"${rawCode}"</strong> ne correspond à aucun délégué dans le registre officiel.<br><span style="font-size: 11px;">Vérifiez l'orthographe ou inscrivez le délégué via le formulaire.</span>`;
      showToast(`Matricule non reconnu !`);
    }

    refreshScannerUI();
  }

  // Logique du scanner Caméra
  function startCamera() {
    if (typeof Html5Qrcode === 'undefined') {
      showToast("Module caméra QR non chargé. Utilisez la validation manuelle ci-dessous.");
      return;
    }

    if (!html5QrScanner) {
      html5QrScanner = new Html5Qrcode("qrCameraReader");
    }

    btnToggleCamera.disabled = true;
    btnToggleCamera.innerHTML = `<span>Initialisation de la caméra...</span>`;

    html5QrScanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 220, height: 220 }
      },
      (decodedText) => {
        const now = Date.now();
        if (decodedText === lastScannedCode && (now - lastScanTimestamp) < 3000) {
          return;
        }
        lastScannedCode = decodedText;
        lastScanTimestamp = now;

        traiterMatricule(decodedText);
      },
      () => {
        // En attente de lecture
      }
    ).then(() => {
      isCameraScanning = true;
      btnToggleCamera.disabled = false;
      btnToggleCamera.innerHTML = `<span>⏹️ Arrêter la Caméra</span>`;
      btnToggleCamera.style.background = '#C0392B';
    }).catch(err => {
      console.warn("Erreur démarrage caméra:", err);
      isCameraScanning = false;
      btnToggleCamera.disabled = false;
      btnToggleCamera.innerHTML = `<span>📷 Activer la Caméra</span>`;
      btnToggleCamera.style.background = '';
      showToast("Caméra non disponible (environnement local ou autorisation). Utilisez la saisie manuelle.");
    });
  }

  function stopCamera() {
    if (html5QrScanner && isCameraScanning) {
      html5QrScanner.stop().then(() => {
        isCameraScanning = false;
        btnToggleCamera.innerHTML = `<span>📷 Activer la Caméra</span>`;
        btnToggleCamera.style.background = '';
      }).catch(err => {
        console.warn("Erreur arrêt caméra:", err);
        isCameraScanning = false;
      });
    }
  }

  // Événement du bouton caméra
  if (btnToggleCamera) {
    btnToggleCamera.addEventListener('click', () => {
      if (isCameraScanning) {
        stopCamera();
      } else {
        startCamera();
      }
    });
  }

  // Émargement Manuel
  if (btnManualValider && manualInput) {
    btnManualValider.addEventListener('click', () => {
      const val = manualInput.value.trim();
      if (!val) {
        showToast("Veuillez saisir un matricule ou un nom.");
        return;
      }
      traiterMatricule(val);
      manualInput.value = '';
    });

    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnManualValider.click();
      }
    });
  }

  // Export CSV
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      if (typeof exporterRegistreEnCSV === 'function') {
        exporterRegistreEnCSV();
        showToast("Export Excel (CSV) du registre généré avec succès !");
      }
    });
  }

  // Ouverture du modal
  if (btnOpenScanner && scannerModal) {
    btnOpenScanner.addEventListener('click', () => {
      scannerModal.classList.add('active');
      refreshScannerUI();
    });
  }

  // Fermeture du modal
  if (btnCloseScannerModal && scannerModal) {
    btnCloseScannerModal.addEventListener('click', () => {
      scannerModal.classList.remove('active');
      stopCamera();
    });

    scannerModal.addEventListener('click', (e) => {
      if (e.target === scannerModal) {
        scannerModal.classList.remove('active');
        stopCamera();
      }
    });
  }
}

/* ==========================================================================
   8. COPIE RAPIDE DU NUMÉRO WAVE / MOBILE MONEY
   ========================================================================== */
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
   9. PARTAGE SOCIAL & IMPRESSION OFFICIELLE
   ========================================================================== */
function initShareFeatures() {
  const shareBtn = document.getElementById('btnShareWhatsApp');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareText = `🏛️ *CONVOCATION OFFICIELLE — ASSEMBLÉE GÉNÉRALE ORDINAIRE (A.G.O.)*\n\n` +
        `L'AEEMCI Sous-Comité de Koumassi a l'honneur de vous convier à sa session statutaire sous la Présidence effective du *Frère SOW Mohamed*.\n\n` +
        `📅 *Date :* Samedi 28 Novembre 2026 à 08h00 GMT\n` +
        `📍 *Lieu :* Lycée Municipal de Koumassi (LMK) — Cantine\n\n` +
        `Découvrez la galerie des anciens présidents, l'équipe du bureau actuel, l'ordre du jour et confirmez votre présence ici :\n` +
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

/* Notification toast */
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
  }, 3200);
}
