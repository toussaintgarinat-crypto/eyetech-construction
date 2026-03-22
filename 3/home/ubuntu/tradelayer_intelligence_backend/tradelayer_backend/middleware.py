import logging
import time

logger = logging.getLogger('api.access')


class APIAccessLogMiddleware:
    """
    Logue chaque requête API : méthode, path, IP, user, durée, statut.
    Conforme aux recommandations du guide sécurité SaaS 2026 (section 10).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start) * 1000)

        if request.path.startswith('/api/'):
            user = getattr(request, 'user', None)
            user_info = str(user) if user and user.is_authenticated else 'anonymous'
            ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '-'))
            if ',' in ip:
                ip = ip.split(',')[0].strip()

            log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
            logger.log(
                log_level,
                '%s %s | user=%s | ip=%s | status=%d | %dms',
                request.method,
                request.path,
                user_info,
                ip,
                response.status_code,
                duration_ms,
            )

        return response
