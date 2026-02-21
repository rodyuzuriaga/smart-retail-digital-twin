
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  AR_VIEW = 'AR_VIEW',
  WAREHOUSE_MAP = 'WAREHOUSE_MAP',
  WORKER_PANEL = 'WORKER_PANEL',
  DIGITAL_TWIN = 'DIGITAL_TWIN',
  AI_STUDIO = 'AI_STUDIO'
}

export interface InventoryAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface AMRStatus {
  id: string;
  battery: number;
  status: 'active' | 'charging' | 'idle';
  location: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
