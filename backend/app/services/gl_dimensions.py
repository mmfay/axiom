from app.tables import GLDimensions, GLDimensionValues
from app.classes.apiresponse import APIResponse
from app.services.ctx import get_company


def _fmt(d: GLDimensions) -> dict:
	return {
		"id": d.id,
		"slot": d.slot,
		"name": d.name,
		"is_active": d.is_active,
	}


def _fmt_value(v: GLDimensionValues) -> dict:
	return {
		"id": v.id,
		"dimension_id": v.dimension_id,
		"code": v.code,
		"name": v.name,
		"is_active": v.is_active,
	}


async def list_dimensions():

	dims = await GLDimensions.findByCompany(get_company())
	
	return APIResponse.ok("Dimensions fetched", [_fmt(d) for d in dims])


async def create_dimension(data):

	existing = await GLDimensions.findBySlot(data.slot)
	if existing:
		return APIResponse.bad_request("A dimension for that slot already exists")

	dim = GLDimensions(slot=data.slot, name=data.name, is_active=data.is_active)
	dim = await dim.insert()

	return APIResponse.created("Dimension created", _fmt(dim))


async def update_dimension(dimension_id: int, data):

	dim = await GLDimensions.find(dimension_id)
	if not dim:
		return APIResponse.not_found("Dimension not found")

	if data.name is not None:
		dim.name = data.name
	if data.is_active is not None:
		dim.is_active = data.is_active

	dim = await dim.update()

	return APIResponse.ok("Dimension updated", _fmt(dim))


async def list_values(dimension_id: int):

	dim = await GLDimensions.find(dimension_id)
	if not dim:
		return APIResponse.not_found("Dimension not found")

	values = await GLDimensionValues.findByDimension(dimension_id)
	return APIResponse.ok("Values fetched", [_fmt_value(v) for v in values])


async def create_value(dimension_id: int, data):

	dim = await GLDimensions.find(dimension_id)
	if not dim:
		return APIResponse.not_found("Dimension not found")
	if not dim.is_active:
		return APIResponse.bad_request("Cannot add values to an inactive dimension")

	existing = await GLDimensionValues.findByCode(dimension_id, data.code)
	if existing:
		return APIResponse.bad_request("A value with that code already exists")

	value = GLDimensionValues(dimension_id=dimension_id, code=data.code, name=data.name)
	value = await value.insert()

	return APIResponse.created("Value created", _fmt_value(value))


async def update_value(dimension_id: int, value_id: int, data):
	
	value = await GLDimensionValues.find(value_id)
	if not value:
		return APIResponse.not_found("Value not found")

	if data.code is not None:
		existing = await GLDimensionValues.findByCode(dimension_id, data.code)
		if existing and existing.id != value_id:
			return APIResponse.bad_request("A value with that code already exists")
		value.code = data.code
	if data.name is not None:
		value.name = data.name
	if data.is_active is not None:
		value.is_active = data.is_active

	value = await value.update()

	return APIResponse.ok("Value updated", _fmt_value(value))