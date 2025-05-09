  export enum MarketStatus {
    OPEN = 'open',
    SUSPENDED = 'suspended',
    CLOSED = 'closed',
    SETTLED = 'settled'
  }
  
  export interface Selection {
    id: string;
    name: string;
    odds: number;
  }
  
  export interface Market {
    id: string;
    eventId: string;
    name: string;
    status: MarketStatus;
    selections: Selection[];
    createdAt: Date;
    updatedAt: Date;
  }