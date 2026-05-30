from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Handle SQLite vs PostgreSQL
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    engine = create_async_engine(db_url, echo=False, connect_args={"check_same_thread": False})
else:
    engine = create_async_engine(db_url, echo=False, pool_size=20, max_overflow=10)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
