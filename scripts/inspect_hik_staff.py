import sys, os
sys.path.insert(0, os.path.abspath('.'))
from scripts.test_hikcentral import hik_request
import json
import psycopg2

res = hik_request('/artemis/api/resource/v1/person/personList', {'pageNo': 1, 'pageSize': 500})
persons = res.get('data', {}).get('list', [])
print(f"Total persons fetched from HikCentral: {len(persons)}")

# Organization list map
org_res = hik_request('/artemis/api/resource/v1/org/orgList', {'pageNo': 1, 'pageSize': 100})
org_map = {str(o['orgIndexCode']): o['orgName'] for o in org_res.get('data', {}).get('list', [])}

student_orgs = {'3', '4', '5', '6', '7'}  # Bachelor, Master, 1-kurs, 2-kurs

conn = psycopg2.connect(host='192.168.1.2', port=5432, dbname='akhu_rating', user='akhu_admin', password='AkhuAdmin2026!')
cur = conn.cursor()

# Get existing 9 staff
cur.execute("SELECT id, full_name, email, passport_id FROM staff_user")
existing_staff = cur.fetchall()
print(f"Existing staff in DB: {len(existing_staff)}")
for es in existing_staff:
    print(f"  DB Staff: id={es[0]}, name={es[1]}, passport={es[3]}")

existing_passports = {es[3].strip().upper() for es in existing_staff if es[3]}
existing_ids = {es[0].strip().lower() for es in existing_staff if es[0]}

# Also get student passport_ids from student table so we don't accidentally treat a student as staff
cur.execute("SELECT external_id FROM student WHERE external_id IS NOT NULL")
students_in_db = cur.fetchall()
student_passports = set()
for s in students_in_db:
    if s[0]: student_passports.add(s[0].strip().upper())

print(f"Students in DB passport count: {len(student_passports)}")

staff_candidates = []
for p in persons:
    org_code = str(p.get('orgIndexCode', ''))
    person_code = (p.get('personCode') or '').strip().upper()
    person_name = p.get('personName', '').strip()
    org_name = org_map.get(org_code, 'Unknown')
    
    # Is it in student orgs?
    if org_code in student_orgs:
        continue
    
    # Is personCode matching a student external_id in our student table?
    if person_code in student_passports:
        print(f"Skipping student found outside student org: {person_name} ({person_code})")
        continue

    # Is it already one of our 9 staff?
    is_existing = (person_code in existing_passports)
    staff_candidates.append({
        'personId': p.get('personId'),
        'personCode': person_code,
        'personName': person_name,
        'orgCode': org_code,
        'orgName': org_name,
        'is_existing': is_existing
    })

print(f"\nTotal staff candidates from HikCentral: {len(staff_candidates)}")
new_staff = [s for s in staff_candidates if not s['is_existing']]
print(f"New staff to import: {len(new_staff)}")
print(f"Existing staff matched in HikCentral: {len(staff_candidates) - len(new_staff)}")

print("\n--- SAMPLE NEW STAFF TO IMPORT ---")
for s in new_staff[:20]:
    print(f"Passport: {s['personCode']} | Name: {s['personName']} | Dept: {s['orgName']}")

conn.close()
