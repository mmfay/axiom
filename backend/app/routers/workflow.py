from fastapi import APIRouter, Depends
from app.services import workflow
from app.services.session import require_permission
from app.types.workflow import SaveGraphRequest, ToggleWorkflowRequest

router = APIRouter()

@router.get("")
async def list_workflows(_=Depends(require_permission("Workflow.Read"))):
	return await workflow.list_workflows()

@router.get("/{document_type}")
async def get_workflow(document_type: str, _=Depends(require_permission("Workflow.Read"))):
	return await workflow.get_workflow(document_type)

@router.patch("/{document_type}")
async def toggle_workflow(document_type: str, data: ToggleWorkflowRequest, _=Depends(require_permission("Workflow.Write"))):
	return await workflow.toggle_workflow(document_type, data.is_active)

@router.put("/{document_type}/graph")
async def save_graph(document_type: str, data: SaveGraphRequest, _=Depends(require_permission("Workflow.Write"))):
	return await workflow.save_graph(document_type, data)

@router.get("/{document_type}/{record_id}/history")
async def get_workflow_history(document_type: str, record_id: int, _=Depends(require_permission())):
	return await workflow.get_workflow_history(document_type, record_id)

@router.post("/{document_type}/{record_id}/submit")
async def submit_workflow(document_type: str, record_id: int, _=Depends(require_permission())):
	return await workflow.submit_workflow(document_type, record_id)

@router.post("/{document_type}/{record_id}/approve")
async def approve_workflow(document_type: str, record_id: int, _=Depends(require_permission())):
	return await workflow.approve_workflow(document_type, record_id)

@router.post("/{document_type}/{record_id}/reject")
async def reject_workflow(document_type: str, record_id: int, _=Depends(require_permission())):
	return await workflow.reject_workflow(document_type, record_id)