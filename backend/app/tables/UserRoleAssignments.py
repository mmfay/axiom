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

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("user_id, role_id")
					.values("$1, $2")
					.scoped(company=False)
					.returning()
				.getQuery()
		)

		row = await self.fetch_returning(sql, self.user_id, self.role_id)

		if row is None:
			raise ValueError("Insert Failed: No row returned")

		self.assigned_at = row["assigned_at"]

		return self

	async def delete(self) -> None:

		sql = (
			SQL()
				.delete(self.table_name)
					.where("user_id = $1")
					.where("role_id = $2")
					.scoped(company=False)
				.getQuery()
		)

		await self.execute(sql, self.user_id, self.role_id)

	@classmethod
	async def findByUser(cls, user_id: int, connection=None) -> list["UserRoleAssignments"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("user_id = $1")
					.scoped(company=False)
				.getQuery()
		)

		rows = await temp.fetch_all(sql, user_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByRole(cls, role_id: int, connection=None) -> list["UserRoleAssignments"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.where("role_id = $1")
					.scoped(company=False)
				.getQuery()
		)

		rows = await temp.fetch_all(sql, role_id)

		return [cls.from_row(row, connection) for row in rows]