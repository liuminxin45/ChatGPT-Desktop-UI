export interface IntegrationContract {
  forwarders?: string[];
  styleForwarders?: string[];
  adapterManifests?: string[];
  retiredPaths?: string[];
}
export interface IntegrationOptions {
  revision?: string;
  version?: string;
  contract?: IntegrationContract;
}
export interface IntegrationResult {
  status: 'passed' | 'failed';
  revision?: string;
  version?: string;
  errors: Array<{ code: string; file?: string; message?: string }>;
}
export function checkConsumer(root: string, options?: IntegrationOptions): IntegrationResult;
