import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base


# Use Supabase PostgreSQL URL
DATABASE_URL = os.getenv("COVENANT_DATABASE_URL") or os.getenv("SUPABASE_DATABASE_URL") or "sqlite:///covenants.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()


def init_db():
    # Late import to avoid circular
    from .models import CovenantEntry  # noqa: F401
    Base.metadata.create_all(bind=engine)


