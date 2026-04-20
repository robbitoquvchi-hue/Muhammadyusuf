import { ReactNode } from 'react';

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  component: ReactNode;
}

export type AppState = 'closed' | 'open' | 'minimized';
