export type Unit='currency'|'percent'|'number';
export type Trend='up'|'down'|'flat';
export type ViewMode='compare'|'lrm'|'market';
export interface MarketMetric{ id:string; label:string; period:string; lrmValue:number; marketValue:number; unit:Unit; delta:number; deltaPercent:number; trend:Trend; source:string; }
export interface BedroomPerformance{ bedroomCount:string; lrmADR:number; marketADR:number; lrmOccupancy:number; marketOccupancy:number; lrmRevPAR:number; marketRevPAR:number; sampleSize:number; period:string; }
export interface NeighborhoodPerformance{ neighborhood:string; lrmADR:number; marketADR:number; lrmOccupancy:number; marketOccupancy:number; lrmRevenue:number; marketRevenueEstimate:number; capRateEstimate:number; trend:Trend; comps:number; }
export interface MonthlyPerformance{ month:string; lrmOccupancy:number; marketOccupancy:number; lrmADR:number; marketADR:number; lrmRevPAR:number; marketRevPAR:number; }
