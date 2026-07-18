import { handleResearchCaseRequest } from "@/server/research/handle-request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handleResearchCaseRequest(request);
}
