import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/in-memory-db';
import { Market, MarketStatus, Selection } from '../models/market.model';
import { bettingEvents } from '../events/betting-events';

export interface CreateMarketDto {
  eventId: string;
  name: string;
  selections: Omit<Selection, 'id'>[];
}

export interface UpdateOddsDto {
  selectionId: string;
  odds: number;
}

export class MarketService {
  getAllMarkets(): Market[] {
    return db.getAllMarkets();
  }

  getMarketById(id: string): Market | undefined {
    return db.getMarketById(id);
  }

  filterMarkets(filters: {
    sportId?: string;
    eventId?: string;
    status?: MarketStatus;
  }): Market[] {
    return db.filterMarkets(filters);
  }

  createMarket(marketData: CreateMarketDto): Market | null {
    // Verify the event exists
    const event = db.getEventById(marketData.eventId);
    if (!event) {
      return null;
    }

    const now = new Date();
    const market: Market = {
      id: uuidv4(),
      eventId: marketData.eventId,
      name: marketData.name,
      status: MarketStatus.OPEN,
      selections: marketData.selections.map(selection => ({
        ...selection,
        id: uuidv4()
      })),
      createdAt: now,
      updatedAt: now
    };

    return db.createMarket(market);
  }

  updateOdds(marketId: string, updates: UpdateOddsDto[]): Market | null {
    const market = db.getMarketById(marketId);
    if (!market) {
      return null;
    }

    const updatedSelections = [...market.selections];
    let oddsChanged = false;

    updates.forEach(update => {
      const selectionIndex = updatedSelections.findIndex(s => s.id === update.selectionId);
      if (selectionIndex !== -1) {
        const selection = updatedSelections[selectionIndex];
        const oldOdds = selection.odds;
        const newOdds = update.odds;

        // Only update if odds have changed
        if (oldOdds !== newOdds) {
          updatedSelections[selectionIndex] = {
            ...selection,
            odds: newOdds
          };
          
          // Emit an odds change event
          bettingEvents.emitOddsChange(marketId, selection.id, oldOdds, newOdds);
          oddsChanged = true;
        }
      }
    });

    if (!oddsChanged) {
      return market;
    }

    const updatedMarket = {
      ...market,
      selections: updatedSelections,
      updatedAt: new Date()
    };

    return db.updateMarket(marketId, updatedMarket) || null;
  }

  updateMarketStatus(marketId: string, status: MarketStatus): Market | null {
    const market = db.getMarketById(marketId);
    if (!market) {
      return null;
    }

    const updatedMarket = {
      ...market,
      status,
      updatedAt: new Date()
    };

    return db.updateMarket(marketId, updatedMarket) || null;
  }
}

export const marketService = new MarketService();