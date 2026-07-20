import { handleAnalyzeCaseRequest } from "@/server/cases/handle-request";

export const runtime = "nodejs";
// A full route build can take well over the platform default. Without this the
// hosted function is killed mid-analysis and the user sees a generic outage.
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  return handleAnalyzeCaseRequest(request);
}
