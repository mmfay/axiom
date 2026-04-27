from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class Users(Common):
    
	# table fields
	id: Optional[int] = None
	version_id: Optional[int] = None
	email: Optional[str] = None
	user_id: Optional[str] = None
	password: Optional[str] = None
	is_enabled: Optional[bool] = None
	tenant_id: Optional[int] = None
	default_company_id: Optional[int] = None

	# table name
	table_name = "users"
	
	def __init__(
		self,
		id: Optional[int] = None,
		version_id: Optional[int] = None,
		email: Optional[str] = None,
		user_id: Optional[str] = None,
		password: Optional[str] = None,
		is_enabled: Optional[bool] = None,
		tenant_id: Optional[int] = None,
		default_company_id: Optional[int] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.version_id = version_id
		self.email = email
		self.user_id = user_id
		self.password = password
		self.is_enabled = is_enabled
		self.tenant_id = tenant_id
		self.default_company_id = default_company_id

	#
	async def insert(self) -> "Users":
		"""
		Inserts a record into user table using self properties
		"""
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("email, password, user_id, tenant_id, default_company_id")
            		.values("$1, $2, $3, $4, $5")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_one(sql, self.email, self.password, self.user_id, self.tenant_id, self.default_company_id)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		self.version_id = row["version_id"]
		self.id = row["id"]
		
		return self

	async def update(self) -> "Users":
		"""
		Updates a record in the user table using self properties
		"""

		if self.id is None:
			raise ValueError("User must have an id to update")

		sql = (
			SQL()
				.update(self.table_name)
					.set("email=$1, password=$2, is_enabled=$3, version_id=$4+1")
					.where("id = $5 AND version_id = $4")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_one(sql, self.email, self.password, self.is_enabled, self.version_id, self.id)

		if row is None:
			raise ValueError("Update Failed: No row returned")
		
		# Make a method to update fields that are based on modified
		self.version_id = row["version_id"]
		
		return self

	@classmethod
	async def find(cls, id: int, connection=None) -> "Users | None":	
		"""
		Finds a record in user table by record id
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

	@classmethod
	async def findByEmail(cls, email: str, connection=None) -> "Users | None":	
		"""
		Finds a record in user table by Email
		"""

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("email = $1")
			.getQuery()
		)

		row = await temp.fetch_one(sql, email)
		
		if row is None: 
			return None

		# now return a User or List of Users
		return cls.from_row(row, connection)
	
	@classmethod
	async def findByUserID(cls, user_id: str, connection=None) -> "Users | None":	
		"""
		Finds a record in user table by UserID
		"""
		
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("user_id = $1")
			.getQuery()
		)

		row = await temp.fetch_one(sql, user_id)
		
		if row is None: 
			return None

		# now return a User or List of Users
		return cls.from_row(row, connection)
        