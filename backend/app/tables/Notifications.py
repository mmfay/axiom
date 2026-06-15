from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL


@dataclass
class Notifications(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	user_id: Optional[int] = None
	type: Optional[str] = None
	message: Optional[str] = None
	document_type: Optional[str] = None
	record_id: Optional[int] = None
	is_read: Optional[bool] = None
	created_at = None

	table_name = "notifications"

	def __init__(self, id=None, tenant_id=None, user_id=None, type=None, message=None, document_type=None, record_id=None, is_read=None, created_at=None, connection=None):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.user_id = user_id
		self.type = type
		self.message = message
		self.document_type = document_type
		self.record_id = record_id
		self.is_read = is_read
		self.created_at = created_at

	@classmethod
	async def create(cls, user_id: int, type: str, message: str, document_type: str = None, record_id: int = None, connection=None) -> "Notifications":

		temp = cls(connection=connection)

		sql = (
			SQL()
				.insert(cls.table_name)
					.fields("user_id, type, message, document_type, record_id")
					.values("$1, $2, $3, $4, $5")
					.scoped(company=False)
					.returning()
				.getQuery()
		)

		row = await temp.fetch_returning(sql, user_id, type, message, document_type, record_id)

		if row is None:
			raise ValueError("Insert failed")
		
		return cls.from_row(row, connection)

	@classmethod
	async def find_unread(cls, user_id: int, connection=None) -> list["Notifications"]:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
					.scoped(company=False)
					.where("user_id = $1")
					.where("is_read = FALSE")
					.order_by("created_at DESC")
					.limit("$2")
				.getQuery()
		)

		rows = await temp.fetch_all(sql, user_id, 20)

		return [cls.from_row(r, connection) for r in rows]
	

	@classmethod
	async def mark_read(cls, notification_id: int, user_id: int, connection=None) -> None:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.update(cls.table_name)
					.set("is_read = TRUE")
					.where("id = $1")
					.where("user_id = $2")
					.scoped(company=False)
				.getQuery()
		)

		await temp.execute(sql, notification_id, user_id)

	@classmethod
	async def mark_all_read(cls, user_id: int, connection=None) -> None:

		temp = cls(connection=connection)

		sql = (
			SQL()
				.update(cls.table_name)
					.set("is_read = TRUE")
					.where("user_id = $1")
					.where("is_read = FALSE")
					.scoped(company=False)
				.getQuery()
		)

		await temp.execute(sql, user_id)