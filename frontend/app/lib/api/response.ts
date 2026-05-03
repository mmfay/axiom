import { APIResult } from "../types/data";

export class ApiResponse {
	static handle<T>(res: APIResult<T>): APIResult<T> {
		if (!res.ok && res.status === 401) {
			window.location.href = "/login";
		}
		return res;
	}
}
