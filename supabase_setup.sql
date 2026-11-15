-- ==========================================================================
-- SCRIPT DE CRÉATION DE LA TABLE SUPABASE POUR L'A.G.O. AEEMCI KOUMASSI 2026
-- À exécuter dans le menu "SQL Editor" de votre projet Supabase (https://supabase.com)
-- ==========================================================================

-- 1. Création de la table des inscriptions et de l'émargement
CREATE TABLE IF NOT EXISTS ago_inscriptions (
  id BIGSERIAL PRIMARY KEY,
  matricule VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'Délégué Officiel de Section (Votant)',
  section VARCHAR(255) DEFAULT 'Sous-Comité Koumassi',
  telephone VARCHAR(50),
  presence VARCHAR(100) DEFAULT 'Présence Confirmée',
  message TEXT,
  emarge BOOLEAN DEFAULT false,
  date_emargement VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activation de la sécurité au niveau des lignes (Row Level Security - RLS)
ALTER TABLE ago_inscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Politique d'accès : Lecture publique autorisée (pour charger la liste et les statistiques)
DROP POLICY IF EXISTS "Lecture publique inscriptions ago" ON ago_inscriptions;
CREATE POLICY "Lecture publique inscriptions ago" 
ON ago_inscriptions FOR SELECT 
USING (true);

-- 4. Politique d'accès : Insertion publique autorisée (pour le formulaire d'inscription des délégués)
DROP POLICY IF EXISTS "Insertion publique inscriptions ago" ON ago_inscriptions;
CREATE POLICY "Insertion publique inscriptions ago" 
ON ago_inscriptions FOR INSERT 
WITH CHECK (true);

-- 5. Politique d'accès : Mise à jour publique autorisée (pour valider l'émargement au scanner)
DROP POLICY IF EXISTS "Mise a jour publique inscriptions ago" ON ago_inscriptions;
CREATE POLICY "Mise a jour publique inscriptions ago" 
ON ago_inscriptions FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 6. Activation des notifications en direct (Realtime)
-- Permet aux écrans de se synchroniser automatiquement sans recharger la page
ALTER PUBLICATION supabase_realtime ADD TABLE ago_inscriptions;

-- 7. Insertion des délégués statutaires initiaux de test
INSERT INTO ago_inscriptions (matricule, nom, role, section, telephone, presence, emarge, date_emargement)
VALUES
  ('AGO-KMSSI-26-A101', 'KONE Ibrahim', 'Secrétaire Général de Section (Votant)', 'Section Lycée Municipal de Koumassi (LMK)', '+225 07 12 34 56 78', 'Présence Confirmée', true, '28/11/2026 07:42:15'),
  ('AGO-KMSSI-26-B202', 'TRAORE Aminata', 'Délégué Officiel de Section (Votant)', 'Section EMSP Abidjan', '+225 05 98 76 54 32', 'Présence Confirmée', true, '28/11/2026 07:48:30'),
  ('AGO-KMSSI-26-C303', 'OUATTARA Souleymane', 'Secrétaire Général de Section (Votant)', 'Section Collège Sainte-Thérèse', '+225 01 44 55 66 77', 'Présence Confirmée', false, null),
  ('AGO-KMSSI-26-D404', 'DIABATE Fatoumata', 'Déléguée Officielle de Section (Votant)', 'Section Collège Moderne de Koumassi', '+225 07 88 99 00 11', 'Présence Confirmée', false, null),
  ('AGO-KMSSI-26-E505', 'COULIBALY Lassina', 'Membre du Bureau Exécutif (Trésorier Général)', 'Sous-Comité AEEMCI de Koumassi', '+225 05 11 22 33 44', 'Présence Confirmée', true, '28/11/2026 07:35:10'),
  ('AGO-KMSSI-26-F606', 'SANOGO Youssouf', 'Secrétaire Général de Section (Votant)', 'Section Lycée Moderne Badou', '+225 01 23 45 67 89', 'Présence Confirmée', false, null),
  ('AGO-KMSSI-26-G707', 'DEMBELE Brahima', 'Ancien Président (Les 3AK)', 'Amicale des Anciens de Koumassi (3AK)', '+225 07 77 66 55 44', 'Présence Confirmée', false, null)
ON CONFLICT (matricule) DO NOTHING;
