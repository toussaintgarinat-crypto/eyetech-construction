from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI(title="OpenRAG Mock - Eyetech")
COLLECTION = os.getenv("OPENRAG_COLLECTION", "general")
DESCRIPTION = os.getenv("OPENRAG_DESCRIPTION", "Assistant general")

class ChatRequest(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok", "collection": COLLECTION}

@app.post("/api/chat")
def chat(req: ChatRequest):
    responses = {
        "plomberie": f"[Specialiste Plomberie] Pour votre question '{req.message[:50]}...', selon le DTU 60.1 : les canalisations d'eau froide doivent etre protegees du gel et les distances minimales entre tuyaux sont de 2cm. Consultez votre chef de projet pour validation.",
        "electricite": f"[Specialiste Electricite] Pour '{req.message[:50]}...', selon NF C 15-100 : les circuits doivent etre proteges par un disjoncteur adapte. Section minimale : 1.5mm2 pour eclairage, 2.5mm2 pour prises.",
        "placo": f"[Specialiste Placo] Pour '{req.message[:50]}...', selon DTU 25.41 : l'entraxe des montants est de 60cm max. Utilisez des vis a placoplatre TF 25mm pour 1 plaque, TF 35mm pour 2 plaques.",
        "charpente": f"[Specialiste Charpente] Pour '{req.message[:50]}...', selon DTU 31.1 et Eurocode 5 : la section minimale depend de la portee. Consultez les abaques de dimensionnement.",
        "cvc": f"[Specialiste CVC] Pour '{req.message[:50]}...', selon DTU 65.3 et RE2020 : la temperature de depart max est de 50C pour les pompes a chaleur. Le DPE doit etre conforme.",
        "maconnerie": f"[Specialiste Maconnerie] Pour '{req.message[:50]}...', selon DTU 20.1 : l'epaisseur minimale des murs porteurs est de 20cm. Les joints doivent etre combles sur toute la hauteur.",
    }
    reponse = responses.get(COLLECTION, f"[Assistant {COLLECTION}] Question recue : {req.message[:100]}. Instance RAG en cours de configuration avec les normes specifiques.")
    return {
        "response": reponse,
        "sources": [{"titre": f"DTU {COLLECTION.upper()}", "page": 12}],
        "collection": COLLECTION
    }

@app.get("/")
def root():
    return {"service": "OpenRAG Eyetech", "collection": COLLECTION, "description": DESCRIPTION}
