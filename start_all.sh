#!/bin/bash

BASE="/Users/garinat_t/Desktop/Eyetech version claude/E/eyetech"

echo "=== Arrêt des anciens processus ==="
pkill -f "manage.py runserver" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

echo ""
echo "=== Lancement Auth Service centralise (port 8000) ==="
cd "$BASE/auth_service"
source "$BASE/auth_service/venv/bin/activate"
python manage.py runserver 8000 &
echo "PID: $!"

echo ""
echo "=== Lancement App 1 - Perce-Mur Backend (port 8001) ==="
cd "$BASE/1/perce_mur_backend_new"
source "$BASE/1/venv/bin/activate"
python manage.py runserver 8001 &
echo "PID: $!"

echo ""
echo "=== Lancement App 2 - BuildingScan Backend (port 8002) ==="
if [ -d "$BASE/2/buildingscan_backend" ]; then
    cd "$BASE/2/buildingscan_backend"
    source "$BASE/2/buildingscan_backend/venv/bin/activate"
    python manage.py runserver 8002 &
    echo "PID: $!"
else
    echo "  (pas encore créé)"
fi

echo ""
echo "=== Lancement App 3 - TradeLayer / Calques Métiers (port 8003) ==="
cd "$BASE/3/home/ubuntu/tradelayer_intelligence_backend"
source "$BASE/3/venv/bin/activate"
python manage.py runserver 8003 &
echo "PID: $!"

echo ""
echo "=== Lancement App 4 - ConstructOptimize (port 8004) ==="
cd "$BASE/4/constructoptimize_backend"
source "$BASE/4/venv/bin/activate"
python manage.py runserver 8004 &
echo "PID: $!"

echo ""
echo "=== Lancement App 1 - Perce-Mur Frontend React (port 5173) ==="
cd "$BASE/1/perce-mur-app"
npm run dev &
echo "PID: $!"

echo ""
echo "=== Lancement App 2 - BuildingScan Frontend React (port 5172) ==="
if [ -d "$BASE/2/buildingscan_frontend" ]; then
    cd "$BASE/2/buildingscan_frontend"
    npm run dev -- --port 5172 &
    echo "PID: $!"
else
    echo "  (pas encore créé)"
fi

echo ""
echo "=== Lancement App 3 - TradeLayer Frontend React (port 5174) ==="
if [ -d "$BASE/3/tradelayer-web" ]; then
    cd "$BASE/3/tradelayer-web"
    npm run dev -- --port 5174 &
    echo "PID: $!"
else
    echo "  (pas encore créé)"
fi

echo ""
echo "=== Lancement App 4 - ConstructOptimize Frontend React (port 5175) ==="
if [ -d "$BASE/4/constructoptimize-web" ]; then
    cd "$BASE/4/constructoptimize-web"
    npm run dev -- --port 5175 &
    echo "PID: $!"
else
    echo "  (pas encore créé)"
fi

echo ""
echo "========================================"
echo "Tout est lancé ! Attends 3 secondes..."
sleep 3
echo ""
echo "Acces :"
echo "  Auth Service              -> http://localhost:8000/api/docs/"
echo "  Frontend Perce-Mur        -> http://localhost:5173"
echo "  Frontend BuildingScan     -> http://localhost:5172"
echo "  Frontend TradeLayer       -> http://localhost:5174"
echo "  Frontend ConstructOptimize -> http://localhost:5175"
echo "  Backend Perce-Mur         -> http://localhost:8001/admin/"
echo "  Backend BuildingScan      -> http://localhost:8002/admin/"
echo "  TradeLayer                -> http://localhost:8003/admin/"
echo "  TradeLayer Swagger        -> http://localhost:8003/api/docs/"
echo "  ConstructOptimize         -> http://localhost:8004/admin/"
echo "  ConstructOptimize Swagger -> http://localhost:8004/api/docs/"
echo ""
echo "Identifiants admin : admin / eyetech2024"
echo "========================================"

wait
