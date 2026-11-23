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
  targetDate: new Date('2026-11-28T14:00:00'),
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
    }, 350);
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
  const toggleBtns = document.querySelectorAll('.nav-audio-btn, #audioToggle, .floating-audio-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleAudio(!isAudioPlaying);
    });
  });
}

function toggleAudio(enable) {
  isAudioPlaying = enable;
  const toggleBtns = document.querySelectorAll('.nav-audio-btn, #audioToggle, .floating-audio-btn');

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
   6. ENREGISTREMENT STATUTAIRE & PASS DÉLÉGUÉ (TÉLÉCHARGEMENT DIRECT & QR)
   ========================================================================== */
let currentPassDelegue = null;

function telechargerPassEnImage() {
  const delegue = currentPassDelegue;
  if (!delegue) {
    showToast("Veuillez d'abord générer votre pass.");
    return;
  }

  const qrCanvasElem = document.querySelector('#passQrCodeCanvas canvas');
  const qrImgElem = document.querySelector('#passQrCodeCanvas img');

  const canvas = document.createElement('canvas');
  const w = 640;
  const h = 880;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Fond Blanc pur
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // Cadre double prestige doré & vert impérial
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  ctx.strokeStyle = '#051D14';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  // Bandeau supérieur Vert Impérial
  ctx.fillStyle = '#051D14';
  ctx.fillRect(26, 26, w - 52, 142);

  // Liseré doré
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(26, 168, w - 52, 3);

  // Textes officiels
  ctx.textAlign = 'center';
  ctx.fillStyle = '#E6D7AB';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText("RÉPUBLIQUE DE CÔTE D'IVOIRE • FOI — UNION — DISCIPLINE", w / 2, 54);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px serif';
  ctx.fillText("A.E.E.M.C.I. — SOUS-COMITÉ DE KOUMASSI", w / 2, 84);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '12px sans-serif';
  ctx.fillText("Secrétariat Régional Abidjan-Sud (SERAS)", w / 2, 108);

  // Badge pilule d'événement
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(w / 2 - 160, 122, 320, 28, 14);
  } else {
    ctx.rect(w / 2 - 160, 122, 320, 28);
  }
  ctx.fill();

  ctx.fillStyle = '#051D14';
  ctx.font = 'bold 11.5px serif';
  ctx.fillText("PASS OFFICIEL D'ÉMARGEMENT • A.G.O. 2026", w / 2, 141);

  // Boîte Matricule Officiel
  ctx.fillStyle = '#E8F5EE';
  ctx.strokeStyle = '#104F36';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(46, 195, 330, 72, 10);
  } else {
    ctx.rect(46, 195, 330, 72);
  }
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#104F36';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText("MATRICULE OFFICIEL STATUTAIRE", 62, 220);

  ctx.fillStyle = '#051D14';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(delegue.matricule || 'AGO-KMSSI-2026', 62, 252);

  // Détails Délégué
  let y = 300;
  function addRow(label, value, bold) {
    ctx.fillStyle = '#777777';
    ctx.font = '11px sans-serif';
    ctx.fillText(label.toUpperCase(), 46, y);
    y += 20;

    ctx.fillStyle = '#051D14';
    ctx.font = bold ? 'bold 15px sans-serif' : '14px sans-serif';
    let valStr = String(value || '-');
    if (valStr.length > 34) valStr = valStr.substring(0, 32) + '...';
    ctx.fillText(valStr, 46, y);
    y += 30;
  }

  addRow("Nom & Prénoms du Délégué", delegue.nom, true);
  addRow("Qualité / Titre Statutaire", delegue.role, true);
  addRow("Section ou Institution Représentée", delegue.section, true);
  addRow("Date & Heure de la Session", "Samedi 28 Novembre 2026 dès 14h00 GMT", false);
  addRow("Lieu de l'Assemblée", "Lycée Municipal de Koumassi (LMK) — Cantine", false);

  // Boîte QR Code
  const qrBoxX = 410;
  const qrBoxY = 195;
  const qrBoxW = 184;
  const qrBoxH = 224;

  ctx.fillStyle = '#FBFDFB';
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 12);
  } else {
    ctx.rect(qrBoxX, qrBoxY, qrBoxW, qrBoxH);
  }
  ctx.fill();
  ctx.stroke();

  // Dessin du QR Code
  if (qrCanvasElem) {
    ctx.drawImage(qrCanvasElem, qrBoxX + 17, qrBoxY + 18, 150, 150);
  } else if (qrImgElem) {
    try {
      ctx.drawImage(qrImgElem, qrBoxX + 17, qrBoxY + 18, 150, 150);
    } catch (e) {
      console.warn("Could not draw qr img directly", e);
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#104F36';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText("SCAN COMMISSION ACCUEIL", qrBoxX + qrBoxW / 2, qrBoxY + 192);

  ctx.fillStyle = '#051D14';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(delegue.matricule || 'AGO-KMSSI-2026', qrBoxX + qrBoxW / 2, qrBoxY + 210);

  // Pied de badge
  ctx.fillStyle = '#E1ECE6';
  ctx.fillRect(46, 765, w - 92, 1.5);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#051D14';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText("SOUS LA HAUTE PRÉSIDENCE EFFECTIVE DU FRÈRE SOW MOHAMED", w / 2, 796);

  ctx.fillStyle = '#666666';
  ctx.font = '11.5px sans-serif';
  ctx.fillText("Présentez cette image à l'accueil pour valider votre émargement officiel.", w / 2, 822);

  // Déclenchement du téléchargement direct
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = `Pass-AGO-Koumassi-${delegue.matricule || '2026'}.png`;
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("Votre Pass officiel a été téléchargé avec succès !");
  } catch (err) {
    console.error("Erreur téléchargement direct image:", err);
    window.print();
  }
}


function telechargerPassEnPDF() {
  const delegue = currentPassDelegue;
  if (!delegue) {
    showToast("Veuillez d'abord générer votre pass.");
    return;
  }

  // 1. Tenter la génération directe d'un vrai fichier PDF (1 page exacte) avec jsPDF
  try {
    if (window.jspdf && window.jspdf.jsPDF) {
      showToast("⏳ Génération du Pass officiel PDF (1 page)...");
      
      const qrCanvasElem = document.querySelector('#passQrCodeCanvas canvas');
      const qrImgElem = document.querySelector('#passQrCodeCanvas img');

      const canvas = document.createElement('canvas');
      const w = 700;
      const h = 980;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // Fond Blanc pur
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      // Cadre double prestige doré & vert impérial
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, w - 36, h - 36);

      ctx.strokeStyle = '#051D14';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(26, 26, w - 52, h - 52);

      // Bandeau supérieur Vert Impérial
      ctx.fillStyle = '#051D14';
      ctx.fillRect(28, 28, w - 56, 146);

      // Liseré doré
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(28, 174, w - 56, 3);

      // Textes officiels
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E6D7AB';
      ctx.font = 'bold 11.5px sans-serif';
      ctx.fillText("RÉPUBLIQUE DE CÔTE D'IVOIRE • FOI — UNION — DISCIPLINE", w / 2, 58);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 19px serif';
      ctx.fillText("A.E.E.M.C.I. — SOUS-COMITÉ DE KOUMASSI", w / 2, 88);

      ctx.fillStyle = '#D4AF37';
      ctx.font = '12px sans-serif';
      ctx.fillText("Secrétariat Régional Abidjan-Sud (SERAS)", w / 2, 112);

      // Badge pilule d'événement
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(w / 2 - 165, 126, 330, 28, 14);
      else ctx.rect(w / 2 - 165, 126, 330, 28);
      ctx.fill();

      ctx.fillStyle = '#051D14';
      ctx.font = 'bold 11.5px serif';
      ctx.fillText("PASS OFFICIEL D'ÉMARGEMENT • A.G.O. 2026", w / 2, 145);

      // Boîte Matricule Officiel
      ctx.fillStyle = '#E8F5EE';
      ctx.strokeStyle = '#104F36';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(50, 205, 360, 76, 10);
      else ctx.rect(50, 205, 360, 76);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#104F36';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("MATRICULE OFFICIEL STATUTAIRE", 66, 230);

      ctx.fillStyle = '#051D14';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(delegue.matricule || 'AGO-KMSSI-2026', 66, 262);

      // Détails Délégué
      let y = 315;
      function addRow(label, value, bold) {
        ctx.fillStyle = '#777777';
        ctx.font = '11px sans-serif';
        ctx.fillText(label.toUpperCase(), 50, y);
        y += 20;

        ctx.fillStyle = '#051D14';
        ctx.font = bold ? 'bold 16px sans-serif' : '14px sans-serif';
        let valStr = String(value || '-');
        if (valStr.length > 36) valStr = valStr.substring(0, 34) + '...';
        ctx.fillText(valStr, 50, y);
        y += 32;
      }

      addRow("Nom & Prénoms du Délégué", delegue.nom, true);
      addRow("Qualité / Titre Statutaire", delegue.role, true);
      addRow("Section ou Institution Représentée", delegue.section, true);
      addRow("Date & Heure de la Session", "Samedi 28 Novembre 2026 dès 14h00 GMT", false);
      addRow("Lieu de l'Assemblée", "Lycée Municipal de Koumassi (LMK) — Cantine", false);

      // Boîte QR Code
      const qrBoxX = 445;
      const qrBoxY = 205;
      const qrBoxW = 200;
      const qrBoxH = 240;

      ctx.fillStyle = '#FBFDFB';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 12);
      else ctx.rect(qrBoxX, qrBoxY, qrBoxW, qrBoxH);
      ctx.fill();
      ctx.stroke();

      if (qrCanvasElem) {
        ctx.drawImage(qrCanvasElem, qrBoxX + 20, qrBoxY + 20, 160, 160);
      } else if (qrImgElem) {
        try { ctx.drawImage(qrImgElem, qrBoxX + 20, qrBoxY + 20, 160, 160); } catch(e){}
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#104F36';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText("SCAN COMMISSION ACCUEIL", qrBoxX + qrBoxW / 2, qrBoxY + 202);

      ctx.fillStyle = '#051D14';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(delegue.matricule || 'AGO-KMSSI-2026', qrBoxX + qrBoxW / 2, qrBoxY + 222);

      // Pied de badge
      ctx.fillStyle = '#E1ECE6';
      ctx.fillRect(50, 835, w - 100, 1.5);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#051D14';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("SOUS LA HAUTE PRÉSIDENCE EFFECTIVE DU FRÈRE SOW MOHAMED", w / 2, 868);

      ctx.fillStyle = '#666666';
      ctx.font = '11px sans-serif';
      ctx.fillText("Présentez ce pass officiel à l'accueil pour valider votre émargement.", w / 2, 894);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Dimensions sur page A4 (210 x 297 mm) — 1 PAGE STRICTE
      const targetW = 180;
      const targetH = (h / w) * targetW;
      const targetX = (210 - targetW) / 2;
      const targetY = (297 - targetH) / 2;

      pdf.addImage(dataUrl, 'JPEG', targetX, targetY, targetW, targetH);
      pdf.save(`Pass_Officiel_AGO_2026_${delegue.matricule || 'DELEGUE'}.pdf`);
      showToast("✅ Pass PDF officiel téléchargé (1 page) !");
      return;
    }
  } catch (e) {
    console.warn("jsPDF fallback:", e);
  }

  // 2. Fallback: impression ultra-isolée via iframe (1 page garantie)
  imprimerPassIsole();
}

function imprimerPassIsole() {
  const printable = document.getElementById('printablePassSection') || document.querySelector('.official-pass-printable');
  if (!printable) {
    document.body.classList.add('print-badge-active');
    window.print();
    setTimeout(() => document.body.classList.remove('print-badge-active'), 1500);
    return;
  }

  let printFrame = document.getElementById('passPrintIframe');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'passPrintIframe';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);
  }

  const doc = printFrame.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Pass Officiel AGO 2026</title>
      <link rel="stylesheet" href="style.css?v=20261119_v15">
      <style>
        @page { size: A5 portrait; margin: 8mm; }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #FFFFFF !important;
          font-family: 'Montserrat', sans-serif !important;
          height: auto !important;
        }
        .pass-modal-card {
          border: 2px solid #D4AF37 !important;
          box-shadow: none !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .official-pass-printable {
          padding: 20px 16px !important;
        }
        .pass-modal-close, .pass-modal-actions {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div class="pass-modal-card">
        ${printable.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 400);
}

/* ==========================================================================
   FONCTION GLOBALE D'AFFICHAGE DU PASS OFFICIEL (QR CODE & BILLETERIE)
   ========================================================================== */
function afficherModalPassOfficiel(delegue, phone, messageNotes) {
  if (!delegue) return;
  currentPassDelegue = delegue;

  const passModal = document.getElementById('passModalBackdrop');
  const passMatricule = document.getElementById('passMatricule');
  const passNom = document.getElementById('passNom');
  const passRole = document.getElementById('passRole');
  const passSection = document.getElementById('passSection');
  const passStatusPill = document.getElementById('passStatusPill');
  const btnPassNotifyWa = document.getElementById('btnPassNotifyWa');

  if (passMatricule) passMatricule.textContent = delegue.matricule || 'AGO-KMSSI-2026';
  if (passNom) passNom.textContent = delegue.nom || 'Délégué Statutaire';
  if (passRole) passRole.textContent = delegue.role || 'Délégué Officiel (Votant)';
  if (passSection) passSection.textContent = delegue.section || 'Sous-Comité Koumassi';
  if (passStatusPill) {
    passStatusPill.textContent = delegue.emarge ? "Présence Validée" : "En attente d'émargement";
  }

  // Rendu dynamique du QR Code
  const qrCanvas = document.getElementById('passQrCodeCanvas');
  if (qrCanvas) {
    qrCanvas.innerHTML = '';
    const qrPayload = [
      (delegue.matricule || 'AGO-KMSSI-2026').trim(),
      (delegue.nom || '').trim(),
      (delegue.section || '').trim(),
      (delegue.role || '').trim()
    ].join('|');
    let qrSuccess = false;

    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(qrCanvas, {
          text: qrPayload,
          width: 140,
          height: 140,
          colorDark: '#051D14',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.M
        });
        qrSuccess = true;
      } catch (qrErr) {
        console.warn("QRCode local render notice:", qrErr);
      }
    }

    setTimeout(() => {
      const hasChild = qrCanvas.querySelector('canvas, img');
      if (!hasChild || !qrSuccess) {
        qrCanvas.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(qrPayload)}" alt="QR Code ${qrPayload}" width="140" height="140" style="display:block; width:140px; height:140px; border-radius:6px; margin:0 auto;">`;
      }
    }, 50);
  }

  // Lien WhatsApp de notification
  if (btnPassNotifyWa) {
    let waText = `🏛️ *CONFIRMATION STATUTAIRE & PASS D'ÉMARGEMENT*\n`;
    waText += `*A.G.O. AEEMCI KOUMASSI 2026*\n`;
    waText += `*Sous la Présidence du Frère SOW Mohamed*\n`;
    waText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    waText += `🎫 *Matricule Officiel :* ${delegue.matricule}\n`;
    waText += `👤 *Nom & Prénoms :* ${delegue.nom}\n`;
    waText += `🏷️ *Qualité :* ${delegue.role}\n`;
    waText += `🏢 *Section :* ${delegue.section || 'Non précisée'}\n`;
    waText += `📱 *Contact :* ${phone || delegue.telephone || 'Non précisé'}\n`;
    waText += `📍 *Lieu :* Lycée Municipal de Koumassi (LMK) — Cantine\n`;
    waText += `📅 *Date :* Samedi 28 Novembre 2026 à 14h00 GMT\n`;
    if (messageNotes || delegue.message) {
      waText += `💬 *Note :* "${messageNotes || delegue.message}"\n`;
    }
    waText += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    waText += `_Mon Pass officiel avec QR Code d'émargement a été généré avec succès._`;

    btnPassNotifyWa.href = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(waText)}`;
  }

  if (passModal) {
    passModal.classList.add('active');
  }
}

function initRsvpForm() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const passModal = document.getElementById('passModalBackdrop');
  const btnClosePassModal = document.getElementById('btnClosePassModal');
  const btnPrintPassPdf = document.getElementById('btnPrintPassPdf');
  const btnDownloadPassImg = document.getElementById('btnDownloadPassImg');
  const existingPassCard = document.getElementById('rsvpExistingPassCard');
  const existingPassNameLabel = document.getElementById('existingPassNameLabel');
  const btnViewExistingPass = document.getElementById('btnViewExistingPass');
  const btnNewRegistration = document.getElementById('btnNewRegistration');
  const postSubmitActions = document.getElementById('rsvpPostSubmitActions');
  const btnReopenPassModal = document.getElementById('btnReopenPassModal');
  const btnRegisterAnotherPerson = document.getElementById('btnRegisterAnotherPerson');

  // Vérifier si un Pass a déjà été généré sur ce téléphone (Persistance comme Formation en Word)
  try {
    const savedPassData = localStorage.getItem('aeemci_ago_user_pass');
    if (savedPassData) {
      const savedPass = JSON.parse(savedPassData);
      if (savedPass && savedPass.matricule) {
        currentPassDelegue = savedPass;
        if (existingPassCard) {
          existingPassCard.style.display = 'flex';
          if (existingPassNameLabel) {
            existingPassNameLabel.textContent = `${savedPass.nom} • ${savedPass.matricule} (${savedPass.section || 'Section'})`;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Lecture du Pass local:", e);
  }

  // Consulter le Pass existant
  if (btnViewExistingPass) {
    btnViewExistingPass.addEventListener('click', () => {
      if (currentPassDelegue) {
        afficherModalPassOfficiel(currentPassDelegue);
      }
    });
  }

  // Nouvelle inscription (masquer l'encart existant pour inscrire un autre délégué)
  if (btnNewRegistration) {
    btnNewRegistration.addEventListener('click', () => {
      if (existingPassCard) existingPassCard.style.display = 'none';
      form.reset();
      const inputNom = document.getElementById('rsvpName');
      if (inputNom) inputNom.focus();
    });
  }

  // Téléchargement direct Pass en Image PNG
  if (btnDownloadPassImg) {
    btnDownloadPassImg.addEventListener('click', telechargerPassEnImage);
  }

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

  // Téléchargement PDF du Pass — 1 SEULE PAGE DIRECTE
  if (btnPrintPassPdf) {
    btnPrintPassPdf.addEventListener('click', telechargerPassEnPDF);
  }

  // Bouton Ré-ouvrir le Pass après soumission
  if (btnReopenPassModal) {
    btnReopenPassModal.addEventListener('click', () => {
      if (currentPassDelegue) {
        afficherModalPassOfficiel(currentPassDelegue);
      }
    });
  }

  // Bouton Inscrire un autre participant (Pour la Commission Accueil à la porte)
  if (btnRegisterAnotherPerson) {
    btnRegisterAnotherPerson.addEventListener('click', () => {
      form.reset();
      if (postSubmitActions) postSubmitActions.style.display = 'none';
      const inputNom = document.getElementById('rsvpName');
      if (inputNom) {
        inputNom.focus();
        inputNom.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast("Formulaire prêt pour le participant suivant !");
    });
  }

  // Soumission du formulaire d'inscription
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameInput = document.getElementById('rsvpName');
    const name = nameInput ? nameInput.value.trim() : '';
    const roleSelect = document.getElementById('rsvpRole');
    const role = roleSelect ? roleSelect.value : 'Délégué Officiel de Section (Votant)';
    const sectionInput = document.getElementById('rsvpSection');
    const section = sectionInput ? sectionInput.value.trim() : '';
    const attendanceSelect = document.getElementById('rsvpAttendance');
    const attendance = attendanceSelect ? attendanceSelect.value : 'Présence Confirmée avec Certitude';
    const phoneInput = document.getElementById('rsvpPhone');
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const messageInput = document.getElementById('rsvpMessage');
    const messageNotes = messageInput ? messageInput.value.trim() : '';

    if (!name) {
      showToast('Veuillez renseigner votre nom complet.');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!section) {
      showToast('Veuillez indiquer votre section ou institution représentée.');
      if (sectionInput) sectionInput.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Validation &amp; Génération du Pass...</span>`;
    }

    try {
      // 1. Enregistrement dans la Base de Données
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
      }

      if (!delegue || typeof delegue.then === 'function') {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        delegue = {
          matricule: 'AGO-KMSSI-26-' + code,
          nom: name,
          role: role,
          section: section || 'Sous-Comité Koumassi',
          telephone: phone,
          message: messageNotes,
          emarge: false
        };
      }

      // Sauvegarde dans le localStorage pour persistance sur ce téléphone
      try {
        localStorage.setItem('aeemci_ago_user_pass', JSON.stringify(delegue));
      } catch (err) {}

      // 2. Affichage immédiat du Pass Officiel dans le Modal
      afficherModalPassOfficiel(delegue, phone, messageNotes);

      // 3. Affichage du bloc post-soumission (Permet d'inscrire une autre personne ou revoir son pass)
      if (postSubmitActions) {
        postSubmitActions.style.display = 'block';
      }
      if (existingPassCard) {
        existingPassCard.style.display = 'flex';
        if (existingPassNameLabel) {
          existingPassNameLabel.textContent = `${delegue.nom} • ${delegue.matricule} (${delegue.section || 'Section'})`;
        }
      }

      if (typeof playSolemnChime === 'function') {
        playSolemnChime();
      }
      showToast(`Inscription confirmée avec succès ! Matricule : ${delegue.matricule}`);

    } catch (err) {
      console.error("Erreur lors de la validation du pass:", err);
      showToast("Une erreur s'est produite lors de la génération. Veuillez réessayer.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
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
        `📅 *Date :* Samedi 28 Novembre 2026 à 14h00 GMT\n` +
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
