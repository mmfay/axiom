export type APIResult<T> = { 
	ok: boolean; 
	message: string; 
	data?: T; 
	status: number; 
	statusText: string 
}
