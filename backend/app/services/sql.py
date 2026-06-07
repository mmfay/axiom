class SQL:

	def __init__(self):
		# Stores the type of SQL operation (SELECT, INSERT, UPDATE, DELETE)
		self._action = None

		# Target table name for the query
		self._table = None

		# Columns to select (defaults to all)
		self._select_columns = "*"

		# Fields used for INSERT statements
		self._fields = None

		# Values placeholder string for INSERT
		self._values = None

		# SET clause for UPDATE statements
		self._set_clause = None

		# List of WHERE conditions (combined with AND)
		self._where = []

		# List of JOIN clauses
		self._joins = []

		# GROUP BY clause
		self._group_by = None

		# List of HAVING conditions (combined with AND)
		self._having = []

		# RETURNING clause (Postgres-specific)
		self._returning = None

		# ORDER BY clause
		self._order_by = None

		# LIMIT clause
		self._limit = None

		# Tenant/company scoping flag
		self._scoped = False

	def select(self, table_name: str):
		# Initialize SELECT query
		self._action = "SELECT"
		self._table = table_name
		self._select_columns = "*"
		return self

	def insert(self, table_name: str):
		# Initialize INSERT query
		self._action = "INSERT"
		self._table = table_name
		return self

	def update(self, table_name: str):
		# Initialize UPDATE query
		self._action = "UPDATE"
		self._table = table_name
		return self

	def delete(self, table_name: str):
		# Initialize DELETE query
		self._action = "DELETE"
		self._table = table_name
		return self

	def columns(self, *columns: str):
		# Define columns for SELECT (overrides default "*")
		if columns:
			self._select_columns = ", ".join(columns)
		return self

	def fields(self, fields: str):
		# Define column names for INSERT
		self._fields = fields
		return self

	def values(self, values: str):
		# Define values placeholders for INSERT (e.g. $1, $2)
		self._values = values
		return self

	def set(self, set_clause: str):
		# Define SET clause for UPDATE
		self._set_clause = set_clause
		return self

	def where(self, condition: str):
		# Add a WHERE condition (multiple chained with AND)
		self._where.append(condition)
		return self

	def where_in(self, column: str, values: list):
		# Add a WHERE col IN (1, 2, 3) condition — values must be integers
		joined = ", ".join(str(int(v)) for v in values)
		self._where.append(f"{column} IN ({joined})")
		return self

	def left_join(self, table: str, condition: str):
		self._joins.append(f"LEFT JOIN {table} ON {condition}")
		return self

	def group_by(self, clause: str):
		self._group_by = clause
		return self

	def having(self, condition: str):
		self._having.append(condition)
		return self

	def order_by(self, column: str):
		self._order_by = column
		return self

	def limit(self, placeholder: str):
		self._limit = placeholder
		return self

	def scoped(self):
		self._scoped = True
		return self

	def returning(self, *columns):
		# Add RETURNING clause (defaults to all columns if none specified)
		self._returning = ", ".join(columns) if columns else "*"
		return self

	def getQuery(self) -> str:
		# Ensure required base components exist
		if not self._action or not self._table:
			raise ValueError("Action and table must be set")

		# Resolve scoped fields/where non-mutably
		fields = self._fields
		values = self._values
		where = list(self._where)

		if self._scoped:
			t = "current_setting('app.tenant_id', true)::integer"
			c = "current_setting('app.company_id', true)::integer"
			if self._action == "INSERT":
				fields = f"tenant_id, company_id, {fields}" if fields else "tenant_id, company_id"
				values = f"{t}, {c}, {values}" if values else f"{t}, {c}"
			else:
				where = [f"tenant_id = {t}", f"company_id = {c}"] + where

		# Build base query depending on action type
		if self._action == "SELECT":
			query = f"SELECT {self._select_columns} FROM {self._table}"
			if self._joins:
				query += " " + " ".join(self._joins)

		elif self._action == "INSERT":
			# INSERT requires both fields and values
			if not fields or not values:
				raise ValueError("INSERT requires fields and values")
			query = f"INSERT INTO {self._table} ({fields}) VALUES ({values})"

		elif self._action == "UPDATE":
			# UPDATE requires SET clause
			if not self._set_clause:
				raise ValueError("UPDATE requires set clause")
			query = f"UPDATE {self._table} SET {self._set_clause}"

		elif self._action == "DELETE":
			query = f"DELETE FROM {self._table}"

		else:
			raise ValueError("Invalid action")

		# Append WHERE conditions if present
		if where:
			query += " WHERE " + " AND ".join(where)

		# Append GROUP BY clause if specified
		if self._group_by:
			query += f" GROUP BY {self._group_by}"

		# Append HAVING conditions if present
		if self._having:
			query += " HAVING " + " AND ".join(self._having)

		# Append ORDER BY clause if specified
		if self._order_by:
			query += f" ORDER BY {self._order_by}"

		# Append LIMIT clause if specified
		if self._limit:
			query += f" LIMIT {self._limit}"

		# Append RETURNING clause if specified
		if self._returning:
			query += f" RETURNING {self._returning}"

		return query