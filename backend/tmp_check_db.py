from urllib.parse import unquote
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

env = Path('.env').read_text()
url = [line.split('=', 1)[1].strip() for line in env.splitlines() if line.startswith('APP_DATABASE_URL=')][0]
print('raw URL:', url)
url = unquote(url)
print('decoded URL:', url)
engine = create_engine(url)
with engine.begin() as conn:
    alembic_exists = conn.execute(text("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='alembic_version')")).scalar()
    print('alembic_version exists:', alembic_exists)
    if alembic_exists:
        print('alembic versions:', conn.execute(text('SELECT version_num FROM alembic_version')).fetchall())
    tasks_exists = conn.execute(text("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tasks')")).scalar()
    print('tasks exists:', tasks_exists)
    if tasks_exists:
        rows = conn.execute(text("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='tasks' ORDER BY ordinal_position")).fetchall()
        for row in rows:
            print(row)
