/**
 * ==========================================================================
 * BASE DE DONNÉES & CONNECTEUR CLOUD SUPABASE — A.G.O. AEEMCI KOUMASSI 2026
 * Système hybride : Fonctionne en Cloud Supabase (Temps Réel) & Secours Local
 * ==========================================================================
 */

const STORAGE_KEY_AGO = 'aeemci_koumassi_ago_registre_2026';
const STORAGE_KEY_SUPABASE_URL = 'ago_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'ago_supabase_key';

// Configuration Supabase officielle du projet "AGO Président Sow"
const DEFAULT_SUPABASE_URL = 'https://bdlhmffedkqjcnsezwzc.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_w8uK91Q41lqBStC-LhbZEg_-_KNFRST';

// Nettoyage automatique en cas d'ancienne cle secrete invalide dans le navigateur
let _storedKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY);
if (_storedKey && _storedKey.startsWith('sb_secret_')) {
  localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
  _storedKey = null;
}

let SUPABASE_URL = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
let SUPABASE_ANON_KEY = _storedKey || DEFAULT_SUPABASE_KEY;

let supabaseClient = null;

// Données initiales d'exemple si le registre est vide
const SEED_DELEGUES = [
  {
    matricule: 'AGO-KMSSI-26-A101',
    nom: 'KONE Ibrahim',
    role: 'Secrétaire Général de Section (Votant)',
    section: 'Section Lycée Municipal de Koumassi (LMK)',
    telephone: '+225 07 12 34 56 78',
    presence: 'Présence Confirmée',
    message: 'Que les travaux soient couronnés de succès.',
    date_inscription: '2026-11-10 14:20',
    emarge: true,
    date_emargement: '28/11/2026 07:42:15'
  },
  {
    matricule: 'AGO-KMSSI-26-B202',
    nom: 'TRAORE Aminata',
    role: 'Délégué Officiel de Section (Votant)',
    section: 'Section EMSP Abidjan',
    telephone: '+225 05 98 76 54 32',
    presence: 'Présence Confirmée',
    message: 'Présente pour représenter la section universitaire.',
    date_inscription: '2026-11-11 09:15',
    emarge: true,
    date_emargement: '28/11/2026 07:48:30'
  },
  {
    matricule: 'AGO-KMSSI-26-C303',
    nom: 'OUATTARA Souleymane',
    role: 'Secrétaire Général de Section (Votant)',
    section: 'Section Collège Sainte-Thérèse',
    telephone: '+225 01 44 55 66 77',
    presence: 'Présence Confirmée',
    message: 'Tous mobilisés pour le sous-comité.',
    date_inscription: '2026-11-12 11:40',
    emarge: false,
    date_emargement: null
  },
  {
    matricule: 'AGO-KMSSI-26-D404',
    nom: 'DIABATE Fatoumata',
    role: 'Déléguée Officielle de Section (Votant)',
    section: 'Section Collège Moderne de Koumassi',
    telephone: '+225 07 88 99 00 11',
    presence: 'Présence Confirmée',
    message: 'Pour le rayonnement de notre sous-comité.',
    date_inscription: '2026-11-12 16:05',
    emarge: false,
    date_emargement: null
  },
  {
    matricule: 'AGO-KMSSI-26-E505',
    nom: 'COULIBALY Lassina',
    role: 'Membre du Bureau Exécutif (Trésorier Général)',
    section: 'Sous-Comité AEEMCI de Koumassi',
    telephone: '+225 05 11 22 33 44',
    presence: 'Présence Confirmée',
    message: 'Rapport financier prêt pour présentation.',
    date_inscription: '2026-11-13 10:30',
    emarge: true,
    date_emargement: '28/11/2026 07:35:10'
  },
  {
    matricule: 'AGO-KMSSI-26-F606',
    nom: 'SANOGO Youssouf',
    role: 'Secrétaire Général de Section (Votant)',
    section: 'Section Lycée Moderne Badou',
    telephone: '+225 01 23 45 67 89',
    presence: 'Présence Confirmée',
    message: 'Présence assurée avec notre délégation.',
    date_inscription: '2026-11-13 14:15',
    emarge: false,
    date_emargement: null
  },
  {
    matricule: 'AGO-KMSSI-26-G707',
    nom: 'DEMBELE Brahima',
    role: 'Ancien Président (Les 3AK)',
    section: 'Amicale des Anciens de Koumassi (3AK)',
    telephone: '+225 07 77 66 55 44',
    presence: 'Présence Confirmée',
    message: 'Tous nos vœux de réussite au Président Sow Mohamed.',
    date_inscription: '2026-11-14 08:50',
    emarge: false,
    date_emargement: null
  }
];

/**
 * Initialisation du Client Supabase Cloud
 */
function initSupabaseClient() {
  SUPABASE_URL = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  SUPABASE_ANON_KEY = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || DEFAULT_SUPABASE_KEY;

  if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Connecteur Cloud Supabase actif.");
      return supabaseClient;
    } catch (e) {
      console.warn("Échec connexion Supabase:", e);
    }
  }
  return null;
}

// Initialisation au chargement
initSupabaseClient();

/**
 * Vérifie si le Cloud Supabase est configuré et prêt
 */
function isSupabaseActif() {
  return supabaseClient !== null;
}

/**
 * Configure ou met à jour les identifiants Supabase
 */
function configurerSupabase(url, key) {
  if (!url || !key) {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
    supabaseClient = null;
    return false;
  }
  localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key.trim());
  return initSupabaseClient() !== null;
}

/**
 * Récupère le registre local mis en cache
 */
function getRegistreAGO() {
  const data = localStorage.getItem(STORAGE_KEY_AGO);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_AGO, JSON.stringify(SEED_DELEGUES));
    return SEED_DELEGUES;
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_DELEGUES;
  } catch (e) {
    return SEED_DELEGUES;
  }
}

/**
 * Sauvegarde le registre en local
 */
function saveRegistreAGO(registre) {
  localStorage.setItem(STORAGE_KEY_AGO, JSON.stringify(registre));
}

/**
 * Génère un matricule officiel unique
 * Format : AGO-KMSSI-26-XXXX
 */
function genererMatriculeAGO() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AGO-KMSSI-26-${code}`;
}

/**
 * Synchronise les données depuis Supabase vers le cache local
 */
async function synchroniserDepuisSupabase() {
  if (!supabaseClient) return getRegistreAGO();

  try {
    const { data, error } = await supabaseClient
      .from('ago_inscriptions')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data && data.length) {
      saveRegistreAGO(data);
      return data;
    }
  } catch (e) {
    console.warn("Synchronisation Supabase hors ligne, utilisation du cache local.");
  }
  return getRegistreAGO();
}

/**
 * Ajoute une nouvelle inscription (Local + Cloud Supabase)
 */
async function ajouterInscriptionAGO(data) {
  const registre = getRegistreAGO();
  const matricule = genererMatriculeAGO();

  const maintenant = new Date();
  const dateStr = maintenant.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const nouvelleInscription = {
    matricule: matricule,
    nom: data.nom.trim(),
    role: data.role || 'Délégué Officiel de Section (Votant)',
    section: data.section ? data.section.trim() : 'Sous-Comité Koumassi',
    telephone: data.telephone ? data.telephone.trim() : '',
    presence: data.presence || 'Présence Confirmée avec Certitude',
    message: data.message ? data.message.trim() : '',
    date_inscription: dateStr,
    emarge: false,
    date_emargement: null
  };

  // 1. Sauvegarde locale instantanée
  registre.unshift(nouvelleInscription);
  saveRegistreAGO(registre);

  // 2. Synchronisation Cloud Supabase si actif
  if (supabaseClient) {
    try {
      await supabaseClient.from('ago_inscriptions').insert([{
        matricule: nouvelleInscription.matricule,
        nom: nouvelleInscription.nom,
        role: nouvelleInscription.role,
        section: nouvelleInscription.section,
        telephone: nouvelleInscription.telephone,
        presence: nouvelleInscription.presence,
        message: nouvelleInscription.message,
        emarge: false,
        date_emargement: null
      }]);
    } catch (err) {
      console.warn("Erreur envoi Supabase, sauvegardé localement:", err);
    }
  }

  return nouvelleInscription;
}

/**
 * Recherche une inscription par matricule
 */
function trouverParMatricule(matricule) {
  if (!matricule) return null;
  const registre = getRegistreAGO();
  const cleanMat = String(matricule).trim().toUpperCase();
  return registre.find(item => item.matricule.toUpperCase() === cleanMat) || null;
}

/**
 * Valide l'émargement d'un participant (Local + Cloud Supabase)
 * Gère aussi le payload autonome : MATRICULE|NOM|SECTION|ROLE
 */
async function validerEmargementParMatricule(codeBrut) {
  if (!codeBrut) return { success: false, introuvable: true };

  let matricule = String(codeBrut).trim();
  let nomPayload = '';
  let sectionPayload = '';
  let rolePayload = '';

  // Décodage du format autonome transporté par le QR Code
  if (matricule.includes('|')) {
    const parts = matricule.split('|');
    matricule = parts[0].trim();
    nomPayload = parts[1] ? parts[1].trim() : '';
    sectionPayload = parts[2] ? parts[2].trim() : '';
    rolePayload = parts[3] ? parts[3].trim() : '';
  }

  const registre = getRegistreAGO();
  const cleanMat = matricule.toUpperCase();
  let index = registre.findIndex(item => item.matricule.toUpperCase() === cleanMat);

  // Si non trouvé par matricule mais présent avec payload dans le QR code
  // on l'insère automatiquement (Secours hors ligne)
  if (index === -1 && nomPayload) {
    const autoDelegue = {
      matricule: matricule,
      nom: nomPayload,
      role: rolePayload || 'Délégué Officiel de Section (Votant)',
      section: sectionPayload || 'Sous-Comité Koumassi',
      telephone: '',
      presence: 'Présent via Scan QR Autonome',
      message: '',
      date_inscription: new Date().toLocaleDateString('fr-FR'),
      emarge: false,
      date_emargement: null
    };
    registre.unshift(autoDelegue);
    index = 0;
  }

  if (index === -1) {
    return { success: false, introuvable: true, message: 'Matricule non reconnu dans le registre de l’A.G.O.' };
  }

  const delegue = registre[index];

  if (delegue.emarge) {
    return {
      success: false,
      dejaEmarge: true,
      delegue: delegue,
      message: `Ce délégué a DÉJÀ été émargé le ${delegue.date_emargement}.`
    };
  }

  const maintenant = new Date();
  const heureStr = maintenant.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  delegue.emarge = true;
  delegue.date_emargement = heureStr;
  registre[index] = delegue;
  saveRegistreAGO(registre);

  // Synchronisation Cloud Supabase
  if (supabaseClient) {
    try {
      await supabaseClient
        .from('ago_inscriptions')
        .update({ emarge: true, date_emargement: heureStr })
        .eq('matricule', delegue.matricule);
    } catch (err) {
      console.warn("Échec mise à jour Supabase, validé localement:", err);
    }
  }

  return {
    success: true,
    delegue: delegue,
    message: `Présence validée avec succès pour ${delegue.nom} (${delegue.section}) !`
  };
}

/**
 * Calcul du Quorum statutaire (Art. 38)
 */
function calculerStatistiquesAGO() {
  const registre = getRegistreAGO();
  const total = registre.length;
  const emarges = registre.filter(d => d.emarge).length;
  const enAttente = total - emarges;

  const sectionsDistinctes = new Set();
  registre.filter(d => d.emarge).forEach(d => {
    if (d.section) sectionsDistinctes.add(d.section.toLowerCase());
  });

  const sectionsCount = sectionsDistinctes.size;
  const quorumObjectif = 14; // 2/3 des 21 sections de Koumassi

  return {
    total,
    emarges,
    enAttente,
    sectionsRepresentees: sectionsCount,
    quorumObjectif,
    quorumAtteint: sectionsCount >= quorumObjectif
  };
}

/**
 * Export Excel (CSV)
 */
function exporterRegistreEnCSV() {
  const registre = getRegistreAGO();
  if (!registre.length) {
    alert("Le registre d'émargement est vide pour le moment.");
    return;
  }

  const entetes = ['Matricule', 'Nom et Prénoms', 'Qualité / Titre', 'Section / Structure', 'Téléphone', 'Statut Présence', 'Émargé (Présent)', 'Date / Heure Émargement', 'Message'];
  const lignes = registre.map(d => [
    `"${d.matricule}"`,
    `"${d.nom.replace(/"/g, '""')}"`,
    `"${(d.role || '').replace(/"/g, '""')}"`,
    `"${(d.section || '').replace(/"/g, '""')}"`,
    `"${d.telephone || ''}"`,
    `"${d.presence || ''}"`,
    `"${d.emarge ? 'OUI (PRÉSENT)' : 'NON (EN ATTENTE)'}"`,
    `"${d.date_emargement || '-'}"`,
    `"${(d.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [entetes.join(';'), ...lignes.map(l => l.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Registre_Emargement_AGO_AEEMCI_Koumassi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
