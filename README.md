# Eyetech Construction

Suite de 4 applications pour digitaliser le chantier BTP — IA, Réalité Augmentée et scan 3D.

## Applications

| App | Description | Tech |
|-----|-------------|------|
| **1 — Perce-Mur AR** | Détection de murs porteurs en réalité augmentée | Django + iOS Swift + React |
| **2 — BuildingScan VR** | Scan 3D du bâtiment en VR | Django + Unity |
| **3 — TradeLayer Intelligence** | Calques métiers AR (électricité, plomberie, structure) | Django + iOS + React |
| **4 — ConstructOptimize** | Comparateur de prix matériaux + IA | Django + iOS + Android + React |

## Architecture

```
eyetech-construction/
├── 1/   → Perce-Mur AR      (backend :8001 + frontend :5173)
├── 2/   → BuildingScan VR   (backend :8002)
├── 3/   → TradeLayer        (backend :8003 + frontend :5174)
├── 4/   → ConstructOptimize (backend :8004 + frontend :5175)
├── auth_service/            → Service d'authentification commun
└── start_all.sh             → Lance tous les serveurs
```

## Démarrage rapide

```bash
bash start_all.sh
```

## Fondateur

**Toussaint Michel Rémi GARINAT** — Eyetech Construction
