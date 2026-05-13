import { env } from '../../config/env';
import type {
  ReleaseReadinessReport,
  SafetyAuditEvent,
  SafetyReportRequest,
  SafetyReviewRequest,
} from '../../types/astrology';
import { getInstallDeviceId } from '../device/deviceIdentity';

export async function reportSafetyIssue(
  request: SafetyReportRequest,
): Promise<SafetyAuditEvent> {
  const response = await fetch(`${env.astrologyApiUrl}/safety/report`, {
    body: JSON.stringify({
      ...request,
      safetyIdentifier:
        request.safetyIdentifier ??
        (await getInstallDeviceId().catch(() => undefined)),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Report could not be sent.'));
  }

  return (await response.json()) as SafetyAuditEvent;
}

export async function loadSafetyReports(token: string): Promise<SafetyAuditEvent[]> {
  const response = await fetch(`${env.astrologyApiUrl}/safety/admin/reports`, {
    headers: {
      'x-pridicta-admin-token': token,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Safety reports could not be loaded.'));
  }

  return (await response.json()) as SafetyAuditEvent[];
}

export async function reviewSafetyReport(
  token: string,
  eventId: string,
  request: SafetyReviewRequest,
): Promise<SafetyAuditEvent> {
  const response = await fetch(
    `${env.astrologyApiUrl}/safety/admin/reports/${encodeURIComponent(eventId)}/review`,
    {
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
        'x-pridicta-admin-token': token,
      },
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Safety report could not be updated.'));
  }

  return (await response.json()) as SafetyAuditEvent;
}

export async function loadReleaseReadiness(
  token: string,
): Promise<ReleaseReadinessReport> {
  const response = await fetch(
    `${env.astrologyApiUrl}/safety/admin/release-readiness`,
    {
      headers: {
        'x-pridicta-admin-token': token,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Public sharing check could not be loaded.'));
  }

  return (await response.json()) as ReleaseReadinessReport;
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    return typeof payload.detail === 'string' ? payload.detail : fallback;
  } catch {
    return fallback;
  }
}
