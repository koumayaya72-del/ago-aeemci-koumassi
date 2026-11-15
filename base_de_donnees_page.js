/**
 * ==========================================================================
 * CONSOLE DE GESTION & SYSTÈME DE SCAN INTÉGRÉ DANS LA BASE DE DONNÉES
 * Assemblée Générale Ordinaire 2026 — AEEMCI Sous-Comité de Koumassi
 * ==========================================================================
 */

let dbAudioCtx = null;
let html5ScannerInstance = null;
let isCameraActive = false;
let currentFilter = 'all';
let currentSearchQuery = '';
let lastScannedMatricule = '';
let lastScanTime = 0;

document.addEventListener('DOMContentLoaded', () => {
  initDbConsole();
});

function initDbConsole() {
  refreshAllDbViews();

  // Écouteurs de la Caméra
  const btnToggleCamera = document.getElementById('btnToggleDbCamera');
  if (btnToggleCamera) {
    btnToggleCamera.addEventListener('click', toggleCameraScanning);
  }

  // Écouteurs de la Saisie Manuelle
  const btnManual = document.getElementById('btnDbManualCheckin');
  const inputManual = document.getElementById('dbManualInput');
  if (btnManual && inputManual) {
    btnManual.addEventListener('click', () => {
      handleManualCheckin(inputManual.value);
    });
    inputManual.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleManualCheckin(inputManual.value);
      }
    });
  }

  // Filtre de recherche dynamique dans le tableau
  const searchInput = document.getElementById('dbTableSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderMainTable();
    });
  }

  // Onglets / Pilules de filtre
  const pills = document.querySelectorAll('.db-filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      renderMainTable();
    });
  });

  // Export CSV
  const btnExport = document.getElementById('btnDbExportCSV');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (typeof exporterRegistreEnCSV === 'function') {
        exporterRegistreEnCSV();
        showDbToast("Exportation Excel (CSV) du registre générée avec succès !");
      }
    });
  }

  // Impression de la liste
  const btnPrintTable = document.getElementById('btnDbPrintTable');
  if (btnPrintTable) {
    btnPrintTable.addEventListener('click', () => {
      window.print();
    });
  }

  // Réinitialisation de démonstration
  const btnReset = document.getElementById('btnDbResetDemo');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm("Voulez-vous réinitialiser le registre avec les données statutaires de départ ?")) {
        localStorage.removeItem(STORAGE_KEY_AGO);
        refreshAllDbViews();
        showDbToast("Registre réinitialisé avec succès.");
      }
    });
  }

  // Modals : Pass & Nouveau Délégué & Supabase
  initModalListeners();
  initNewDelegateForm();
  initSupabaseModal();
  syncCloudInitial();
}

async function syncCloudInitial() {
  if (typeof isSupabaseActif === 'function' && isSupabaseActif()) {
    showDbToast("⚡ Connexion Cloud Supabase...");
    if (typeof synchroniserDepuisSupabase === 'function') {
      await synchroniserDepuisSupabase();
      refreshAllDbViews();
      showDbToast("🟢 Synchronisé avec le Cloud Supabase !");
    }

    // Écoute en temps réel (Realtime)
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        supabaseClient.channel('ago_inscriptions_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'ago_inscriptions' }, async () => {
            if (typeof synchroniserDepuisSupabase === 'function') {
              await synchroniserDepuisSupabase();
              refreshAllDbViews();
              showDbToast("🔄 Base mise à jour en direct (Cloud)");
            }
          })
          .subscribe();
      } catch (e) {
        console.warn("Erreur souscription realtime:", e);
      }
    }
  }
}

/* ==========================================================================
   1. GESTION DES SONS WEB AUDIO
   ========================================================================== */
function playAudioFeedback(type) {
  const checkAudio = document.getElementById('dbAudioCheck');
  if (checkAudio && !checkAudio.checked) return;

  try {
    if (!dbAudioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) dbAudioCtx = new AudioContextClass();
    }
    if (dbAudioCtx && dbAudioCtx.state === 'suspended') {
      dbAudioCtx.resume();
    }
    if (!dbAudioCtx) return;

    const osc = dbAudioCtx.createOscillator();
    const gain = dbAudioCtx.createGain();

    if (type === 'success') {
      // Bip aigu d'émargement validé
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, dbAudioCtx.currentTime);
      osc.frequency.setValueAtTime(1320, dbAudioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, dbAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dbAudioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(dbAudioCtx.destination);
      osc.start();
      osc.stop(dbAudioCtx.currentTime + 0.32);
    } else if (type === 'warning') {
      // Bip double d'avertissement (déjà émargé)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, dbAudioCtx.currentTime);
      osc.frequency.setValueAtTime(330, dbAudioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, dbAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dbAudioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(dbAudioCtx.destination);
      osc.start();
      osc.stop(dbAudioCtx.currentTime + 0.38);
    } else {
      // Bip grave d'erreur
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, dbAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.18, dbAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dbAudioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(dbAudioCtx.destination);
      osc.start();
      osc.stop(dbAudioCtx.currentTime + 0.32);
    }
  } catch (e) {
    console.warn("Audio non supporté:", e);
  }
}

/* ==========================================================================
   2. MISE À JOUR GLOBALE DE L'INTERFACE
   ========================================================================== */
function refreshAllDbViews() {
  updateKpis();
  renderMainTable();
  renderRecentList();
}

function updateKpis() {
  if (typeof calculerStatistiquesAGO !== 'function') return;
  const stats = calculerStatistiquesAGO();
  const registre = getRegistreAGO();

  const totalInscrits = stats.total;
  const totalEmarges = stats.emarges;
  const totalAttente = totalInscrits - totalEmarges;
  const taux = totalInscrits > 0 ? Math.round((totalEmarges / totalInscrits) * 100) : 0;

  // KPIs
  const elInscrits = document.getElementById('dbKpiTotalInscrits');
  const elEmarges = document.getElementById('dbKpiTotalEmarges');
  const elAttente = document.getElementById('dbKpiTotalAttente');
  const elSections = document.getElementById('dbKpiSectionsCount');
  const elQuorumStatus = document.getElementById('dbKpiQuorumStatus');
  const cardQuorum = document.getElementById('dbKpiQuorumCard');
  const elTaux = document.getElementById('dbKpiTauxPresence');

  if (elInscrits) elInscrits.textContent = totalInscrits;
  if (elEmarges) elEmarges.textContent = totalEmarges;
  if (elAttente) elAttente.textContent = totalAttente;
  if (elSections) elSections.textContent = `${stats.sectionsRepresentees} / 21`;
  if (elTaux) elTaux.textContent = `${taux}% (${totalEmarges} présents)`;

  if (elQuorumStatus && cardQuorum) {
    if (stats.quorumAtteint) {
      elQuorumStatus.innerHTML = `<strong style="color:#0E733D;">✅ QUORUM ATTEINT (2/3)</strong>`;
      cardQuorum.style.background = '#E8F8EE';
      cardQuorum.style.borderColor = '#2ECC71';
    } else {
      elQuorumStatus.innerHTML = `Requis : 14 sections (reste <strong>${Math.max(0, 14 - stats.sectionsRepresentees)}</strong>)`;
      cardQuorum.style.background = '#FAF6EB';
      cardQuorum.style.borderColor = 'var(--db-gold)';
    }
  }

  // Mettre à jour les compteurs des onglets
  const elCountAll = document.getElementById('countAll');
  const elCountEmarges = document.getElementById('countEmarges');
  const elCountAttente = document.getElementById('countAttente');
  const elCountVotants = document.getElementById('countVotants');

  const votants = registre.filter(d => (d.role || '').toLowerCase().includes('votant')).length;

  if (elCountAll) elCountAll.textContent = totalInscrits;
  if (elCountEmarges) elCountEmarges.textContent = totalEmarges;
  if (elCountAttente) elCountAttente.textContent = totalAttente;
  if (elCountVotants) elCountVotants.textContent = votants;
}

/* ==========================================================================
   3. RENDU DU TABLEAU DE LA BASE DE DONNÉES
   ========================================================================== */
function renderMainTable() {
  const tbody = document.getElementById('dbMainTableBody');
  const summary = document.getElementById('dbTableSummary');
  if (!tbody || typeof getRegistreAGO !== 'function') return;

  const registre = getRegistreAGO();

  // Filtrage selon onglet
  let filtered = registre.filter(d => {
    if (currentFilter === 'emarge') return d.emarge;
    if (currentFilter === 'attente') return !d.emarge;
    if (currentFilter === 'votant') return (d.role || '').toLowerCase().includes('votant');
    return true;
  });

  // Filtrage selon recherche textuelle
  if (currentSearchQuery) {
    filtered = filtered.filter(d => {
      const nom = (d.nom || '').toLowerCase();
      const mat = (d.matricule || '').toLowerCase();
      const sec = (d.section || '').toLowerCase();
      const role = (d.role || '').toLowerCase();
      const tel = (d.telephone || '').toLowerCase();
      return nom.includes(currentSearchQuery) || 
             mat.includes(currentSearchQuery) || 
             sec.includes(currentSearchQuery) || 
             role.includes(currentSearchQuery) || 
             tel.includes(currentSearchQuery);
    });
  }

  if (summary) {
    summary.textContent = `Affichage de ${filtered.length} sur ${registre.length} délégué(s) enregistré(s)`;
  }

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: #888;">
          Aucun délégué ne correspond aux critères de filtre ou de recherche.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    const isEmarge = d.emarge;
    const badgeClass = isEmarge ? 'emarge' : 'attente';
    const badgeText = isEmarge ? '✅ Présent Émargé' : '⏳ En attente';
    const heureEmarge = d.date_emargement || '-';

    const btnEmargement = !isEmarge
      ? `<button type="button" class="btn-action-emarge" data-mat="${d.matricule}">Valider Présence</button>`
      : `<button type="button" class="btn-action-pass" style="color:#C0392B; border-color:#E74C3C;" data-cancel-mat="${d.matricule}">Annuler</button>`;

    return `
      <tr>
        <td>
          <span class="db-mat-tag">${d.matricule}</span>
        </td>
        <td>
          <strong style="color: var(--db-emerald-dark); font-size: 13px;">${d.nom}</strong>
        </td>
        <td>${d.section || '-'}</td>
        <td style="font-size: 11.5px; color: #444;">${d.role || '-'}</td>
        <td style="font-size: 11px; color: #666;">${d.telephone || '-'}</td>
        <td>
          <span class="db-badge-status ${badgeClass}">${badgeText}</span>
        </td>
        <td style="font-family: monospace; font-size: 11.5px; color: #555;">${heureEmarge}</td>
        <td>
          <div class="db-table-actions">
            ${btnEmargement}
            <button type="button" class="btn-action-pass" data-view-pass="${d.matricule}" title="Afficher et réimprimer le badge">
              🎫 Pass
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Câblage des boutons d'action du tableau
  tbody.querySelectorAll('.btn-action-emarge').forEach(btn => {
    btn.addEventListener('click', () => {
      const mat = btn.getAttribute('data-mat');
      traiterValidation(mat);
    });
  });

  tbody.querySelectorAll('[data-cancel-mat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mat = btn.getAttribute('data-cancel-mat');
      annulerEmargement(mat);
    });
  });

  tbody.querySelectorAll('[data-view-pass]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mat = btn.getAttribute('data-view-pass');
      afficherPassModal(mat);
    });
  });
}

/* ==========================================================================
   4. FIL DES DERNIERS ÉMARGEMENTS VALIDÉS
   ========================================================================== */
function renderRecentList() {
  const listEl = document.getElementById('dbRecentList');
  if (!listEl || typeof getRegistreAGO !== 'function') return;

  const registre = getRegistreAGO();
  const emarges = registre
    .filter(d => d.emarge && d.date_emargement)
    .sort((a, b) => (b.date_emargement || '').localeCompare(a.date_emargement || ''))
    .slice(0, 5);

  if (!emarges.length) {
    listEl.innerHTML = `<li class="db-recent-empty">Aucun émargement pour l'instant.</li>`;
    return;
  }

  listEl.innerHTML = emarges.map(d => `
    <li class="db-recent-item">
      <div>
        <strong>${d.nom}</strong>
        <div style="font-size: 11px; color: #555;">${d.section || 'Sous-Comité Koumassi'}</div>
      </div>
      <div style="text-align: right;">
        <span class="db-mat-tag" style="font-size: 10px;">${d.matricule}</span><br>
        <span class="db-recent-time">${d.date_emargement}</span>
      </div>
    </li>
  `).join('');
}

/* ==========================================================================
   5. LOGIQUE DU SCANNEUR & VALIDATION
   ========================================================================== */
function traiterValidation(rawCode) {
  if (!rawCode) return;
  let code = String(rawCode).trim();

  // Extraction d'un éventuel paramètre matricule ou URL
  if (code.includes('matricule=')) {
    code = code.split('matricule=')[1].split('&')[0];
  } else if (code.includes('/')) {
    code = code.split('/').pop();
  }

  let res = validerEmargementParMatricule(code);

  // Si matricule direct non trouvé, recherche par nom dans la base
  if (res.introuvable && typeof getRegistreAGO === 'function') {
    const all = getRegistreAGO();
    const match = all.find(item => item.nom.toLowerCase().includes(code.toLowerCase()));
    if (match) {
      res = validerEmargementParMatricule(match.matricule);
    }
  }

  const box = document.getElementById('dbStatusBox');
  const title = document.getElementById('dbStatusTitle');
  const desc = document.getElementById('dbStatusDesc');
  const icon = document.getElementById('dbStatusIcon');
  const preview = document.getElementById('dbDelegatePreview');

  if (res.success) {
    playAudioFeedback('success');
    if (box) {
      box.className = 'db-status-box success';
      if (icon) icon.textContent = '✅';
      if (title) title.textContent = `ÉMARGEMENT VALIDÉ AVEC SUCCÈS`;
      if (desc) desc.innerHTML = `La présence de <strong>${res.delegue.nom}</strong> a été enregistrée dans la base et comptabilisée pour le Quorum.`;
    }

    if (preview) {
      preview.style.display = 'block';
      document.getElementById('dbPreviewMatricule').textContent = res.delegue.matricule;
      document.getElementById('dbPreviewNom').textContent = res.delegue.nom;
      document.getElementById('dbPreviewRole').textContent = res.delegue.role;
      document.getElementById('dbPreviewSection').textContent = res.delegue.section;
      document.getElementById('dbPreviewPhone').textContent = res.delegue.telephone || 'Non renseigné';
      document.getElementById('dbPreviewTime').textContent = res.delegue.date_emargement || '';
    }

    showDbToast(`✅ Présence validée : ${res.delegue.nom}`);
  } else if (res.dejaEmarge) {
    playAudioFeedback('warning');
    if (box) {
      box.className = 'db-status-box warning';
      if (icon) icon.textContent = '⚠️';
      if (title) title.textContent = `ATTENTION : DÉJÀ ÉMARGÉ`;
      if (desc) desc.innerHTML = `<strong>${res.delegue.nom}</strong> a déjà émargé le <strong>${res.delegue.date_emargement}</strong>. Ce badge ne peut pas être scanné deux fois.`;
    }

    if (preview) {
      preview.style.display = 'block';
      document.getElementById('dbPreviewMatricule').textContent = res.delegue.matricule;
      document.getElementById('dbPreviewNom').textContent = res.delegue.nom;
      document.getElementById('dbPreviewRole').textContent = res.delegue.role;
      document.getElementById('dbPreviewSection').textContent = res.delegue.section;
      document.getElementById('dbPreviewPhone').textContent = res.delegue.telephone || 'Non renseigné';
      document.getElementById('dbPreviewTime').textContent = res.delegue.date_emargement || '';
    }

    showDbToast(`⚠️ Délégué déjà présent : ${res.delegue.nom}`);
  } else {
    playAudioFeedback('error');
    if (box) {
      box.className = 'db-status-box error';
      if (icon) icon.textContent = '❌';
      if (title) title.textContent = `CODE NON RECONNU`;
      if (desc) desc.innerHTML = `Le code ou nom <strong>"${rawCode}"</strong> est introuvable dans la base officielle. Vérifiez l'orthographe ou inscrivez le délégué.`;
    }
    if (preview) preview.style.display = 'none';

    showDbToast(`❌ Matricule inconnu !`);
  }

  refreshAllDbViews();
}

function handleManualCheckin(val) {
  const trimmed = (val || '').trim();
  if (!trimmed) {
    showDbToast("Veuillez saisir un matricule ou un nom.");
    return;
  }
  traiterValidation(trimmed);
  const input = document.getElementById('dbManualInput');
  if (input) input.value = '';
}

function annulerEmargement(matricule) {
  const registre = getRegistreAGO();
  const delegue = registre.find(d => d.matricule.toUpperCase() === matricule.toUpperCase());
  if (delegue && confirm(`Annuler l'émargement de ${delegue.nom} ?`)) {
    delegue.emarge = false;
    delegue.date_emargement = null;
    saveRegistreAGO(registre);
    refreshAllDbViews();
    showDbToast(`Émargement annulé pour ${delegue.nom}`);
  }
}

/* ==========================================================================
   6. CONTRÔLE DE LA CAMÉRA (HTML5-QRCODE)
   ========================================================================== */
function toggleCameraScanning() {
  const btn = document.getElementById('btnToggleDbCamera');
  if (isCameraActive) {
    stopDbCamera();
  } else {
    startDbCamera();
  }
}

function startDbCamera() {
  if (typeof Html5Qrcode === 'undefined') {
    showDbToast("Module caméra QR non chargé. Utilisez la saisie manuelle.");
    return;
  }

  const btn = document.getElementById('btnToggleDbCamera');
  if (!html5ScannerInstance) {
    html5ScannerInstance = new Html5Qrcode("dbCameraReader");
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Démarrage du flux caméra...</span>`;
  }

  html5ScannerInstance.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 220, height: 220 }
    },
    (decodedText) => {
      const now = Date.now();
      if (decodedText === lastScannedMatricule && (now - lastScanTime) < 3000) {
        return;
      }
      lastScannedMatricule = decodedText;
      lastScanTime = now;

      traiterValidation(decodedText);
    },
    () => {
      // frame non décodée (normal)
    }
  ).then(() => {
    isCameraActive = true;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>Arrêter la Caméra d'Émargement</span>`;
      btn.style.background = '#C0392B';
    }
    showDbToast("Caméra d'émargement active !");
  }).catch(err => {
    console.warn("Erreur caméra:", err);
    isCameraActive = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>Activer la Caméra d'Émargement</span>`;
      btn.style.background = '';
    }
    showDbToast("Caméra inaccessible. Vous pouvez valider directement via la saisie manuelle.");
  });
}

function stopDbCamera() {
  const btn = document.getElementById('btnToggleDbCamera');
  if (html5ScannerInstance && isCameraActive) {
    html5ScannerInstance.stop().then(() => {
      isCameraActive = false;
      if (btn) {
        btn.innerHTML = `<span>Activer la Caméra d'Émargement</span>`;
        btn.style.background = '';
      }
      showDbToast("Caméra arrêtée.");
    }).catch(err => {
      console.warn("Erreur arrêt caméra:", err);
      isCameraActive = false;
    });
  }
}

/* ==========================================================================
   7. MODAL PASS OFFICIEL (AFFICHAGE / RÉIMPRESSION)
   ========================================================================== */
function afficherPassModal(matricule) {
  const delegue = trouverParMatricule(matricule);
  if (!delegue) return;

  const modal = document.getElementById('dbPassModalBackdrop');
  document.getElementById('dbModalPassMatricule').textContent = delegue.matricule;
  document.getElementById('dbModalPassNom').textContent = delegue.nom;
  document.getElementById('dbModalPassRole').textContent = delegue.role;
  document.getElementById('dbModalPassSection').textContent = delegue.section || 'Sous-Comité Koumassi';
  
  const pill = document.getElementById('dbModalPassStatusPill');
  if (pill) {
    pill.textContent = delegue.emarge ? "Présence Validée" : "En attente d'émargement";
    pill.style.background = delegue.emarge ? "#2ECC71" : "#D4AF37";
  }

  // Rendu du QR Code
  const qrBox = document.getElementById('dbModalPassQrCode');
  if (qrBox && typeof QRCode !== 'undefined') {
    qrBox.innerHTML = '';
    new QRCode(qrBox, {
      text: delegue.matricule,
      width: 140,
      height: 140,
      colorDark: '#051D14',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  if (modal) modal.classList.add('active');
}

function initModalListeners() {
  const modalPass = document.getElementById('dbPassModalBackdrop');
  const btnClosePass = document.getElementById('btnCloseDbPassModal');
  const btnPrintPass = document.getElementById('btnDbPrintSinglePass');

  if (btnClosePass && modalPass) {
    btnClosePass.addEventListener('click', () => modalPass.classList.remove('active'));
    modalPass.addEventListener('click', (e) => {
      if (e.target === modalPass) modalPass.classList.remove('active');
    });
  }

  if (btnPrintPass) {
    btnPrintPass.addEventListener('click', () => {
      document.body.classList.add('print-badge-active');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-badge-active');
      }, 1200);
    });
  }

  // Modal Nouveau
  const modalNew = document.getElementById('dbNewModalBackdrop');
  const btnOpenNew = document.getElementById('btnDbOpenNewModal');
  const btnCloseNew = document.getElementById('btnCloseDbNewModal');

  if (btnOpenNew && modalNew) {
    btnOpenNew.addEventListener('click', () => modalNew.classList.add('active'));
  }
  if (btnCloseNew && modalNew) {
    btnCloseNew.addEventListener('click', () => modalNew.classList.remove('active'));
    modalNew.addEventListener('click', (e) => {
      if (e.target === modalNew) modalNew.classList.remove('active');
    });
  }
}

/* ==========================================================================
   8. FORMULAIRE D'INSCRIPTION RAPIDE SUR PLACE
   ========================================================================== */
function initNewDelegateForm() {
  const form = document.getElementById('dbNewForm');
  const modal = document.getElementById('dbNewModalBackdrop');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nom = document.getElementById('newNom').value.trim();
    const role = document.getElementById('newRole').value;
    const section = document.getElementById('newSection').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const autoEmarge = document.getElementById('newAutoEmarge').checked;

    if (!nom) {
      alert("Veuillez renseigner le nom complet du délégué.");
      return;
    }

    const nouveau = ajouterInscriptionAGO({
      nom: nom,
      role: role,
      section: section,
      telephone: phone,
      presence: 'Présent sur Place'
    });

    if (autoEmarge) {
      validerEmargementParMatricule(nouveau.matricule);
    }

    form.reset();
    if (modal) modal.classList.remove('active');

    refreshAllDbViews();
    showDbToast(`Délégué ${nouveau.nom} inscrit avec succès (${nouveau.matricule}) !`);
  });
}

/* ==========================================================================
   9. MODAL & GESTION CLOUD SUPABASE
   ========================================================================== */
function initSupabaseModal() {
  const modal = document.getElementById('dbSupabaseModalBackdrop');
  const btnOpen = document.getElementById('btnDbOpenSupabaseModal');
  const btnClose = document.getElementById('btnCloseSupabaseModal');
  const btnSave = document.getElementById('btnSaveSupabaseConfig');
  const btnDisconnect = document.getElementById('btnDisconnectSupabase');
  const badge = document.getElementById('supabaseStatusBadge');
  const inputUrl = document.getElementById('supabaseInputUrl');
  const inputKey = document.getElementById('supabaseInputKey');

  function updateBadgeStatus() {
    if (!badge) return;
    const isActif = typeof isSupabaseActif === 'function' && isSupabaseActif();
    if (isActif) {
      badge.style.background = '#E8F8EE';
      badge.style.color = '#0E733D';
      badge.style.borderColor = '#2ECC71';
      badge.innerHTML = `🟢 <strong>Cloud Supabase Connecté &amp; Actif</strong><br><span style="font-size:11px; font-weight:normal;">Les données sont synchronisées en direct avec le serveur PostgreSQL.</span>`;
      if (btnOpen) {
        btnOpen.style.borderColor = '#2ECC71';
        btnOpen.style.color = '#2ECC71';
        btnOpen.textContent = '🟢 Cloud Supabase';
      }
    } else {
      badge.style.background = '#FFF7E6';
      badge.style.color = '#8C5305';
      badge.style.borderColor = '#F39C12';
      badge.innerHTML = `⚪ <strong>Mode Local (Hors Ligne)</strong><br><span style="font-size:11px; font-weight:normal;">Saisissez vos identifiants pour synchroniser tous les appareils en direct.</span>`;
      if (btnOpen) {
        btnOpen.style.borderColor = 'rgba(255,255,255,0.3)';
        btnOpen.style.color = '#FFFFFF';
        btnOpen.textContent = '⚡ Cloud Supabase';
      }
    }
  }

  updateBadgeStatus();

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      if (inputUrl) inputUrl.value = localStorage.getItem('ago_supabase_url') || '';
      if (inputKey) inputKey.value = localStorage.getItem('ago_supabase_key') || '';
      updateBadgeStatus();
      modal.classList.add('active');
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (btnSave && modal) {
    btnSave.addEventListener('click', async () => {
      const url = inputUrl ? inputUrl.value.trim() : '';
      const key = inputKey ? inputKey.value.trim() : '';

      if (!url || !key) {
        alert("Veuillez renseigner à la fois l'URL du projet et la clé Anon Supabase.");
        return;
      }

      if (typeof configurerSupabase === 'function') {
        const ok = configurerSupabase(url, key);
        if (ok) {
          updateBadgeStatus();
          showDbToast("Connexion à Supabase réussie !");
          modal.classList.remove('active');
          await syncCloudInitial();
        } else {
          alert("Impossible d'initialiser Supabase avec ces identifiants. Vérifiez l'URL.");
        }
      }
    });
  }

  if (btnDisconnect && modal) {
    btnDisconnect.addEventListener('click', () => {
      if (confirm("Déconnecter Supabase et repasser en mode local ?")) {
        if (typeof configurerSupabase === 'function') {
          configurerSupabase('', '');
          updateBadgeStatus();
          modal.classList.remove('active');
          showDbToast("Déconnecté de Supabase (Mode local actif).");
        }
      }
    });
  }
}

/* Toast de notification */
function showDbToast(msg) {
  let toast = document.getElementById('dbToastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dbToastNotice';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #051D14;
      color: #FFFFFF;
      border: 1.5px solid #D4AF37;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(0,0,0,0.3);
      z-index: 999999;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3200);
}
