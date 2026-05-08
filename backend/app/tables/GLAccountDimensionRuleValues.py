from app.tables.Common import Common
from dataclasses import dataclass
from typing import Optional
from app.services.sql import SQL
from app.services.ctx import get_company, get_tenant


@dataclass
class GLAccountDimensionRuleValues(Common):

	id: Optional[int] = None
	tenant_id: Optional[int] = None
	company_id: Optional[int] = None
	rule_id: Optional[int] = None
	value_id: Optional[int] = None

	table_name = "gl_account_dimension_rule_values"

	def __init__(
		self,
		id: Optional[int] = None,
		tenant_id: Optional[int] = None,
		company_id: Optional[int] = None,
		rule_id: Optional[int] = None,
		value_id: Optional[int] = None,
		connection=None,
	):
		super().__init__(connection)
		self.id = id
		self.tenant_id = tenant_id
		self.company_id = company_id
		self.rule_id = rule_id
		self.value_id = value_id

	async def insert(self) -> "GLAccountDimensionRuleValues":

		sql = (
			SQL()
				.insert(self.table_name)
					.fields("tenant_id, company_id, rule_id, value_id")
					.values("$1, $2, $3, $4")
					.returning()
				.getQuery()
		)

		row = await self.fetch_one(sql, get_tenant(), get_company(), self.rule_id, self.value_id)

		if row is None:
			raise ValueError("Insert Failed: No row returned")
		
		self.id = row["id"]

		return self

	async def delete(self) -> None:

		if self.rule_id is None or self.value_id is None:
			raise ValueError("GLAccountDimensionRuleValue must have rule_id and value_id to delete")

		sql = (
			SQL()
				.delete(self.table_name)
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("rule_id = $3")
					.where("value_id = $4")
				.getQuery()
		)

		await self.execute(sql, get_tenant(), get_company(), self.rule_id, self.value_id)

	@classmethod
	async def findByRule(cls, rule_id: int, connection=None) -> list["GLAccountDimensionRuleValues"]:
		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where("rule_id = $3")
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company(), rule_id)

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def findByRules(cls, rule_ids: list[int], connection=None) -> list["GLAccountDimensionRuleValues"]:
		
		if not rule_ids:
			return []

		temp = cls(connection=connection)

		sql = (
			SQL()
				.select(cls.table_name)
				.where("tenant_id = $1")
				.where("company_id = $2")
				.where_in("rule_id", rule_ids)
			.getQuery()
		)

		rows = await temp.fetch_all(sql, get_tenant(), get_company())

		return [cls.from_row(row, connection) for row in rows]

	@classmethod
	async def deleteByRule(cls, rule_id: int, connection=None) -> None:
		"""Remove all allowed values for a rule (used when switching to 'allow all')."""
		temp = cls(connection=connection)

		sql = (
			SQL()
				.delete(cls.table_name)
					.where("tenant_id = $1")
					.where("company_id = $2")
					.where("rule_id = $3")
				.getQuery()
		)

		await temp.execute(sql, get_tenant(), get_company(), rule_id)
