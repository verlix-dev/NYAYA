export type EvidenceState = 'historical_unverified' | 'controlled_demo';

export interface ServiceProfile {
  id: string;
  name: string;
  category: string;
  evidenceState: EvidenceState;
  routeType: string;
  routeLabel: string;
  providerStatus: string;
  historicalScore?: number;
  policyUrl?: string;
  rightsRequestUrl?: string;
  grievanceContact?: string;
  evidenceUrls: readonly string[];
  blockers: readonly string[];
  evidenceGaps: readonly string[];
  summary: string;
  sourceAttribution: string;
}

export interface HistoricalDatasetSummary {
  sourceFile: string;
  sourceProject: string;
  runAtUtc: string;
  methodologyVersion: string;
  targetsTested: number;
  routesFound: number;
  services: readonly ServiceProfile[];
}

export interface RequestDraftInput {
  destinationName?: string;
  requesterName: string;
  requesterEmail: string;
  requestPurpose: string;
}

export interface RequestDraft {
  destinationName: string;
  rightsGoal: 'access';
  requesterName: string;
  requesterEmail: string;
  requestPurpose: string;
  body: string;
}
