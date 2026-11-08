"""Synthetic architecture rehearsal on macOS Python SQLite. NOT Watermelon/iOS proof.
Run from any directory with Python 3.9+ and Node 24+; temporary database only.
"""
from pathlib import Path
import datetime as dt
import json
import math
import platform
import sqlite3
import subprocess
import sys
import tempfile
import time

HERE = Path(__file__).resolve().parent
module_uri = (HERE / 'C_DOMAIN_CONTRACTS.ts').as_uri()
schema = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    'import { TABLES } from ' + json.dumps(module_uri) + '; console.log(JSON.stringify(TABLES));'], text=True))
SCOPE = ('synthetic-workspace-a', 'synthetic-athlete-a')
OTHER = ('synthetic-workspace-b', 'synthetic-athlete-b')


def percentile(values, p):
    return round(sorted(values)[max(0, math.ceil(len(values) * p) - 1)], 4)


def report(values):
    return {'samples': len(values), 'p50_ms': percentile(values, .50), 'p95_ms': percentile(values, .95)}


def main():
    with tempfile.TemporaryDirectory(prefix='bd-c-synthetic-') as directory:
        dbfile = Path(directory) / 'body-dashboard-native-reference.sqlite'
        con = sqlite3.connect(dbfile)
        con.execute('pragma journal_mode=WAL')
        con.execute('pragma synchronous=FULL')
        for table, columns in schema.items():
            fields = ['id TEXT PRIMARY KEY NOT NULL', "_status TEXT NOT NULL DEFAULT 'created'", "_changed TEXT NOT NULL DEFAULT ''"]
            for name, col in columns.items():
                typ = {'string': 'TEXT', 'number': 'REAL', 'boolean': 'INTEGER'}[col['type']]
                default = 'NULL' if col['isOptional'] else "''" if typ == 'TEXT' else '0'
                fields.append(f'"{name}" {typ}' + ('' if col['isOptional'] else ' NOT NULL') + f' DEFAULT {default}')
            con.execute(f'CREATE TABLE "{table}" ({",".join(fields)})')
            for name, col in columns.items():
                if col['isIndexed']:
                    con.execute(f'CREATE INDEX "{table}__{name}" ON "{table}" ("{name}")')

        def insert(table, records):
            if not records:
                return
            keys = list(records[0])
            columns = ','.join('"' + k + '"' for k in keys)
            marks = ','.join('?' for _ in keys)
            con.executemany(f'INSERT INTO "{table}" ({columns}) VALUES ({marks})',
                            [tuple(r[k] for k in keys) for r in records])

        def owned(record, scope=SCOPE, batch='batch-a'):
            return dict(workspace_id=scope[0], athlete_id=scope[1], created_by_actor_id='actor-a',
                        updated_by_actor_id='actor-a', revision=1, publication_batch_id=batch, **record)

        insert('workspaces', [{'id': SCOPE[0], 'owner_actor_id': 'actor-a'}, {'id': OTHER[0], 'owner_actor_id': 'actor-b'}])
        insert('athletes', [{'id': SCOPE[1], 'workspace_id': SCOPE[0], 'owner_actor_id': 'actor-a'},
                            {'id': OTHER[1], 'workspace_id': OTHER[0], 'owner_actor_id': 'actor-b'}])
        insert('actors', [{'id': 'actor-a'}, {'id': 'actor-b'}])
        for scope, batch in [(SCOPE, 'batch-a'), (OTHER, 'batch-b')]:
            insert('publication_batches', [dict(id=batch, workspace_id=scope[0], athlete_id=scope[1], state='committed')])
        insert('athlete_runtime', [dict(id='runtime-a', workspace_id=SCOPE[0], athlete_id=SCOPE[1])])
        start = time.perf_counter()
        days = [(dt.date(2026, 1, 1) + dt.timedelta(days=i % 310)).isoformat() for i in range(5000)]
        insert('sessions', [owned(dict(id=f's{i}', head_version_id=f'sv{i}')) for i in range(5000)])
        insert('session_versions', [owned(dict(id=f'sv{i}', session_id=f's{i}', state='completed',
            recorded_day=days[i], operation_id=f'initial-session-{i}')) for i in range(5000)])
        insert('session_exercises', [owned(dict(id=f'e{i}', session_id=f's{i}', position=0,
            label_snapshot='Synthetic press', tracking_type='weight_reps', load_basis_snapshot='external_total'))
            for i in range(5000)])
        for offset in range(0, 100000, 2000):
            insert('sets', [owned(dict(id=f'set{i}', session_id=f's{i // 20}', session_exercise_id=f'e{i // 20}',
                head_observation_id=f'o{i}', position=i % 20)) for i in range(offset, offset + 2000)])
            insert('set_observations', [owned(dict(id=f'o{i}', set_id=f'set{i}', session_id=f's{i // 20}',
                session_exercise_id=f'e{i // 20}', state='completed', set_kind='working', load_kg=80., reps=5.,
                tracking_type='weight_reps', load_basis='external_total', rpe=None,
                operation_id=f'initial-set-{i}')) for i in range(offset, offset + 2000)])
        insert('food_entries', [owned(dict(id=f'f{i}', head_version_id=f'fv{i}')) for i in range(10000)])
        insert('food_entry_versions', [owned(dict(id=f'fv{i}', food_entry_id=f'f{i}', state='recorded',
            recorded_day=days[i % 5000], energy_kcal=400., protein_g=20., carbs_g=55., fat_g=12.,
            quantity=1., unit='serving', operation_id=f'initial-food-{i}')) for i in range(10000)])
        con.commit()
        seed_seconds = round(time.perf_counter() - start, 3)
        # Extra foreign-scope fixture is outside the primary 100,000-set benchmark.
        insert('sets', [owned(dict(id='foreign-set', session_id='foreign-session',
            session_exercise_id='foreign-exercise', head_observation_id=None), OTHER, 'batch-b')])
        con.commit()

        row_sql = """SELECT s.id,o.load_kg,o.reps,o.rpe FROM sets s
          JOIN set_observations o ON o.id=s.head_observation_id AND o.set_id=s.id
          JOIN publication_batches p ON p.id=s.publication_batch_id
          JOIN publication_batches op ON op.id=o.publication_batch_id
          WHERE s.workspace_id=? AND s.athlete_id=? AND s.session_exercise_id=?
          AND o.workspace_id=s.workspace_id AND o.athlete_id=s.athlete_id
          AND p.workspace_id=s.workspace_id AND p.athlete_id=s.athlete_id AND p.state='committed'
          AND op.workspace_id=s.workspace_id AND op.athlete_id=s.athlete_id AND op.state='committed' AND op._status!='deleted'
          AND s._status!='deleted' AND o._status!='deleted' AND p._status!='deleted'
          AND o.state='completed' ORDER BY s.position"""
        history_sql = """SELECT s.id,v.recorded_day FROM sessions s
          JOIN session_versions v ON v.id=s.head_version_id AND v.session_id=s.id
          JOIN publication_batches p ON p.id=s.publication_batch_id
          JOIN publication_batches vp ON vp.id=v.publication_batch_id
          WHERE s.workspace_id=? AND s.athlete_id=? AND v.workspace_id=s.workspace_id AND v.athlete_id=s.athlete_id
          AND p.workspace_id=s.workspace_id AND p.athlete_id=s.athlete_id AND p.state='committed'
          AND vp.workspace_id=s.workspace_id AND vp.athlete_id=s.athlete_id AND vp.state='committed' AND vp._status!='deleted'
          AND s._status!='deleted' AND v._status!='deleted' AND p._status!='deleted'
          AND v.state='completed' AND v.recorded_day<=? ORDER BY v.recorded_day DESC,s.id DESC LIMIT 50"""
        diet_sql = """SELECT v.id,v.energy_kcal,v.protein_g FROM food_entry_versions v
          JOIN food_entries f ON f.head_version_id=v.id AND v.food_entry_id=f.id
          JOIN publication_batches p ON p.id=f.publication_batch_id
          JOIN publication_batches vp ON vp.id=v.publication_batch_id
          WHERE f.workspace_id=? AND f.athlete_id=? AND v.recorded_day=?
          AND v.workspace_id=f.workspace_id AND v.athlete_id=f.athlete_id
          AND p.workspace_id=f.workspace_id AND p.athlete_id=f.athlete_id AND p.state='committed'
          AND vp.workspace_id=f.workspace_id AND vp.athlete_id=f.athlete_id AND vp.state='committed' AND vp._status!='deleted'
          AND f._status!='deleted' AND v._status!='deleted' AND p._status!='deleted' AND v.state='recorded'"""
        timings = {}
        plans = {}
        for label, sql, args in [('exercise_20_rows', row_sql, (*SCOPE, 'e200')),
            ('history_50_rows', history_sql, (*SCOPE, '2026-11-07')),
            ('diet_day', diet_sql, (*SCOPE, '2026-11-06'))]:
            row_count = len(con.execute(sql, args).fetchall())
            assert row_count > 0, f'{label}: benchmark must return data'
            values = []
            for iteration in range(325):
                t = time.perf_counter_ns(); con.execute(sql, args).fetchall()
                if iteration >= 25:
                    values.append((time.perf_counter_ns() - t) / 1e6)
            timings[label] = report(values)
            timings[label]['rows_returned'] = row_count
            plans[label] = [r[3] for r in con.execute('EXPLAIN QUERY PLAN ' + sql, args)]

        # Two commits: durable intent, then observation + stable pointer + receipt.
        values = []
        for i in range(325):
            t = time.perf_counter_ns()
            operation = f'host-complete-{i}'
            insert('command_intents', [dict(id=f'intent{i}', workspace_id=SCOPE[0], athlete_id=SCOPE[1],
                operation_key=operation, payload_hash='synthetic-payload', phase='prepared')]); con.commit()
            with con:
                insert('set_observations', [owned(dict(id=f'new-o{i}', set_id='set4000', session_id='s200',
                    session_exercise_id='e200', parent_observation_id='o4000' if i == 0 else f'new-o{i-1}',
                    state='completed', set_kind='working', tracking_type='weight_reps', load_basis='external_total',
                    load_kg=82.5, reps=5, operation_id=operation))])
                con.execute('UPDATE sets SET head_observation_id=?,revision=revision+1 WHERE id=? AND workspace_id=? AND athlete_id=?',
                    (f'new-o{i}', 'set4000', *SCOPE))
                insert('command_receipts', [dict(id=f'receipt{i}', workspace_id=SCOPE[0], athlete_id=SCOPE[1],
                    operation_key=operation, payload_hash='synthetic-payload', result_json='{}')])
                con.execute('UPDATE command_intents SET phase=? WHERE operation_key=?', ('committed', operation))
            if i >= 25:
                values.append((time.perf_counter_ns() - t) / 1e6)
        timings['intent_then_observation_pointer_receipt'] = report(values)
        assert con.execute('SELECT count(*) FROM command_receipts WHERE operation_key=?', ('host-complete-324',)).fetchone()[0] == 1

        checks = []
        # Failed batch cannot replace the previous head or leave a receipt.
        before = con.execute('SELECT head_observation_id FROM sets WHERE id=?', ('set4000',)).fetchone()[0]
        try:
            with con:
                con.execute("UPDATE sets SET head_observation_id='uncommitted' WHERE id='set4000'")
                con.execute("INSERT INTO sets(id) VALUES('set4000')")
        except sqlite3.IntegrityError:
            pass
        assert con.execute("SELECT head_observation_id FROM sets WHERE id='set4000'").fetchone()[0] == before
        checks.append('SQL failed-batch rollback')
        assert not con.execute(row_sql, (*OTHER, 'e200')).fetchall()
        assert not con.execute(row_sql, (SCOPE[0], OTHER[1], 'e200')).fetchall()
        assert not con.execute(history_sql, (*OTHER, '2026-11-07')).fetchall()
        assert not con.execute(diet_sql, (*OTHER, '2026-11-07')).fetchall()
        for scope in [OTHER, (SCOPE[0], OTHER[1])]:
            assert con.execute('UPDATE sets SET position=99 WHERE id=? AND workspace_id=? AND athlete_id=?',
                ('set4000', *scope)).rowcount == 0
        parent = con.execute("SELECT workspace_id,athlete_id FROM session_exercises WHERE id='e200'").fetchone()
        assert parent != OTHER
        checks.append('seven negative scope/read/write/relationship checks in reference harness')
        assert con.execute("SELECT rpe FROM set_observations WHERE id='o4000'").fetchone()[0] is None
        with con:
            con.execute("UPDATE set_observations SET rpe=0 WHERE id='o4000'")  # storage semantics only; native RPE rejects zero
        assert con.execute("SELECT rpe FROM set_observations WHERE id='o4000'").fetchone()[0] == 0
        con.execute('ALTER TABLE set_observations ADD COLUMN optional_future_context TEXT')
        assert con.execute("SELECT load_kg,reps,optional_future_context FROM set_observations WHERE id='o4000'").fetchone() == (80, 5, None)
        checks.append('nullable zero preservation and additive SQL migration rehearsal')
        # Native importer will also revalidate row heads and perform reconciliation.
        with con:
            insert('publication_batches', [dict(id='staged', workspace_id=SCOPE[0], athlete_id=SCOPE[1], state='staging')])
            insert('sessions', [owned(dict(id='new-import', head_version_id='new-version'), batch='staged')])
            insert('session_versions', [owned(dict(id='new-version', session_id='new-import', state='completed',
                recorded_day='2026-11-07'), batch='staged')])
        assert 'new-import' not in {r[0] for r in con.execute(history_sql, (*SCOPE, '2026-11-07'))}
        with con:
            con.execute("UPDATE publication_batches SET state='committed' WHERE id='staged'")
        assert 'new-import' in {r[0] for r in con.execute(history_sql, (*SCOPE, '2026-11-07'))}
        checks.append('publication gate hides staged history then reveals on commit')
        con.commit(); con.close()
        child = """import sqlite3,sys,os,signal
c=sqlite3.connect(sys.argv[1]);c.execute('pragma synchronous=FULL')
c.execute("UPDATE athlete_runtime SET is_recovery_required=? WHERE id='runtime-a'",(int(sys.argv[2]),))
if sys.argv[3]=='commit':c.commit();print('ACK',flush=True)
os.kill(os.getpid(),signal.SIGKILL)
"""
        committed = subprocess.run([sys.executable, '-c', child, str(dbfile), '1', 'commit'], capture_output=True, text=True)
        assert committed.stdout.strip() == 'ACK'
        uncommitted = subprocess.run([sys.executable, '-c', child, str(dbfile), '0', 'no-commit'], capture_output=True, text=True)
        assert committed.returncode != 0 and uncommitted.returncode != 0
        con = sqlite3.connect(dbfile)
        assert con.execute("SELECT is_recovery_required FROM athlete_runtime WHERE id='runtime-a'").fetchone()[0] == 1
        assert con.execute("SELECT head_observation_id FROM sets WHERE id='set4000'").fetchone()[0] == before
        checks.append('host SIGKILL after commit persists; pre-commit SIGKILL rolls back')
        integrity = con.execute('pragma integrity_check').fetchone()[0]
        con.close()
        print(json.dumps({'kind': 'host-sqlite-reference-only', 'status': 'passed',
            'environment': {'python': platform.python_version(), 'sqlite': sqlite3.sqlite_version,
                            'os': platform.system(), 'os_release': platform.release(), 'machine': platform.machine()},
            'dataset': {'primary_set_identities': 100000, 'primary_food_entries': 10000,
                        'session_identities': 5000, 'additional_foreign_set': 1, 'warmup_iterations': 25},
            'schema_tables': len(schema), 'seed_seconds': seed_seconds, 'journal_mode': 'WAL', 'synchronous': 'FULL',
            'timings': timings, 'query_plans': plans, 'checks': checks, 'integrity_check': integrity,
            'native_adapter_tested': False, 'native_ui_latency_ms': None, 'native_commit_latency_ms': None}, indent=2))


if __name__ == '__main__':
    main()
