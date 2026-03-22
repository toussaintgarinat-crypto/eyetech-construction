from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """5 tentatives de login par minute par IP — protection brute force."""
    scope = 'auth'


class DemoTokenThrottle(AnonRateThrottle):
    """30 requêtes/minute pour l'endpoint démo."""
    scope = 'demo'
