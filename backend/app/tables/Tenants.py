from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL

@dataclass
class Tenants(Common):
    
	# table fields
	id: Optional[int] = None
	name: Optional[str] = None
	email: Optional[str] = None
	created_at: Optional[str] = None
	is_active: Optional[bool] = None

	# table name
	table_name = "tenants"
	
	def __init__(
		self,
		id: Optional[int] = None,
		name: Optional[str] = None,
		email: Optional[str] = None, 
		created_at: Optional[str] = None,
		is_active: Optional[bool] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.name = name
		self.email = email
		self.created_at = created_at
		self.is_active = is_active

	async def insert(self) -> "Tenants":
		"""
		Inserts a record into tenant table using self properties
		"""
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("name, email")
            		.values("$1, $2")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_returning(sql, self.name, self.email)

		if row is None:
			raise ValueError("Update Failed: No row returned")

		self.id = row["id"]
		self.created_at = row["created_at"]
		self.is_active = row["is_active"]
		
		return self

	async def update(self) -> "Tenants":
		"""
		Updates a record in the tenant table using self properties
		"""

		if self.id is None:
			raise ValueError("Tenant must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("name = $1, email = $2, is_active = $3")
					.where("id = $4")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_returning(sql, self.name, self.email, self.is_active, self.id)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "Tenants | None":	
		"""
		Finds a record in tenant table by record id
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

		# now return a Tenant or List of Tenants
		return cls.from_row(row, connection)