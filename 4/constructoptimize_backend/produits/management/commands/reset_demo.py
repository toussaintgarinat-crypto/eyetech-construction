"""
Commande de reset des données démo — App 4 ConstructOptimize.
Usage : python manage.py reset_demo
"""
from django.core.management.base import BaseCommand
import os


class Command(BaseCommand):
    help = "Réinitialise les données de démonstration ConstructOptimize (produits, fournisseurs, prix)"

    def handle(self, *args, **options):
        self.stdout.write("Réinitialisation des données démo App 4...")
        seed_path = os.path.join(
            os.path.dirname(__file__), '..', '..', '..', '..', 'seed_data.py'
        )
        seed_path = os.path.normpath(seed_path)
        if not os.path.exists(seed_path):
            self.stderr.write(f"seed_data.py introuvable : {seed_path}")
            return
        exec(open(seed_path).read())
        self.stdout.write(self.style.SUCCESS("✅ Données démo réinitialisées."))
