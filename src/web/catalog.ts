import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type {
  HistoricalDatasetSummary,
  ServiceProfile,
} from './domain.ts';

interface HistoricalRecord {
  target_id: string;
  service_name: string;
  agent_status: string;
  rights_route_type: string;
  discovery_score?: number;
  privacy_policy_url?: string;
  rights_request_url?: string | null;
  grievance_contact?: string;
  evidence_urls?: string[];
  blockers?: string[];
  agent_status_summary?: string;
}

interface HistoricalDataset {
  project: string;
  run_at_utc: string;
  methodology_version: string;
  targets_tested: number;
  routes_found: number;
  results: HistoricalRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Historical dataset field ${key} must be a non-empty string`);
  }
  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function stringList(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function parseDataset(value: unknown): HistoricalDataset {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new Error('Historical validation JSON has an unsupported shape');
  }

  const results = value.results.map((item, index): HistoricalRecord => {
    if (!isRecord(item)) {
      throw new Error(`Historical result ${index + 1} is not an object`);
    }

    const score = item.discovery_score;
    return {
      target_id: requiredString(item, 'target_id'),
      service_name: requiredString(item, 'service_name'),
      agent_status: requiredString(item, 'agent_status'),
      rights_route_type: requiredString(item, 'rights_route_type'),
      discovery_score: typeof score === 'number' ? score : undefined,
      privacy_policy_url: optionalString(item, 'privacy_policy_url'),
      rights_request_url: typeof item.rights_request_url === 'string' ? item.rights_request_url : null,
      grievance_contact: optionalString(item, 'grievance_contact'),
      evidence_urls: stringList(item, 'evidence_urls'),
      blockers: stringList(item, 'blockers'),
      agent_status_summary: optionalString(item, 'agent_status_summary'),
    };
  });

  return {
    project: requiredString(value, 'project'),
    run_at_utc: requiredString(value, 'run_at_utc'),
    methodology_version: requiredString(value, 'methodology_version'),
    targets_tested: typeof value.targets_tested === 'number' ? value.targets_tested : results.length,
    routes_found: typeof value.routes_found === 'number' ? value.routes_found : 0,
    results,
  };
}

function routeLabel(routeType: string): string {
  switch (routeType) {
    case 'blocked':
      return 'Blocked before request';
    case 'dedicated_request_flow':
      return 'Dedicated request flow';
    case 'email_or_contact_route':
      return 'Email or contact route';
    case 'grievance_contact':
      return 'Grievance contact';
    default:
      return routeType.replaceAll('_', ' ');
  }
}

function toProfile(record: HistoricalRecord): ServiceProfile {
  return {
    id: record.target_id,
    name: record.service_name,
    category: 'Historical pilot observation',
    evidenceState: 'historical_unverified',
    routeType: record.rights_route_type,
    routeLabel: routeLabel(record.rights_route_type),
    providerStatus: record.agent_status,
    historicalScore: record.discovery_score,
    policyUrl: record.privacy_policy_url,
    rightsRequestUrl: record.rights_request_url ?? undefined,
    grievanceContact: record.grievance_contact,
    evidenceUrls: record.evidence_urls ?? [],
    blockers: record.blockers ?? [],
    evidenceGaps: [
      'No retained page snapshots or page bytes',
      'No screenshots or screenshot references',
      'No per-evidence capture timestamps',
      'No content hashes or evidence-to-step IDs',
    ],
    summary: record.agent_status_summary ?? 'Historical Agent summary was not recorded.',
    sourceAttribution: 'Historical input from the earlier Haq validation project; not verified by Nyaya.',
  };
}

export function loadHistoricalDataset(
  sourcePath = resolve(process.cwd(), 'validation_20261016_190546.json'),
): HistoricalDatasetSummary {
  // The historical dataset path is resolved at runtime from the working
  // directory; it is intentionally not statically traced so the build does
  // not bundle the whole project as server code.
  // turbopackIgnore: true - the historical dataset path is resolved at runtime
  // from the working directory so the build does not bundle the whole project.
  const dataset = parseDataset(JSON.parse(readFileSync(/* turbopackIgnore: true */ sourcePath, 'utf8')) as unknown);
  return {
    sourceFile: sourcePath,
    sourceProject: dataset.project,
    runAtUtc: dataset.run_at_utc,
    methodologyVersion: dataset.methodology_version,
    targetsTested: dataset.targets_tested,
    routesFound: dataset.routes_found,
    services: dataset.results.map(toProfile),
  };
}

export function controlledDemoProfile(): ServiceProfile {
  return {
    id: 'democorp',
    name: 'DemoCorp',
    category: 'Controlled synthetic demo',
    evidenceState: 'controlled_demo',
    routeType: 'synthetic_access_flow',
    routeLabel: 'Synthetic access-request flow',
    providerStatus: 'deterministic_fixture',
    evidenceUrls: ['https://democorp.invalid/privacy/access'],
    blockers: [],
    evidenceGaps: [],
    summary: 'A purpose-built synthetic destination for preparing an access request. Nyaya stops before the final submit action.',
    sourceAttribution: 'Controlled synthetic fixture; not a real company or service.',
  };
}
