"""
Script de seed data pour ConstructOptimize App 4.
Crée des catégories, marques, produits, fournisseurs et prix réalistes BTP.
Usage: python manage.py shell < seed_data.py
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'constructoptimize_backend.settings')
django.setup()

from decimal import Decimal
from produits.models import Categorie, Marque, Produit
from fournisseurs.models import Fournisseur, PrixProduit

print("Nettoyage des données existantes...")
PrixProduit.objects.all().delete()
Produit.objects.all().delete()
Marque.objects.all().delete()
Categorie.objects.all().delete()
Fournisseur.objects.all().delete()

# ─────────────────────────────────────────
# CATÉGORIES
# ─────────────────────────────────────────
print("Création des catégories...")

cat_placo = Categorie.objects.create(nom="Plâtrerie / Placo", slug="platrerie-placo",
    description="Plaques de plâtre, rails, montants, enduits", ordre_affichage=1)
cat_elec = Categorie.objects.create(nom="Électricité", slug="electricite",
    description="Câbles, gaines, tableaux électriques, prises", ordre_affichage=2)
cat_plomb = Categorie.objects.create(nom="Plomberie", slug="plomberie",
    description="Tuyaux, raccords, robinetterie, évacuations", ordre_affichage=3)
cat_beton = Categorie.objects.create(nom="Gros œuvre / Béton", slug="gros-oeuvre-beton",
    description="Béton, parpaings, mortier, armatures", ordre_affichage=4)
cat_isolation = Categorie.objects.create(nom="Isolation", slug="isolation",
    description="Laine de verre, polystyrène, laine de roche", ordre_affichage=5)
cat_bois = Categorie.objects.create(nom="Menuiserie / Bois", slug="menuiserie-bois",
    description="Bois de charpente, OSB, contreplaqué", ordre_affichage=6)

# ─────────────────────────────────────────
# MARQUES
# ─────────────────────────────────────────
print("Création des marques...")

placo = Marque.objects.create(nom="Placo Saint-Gobain", site_web="https://www.placo.fr")
knauf = Marque.objects.create(nom="Knauf", site_web="https://www.knauf.fr")
legrand = Marque.objects.create(nom="Legrand", site_web="https://www.legrand.fr")
schneider = Marque.objects.create(nom="Schneider Electric", site_web="https://www.se.com")
grohe = Marque.objects.create(nom="Grohe", site_web="https://www.grohe.fr")
hansgrohe = Marque.objects.create(nom="Hansgrohe", site_web="https://www.hansgrohe.fr")
weber = Marque.objects.create(nom="Weber Saint-Gobain", site_web="https://www.weber.fr")
isover = Marque.objects.create(nom="Isover Saint-Gobain", site_web="https://www.isover.fr")
rockwool = Marque.objects.create(nom="Rockwool", site_web="https://www.rockwool.com/fr")

# ─────────────────────────────────────────
# PRODUITS
# ─────────────────────────────────────────
print("Création des produits...")

produits_data = [
    # Plâtrerie
    {"nom": "Plaque de plâtre BA13 standard 2,5m", "reference_fabricant": "PL-BA13-25",
     "categorie": cat_placo, "marque": placo,
     "description": "Plaque de plâtre standard BA13, 120x250cm, 13mm d'épaisseur. Idéale pour cloisons et doublages intérieurs.",
     "unite_mesure": "unité", "poids": 12.5},
    {"nom": "Plaque de plâtre BA13 hydrofuge 2,5m", "reference_fabricant": "PL-BA13H-25",
     "categorie": cat_placo, "marque": placo,
     "description": "Plaque de plâtre hydrofuge BA13, 120x250cm. Résistante à l'humidité pour salles de bain et cuisines.",
     "unite_mesure": "unité", "poids": 13.2},
    {"nom": "Rail 70mm (longueur 3m)", "reference_fabricant": "RAIL-70-3M",
     "categorie": cat_placo, "marque": knauf,
     "description": "Rail métallique 70mm pour montage cloisons placo. Galvanisé, épaisseur 0.6mm.",
     "unite_mesure": "unité", "poids": 1.8},
    {"nom": "Montant 70mm (longueur 3m)", "reference_fabricant": "MON-70-3M",
     "categorie": cat_placo, "marque": knauf,
     "description": "Montant métallique 70mm pour cloisons placo. Ailes 35mm, âme 70mm.",
     "unite_mesure": "unité", "poids": 2.1},
    {"nom": "Enduit de finition poudre 25kg", "reference_fabricant": "ENDU-25KG",
     "categorie": cat_placo, "marque": knauf,
     "description": "Enduit de lissage et finition en poudre, 25kg. Temps de travail 45min.",
     "unite_mesure": "sac", "poids": 25.0},
    # Électricité
    {"nom": "Câble électrique 2.5mm² (100m)", "reference_fabricant": "CAB-25-100",
     "categorie": cat_elec, "marque": legrand,
     "description": "Câble électrique U1000 R2V 3G2,5mm². Longueur 100m, couleur rouge. Norme NF C 32-102.",
     "unite_mesure": "rouleau", "poids": 8.5},
    {"nom": "Câble électrique 1.5mm² (100m)", "reference_fabricant": "CAB-15-100",
     "categorie": cat_elec, "marque": legrand,
     "description": "Câble électrique U1000 R2V 3G1,5mm². Longueur 100m, couleur blanche. Éclairage et prises légères.",
     "unite_mesure": "rouleau", "poids": 5.8},
    {"nom": "Gaine ICTA 16mm (100m)", "reference_fabricant": "GAINE-16-100",
     "categorie": cat_elec, "marque": schneider,
     "description": "Gaine ICTA annelée souple 16mm, grise, 100m. Passation câbles dans cloisons et dalles.",
     "unite_mesure": "rouleau", "poids": 3.2},
    {"nom": "Tableau électrique 13 modules", "reference_fabricant": "TAB-13M",
     "categorie": cat_elec, "marque": schneider,
     "description": "Tableau électrique nu 1 rangée 13 modules + porte. Ip40 IK07.",
     "unite_mesure": "unité", "poids": 1.2},
    {"nom": "Disjoncteur bipolaire 20A", "reference_fabricant": "DISJ-2P-20A",
     "categorie": cat_elec, "marque": schneider,
     "description": "Disjoncteur modulaire bipolaire 20A courbe C. Pour protection circuits prises.",
     "unite_mesure": "unité", "poids": 0.15},
    # Plomberie
    {"nom": "Tube PER 16mm (100m)", "reference_fabricant": "PER-16-100",
     "categorie": cat_plomb, "marque": grohe,
     "description": "Tube PER multicouche 16mm, barrière anti-oxygène. Compatible plancher chauffant et sanitaire.",
     "unite_mesure": "rouleau", "poids": 9.0},
    {"nom": "Tube cuivre 16/18mm (3m)", "reference_fabricant": "CU-16-18-3",
     "categorie": cat_plomb, "marque": hansgrohe,
     "description": "Tube cuivre écroui 16/18mm, longueur 3m. Norme NF EN 1057. Pour installations eau chaude/froide.",
     "unite_mesure": "barre", "poids": 1.4},
    {"nom": "Robinet d'arrêt 15/21 laiton", "reference_fabricant": "ROB-15-LAIT",
     "categorie": cat_plomb, "marque": grohe,
     "description": "Robinet d'arrêt quart de tour 15/21mm, laiton chromé. Pression max 10 bars.",
     "unite_mesure": "unité", "poids": 0.3},
    {"nom": "Siphon douche 90mm carré", "reference_fabricant": "SIPH-90-CARRE",
     "categorie": cat_plomb, "marque": hansgrohe,
     "description": "Siphon de douche carré 90x90mm, évacuation 50mm. Débit 0.8 l/s. Finition inox brossé.",
     "unite_mesure": "unité", "poids": 0.8},
    # Béton / Gros œuvre
    {"nom": "Béton prêt à l'emploi BPS250 (sac 35kg)", "reference_fabricant": "BET-BPS250-35",
     "categorie": cat_beton, "marque": weber,
     "description": "Béton de structure BPS250, sac 35kg. Résistance C25/30 à 28 jours. Usage général.",
     "unite_mesure": "sac", "poids": 35.0},
    {"nom": "Mortier colle standard 25kg", "reference_fabricant": "MORT-COL-25",
     "categorie": cat_beton, "marque": weber,
     "description": "Mortier-colle standard pour carrelage mur et sol intérieur. Classe C1. Sac 25kg.",
     "unite_mesure": "sac", "poids": 25.0},
    {"nom": "Parpaing creux 20x20x50cm (palette)", "reference_fabricant": "PARP-20-PAL",
     "categorie": cat_beton, "marque": weber,
     "description": "Parpaing creux 20x20x50cm, palette 100 pièces. Résistance 4MPa.",
     "unite_mesure": "palette", "poids": 1400.0},
    # Isolation
    {"nom": "Laine de verre 100mm (rouleau 12m²)", "reference_fabricant": "LV-100-12M2",
     "categorie": cat_isolation, "marque": isover,
     "description": "Laine de verre en rouleau 100mm d'épaisseur, 12m². Lambda 0.032 W/m.K. Résistance R=3,15 m².K/W.",
     "unite_mesure": "rouleau", "poids": 6.5},
    {"nom": "Laine de roche 80mm (panneau 1.2x0.6m)", "reference_fabricant": "LR-80-PAN",
     "categorie": cat_isolation, "marque": rockwool,
     "description": "Panneau de laine de roche rigide 80mm, 1200x600mm. Lambda 0.035 W/m.K. Non combustible.",
     "unite_mesure": "panneau", "poids": 2.8},
    {"nom": "Polystyrène expansé 60mm PSE (panneau 1.2x0.6m)", "reference_fabricant": "PSE-60-PAN",
     "categorie": cat_isolation, "marque": isover,
     "description": "Panneau PSE graphite 60mm, 1200x600mm. Lambda 0.031 W/m.K. Résistance R=1.93 m².K/W.",
     "unite_mesure": "panneau", "poids": 0.9},
]

produits = []
for p in produits_data:
    prod = Produit.objects.create(
        nom=p["nom"],
        reference_fabricant=p["reference_fabricant"],
        categorie=p["categorie"],
        marque=p["marque"],
        description=p.get("description", ""),
        unite_mesure=p.get("unite_mesure", "piece"),
        poids=Decimal(str(p.get("poids", 0))),
        active=True,
    )
    produits.append(prod)
    print(f"  Produit créé: {prod.nom}")

# ─────────────────────────────────────────
# FOURNISSEURS
# ─────────────────────────────────────────
print("\nCréation des fournisseurs...")

fournisseurs_data = [
    {
        "nom": "Leroy Merlin Paris Est",
        "nom_commercial": "Leroy Merlin",
        "type_fournisseur": "distributeur",
        "ville": "Noisy-le-Grand",
        "code_postal": "93160",
        "latitude": 48.847, "longitude": 2.552,
        "telephone": "01 43 05 40 00",
        "site_web": "https://www.leroymerlin.fr",
        "delai_livraison_moyen": 2,
        "frais_livraison_gratuite": Decimal("300.00"),
        "note_qualite": Decimal("4.20"),
        "nombre_evaluations": 1250,
        "accepte_commandes_en_ligne": True,
        "verifie": True,
    },
    {
        "nom": "Point P Paris Nord",
        "nom_commercial": "Point P",
        "type_fournisseur": "distributeur",
        "ville": "Saint-Denis",
        "code_postal": "93200",
        "latitude": 48.937, "longitude": 2.357,
        "telephone": "01 48 20 19 50",
        "site_web": "https://www.pointp.fr",
        "delai_livraison_moyen": 1,
        "frais_livraison_gratuite": Decimal("500.00"),
        "note_qualite": Decimal("4.50"),
        "nombre_evaluations": 890,
        "accepte_commandes_en_ligne": True,
        "verifie": True,
    },
    {
        "nom": "Brico Dépôt Créteil",
        "nom_commercial": "Brico Dépôt",
        "type_fournisseur": "distributeur",
        "ville": "Créteil",
        "code_postal": "94000",
        "latitude": 48.771, "longitude": 2.457,
        "telephone": "01 45 13 78 00",
        "site_web": "https://www.bricodepot.fr",
        "delai_livraison_moyen": 3,
        "frais_livraison_gratuite": Decimal("200.00"),
        "note_qualite": Decimal("3.80"),
        "nombre_evaluations": 567,
        "accepte_commandes_en_ligne": True,
        "verifie": True,
    },
    {
        "nom": "Prolians Île-de-France",
        "nom_commercial": "Prolians",
        "type_fournisseur": "grossiste",
        "ville": "Bobigny",
        "code_postal": "93000",
        "latitude": 48.909, "longitude": 2.440,
        "telephone": "01 48 95 25 00",
        "site_web": "https://www.prolians.com",
        "delai_livraison_moyen": 1,
        "frais_livraison_gratuite": Decimal("1000.00"),
        "note_qualite": Decimal("4.70"),
        "nombre_evaluations": 234,
        "accepte_commandes_en_ligne": False,
        "verifie": True,
    },
    {
        "nom": "Cedeo Paris Sud",
        "nom_commercial": "Cedeo",
        "type_fournisseur": "distributeur",
        "ville": "Ivry-sur-Seine",
        "code_postal": "94200",
        "latitude": 48.812, "longitude": 2.386,
        "telephone": "01 46 58 23 00",
        "site_web": "https://www.cedeo.fr",
        "delai_livraison_moyen": 2,
        "frais_livraison_gratuite": Decimal("400.00"),
        "note_qualite": Decimal("4.30"),
        "nombre_evaluations": 445,
        "accepte_commandes_en_ligne": True,
        "verifie": True,
    },
    {
        "nom": "GSB Pro Matériaux",
        "nom_commercial": "GSB Pro",
        "type_fournisseur": "grossiste",
        "ville": "Rungis",
        "code_postal": "94150",
        "latitude": 48.754, "longitude": 2.352,
        "telephone": "01 46 87 55 00",
        "site_web": "https://www.gsbpro.fr",
        "delai_livraison_moyen": 3,
        "frais_livraison_gratuite": Decimal("800.00"),
        "note_qualite": Decimal("4.10"),
        "nombre_evaluations": 178,
        "accepte_commandes_en_ligne": False,
        "verifie": False,
    },
    {
        "nom": "Castorama Versailles",
        "nom_commercial": "Castorama",
        "type_fournisseur": "distributeur",
        "ville": "Versailles",
        "code_postal": "78000",
        "latitude": 48.802, "longitude": 2.120,
        "telephone": "01 30 97 88 00",
        "site_web": "https://www.castorama.fr",
        "delai_livraison_moyen": 4,
        "frais_livraison_gratuite": Decimal("250.00"),
        "note_qualite": Decimal("3.90"),
        "nombre_evaluations": 678,
        "accepte_commandes_en_ligne": True,
        "verifie": True,
    },
    {
        "nom": "Würth France Pro",
        "nom_commercial": "Würth",
        "type_fournisseur": "fabricant",
        "ville": "Erstein",
        "code_postal": "67150",
        "latitude": 48.419, "longitude": 7.665,
        "telephone": "03 88 64 93 93",
        "site_web": "https://www.wurth.fr",
        "delai_livraison_moyen": 5,
        "frais_livraison_gratuite": Decimal("600.00"),
        "note_qualite": Decimal("4.80"),
        "nombre_evaluations": 1890,
        "accepte_commandes_en_ligne": True,
        "verifie": True,
    },
]

fournisseurs = []
for f in fournisseurs_data:
    fourn = Fournisseur.objects.create(**f)
    fournisseurs.append(fourn)
    print(f"  Fournisseur créé: {fourn.nom}")

# ─────────────────────────────────────────
# PRIX PRODUITS (variations réalistes)
# ─────────────────────────────────────────
print("\nCréation des prix...")

# (produit, fournisseur, prix, frais_livraison, stock, delai)
prix_data = [
    # Plaque BA13 2.5m
    (0, 0, "8.90", "12.00", 500, 2),   # Leroy Merlin
    (0, 1, "7.80", "15.00", 1200, 1),  # Point P - moins cher
    (0, 2, "8.20", "10.00", 350, 3),   # Brico Dépôt
    (0, 3, "7.10", "20.00", 2000, 1),  # Prolians - grossiste moins cher
    (0, 6, "8.50", "11.00", 280, 4),   # Castorama
    # Plaque BA13 hydrofuge
    (1, 0, "12.50", "12.00", 200, 2),
    (1, 1, "11.20", "15.00", 600, 1),
    (1, 3, "10.80", "20.00", 800, 1),
    # Rail 70mm
    (2, 0, "4.20", "12.00", 800, 2),
    (2, 1, "3.80", "15.00", 2000, 1),
    (2, 3, "3.40", "20.00", 5000, 1),
    (2, 7, "3.60", "25.00", 3000, 5),  # Würth
    # Montant 70mm
    (3, 0, "4.80", "12.00", 700, 2),
    (3, 1, "4.40", "15.00", 1800, 1),
    (3, 3, "3.90", "20.00", 4500, 1),
    # Enduit finition 25kg
    (4, 0, "18.90", "12.00", 150, 2),
    (4, 1, "16.50", "15.00", 400, 1),
    (4, 2, "17.80", "10.00", 100, 3),
    # Câble 2.5mm²
    (5, 0, "62.00", "12.00", 80, 2),
    (5, 1, "55.00", "15.00", 200, 1),
    (5, 3, "51.00", "20.00", 500, 1),
    (5, 7, "54.00", "25.00", 300, 5),
    # Câble 1.5mm²
    (6, 0, "42.00", "12.00", 100, 2),
    (6, 1, "37.50", "15.00", 250, 1),
    (6, 3, "35.00", "20.00", 600, 1),
    # Gaine ICTA 16mm
    (7, 0, "28.00", "12.00", 120, 2),
    (7, 1, "24.00", "15.00", 400, 1),
    (7, 3, "22.00", "20.00", 800, 1),
    # Tableau élec 13 modules
    (8, 0, "32.00", "12.00", 60, 2),
    (8, 1, "28.50", "15.00", 120, 1),
    (8, 4, "30.00", "18.00", 45, 2),   # Cedeo
    # Disjoncteur 20A
    (9, 0, "12.50", "12.00", 200, 2),
    (9, 1, "10.80", "15.00", 500, 1),
    (9, 7, "9.90", "25.00", 1000, 5),
    # Tube PER 16mm
    (10, 4, "89.00", "18.00", 50, 2),  # Cedeo
    (10, 0, "105.00", "12.00", 30, 2),
    (10, 1, "95.00", "15.00", 80, 1),
    # Tube cuivre 16/18
    (11, 4, "8.50", "18.00", 200, 2),
    (11, 1, "7.80", "15.00", 350, 1),
    (11, 5, "8.20", "22.00", 150, 3),  # GSB Pro
    # Robinet d'arrêt
    (12, 4, "14.50", "18.00", 100, 2),
    (12, 0, "18.00", "12.00", 60, 2),
    (12, 7, "12.90", "25.00", 500, 5),
    # Siphon douche
    (13, 4, "42.00", "18.00", 40, 2),
    (13, 0, "55.00", "12.00", 25, 2),
    # Béton BPS250
    (14, 0, "7.50", "12.00", 2000, 2),
    (14, 2, "6.80", "10.00", 1500, 3),
    (14, 5, "6.20", "22.00", 5000, 3),
    # Mortier colle
    (15, 0, "12.90", "12.00", 300, 2),
    (15, 2, "11.50", "10.00", 200, 3),
    (15, 5, "10.80", "22.00", 800, 3),
    # Parpaings (palette)
    (16, 5, "145.00", "0.00", 50, 3),
    (16, 3, "132.00", "0.00", 100, 1),
    # Laine de verre
    (17, 0, "38.00", "12.00", 80, 2),
    (17, 2, "34.50", "10.00", 120, 3),
    (17, 6, "36.00", "11.00", 60, 4),
    # Laine de roche
    (18, 0, "18.50", "12.00", 150, 2),
    (18, 1, "16.80", "15.00", 300, 1),
    (18, 5, "15.90", "22.00", 500, 3),
    # PSE graphite
    (19, 0, "9.80", "12.00", 200, 2),
    (19, 2, "8.50", "10.00", 300, 3),
    (19, 6, "9.20", "11.00", 150, 4),
]

for prod_idx, fourn_idx, prix, frais, stock, delai in prix_data:
    if prod_idx < len(produits) and fourn_idx < len(fournisseurs):
        PrixProduit.objects.create(
            produit=produits[prod_idx],
            fournisseur=fournisseurs[fourn_idx],
            prix=Decimal(prix),
            frais_livraison=Decimal(frais),
            stock_disponible=stock,
            delai_livraison=delai,
            disponible=True,
            source_donnees='manual',
        )

print(f"\n✅ Seed terminé !")
print(f"   {Categorie.objects.count()} catégories")
print(f"   {Marque.objects.count()} marques")
print(f"   {Produit.objects.count()} produits")
print(f"   {Fournisseur.objects.count()} fournisseurs")
print(f"   {PrixProduit.objects.count()} prix fournisseurs")
