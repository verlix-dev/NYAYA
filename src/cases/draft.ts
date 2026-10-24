import type { RequestDraftInput } from '../web/domain.ts';

export function buildDraftBody(input: RequestDraftInput): string {
  return `Subject: Request for access to my personal data\n\nDear DemoCorp Privacy Team,\n\nMy name is ${input.requesterName}. Please provide a copy of the personal data associated with ${input.requesterEmail}.\n\nPurpose: ${input.requestPurpose}\n\nPlease let me know if you need any additional information through the destination's own review process.\n\nRegards,\n${input.requesterName}`;
}