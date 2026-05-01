from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class Sessions(Common):
    
	# table fields
	id: Optional[int] = None
	user_id: Optional[str] = None
	email: Optional[str] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	active_role_id: Optional[int] = None
	created_at: Optional[str] = None
	expires_at: Optional[str] = None
	is_active: Optional[bool] = None

	# table name
	table_name = "sessions"
	
	def __init__(
		self,
		id: Optional[int] = None,
		user_id: Optional[str] = None,
		email: Optional[str] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		active_role_id: Optional[int] = None,
		created_at: Optional[str] = None,
		expires_at: Optional[str] = None,
		is_active: Optional[bool] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.user_id = user_id
		self.email = email
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.active_role_id = active_role_id
		self.created_at = created_at
		self.expires_at = expires_at
		self.is_active = is_active

	async def insert(self) -> "Sessions":
		"""
		Inserts a record into user table using self properties
		"""
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("user_id, email, tenant_id, company_id, active_role_id, expires_at")
            		.values("$1, $2, $3, $4, $5, $6")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_one(sql, self.user_id, self.email, self.tenant_id, self.company_id, self.active_role_id, self.expires_at)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		self.id = row["id"]
		
		return self

	async def update(self) -> "Sessions":
		"""
		Updates a record in the sessions table using self properties
		"""

		if self.id is None:
			raise ValueError("User must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("company_id = $1, active_role_id = $2")
					.where("id = $3 AND tenant_id = $4")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, self.company_id, self.active_role_id, self.id, self.tenant_id)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		return self

	@classmethod
	async def find(cls, id: str, connection=None) -> "Sessions | None":	
		"""
		Finds a record in sessions table by record id
		"""

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("id = $1")
			.getQuery()
		)

		row = await temp.fetch_one(sql, id)
		
		if row is None: 
			return None

		# now return a User or List of Users
		return cls.from_row(row, connection)