import asyncpg
from typing import Optional, Any
from app.services.db import db

class Common:
	"""
	Base data access class providing shared database operations.

	Supports two modes:
	1. Bound connection (passed in) → used for transactions
	2. Auto-managed connection → acquired/released per call

	This allows higher-level services to control transactions when needed,
	while keeping simple queries lightweight.
	"""

	def __init__(self, connection: Optional[asyncpg.Connection] = None) -> None:
		# Optional connection allows participation in external transactions
		self._connection = connection

	def _using_bound_connection(self) -> bool:
		# Determins if this instance is operating wtihin a transaction
		return self._connection is not None

	async def _get_connection(self) -> asyncpg.Connection:
		"""
		Returns an active DB connection.

		- If a connection was injected → reuse it (transaction scope)
		- Otherwise → acquire from pool
		"""
		if self._using_bound_connection():
			return self._connection  # type: ignore[return-value]

		return await db.acquire()

	async def execute(self, sql: str, *args: Any) -> str:
		"""
		Execute a statement (INSERT/UPDATE/DELETE).

		Automatically manages connection lifecycle unless part of a transaction.
		"""
		if self._using_bound_connection():
			return await self._connection.execute(sql, *args)

		async with db.transaction() as conn:
			return await conn.execute(sql, *args)

	async def fetch_one(self, sql: str, *args: Any) -> Optional[asyncpg.Record]:
		"""
		Fetch a single row.

		Returns None if no record is found.
		"""
		if self._using_bound_connection():
			return await self._connection.fetchrow(sql, *args)

		async with db.read() as conn:
			return await conn.fetchrow(sql, *args)

	async def fetch_returning(self, sql: str, *args: Any) -> Optional[asyncpg.Record]:
		"""
		Execute a write statement with RETURNING and fetch the resulting row.

		Use this for INSERT/UPDATE/DELETE ... RETURNING instead of fetch_one.
		"""
		if self._using_bound_connection():
			return await self._connection.fetchrow(sql, *args)

		async with db.transaction() as conn:
			return await conn.fetchrow(sql, *args)

	async def fetch_all(self, sql: str, *args: Any) -> list[asyncpg.Record]:
		"""
		Fetch multiple rows.

		Always returns a list (empty if no results).
		"""
		if self._using_bound_connection():
			rows = await self._connection.fetch(sql, *args)
			return list(rows)

		async with db.read() as conn:
			rows = await conn.fetch(sql, *args)
			return list(rows)

	async def fetch_value(self, sql: str, *args: Any) -> Any:
		"""
		Fetch a single scalar value (e.g., COUNT, SUM, ID).
		"""
		if self._using_bound_connection():
			return await self._connection.fetchval(sql, *args)

		async with db.read() as conn:
			return await conn.fetchval(sql, *args)
			
	def to_dict(self) -> dict:
		result = {}
		for key, value in self.__dict__.items():
			if key.startswith("_"):
				continue
			if hasattr(value, "isoformat"):
				result[key] = value.isoformat()
			else:
				result[key] = value
		return result

	@classmethod
	def from_row(cls, row: dict, connection=None):
		"""
		Map a database row to a class instance.

		Only sets attributes that exist on the class to avoid unexpected fields.
		Preserves connection if part of a transaction chain.
		"""
		if row is None:
			return None

		obj = cls(connection=connection)

		for key, value in row.items():
			if hasattr(obj, key):
				setattr(obj, key, value)

		return obj