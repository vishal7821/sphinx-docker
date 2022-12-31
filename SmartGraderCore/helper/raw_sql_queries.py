from django.db import connection, connections
from multidb.middleware import request_cfg

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def get_enrollment_courses_permissions_sections(user_id):
    # by default this connection uses default db
    with connection.cursor() as cursor:
        cursor.execute(" select  c.id ,c.name ,c.title , uc.enrollment_id, uc.enrollment_role_id,  uc.enrollment_action_list, uc.enrollment_section_list  "
                       " from user_has_courses uc inner join courses c on c.id = uc.course_id where "
                       " uc.deleted is null and c.deleted is null and uc.user_id = %s",[user_id,])
                        # " uc.deleted is null and c.deleted is null and c.is_active = 1 and uc.user_id = %s", [user_id, ])
        rows = dictfetchall(cursor)
    res = dict()
    for c in rows:
        res[c['id']] = c
    return res

def get_section_enrollments(section_id,db_alias):
    with connections[db_alias].cursor() as cursor:
        cursor.execute(" select s.id  "
                       " from sections s inner join enrollment_has_sections ehs on s.id = ehs.section_id "
                       " where  s.deleted is null and ehs.deleted is null and  s.id = %s",[section_id,])
        rows = dictfetchall(cursor)
    return rows


def get_role_details(role_id,db_alias):
    with connections[db_alias].cursor() as cursor:
        cursor.execute(" select r.id , r.name  "
                       " from roles r "
                       " where  r.deleted is null and  r.id = %s",[role_id,])
        rows = dictfetchall(cursor)
    return rows