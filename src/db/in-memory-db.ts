import { Market, MarketStatus } from '../models/market.model';
import { Sport } from '../models/sport.model';
import { Event, EventStatus } from '../models/event.model';

class InMemoryDB {
  private markets: Map<string, Market> = new Map();
  private sports: Map<string, Sport> = new Map();
  private events: Map<string, Event> = new Map();

  getAllMarkets(): Market[] {
    return Array.from(this.markets.values());
  }

  getMarketById(id: string): Market | undefined {
    return this.markets.get(id);
  }

  createMarket(market: Market): Market {
    this.markets.set(market.id, market);
    return market;
  }

  updateMarket(id: string, market: Partial<Market>): Market | undefined {
    const existingMarket = this.markets.get(id);
    if (!existingMarket) return undefined;

    const updatedMarket = { ...existingMarket, ...market, updatedAt: new Date() };
    this.markets.set(id, updatedMarket);
    return updatedMarket;
  }

  filterMarkets(filters: Partial<{ 
    sportId: string;
    eventId: string;
    status: MarketStatus;
  }>): Market[] {
    //TODO: remove log after debugging
    console.log("filter called...", this.getAllMarkets());
    return this.getAllMarkets().filter(market => {
      if (filters.eventId && market.eventId !== filters.eventId) return false;
      
      if (filters.status && market.status !== filters.status) return false;
      
      if (filters.sportId) {
        const event = this.events.get(market.eventId);
        if (!event || event.sportId !== filters.sportId) return false;
      }
      
      return true;
    });
  }

  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  getEventById(id: string): Event | undefined {
    return this.events.get(id);
  }

  createEvent(event: Event): Event {
    this.events.set(event.id, event);
    return event;
  }

  // initial data
  seedData(): void {
    
    const football: Sport = { id: 'sport_fb', name: 'Football' };
    const horseRacing: Sport = { id: 'sport_hr', name: 'Horse Racing' };
    
    this.sports.set(football.id, football);
    this.sports.set(horseRacing.id, horseRacing);
    
    const premierLeagueMatch: Event = {
      id: 'event1',
      name: 'Liverpool vs Manchester United',
      sportId: football.id,
      status: EventStatus.UPCOMING,
      startTime: new Date(Date.now() + 86400000) // tomorrow //TODO: replace with dateFn library
    };
    
    const horseRace: Event = {
      id: 'event2',
      name: 'Ascot 15:30',
      sportId: horseRacing.id,
      status: EventStatus.UPCOMING,
      startTime: new Date(Date.now() + 3600000) // in 1 hour //TODO: replace with dateFn library
    };
    
    this.events.set(premierLeagueMatch.id, premierLeagueMatch);
    this.events.set(horseRace.id, horseRace);
  }
  
}

// singleton instance
export const db = new InMemoryDB();