"""
Script de seed data pour Perce-Mur App 1.
Crée un projet démo avec des points de perçage et mesures AR réalistes.
Simule un scan LiDAR d'une pièce avec obstacles cachés (câbles, tuyaux).
Usage: python manage.py shell < seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perce_mur_backend.settings')
django.setup()

from core.models import User, Project, DrillingPoint, ARMeasurement

print("Nettoyage des données existantes...")
ARMeasurement.objects.all().delete()
DrillingPoint.objects.all().delete()
Project.objects.all().delete()

# ─────────────────────────────────────────
# UTILISATEURS
# ─────────────────────────────────────────
admin_user = User.objects.filter(is_superuser=True).first()
if not admin_user:
    admin_user = User.objects.create_superuser(
        username='admin', email='admin@eyetech.fr', password='eyetech2024'
    )
    print("Admin créé.")

demo_user, created = User.objects.get_or_create(
    email='demo@eyetech.fr',
    defaults={'username': 'demo', 'first_name': 'Demo', 'last_name': 'Eyetech'},
)
if created:
    demo_user.set_password('DemoEyetech2026!')
    demo_user.save()
    print("Utilisateur demo créé.")

# ─────────────────────────────────────────
# PROJET DÉMO
# ─────────────────────────────────────────
print("\nCréation du projet démo...")

proj = Project.objects.create(
    user=admin_user,
    name="Chantier Démo — Appartement 3 R+1",
    description=(
        "Projet de démonstration Perce-Mur. Appartement en rénovation, murs porteurs en béton. "
        "Le scan LiDAR a détecté 2 câbles électriques et 1 tuyau PER dans le mur ouest. "
        "Ce projet illustre la détection d'obstacles et le guidage AR au perçage."
    ),
    location="14 rue des Acacias, Paris 17e — R+1 gauche",
)
print(f"  Projet : {proj.name}")

# ─────────────────────────────────────────
# POINTS DE PERÇAGE
# Système de coordonnées : X=horizontal (cm depuis angle gauche du mur)
# Y=vertical (cm depuis le sol), Z=profondeur dans le mur (mm)
# Mur ouest de la chambre : 380cm de large, 270cm de haut
# ─────────────────────────────────────────
print("\nCréation des points de perçage...")

points_data = [
    # Points validés — pas d'obstacle
    {"x": 45.0, "y": 165.0, "z": 0.0, "description": "Cheville tableau — Zone libre. Aucun obstacle détecté. Béton armé 18cm. Foret Ø10 recommandé."},
    {"x": 145.0, "y": 165.0, "z": 0.0, "description": "Cheville tableau — Zone libre. Béton armé 18cm. Foret Ø10."},
    {"x": 245.0, "y": 165.0, "z": 0.0, "description": "Cheville tableau côté fenêtre — Zone libre. Béton armé 18cm."},
    # Points avec obstacle détecté — câble électrique
    {"x": 95.0, "y": 165.0, "z": 0.0, "description": "⚠️ OBSTACLE DÉTECTÉ : Câble électrique 1.5mm² à 4cm de profondeur, Z=85cm sol. Ne pas percer. Décaler de ±15cm horizontalement."},
    {"x": 95.0, "y": 130.0, "z": 0.0, "description": "⚠️ OBSTACLE DÉTECTÉ : Même câble électrique. Tracé vertical confirmé par scan. Zone de 20cm à éviter autour de X=95cm."},
    # Point avec obstacle — tuyau PER
    {"x": 200.0, "y": 80.0, "z": 0.0, "description": "⚠️ OBSTACLE DÉTECTÉ : Tuyau PER 16mm (eau froide) à 6cm de profondeur. Pression 3 bars. Ne pas percer. Zone de 15cm à éviter."},
    # Points décalés validés après détection obstacles
    {"x": 75.0, "y": 165.0, "z": 0.0, "description": "✅ Position décalée validée — à 20cm du câble X=95. Profondeur max sécurisée : 12cm. Foret Ø8."},
    {"x": 115.0, "y": 165.0, "z": 0.0, "description": "✅ Position décalée validée — à 20cm du câble X=95. Profondeur max sécurisée : 12cm. Foret Ø8."},
    {"x": 185.0, "y": 80.0, "z": 0.0, "description": "✅ Position décalée validée — à 15cm du tuyau PER. Zone de béton pur. Foret Ø12 max 8cm profondeur."},
    # Ligne guide horizontale (alignement tableau)
    {"x": 45.0, "y": 182.0, "z": 0.0, "description": "Repère guide AR — Ligne horizontale à H=182cm. Alignement tableau électrique côté gauche."},
    {"x": 335.0, "y": 182.0, "z": 0.0, "description": "Repère guide AR — Ligne horizontale à H=182cm. Alignement tableau électrique côté droit."},
]

for p in points_data:
    DrillingPoint.objects.create(project=proj, **p)

print(f"  {DrillingPoint.objects.filter(project=proj).count()} points de perçage créés")

# ─────────────────────────────────────────
# MESURES AR (données de scan LiDAR simulées)
# ─────────────────────────────────────────
print("\nCréation des mesures AR...")

mesures_data = [
    {
        "data": {
            "type": "scan_lidar",
            "appareil": "iPhone 15 Pro — LiDAR Scanner",
            "date_scan": "2026-03-15T09:30:00Z",
            "mur": "Mur ouest chambre principale",
            "dimensions_mur": {"largeur_cm": 380, "hauteur_cm": 270, "epaisseur_cm": 18},
            "materiau_detecte": "béton_armé",
            "qualite_scan": 0.94,
            "nombre_points_nuage": 48200,
            "obstacles_detectes": [
                {
                    "id": "obs_001",
                    "type": "cable_electrique",
                    "section_mm2": 1.5,
                    "position": {"x_cm": 95, "y_min_cm": 10, "y_max_cm": 265},
                    "profondeur_cm": 4,
                    "tracé": "vertical",
                    "tension_estimee_V": 230,
                    "confiance": 0.89,
                    "norme_securite": "IEC 60364",
                    "zone_exclusion_cm": 20,
                },
                {
                    "id": "obs_002",
                    "type": "tuyau_per",
                    "diametre_mm": 16,
                    "position": {"x_cm": 200, "y_min_cm": 50, "y_max_cm": 110},
                    "profondeur_cm": 6,
                    "tracé": "horizontal",
                    "pression_bars": 3,
                    "fluide": "eau_froide",
                    "confiance": 0.92,
                    "norme_securite": "DTU 60.11",
                    "zone_exclusion_cm": 15,
                },
            ],
            "zones_libres": [
                {"x_min_cm": 0, "x_max_cm": 80, "y_min_cm": 30, "description": "Zone gauche libre — béton homogène"},
                {"x_min_cm": 110, "x_max_cm": 185, "y_min_cm": 30, "description": "Zone centrale libre"},
                {"x_min_cm": 215, "x_max_cm": 380, "y_min_cm": 30, "description": "Zone droite libre"},
            ],
        }
    },
    {
        "data": {
            "type": "mesure_distance_ar",
            "date": "2026-03-15T09:45:00Z",
            "mesures": [
                {"id": "m1", "description": "Sol → plafond", "valeur_cm": 268, "precision_mm": 3},
                {"id": "m2", "description": "Angle gauche → angle droit", "valeur_cm": 382, "precision_mm": 4},
                {"id": "m3", "description": "Sol → centre fenêtre", "valeur_cm": 110, "precision_mm": 3},
                {"id": "m4", "description": "Profondeur mur (béton)", "valeur_cm": 18, "precision_mm": 2},
                {"id": "m5", "description": "Distance câble élec → surface mur", "valeur_cm": 4, "precision_mm": 2},
            ],
        }
    },
    {
        "data": {
            "type": "session_percage_ar",
            "date": "2026-03-15T10:15:00Z",
            "technicien": "J. Dupont",
            "points_percés": [
                {"point_id": 1, "statut": "réalisé", "profondeur_cm": 8, "duree_sec": 45},
                {"point_id": 2, "statut": "réalisé", "profondeur_cm": 8, "duree_sec": 42},
                {"point_id": 3, "statut": "réalisé", "profondeur_cm": 8, "duree_sec": 48},
                {"point_id": 4, "statut": "abandonné", "raison": "obstacle_détecté_en_temps_réel", "profondeur_cm": 0},
                {"point_id": 7, "statut": "réalisé", "profondeur_cm": 7.5, "duree_sec": 40},
                {"point_id": 8, "statut": "réalisé", "profondeur_cm": 7.5, "duree_sec": 38},
            ],
            "bilan": {
                "percages_reussis": 5,
                "obstacles_evites": 1,
                "economie_degats_estimee_EUR": 2400,
                "note_session": "Excellent guidage AR. 1 collision évitée grâce à la détection temps réel.",
            }
        }
    },
]

for m in mesures_data:
    ARMeasurement.objects.create(project=proj, data=m["data"])

print(f"  {ARMeasurement.objects.filter(project=proj).count()} mesures AR créées")

print(f"\n✅ Seed App 1 terminé !")
print(f"   {Project.objects.count()} projet démo")
print(f"   {DrillingPoint.objects.count()} points de perçage")
print(f"   {ARMeasurement.objects.count()} mesures AR / scans LiDAR")
print(f"\n   Token démo  : GET http://localhost:8001/api/demo/token/")
print(f"   API projets : http://localhost:8001/api/projects/")
