import threading
from django.http import Http404
from multidb.middleware import request_cfg


class MultiDbRouter(object):
    """
    The multiple database router.

    Add this to your Django database router configuration, for example:

    DATABASE_ROUTERS += ['bananaproject.multidb.MultiDbRouter']
    """
    def _multi_db(self):
        from django.conf import settings
        if hasattr(request_cfg, 'db'):
            if request_cfg.db in settings.DATABASES:
                return request_cfg.db
            else:
                raise Http404
        else:
            return 'default'

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'authentication':
            return 'global'
        return self._multi_db()

    db_for_write = db_for_read

    def allow_relation(self, obj1, obj2, **hints):
        return True
