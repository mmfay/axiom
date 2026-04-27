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

		# RETURNING clause (Postgres-specific)
		self._returning = None

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

	def returning(self, *columns):
		# Add RETURNING clause (defaults to all columns if none specified)
		self._returning = ", ".join(columns) if columns else "*"
		return self

	def getQuery(self) -> str:
		# Ensure required base components exist
		if not self._action or not self._table:
			raise ValueError("Action and table must be set")

		# Build base query depending on action type
		if self._action == "SELECT":
			query = f"SELECT {self._select_columns} FROM {self._table}"

		elif self._action == "INSERT":
			# INSERT requires both fields and values
			if not self._fields or not self._values:
				raise ValueError("INSERT requires fields and values")
			query = f"INSERT INTO {self._table} ({self._fields}) VALUES ({self._values})"

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
		if self._where:
			query += " WHERE " + " AND ".join(self._where)

		# Append RETURNING clause if specified
		if self._returning:
			query += f" RETURNING {self._returning}"

		return query