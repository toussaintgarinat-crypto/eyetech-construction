"""
Commande de seed pour BuildingScan — génère des données de démonstration.
Usage : python manage.py seed_buildingscan
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from scans.models import ChantierScan, SessionScan
from mesures.models import Mesure, ZoneMesure
from jumeaux_numeriques.models import JumeauNumerique


class Command(BaseCommand):
    help = "Génère des données de démonstration pour BuildingScan"

    def handle(self, *args, **options):
        self.stdout.write("Nettoyage des données existantes...")
        JumeauNumerique.objects.all().delete()
        Mesure.objects.all().delete()
        ZoneMesure.objects.all().delete()
        SessionScan.objects.all().delete()
        ChantierScan.objects.all().delete()

        admin = User.objects.filter(username='admin').first()
        if not admin:
            admin = User.objects.create_superuser('admin', 'admin@eyetech.fr', 'eyetech2024')
            self.stdout.write("  Superuser 'admin' créé")

        self.stdout.write("Création des chantiers...")

        chantiers_data = [
            {
                'nom': "Résidence Les Acacias — Bât. A",
                'adresse': "14 allée des Acacias, 93100 Montreuil",
                'description': "Rénovation complète d'un immeuble R+4. Scan LiDAR des parties communes et appartements.",
                'statut': 'termine',
            },
            {
                'nom': "Bureaux Horizon — Tour Nord",
                'adresse': "8 avenue de la Défense, 92800 Puteaux",
                'description': "Scan photogrammétrique d'un plateau de bureaux open-space 1200m² pour cloisonnement.",
                'statut': 'en_cours',
            },
            {
                'nom': "Entrepôt Logistique Rungis — Zone C",
                'adresse': "15 rue du Commerce, 94150 Rungis",
                'description': "Jumeau numérique d'un entrepôt 8000m² — cartographie complète pour réorganisation.",
                'statut': 'en_cours',
            },
            {
                'nom': "Maison Individuelle — Extension",
                'adresse': "3 rue des Lilas, 77300 Fontainebleau",
                'description': "Scan avant extension de 60m². Mesures précises pour plan architecte.",
                'statut': 'termine',
            },
            {
                'nom': "Clinique Saint-Joseph — Bloc B",
                'adresse': "42 boulevard Pasteur, 75015 Paris",
                'description': "Relevé technique pour rénovation bloc opératoire. Précision requise < 5mm.",
                'statut': 'en_cours',
            },
        ]

        chantiers = []
        for d in chantiers_data:
            c = ChantierScan.objects.create(created_by=admin, **d)
            chantiers.append(c)
            self.stdout.write(f"  Chantier créé : {c.nom}")

        self.stdout.write("Création des sessions de scan...")

        sessions_data = [
            # Acacias
            (0, 'lidar', 'iPhone 15 Pro', 45, 320.0, 'termine'),
            (0, 'lidar', 'iPhone 15 Pro', 38, 280.0, 'termine'),
            # Horizon
            (1, 'photogrammetrie', 'iPhone 14 Pro', 90, 1200.0, 'traitement'),
            # Rungis
            (2, 'mixte', 'iPhone 15 Pro Max', 180, 4000.0, 'traitement'),
            (2, 'lidar', 'iPhone 15 Pro', 120, 4000.0, 'en_cours'),
            # Fontainebleau
            (3, 'lidar', 'iPhone 13 Pro', 25, 85.0, 'termine'),
            # Clinique
            (4, 'lidar', 'iPhone 15 Pro', 60, 450.0, 'en_cours'),
        ]

        sessions = []
        for chan_idx, methode, device, duree, surface, statut in sessions_data:
            s = SessionScan.objects.create(
                chantier=chantiers[chan_idx],
                operateur=admin,
                device_utilise=device,
                methode=methode,
                duree_minutes=duree,
                surface_scannee_m2=surface,
                statut=statut,
            )
            sessions.append(s)

        self.stdout.write("Création des mesures...")

        mesures_data = [
            # Session 0 (Acacias LiDAR)
            (0, 'distance', 3.85, 'm', 'Hauteur sous plafond — Couloir RDC', 0, 0, 0, 0, 0, 3.85),
            (0, 'surface', 18.5, 'm²', 'Surface — Cage escalier', 0, 0, 0, 4.3, 4.3, 0),
            (0, 'distance', 12.4, 'm', 'Longueur façade Est', 0, 0, 0, 12.4, 0, 0),
            (0, 'volume', 145.2, 'm³', 'Volume total niveau 0', 0, 0, 0, 10, 10, 3.85),
            (0, 'distance', 0.23, 'm', 'Épaisseur mur porteur', 0, 0, 0, 0.23, 0, 0),
            # Session 2 (Fontainebleau)
            (5, 'surface', 62.3, 'm²', 'Surface maison existante', 0, 0, 0, 8.1, 7.7, 0),
            (5, 'surface', 18.7, 'm²', 'Surface extension prévue', 8.1, 0, 0, 12.1, 0, 0),
            (5, 'hauteur', 2.90, 'm', 'Hauteur sous solive', 0, 0, 0, 0, 0, 2.90),
            (5, 'distance', 4.2, 'm', 'Largeur baie vitrée projet', 8.1, 0, 0, 12.3, 0, 0),
            # Session 3 (Rungis)
            (3, 'surface', 7840.5, 'm²', 'Surface utile entrepôt zone C', 0, 0, 0, 100, 80, 0),
            (3, 'hauteur', 9.8, 'm', 'Hauteur libre sous faîtage', 0, 0, 0, 0, 0, 9.8),
            (3, 'distance', 42.3, 'm', 'Longueur allée principale', 0, 0, 0, 42.3, 0, 0),
        ]

        for (ses_idx, type_m, val, unite, label, dx, dy, dz, ax, ay, az) in mesures_data:
            Mesure.objects.create(
                session=sessions[ses_idx],
                type_mesure=type_m,
                valeur=val,
                unite=unite,
                label=label,
                point_depart_x=dx, point_depart_y=dy, point_depart_z=dz,
                point_arrivee_x=ax, point_arrivee_y=ay, point_arrivee_z=az,
            )

        self.stdout.write("Création des zones de mesure...")

        zones_data = [
            (0, 'Séjour / Salon', 'piece', 28.4, 85.2, 2.55, 21.4),
            (0, 'Chambre principale', 'piece', 16.2, 48.6, 2.55, 16.4),
            (0, 'Cuisine', 'piece', 12.1, 36.3, 2.55, 14.0),
            (0, 'Couloir RDC', 'couloir', 8.5, 25.5, 2.55, 11.8),
            (0, 'Cage escalier principale', 'escalier', 6.3, 75.6, 12.75, 10.2),
            (1, 'Open-space principal', 'piece', 820.0, 2460.0, 2.80, 115.0),
            (1, 'Salle de réunion A', 'piece', 45.0, 135.0, 2.80, 27.0),
            (1, 'Couloir distribucation', 'couloir', 48.0, 144.0, 2.80, 34.0),
            (3, 'Salle de bloc principal', 'piece', 38.0, 152.0, 4.0, 24.8),
            (3, 'Couloir stérile', 'couloir', 22.5, 90.0, 3.2, 29.0),
        ]

        for (chan_idx, nom, type_z, surface, volume, hauteur, perimetre) in zones_data:
            ZoneMesure.objects.create(
                chantier=chantiers[chan_idx],
                nom=nom,
                type_zone=type_z,
                surface_m2=surface,
                volume_m3=volume,
                hauteur_m=hauteur,
                perimetre_m=perimetre,
            )

        self.stdout.write("Création des jumeaux numériques...")

        jumeaux_data = [
            (0, "Acacias Bât.A — Jumeau complet v2", "2.0", "GLB", "pret", 2847, 0.8, True),
            (0, "Acacias Bât.A — RDC uniquement v1", "1.0", "IFC", "pret", 342, 1.2, False),
            (1, "Horizon Tour Nord — Plateau R+3", "1.0", "GLB", "generation", 8920, 1.5, False),
            (2, "Rungis Zone C — Scan partiel", "0.5", "PLY", "generation", 0, 2.0, False),
            (3, "Fontainebleau Maison + Extension", "1.0", "OBJ", "pret", 1240, 0.5, True),
        ]

        for (chan_idx, nom, version, fmt, statut, nb_el, precision, exporte) in jumeaux_data:
            JumeauNumerique.objects.create(
                chantier=chantiers[chan_idx],
                nom=nom,
                version=version,
                format_modele=fmt,
                statut=statut,
                nb_elements=nb_el,
                precision_globale_cm=precision,
                exporte_tradelayer=exporte,
            )

        self.stdout.write(self.style.SUCCESS(
            f"\n✅ Seed BuildingScan terminé !\n"
            f"   {ChantierScan.objects.count()} chantiers\n"
            f"   {SessionScan.objects.count()} sessions scan\n"
            f"   {Mesure.objects.count()} mesures\n"
            f"   {ZoneMesure.objects.count()} zones\n"
            f"   {JumeauNumerique.objects.count()} jumeaux numériques"
        ))
