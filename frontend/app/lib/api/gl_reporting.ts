import { getJSON } from "./submissions";
import { APIResult } from "../types/data";
import { TrialBalance } from "../types/gl_reporting";

export async function getTrialBalance(asOf: string): Promise<APIResult<TrialBalance>> {
	return getJSON("/gl/trial-balance", { as_of: asOf });
}
