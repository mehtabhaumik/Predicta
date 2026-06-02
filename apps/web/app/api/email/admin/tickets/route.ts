import {
  listAdminSupportInboxThreads,
  requireSupportInboxAdmin,
} from '../../../../../lib/email/admin-support-inbox';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const auth = requireSupportInboxAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const inbox = await listAdminSupportInboxThreads();

  return Response.json(inbox);
}
