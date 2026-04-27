from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL

@dataclass
class Entities(Common):
    
	# table fields
	id: Optional[int] = None
	tenant_id: Optional[int] = None
	name: Optional[str] = None
	created_at: Optional[str] = None
	is_active: Optional[bool] = None

	# table name
	table_name = "entities"
	
	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		name: Optional[str] = None,
		created_at: Optional[str] = None,
		is_active: Optional[bool] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.name = name
		self.created_at = created_at
		self.is_active = is_active

	async def insert(self) -> "Entities":
		"""
		Inserts a record into entity table using self properties
		"""
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("name, tenant_id")
            		.values("$1, $2")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_one(sql, self.name, self.tenant_id)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		self.id = row["id"]
		self.created_at = row["created_at"]
		self.is_active = row["is_active"]
		
		return self

	async def update(self) -> "Entities":
		"""
		Updates a record in the entity table using self properties
		"""

		if self.id is None:
			raise ValueError("Entity must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("name = $1, tenant_id = $2, is_active = $3")
					.where("id = $4")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_one(sql, self.name, self.tenant_id, self.is_active, self.id)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		return self

	@classmethod
	async def findByTenant(cls, tenant_id: int, connection=None) -> list["Entities"]:
		"""
		Returns all active entities for a tenant.
		"""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("is_active = TRUE")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, tenant_id)
		
		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def find(cls, id: int, connection=None) -> "Entities | None":
		"""
		Finds a record in entity table by record id
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

		# now return a Entity or List of Entities
		return cls.from_row(row, connection)