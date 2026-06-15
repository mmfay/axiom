"use client";

import { useCallback, useEffect, useState } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/notifications";
import { ApiResponse } from "../api/response";
import { Notification } from "../types/notifications";

const POLL_INTERVAL = 30_000;

export function useNotifications() {

	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	const fetch = useCallback(async () => {
		const res = ApiResponse.handle(await getNotifications());
		if (res.ok && res.data) setNotifications(res.data);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetch();
		const interval = setInterval(fetch, POLL_INTERVAL);
		return () => clearInterval(interval);
	}, [fetch]);

	const markRead = useCallback(async (id: number) => {
		await markNotificationRead(id);
		setNotifications(prev => prev.filter(n => n.id !== id));
	}, []);

	const markAllRead = useCallback(async () => {
		await markAllNotificationsRead();
		setNotifications([]);
	}, []);

	return {
		notifications,
		loading,
		unreadCount: notifications.length,
		markRead,
		markAllRead,
		refresh: fetch,
	};
}
