 export enum EventStatus {
    UPCOMING = 'upcoming',
    LIVE = 'live',
    FINISHED = 'finished',
    CANCELLED = 'cancelled'
  }
  
  export interface Event {
    id: string;
    name: string;
    sportId: string;
    status: EventStatus;
    startTime: Date;
  }