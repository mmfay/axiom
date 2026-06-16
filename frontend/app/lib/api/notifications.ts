import { getJSON, patchJSON, postJSON } from "./submissions";
import { APIResult } from "../types/data";
import { Notification } from "../types/notifications";

export async function getNotifications(): Promise<APIResult<Notification[]>> {
	return getJSON("/notifications");
}

export async function markNotificationRead(id: number): Promise<APIResult<void>> {
	return patchJSON(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<APIResult<void>> {
	return postJSON("/notifications/read-all");
}