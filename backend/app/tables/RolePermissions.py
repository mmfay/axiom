from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_tenant


@dataclass
class RolePermissions(Common):

	# table fields
	role_id: Optional[int] = None
	permission_id: Optional[int] = None
	tenant_id: Optional[int] = None

	# table name
	table_name = "role_permissions"

	def __init__(
		self,
		role_id: Optional[int] = None,
		permission_id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		connection=None,
	):
		super().__init__(connection)
		self.role_id = role_id
		self.permission_id = permission_id
		self.tenant_id = tenant_id

	async def insert(self) -> "RolePermissions":
		sql = (
			SQL()
				.insert(self.table_name)
					.fields("role_id, permission_id, tenant_id")
					.values("$1, $2, $3")
				.getQuery()
		)

		await self.execute(sql, self.role_id, self.permission_id, get_tenant())

		return self

	async def delete(self) -> None:
		sql = (
			SQL()
				.delete(self.table_name)
					.where("role_id = $1")
					.where("permission_id = $2")
					.where("tenant_id = $3")
				.getQuery()
		)

		await self.execute(sql, self.role_id, self.permission_id, get_tenant())

	@classmethod
	async def findByRole(cls, role_id: int, connection=None) -> list["RolePermissions"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("role_id = $1 AND tenant_id = $2")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, role_id, get_tenant())

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByPermission(cls, permission_id: int, connection=None) -> list["RolePermissions"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("permission_id = $1 AND tenant_id = $2")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, permission_id, get_tenant())

		return [cls.from_row(row, connection) for row in rows]