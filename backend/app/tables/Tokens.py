import hashlib
from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL

from datetime import datetime, timedelta, timezone

from app.enums.baseEnums import TokenType

@dataclass
class Tokens(Common):
    
	# table fields
	id: Optional[int] = None
	user_id: Optional[int] = None
	token_hash: Optional[str] = None
	type: Optional[TokenType] = None
	expires_at: Optional[str] = None
	used_at: Optional[str] = None
	created_at: Optional[str] = None

	# table name
	table_name = "tokens"
	
	def __init__(
		self,
		id: Optional[int] = None,
		user_id: Optional[int] = None,
		token_hash: Optional[str] = None,
		type: Optional[TokenType] = None,
		expires_at: Optional[str] = None,
		used_at: Optional[str] = None,
		created_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.user_id = user_id
		self.token_hash = token_hash
		self.type = type
		self.expires_at = expires_at
		self.used_at = used_at
		self.created_at = created_at

	async def insert(self) -> "Tokens":
		"""
		Inserts a record into token table using self properties
		"""

		self.expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("user_id, token_hash, type, expires_at")
            		.values("$1, $2, $3, $4")
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.user_id, self.token_hash, self.type, self.expires_at)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		self.id = row["id"]
		self.created_at = row["created_at"]
		self.used_at = row["used_at"]
		
		return self

	async def update(self) -> "Tokens":
		"""
		Updates a record in the token table using self properties
		"""

		if self.id is None:
			raise ValueError("Token must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("used_at = $1")
					.where("id = $2")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_returning(sql, self.used_at, self.id)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		return self

	@classmethod
	async def findByToken(cls, raw_token: str, connection=None) -> "Tokens | None":	
		"""
		Finds a record in token table by token id
		"""

		temp = cls(connection=connection)

		hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
		
		sql = (
			SQL()
				.select(cls.table_name)
				.where("token_hash = $1")
			.getQuery()
		)

		row = await temp.fetch_one(sql, hashed_token)
		
		if row is None: 
			return None

		# now return a Token or List of Tokens
		return cls.from_row(row, connection)