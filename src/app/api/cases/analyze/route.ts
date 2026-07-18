import { handleAnalyzeCaseRequest } from "@/server/cases/handle-request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleAnalyzeCaseRequest(request);
}
