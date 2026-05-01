from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.cursorpage import CursorPage, decode_cursor, encode_cursor
from app.classes.appexception import AppException


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
	default_role_id: Optional[int] = None

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
		default_role_id: Optional[int] = None,
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
		self.default_role_id = default_role_id

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
					.set("email=$1, password=$2, is_enabled=$3, default_role_id=$4, version_id=$5+1")
					.where("id = $6 AND version_id = $5")
					.returning()
				.getQuery()
		)
		
		row = await self.fetch_one(sql, self.email, self.password, self.is_enabled, self.default_role_id, self.version_id, self.id)

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

	@classmethod
	async def findByTenant(cls, tenant_id: int, connection=None) -> list["Users"]:
		"""
		Returns all users for a tenant.
		"""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, tenant_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def getUserPagination(cls, tenant_id: int, cursor: str | None = None, connection=None) -> CursorPage:
		"""
		Cursor pagination (forward) using users.id.
		- cursor encodes the last seen id
		- returns up to `limit` items
		"""
		
		temp = cls(connection=connection)

		# get the users settings lines per page
		# default to 25 for now
		page_lines = 2

		tenant = tenant_id

		last_id = 0
		if cursor:
			try:
				payload = decode_cursor(cursor)
				last_id = int(payload.get("id", 0))
			except Exception:
				raise AppException(400, "Invalid cursor")

		# Fetch limit + 1 to know if there is another page
		sql = (
			SQL()
				.select(cls.table_name)
				.columns("email", "user_id", "id", "is_enabled")
				.where("tenant_id = $1")
				.where("id > $2")
				.order_by("id")
				.limit("$3")
				.getQuery()
		)

		rows = await temp.fetch_all(sql, tenant, last_id, page_lines + 1)

		# Determine has_more by over-fetching
		has_more = len(rows) > page_lines
		rows = rows[:page_lines]

		items = [cls.from_row(r, connection) for r in rows]

		next_cursor = None
		if has_more:
			# cursor points to the last item in this page
			next_cursor = encode_cursor({"id": dict(rows[-1])["id"]})

		return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)   