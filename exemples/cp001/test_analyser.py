"""Tests indépendants de l'illustration CP-001."""
import tempfile
import unittest
from pathlib import Path
from analyser import analyser

CAPACITES = 'creneau,atelier,capacite\n09:30,Simulateur,24\n14:00,Simulateur,24\n'
ENTETES = 'participant_id,creneau,atelier,statut,source\n'

class TestDemonstrateur(unittest.TestCase):
    def scenario(self, inscriptions, capacites=CAPACITES):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        base = Path(tmp.name)
        (base / 'inscriptions-demo.csv').write_text(inscriptions, encoding='utf-8')
        (base / 'capacites-ateliers-demo.csv').write_text(capacites, encoding='utf-8')
        return analyser(base)

    def test_48_inscriptions_et_excedent_8(self):
        resultat = analyser(Path(__file__).resolve().parent)
        self.assertEqual(resultat['inscriptions'], 48)
        self.assertEqual(resultat['excedent_total'], 8)
        a = {(r['creneau'],r['atelier']):r for r in resultat['creneaux']}
        self.assertEqual(a['09:30','Simulateur']['demandes'],32)
        self.assertEqual(a['14:00','Simulateur']['places_theoriques'],20)

    def test_jauge_non_depassee(self):
        s = ENTETES + 'P001,09:30,Simulateur,confirme,fictif\n'
        self.assertEqual(self.scenario(s)['excedent_total'],0)

    def test_doublon_refuse(self):
        s = ENTETES + 'P001,09:30,Simulateur,confirme,fictif\nP001,09:30,Simulateur,confirme,fictif\n'
        with self.assertRaisesRegex(ValueError,'Doublon'):
            self.scenario(s)

    def test_capacite_absente_refusee(self):
        s = ENTETES + 'P001,09:30,Simulateur,confirme,fictif\n'
        with self.assertRaisesRegex(ValueError,'sans capacité'):
            self.scenario(s, 'creneau,atelier,capacite\n14:00,Simulateur,24\n')

    def test_jauge_invalide_refusee(self):
        s = ENTETES + 'P001,09:30,Simulateur,confirme,fictif\n'
        with self.assertRaisesRegex(ValueError,'non positive'):
            self.scenario(s, 'creneau,atelier,capacite\n09:30,Simulateur,0\n')

if __name__ == '__main__':
    unittest.main()
