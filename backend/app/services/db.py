import os
from contextlib import asynccontextmanager
from typing import AsyncIterator, Optional
from app.services.config import settings
from pathlib import Path

import asyncpg

class Database:
	
	def __init__(self) -> None:
		# Database connection string (loaded from environment/settings)
		self.database_url = settings.DATABASE_URL
		if not self.database_url:
			raise ValueError("DATABASE_URL is not set.")

		# Async connection pool (initialized on startup)
		self.pool: Optional[asyncpg.Pool] = None

		self.schema_file = Path("ddl/schema.sql")
		self.data_file = Path("ddl/data.sql")
		self.index_file = Path("ddl/index.sql")

	async def connect(self) -> None:
		# Initialize connection pool if not already created
		if self.pool is None:
			self.pool = await asyncpg.create_pool(
				dsn=self.database_url,
				min_size=1,
				max_size=10,
				command_timeout=30,
			)

	async def disconnect(self) -> None:
		# Close and clean up connection pool
		if self.pool is not None:
			await self.pool.close()
			self.pool = None

	def _ensure_pool(self) -> asyncpg.Pool:
		# Ensure pool is initialized before usage
		if self.pool is None:
			raise RuntimeError("Database pool is not initialized.")
		return self.pool

	async def acquire(self) -> asyncpg.Connection:
		# Acquire a connection from the pool
		pool = self._ensure_pool()
		return await pool.acquire()

	async def release(self, connection: asyncpg.Connection) -> None:
		# Release a connection back to the pool
		pool = self._ensure_pool()
		await pool.release(connection)

	@asynccontextmanager
	async def transaction(self) -> AsyncIterator[asyncpg.Connection]:
		# Provide a transactional connection scope
		# Ensures commit/rollback handled automatically by asyncpg
		conn = await self.acquire()
		try:
			async with conn.transaction():
				yield conn
		finally:
			# Always release connection after transaction completes
			await self.release(conn)
            
	async def startup(self) -> None:
		# Application startup hook: initialize DB and optionally apply schema
		await self.connect()

		# Prevent accidental schema auto-apply in production
		if settings.IS_PROD and settings.AUTO_APPLY_SCHEMA:
			raise RuntimeError("AUTO_APPLY_SCHEMA cannot be enabled in production.")

		if not settings.IS_PROD:
			await self.apply_schema()
			await self.apply_data()
			await self.apply_indexes()

	async def apply_schema(self) -> None:
		# Load and execute schema.sql file against database
		if not self.schema_file.exists():
			raise FileNotFoundError(f"Schema file not found: {self.schema_file}")

		sql = self.schema_file.read_text(encoding="utf-8")

		pool = self._ensure_pool()

		async with pool.acquire() as conn:
			await conn.execute(sql)

		print("Schema applied")

	async def apply_data(self) -> None:
		if not self.data_file.exists():
			raise FileNotFoundError(f"Data file not found: {self.data_file}")

		sql = self.data_file.read_text(encoding="utf-8")
		pool = self._ensure_pool()

		async with pool.acquire() as conn:
			await conn.execute(sql)

		print("Data applied")

	async def apply_indexes(self) -> None:
		if not self.index_file.exists():
			raise FileNotFoundError(f"Index file not found: {self.index_file}")

		sql = self.index_file.read_text(encoding="utf-8")
		pool = self._ensure_pool()

		async with pool.acquire() as conn:
			await conn.execute(sql)

		print("Indexes applied")
               
# Global database instance used across the application
db = Database()