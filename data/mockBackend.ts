import { PlatformModule, ImportJob } from '@/types/platform';
export const platformModules: PlatformModule[] = [
  { key:'content_cms',name:'Content CMS',description:'Long-form blog and publishing workflows.',status:'active' },
  { key:'property_cms',name:'Property CMS',description:'Property uploads and investment memo publishing.',status:'active' },
  { key:'lead_crm',name:'Lead CRM',description:'Lead capture, qualification, ROI submissions.',status:'active' },
  { key:'market_data_warehouse',name:'Market Data Warehouse',description:'LRM + benchmark normalized metrics.',status:'beta' },
  { key:'import_center',name:'Import Center',description:'Guesty/AirDNA/CSV ingestion orchestration.',status:'planned' },
  { key:'media_library',name:'Media Library',description:'Storage-backed image/PDF asset manager.',status:'active' },
  { key:'report_manager',name:'Report Manager',description:'Gated report publishing and access control.',status:'beta' },
  { key:'user_roles_permissions',name:'User Roles & Permissions',description:'Role-based access across admin and reports.',status:'planned' },
  { key:'audit_logs',name:'Audit Logs',description:'Admin action and data change trail.',status:'planned' },
  { key:'analytics_tracking',name:'Analytics/Event Tracking',description:'Events for funnel, content, and calculators.',status:'planned' },
  { key:'gated_content_access',name:'Gated Content Access',description:'Access tokens/approvals for premium content.',status:'beta' }
];
export const mockImportJobs: ImportJob[] = [
  { id:'job_1',source:'airdna',status:'completed',startedAt:'2026-04-01',finishedAt:'2026-04-01',notes:'Sample import' },
  { id:'job_2',source:'guesty',status:'queued',startedAt:'2026-04-29',notes:'Waiting for scheduler' }
];
