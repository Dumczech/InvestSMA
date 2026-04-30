export type ModuleKey =
  | 'content_cms' | 'property_cms' | 'lead_crm' | 'market_data_warehouse' | 'import_center'
  | 'media_library' | 'report_manager' | 'user_roles_permissions' | 'audit_logs' | 'analytics_tracking' | 'gated_content_access';

export interface PlatformModule { key: ModuleKey; name: string; description: string; status: 'planned'|'active'|'beta'; }
export interface ImportJob { id: string; source: 'guesty'|'airdna'|'owner_statement'|'manual_csv'; status: 'queued'|'running'|'completed'|'failed'; startedAt: string; finishedAt?: string; notes?: string; }
export interface InvestmentAssumptionVersion { id: string; propertyId: string; version: number; assumptions: Record<string, number | string>; createdAt: string; createdBy: string; }
