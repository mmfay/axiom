export interface Notification {
	id: number;
	type: string;
	message: string;
	document_type: string | null;
	record_id: number | null;
	is_read: boolean;
	created_at: string;
}