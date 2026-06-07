from fastapi import APIRouter, Depends
from app.services import numbering
from app.services.session import require_permission
from app.types.numbering import CreateNumberingSchemeRequest, UpdateNumberingSchemeRequest

router = APIRouter()


@router.get("")
async def list_schemes(_=Depends(require_permission("System.Read"))):
    return await numbering.list_schemes()


@router.post("")
async def create_scheme(data: CreateNumberingSchemeRequest, _=Depends(require_permission("System.Write"))):
    return await numbering.create_scheme(data)


@router.patch("/{scheme_id}")
async def update_scheme(scheme_id: int, data: UpdateNumberingSchemeRequest, _=Depends(require_permission("System.Write"))):
    return await numbering.update_scheme(scheme_id, data)


@router.get("/preview/{document_type}")
async def get_preview(document_type: str, _=Depends(require_permission("System.Read"))):
    return await numbering.get_preview(document_type)
