from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class UserRoleAssignments(Common):

	# table fields
	user_id: Optional[int] = None
	role_id: Optional[int] = None
	tenant_id: Optional[int] = None
	assigned_at: Optional[str] = None

	# table name
	table_name = "user_role_assignments"

	def __init__(
		self,
		user_id: Optional[int] = None,
		role_id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		assigned_at: Optional[str] = None,
		connection=None,
	):
		super().__init__(connection)
		self.user_id = user_id
		self.role_id = role_id
		self.tenant_id = tenant_id
		self.assigned_at = assigned_at

	async def insert(self) -> "UserRoleAssignments":
		"""
		Assigns a role to a user
		"""
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("user_id, role_id, tenant_id")
					.values("$1, $2, $3")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, self.user_id, self.role_id, self.tenant_id)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.assigned_at = row["assigned_at"]

		return self

	async def delete(self) -> None:
		"""
		Removes a role from a user
		"""
		sql = (
			SQL()
				.delete(self.table_name)
					.where("user_id = $1")
					.where("role_id = $2")
				.getQuery()
		)

		await self.execute(sql, self.user_id, self.role_id)

	@classmethod
	async def findByUser(cls, user_id: int, tenant_id: int, connection=None) -> list["UserRoleAssignments"]:
		"""
		Returns all role assignments for a user within a tenant
		"""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("user_id = $1")
				.where("tenant_id = $2")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, user_id, tenant_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByRole(cls, role_id: int, connection=None) -> list["UserRoleAssignments"]:
		"""
		Returns all user assignments for a role
		"""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("role_id = $1")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, role_id)

		return [cls.from_row(row, connection) for row in rows]
