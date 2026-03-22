import requests
import time
import logging

logger = logging.getLogger(__name__)


class OpenRAGService:
    """Service pour interroger les instances OpenRAG."""

    def __init__(self, instance_rag):
        self.instance = instance_rag
        self.base_url = instance_rag.url_openrag.rstrip('/')
        self.api_key = instance_rag.api_key
        self.timeout = 30

    def _headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['X-API-Key'] = self.api_key
        return headers

    def poser_question(self, question, contexte=''):
        """Envoie une question a l'instance OpenRAG et retourne la reponse."""
        debut = time.time()

        prompt = question
        if contexte:
            prompt = f"Contexte chantier : {contexte}\n\nQuestion : {question}"

        try:
            # Endpoint standard OpenRAG
            response = requests.post(
                f"{self.base_url}/api/chat",
                json={'message': prompt},
                headers=self._headers(),
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()

            temps_ms = int((time.time() - debut) * 1000)

            return {
                'succes': True,
                'reponse': data.get('response', data.get('message', str(data))),
                'sources': data.get('sources', data.get('references', [])),
                'temps_ms': temps_ms,
            }
        except requests.exceptions.ConnectionError:
            logger.warning("Instance RAG non disponible : %s", self.base_url)
            return {
                'succes': False,
                'reponse': "L'assistant specialiste n'est pas disponible pour ce metier.",
                'sources': [],
                'temps_ms': 0,
                'erreur': 'connection_error',
            }
        except requests.exceptions.Timeout:
            logger.warning("Timeout RAG : %s", self.base_url)
            return {
                'succes': False,
                'reponse': "L'assistant met trop de temps a repondre. Reessayez.",
                'sources': [],
                'temps_ms': self.timeout * 1000,
                'erreur': 'timeout',
            }
        except Exception as e:
            logger.error("Erreur RAG : %s", str(e))
            return {
                'succes': False,
                'reponse': "Erreur lors de la consultation du specialiste.",
                'sources': [],
                'temps_ms': 0,
                'erreur': str(e),
            }

    def sante(self):
        """Verifie que l'instance RAG repond."""
        try:
            r = requests.get(f"{self.base_url}/health", timeout=5)
            return r.status_code == 200
        except Exception:
            return False
