"""
Script de seed data pour TradeLayer App 3.
Crée des corps de métier, projets, calques et ÉLÉMENTS GÉOMÉTRIQUES de démonstration.
Les éléments incluent des coordonnées 3D réalistes pour simuler un vrai jumeau numérique.
Usage: python manage.py shell < seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tradelayer_backend.settings')
django.setup()

from django.contrib.auth.models import User
from calques_metiers.models import CorpsMetier, Projet, CalqueMetier, ElementCalque, Annotation

print("Nettoyage des données existantes...")
Annotation.objects.all().delete()
ElementCalque.objects.all().delete()
CalqueMetier.objects.all().delete()
Projet.objects.all().delete()
CorpsMetier.objects.all().delete()

# ─────────────────────────────────────────
# CORPS DE MÉTIER
# ─────────────────────────────────────────
print("Création des corps de métier...")
corps_data = [
    {"nom": "plomberie", "nom_affichage": "Plomberie", "couleur_principale": "#3b82f6", "icone": "drop", "ordre_affichage": 1, "description": "Installations eau froide, eau chaude, évacuations, sanitaires."},
    {"nom": "electricite", "nom_affichage": "Électricité", "couleur_principale": "#eab308", "icone": "zap", "ordre_affichage": 2, "description": "Câblage, tableaux électriques, prises, éclairage, domotique."},
    {"nom": "placo", "nom_affichage": "Plâtrerie / Placo", "couleur_principale": "#94a3b8", "icone": "square", "ordre_affichage": 3, "description": "Cloisons en plaque de plâtre BA13, doublages, faux-plafonds."},
    {"nom": "cvc", "nom_affichage": "CVC", "couleur_principale": "#ef4444", "icone": "wind", "ordre_affichage": 4, "description": "Chauffage, ventilation, climatisation. Gaines, bouches, équipements."},
    {"nom": "charpente", "nom_affichage": "Charpente", "couleur_principale": "#92400e", "icone": "triangle", "ordre_affichage": 5, "description": "Ossature bois, charpente, poutres, chevrons."},
    {"nom": "peinture", "nom_affichage": "Peinture", "couleur_principale": "#22c55e", "icone": "brush", "ordre_affichage": 6, "description": "Préparation des surfaces, peinture intérieure et extérieure."},
]
corps_objs = {}
for c in corps_data:
    obj = CorpsMetier.objects.create(**c)
    corps_objs[c["nom"]] = obj
    print(f"  {obj.nom_affichage}")

# ─────────────────────────────────────────
# UTILISATEURS
# ─────────────────────────────────────────
admin_user = User.objects.filter(is_superuser=True).first()
if not admin_user:
    admin_user = User.objects.create_superuser('admin', 'admin@eyetech.fr', 'eyetech2024')
    print("Admin créé.")

demo_user, created = User.objects.get_or_create(
    username='demo',
    defaults={'email': 'demo@eyetech.fr', 'first_name': 'Demo', 'last_name': 'Eyetech'},
)
if created:
    demo_user.set_password('DemoEyetech2026!')
    demo_user.save()
    print("Utilisateur demo créé.")

# ─────────────────────────────────────────
# PROJETS
# ─────────────────────────────────────────
print("\nCréation des projets...")
proj_demo = Projet.objects.create(
    proprietaire=admin_user,
    nom="Chantier Démo Eyetech — Immeuble Acacias",
    description="Projet de démonstration Eyetech. Rénovation complète d'un immeuble de 6 logements. Calques plomberie, électricité, placo et CVC avec éléments 3D.",
    adresse="14 rue des Acacias, 75017 Paris",
    latitude=48.8831, longitude=2.2985,
    surface_totale=480.0, nombre_etages=5,
    type_batiment="Immeuble résidentiel", statut="en_cours",
)
proj_demo.collaborateurs.add(demo_user)
print(f"  {proj_demo.nom}")

for nom, adresse, lat, lng, surf, etages, bat, statut in [
    ("Bureaux Coworking — ZAC Seine Ouest", "12 allée des Impressionnistes, 92130 Issy-les-Moulineaux", 48.818, 2.265, 1200.0, 1, "Bureau", "planification"),
    ("Maison Individuelle — Lot 7 Les Chênes", "Lot 7 résidence Les Chênes, 78170 La Celle-Saint-Cloud", 48.843, 2.016, 148.0, 2, "Maison individuelle", "en_cours"),
    ("École Primaire J. Prévert — Extension", "32 avenue Jacques Prévert, 93100 Montreuil", 48.856, 2.449, 620.0, 1, "Établissement scolaire", "planification"),
]:
    p = Projet.objects.create(proprietaire=admin_user, nom=nom, adresse=adresse, latitude=lat, longitude=lng, surface_totale=surf, nombre_etages=etages, type_batiment=bat, statut=statut)
    print(f"  {p.nom}")

# ─────────────────────────────────────────
# CALQUES (projet démo)
# ─────────────────────────────────────────
print("\nCréation des calques...")
calque_plomb = CalqueMetier.objects.create(projet=proj_demo, corps_metier=corps_objs["plomberie"], nom="Plomberie — Réseau EF/EC RDC + R+1", description="Réseau eau froide et eau chaude sanitaire. Colonnes montantes et dérivations par logement.", auteur=admin_user, derniere_modification_par=admin_user)
calque_elec = CalqueMetier.objects.create(projet=proj_demo, corps_metier=corps_objs["electricite"], nom="Électricité — Tableau général + colonnes", description="Tableau général de distribution, colonnes montantes électriques, mise à la terre.", auteur=admin_user, derniere_modification_par=admin_user)
calque_placo = CalqueMetier.objects.create(projet=proj_demo, corps_metier=corps_objs["placo"], nom="Cloisons BA13 — Logements R+1", description="Toutes les cloisons de séparation intérieure en plaque de plâtre BA13.", auteur=admin_user, derniere_modification_par=admin_user)
calque_cvc = CalqueMetier.objects.create(projet=proj_demo, corps_metier=corps_objs["cvc"], nom="VMC — Gaines collectives", description="Réseau de ventilation mécanique contrôlée. Gaines collectives et bouches par logement.", auteur=admin_user, derniere_modification_par=admin_user)
print(f"  4 calques créés pour le projet démo")

# ─────────────────────────────────────────
# ÉLÉMENTS GÉOMÉTRIQUES (JUMEAU NUMÉRIQUE)
# Système de coordonnées : X=est, Y=nord, Z=hauteur (mètres)
# Bâtiment : 12m large, 15m long. RDC à Z=0, R+1 à Z=3.0
# ─────────────────────────────────────────
print("\nCréation des éléments 3D (jumeau numérique)...")

def mk_elem(calque, type_el, nom, geom, desc, metier, couleur):
    return ElementCalque.objects.create(
        calque=calque, type_element=type_el, nom=nom,
        geometrie=geom, description=desc,
        proprietes_metier=metier, couleur=couleur, auteur=admin_user,
    )

# --- PLOMBERIE ---
mk_elem(calque_plomb, "ligne", "Colonne montante eau froide — cage escalier",
    {"points": [{"x":1.5,"y":14.0,"z":0.0},{"x":1.5,"y":14.0,"z":9.0}],"diametre_mm":32,"materiau":"PVC"},
    "Colonne montante EF DN32 depuis nourrice RDC jusqu'au R+2",
    {"fluide":"eau_froide","norme":"DTU 60.11","isolation":"coquille_40mm"}, "#3b82f6")

mk_elem(calque_plomb, "ligne", "Colonne montante eau chaude — cage escalier",
    {"points": [{"x":2.0,"y":14.0,"z":0.0},{"x":2.0,"y":14.0,"z":9.0}],"diametre_mm":25,"materiau":"Cuivre"},
    "Colonne montante EC DN25 cuivre, isolation laine de verre 30mm",
    {"fluide":"eau_chaude","norme":"DTU 60.11","temperature_max_c":70}, "#ef4444")

mk_elem(calque_plomb, "ligne", "Dérivation EF — Logement RDC gauche",
    {"points":[{"x":1.5,"y":14.0,"z":0.3},{"x":1.5,"y":9.0,"z":0.3},{"x":5.0,"y":9.0,"z":0.3}],"diametre_mm":20,"materiau":"PER"},
    "Nourrice EF au couloir + dérivation vers cuisine et salle de bain logement RDC",
    {"fluide":"eau_froide","etage":"RDC","logement":1}, "#60a5fa")

mk_elem(calque_plomb, "symbole", "Baignoire — Salle de bain logement RDC",
    {"position":{"x":5.5,"y":8.0,"z":0.0},"dimensions":{"longueur":1.70,"largeur":0.75},"symbole":"baignoire","orientation_deg":0},
    "Baignoire encastrée + mitigeur thermostatique",
    {"type":"baignoire","marque":"Ideal Standard","alimentation":"EF+EC+vidange"}, "#93c5fd")

mk_elem(calque_plomb, "ligne", "Évacuation EU — Cuisine R+1",
    {"points":[{"x":3.0,"y":5.0,"z":3.15},{"x":3.0,"y":5.0,"z":2.8},{"x":3.0,"y":14.0,"z":2.8},{"x":3.0,"y":14.0,"z":0.0}],"diametre_mm":100,"materiau":"PVC_EU","pente_pourcent":2.0},
    "Chute EU DN100 depuis cuisine R+1 jusqu'au regard de sol",
    {"fluide":"eaux_usees","norme":"DTU 60.11"}, "#78716c")

print(f"  5 éléments plomberie")

# --- ÉLECTRICITÉ ---
mk_elem(calque_elec, "symbole", "Tableau Général de Distribution",
    {"position":{"x":0.5,"y":13.5,"z":1.5},"dimensions":{"largeur":0.6,"hauteur":1.2,"profondeur":0.2},"symbole":"tableau_electrique"},
    "TGD 400V triphasé — 63A par colonne — 6 colonnes logements + parties communes",
    {"tension":"400V_triphase","intensite_nominale":63,"nombre_colonnes":6,"marque":"Schneider","norme":"NF C 15-100"}, "#eab308")

mk_elem(calque_elec, "ligne", "Colonne montante électrique — cage escalier",
    {"points":[{"x":0.8,"y":13.5,"z":0.0},{"x":0.8,"y":13.5,"z":9.0}],"section_mm2":16,"materiau":"Câble U1000 R2V","gaine":"ICTA32"},
    "Colonne montante 3x16mm² depuis TGD jusqu'au tableau logement R+2",
    {"norme":"NF C 15-100","protection":"disjoncteur_63A"}, "#fbbf24")

mk_elem(calque_elec, "symbole", "Tableau Logement R+1 — Appartement 3",
    {"position":{"x":1.0,"y":2.0,"z":3.5},"dimensions":{"largeur":0.4,"hauteur":0.6,"profondeur":0.1},"symbole":"tableau_electrique"},
    "Tableau individuel 13 modules — 1 disj différentiel 40A + 8 disj circuits",
    {"logement":"Apt 3 — R+1 gauche","puissance_souscrite":"9kVA"}, "#f59e0b")

mk_elem(calque_elec, "ligne", "Câblage prises séjour — Apt 3 R+1",
    {"points":[{"x":1.0,"y":2.0,"z":3.5},{"x":5.0,"y":2.0,"z":3.5},{"x":5.0,"y":2.0,"z":3.3}],"section_mm2":2.5,"materiau":"U1000 R2V","gaine":"ICTA16"},
    "Circuit prises séjour 2.5mm² — 5 prises doubles + gaine technique TV",
    {"norme":"NF C 15-100","circuit":"prises_16A","nb_prises":5}, "#fde047")

mk_elem(calque_elec, "symbole", "Prise double avec terre — Séjour R+1",
    {"position":{"x":5.0,"y":2.1,"z":3.3},"symbole":"prise_double","hauteur_pose_cm":30},
    "Prise 2P+T 16A — Legrand Céliane blanc",
    {"marque":"Legrand","modele":"Céliane","norme":"NF C 61-314"}, "#fef08a")

print(f"  5 éléments électricité")

# --- PLACO ---
mk_elem(calque_placo, "rectangle", "Cloison BA13 — Couloir R+1 côté séjour",
    {"origine":{"x":1.0,"y":3.0,"z":3.0},"vecteur_u":{"x":6.0,"y":0.0,"z":0.0},"vecteur_v":{"x":0.0,"y":0.0,"z":2.7},"epaisseur_m":0.072,"type":"cloison_72"},
    "Cloison 72/48 BA13 simple peau. Séparation couloir / séjour.",
    {"norme":"DTU 25.41","type_cloison":"72/48_simple_peau","performance_acoustique_dB":38,"surface_m2":16.2}, "#cbd5e1")

mk_elem(calque_placo, "rectangle", "Cloison hydrofuge BA13H — Salle de bain R+1",
    {"origine":{"x":4.5,"y":6.5,"z":3.0},"vecteur_u":{"x":2.5,"y":0.0,"z":0.0},"vecteur_v":{"x":0.0,"y":0.0,"z":2.7},"epaisseur_m":0.072,"type":"cloison_hydrofuge"},
    "Cloison BA13H (hydrofuge) pour séparation SdB. Doublage carrelage prévu.",
    {"norme":"DTU 25.41","type_cloison":"72/48_BA13H","zone":"humide","surface_m2":6.75}, "#94a3b8")

mk_elem(calque_placo, "rectangle", "Doublage thermique BA13 + laine de verre — Façade nord",
    {"origine":{"x":0.0,"y":15.0,"z":3.0},"vecteur_u":{"x":12.0,"y":0.0,"z":0.0},"vecteur_v":{"x":0.0,"y":0.0,"z":2.7},"epaisseur_m":0.13,"type":"doublage_thermique"},
    "Doublage BA13 + laine de verre 100mm. R=3.15 m².K/W.",
    {"norme":"DTU 25.41","isolation":"laine_de_verre_100mm","R_value":3.15,"surface_m2":32.4}, "#e2e8f0")

print(f"  3 éléments placo")

# --- CVC ---
mk_elem(calque_cvc, "ligne", "Gaine VMC collective — Cage escalier",
    {"points":[{"x":3.0,"y":13.0,"z":0.0},{"x":3.0,"y":13.0,"z":10.5}],"section_mm":{"largeur":250,"hauteur":200},"materiau":"tole_galva"},
    "Gaine VMC collective 250x200mm depuis sous-sol jusqu'en toiture. Débit total 1200 m³/h.",
    {"debit_m3h":1200,"norme":"DTU 68.2","type":"extraction_collective"}, "#f87171")

mk_elem(calque_cvc, "ligne", "Dérivation VMC — Logements R+1",
    {"points":[{"x":3.0,"y":13.0,"z":5.8},{"x":3.0,"y":8.0,"z":5.8},{"x":6.0,"y":8.0,"z":5.8},{"x":9.0,"y":8.0,"z":5.8}],"section_mm":{"largeur":125,"hauteur":100},"materiau":"tole_galva"},
    "Gaine horizontale R+1 vers bouches cuisine et SdB — 2 logements.",
    {"debit_m3h":400,"norme":"DTU 68.2"}, "#fca5a5")

mk_elem(calque_cvc, "symbole", "Bouche extraction VMC — Cuisine Apt 3 R+1",
    {"position":{"x":6.0,"y":7.5,"z":5.65},"symbole":"bouche_vmc","diametre_mm":125},
    "Bouche d'extraction hygroréglable type B — cuisine. Débit 90-135 m³/h.",
    {"type":"extraction_hygro_B","debit_min_m3h":90,"debit_max_m3h":135,"marque":"Aldes","norme":"DTU 68.2"}, "#ef4444")

mk_elem(calque_cvc, "symbole", "Bouche extraction VMC — Salle de bain Apt 3 R+1",
    {"position":{"x":5.5,"y":7.5,"z":5.65},"symbole":"bouche_vmc","diametre_mm":80},
    "Bouche d'extraction hygroréglable type B — SdB. Débit 15-45 m³/h.",
    {"type":"extraction_hygro_B","debit_min_m3h":15,"debit_max_m3h":45,"marque":"Aldes","norme":"DTU 68.2"}, "#ef4444")

print(f"  4 éléments CVC")

# ─────────────────────────────────────────
# ANNOTATIONS
# ─────────────────────────────────────────
print("\nCréation des annotations...")

elem_ef = ElementCalque.objects.filter(calque=calque_plomb, nom__contains="eau froide").first()
elem_sdb = ElementCalque.objects.filter(calque=calque_placo, nom__contains="Salle de bain").first()

if elem_ef:
    Annotation.objects.create(
        calque=calque_plomb, element=elem_ef,
        type_annotation='note',
        titre='Attention : passage gaine VMC à 15cm',
        contenu="Vérifier la distance entre la colonne EF DN32 et la gaine VMC collective. Distance actuelle calculée : 14cm. Prévoir protection thermique si < 20cm (DTU 60.11 §5.3).",
        auteur=admin_user, priorite=3, statut='ouvert',
    )

if elem_sdb:
    Annotation.objects.create(
        calque=calque_placo, element=elem_sdb,
        type_annotation='validation',
        titre='Cloison SdB validée — position confirmée',
        contenu="Position confirmée par le maître d'oeuvre le 15/03/2026. Respecte le gabarit sanitaire minimal 1.4m². Aucune réservation supplémentaire requise.",
        auteur=admin_user, priorite=2, statut='resolu',
    )

Annotation.objects.create(
    calque=calque_elec,
    type_annotation='probleme',
    titre='Conflit potentiel câble / gaine CVC à x=3.0m',
    contenu="Le câblage colonne électrique (x=0.8m, y=13.5m) et la gaine CVC (x=3.0m, y=13.0m) passent tous les deux dans le même faux-plafond technique. Vérifier le chemin de câbles.",
    position_x=0.8, position_y=13.5, position_z=5.8,
    auteur=admin_user, priorite=3, statut='en_cours',
)

print(f"\n✅ Seed App 3 terminé !")
print(f"   {CorpsMetier.objects.count()} corps de métier")
print(f"   {Projet.objects.count()} projets")
print(f"   {CalqueMetier.objects.count()} calques")
print(f"   {ElementCalque.objects.count()} éléments géométriques 3D")
print(f"   {Annotation.objects.count()} annotations")
print(f"\n   Token démo  : GET http://localhost:8003/api/demo/token/")
print(f"   Swagger API : http://localhost:8003/api/docs/")
