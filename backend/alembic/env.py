"""Alembic env.py — async migrations with SQLAlchemy 2.x."""
from __future__ import annotations

import asyncio
import os
import sys
from logging.config import fileConfig

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy.pool import NullPool

from dotenv import load_dotenv
load_dotenv()

from app.db.database import Base
from app.models import models  # noqa: F401 — import models to register them

config = context.config
raw_db_url = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_W0ihJ1PKujEx@ep-fragrant-boat-b5bjd6aw.c-7.us-east-2.aws.neon.tech/cybertrack_nexus?sslmode=require")
config.set_main_option(
    "sqlalchemy.url",
    raw_db_url.replace("postgres://", "postgresql+psycopg://").replace("postgresql://", "postgresql+psycopg://"),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):  # type: ignore
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
