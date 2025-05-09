import { Request, Response } from 'express';
import { marketService } from '../services/market.service';
import { MarketStatus } from '../models/market.model';

export class MarketController {
  async getAllMarkets(req: Request, res: Response): Promise<void> {
    try {
      const { sportId, eventId, status } = req.query;
      
      const filters: {
        sportId?: string;
        eventId?: string;
        status?: MarketStatus;
      } = {};
      
      if (sportId) filters.sportId = sportId as string;
      if (eventId) filters.eventId = eventId as string;
      if (status && Object.values(MarketStatus).includes(status as MarketStatus)) {
        filters.status = status as MarketStatus;
      }
      
      const markets = Object.keys(filters).length > 0
        ? marketService.filterMarkets(filters)
        : marketService.getAllMarkets();
        
      res.status(200).json(markets);
    } catch (error) {
      console.error('Error getting markets:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getMarketById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const market = marketService.getMarketById(id);
      
      if (!market) {
        res.status(404).json({ message: 'Market not found' });
        return;
      }
      
      res.status(200).json(market);
    } catch (error) {
      console.error(`Error getting market ${req.params.id}:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createMarket(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, name, selections } = req.body;
      
      if (!eventId || !name || !selections || !Array.isArray(selections)) {
        res.status(400).json({ message: 'Invalid market data' });
        return;
      }
      
      const market = marketService.createMarket({ eventId, name, selections });
      
      if (!market) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      
      res.status(201).json(market);
    } catch (error) {
      console.error('Error creating market:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateOdds(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { updates } = req.body;
      
      if (!updates || !Array.isArray(updates)) {
        res.status(400).json({ message: 'Invalid odds updates' });
        return;
      }
      
      const market = marketService.updateOdds(id, updates);
      
      if (!market) {
        res.status(404).json({ message: 'Market not found' });
        return;
      }
      
      res.status(200).json(market);
    } catch (error) {
      console.error(`Error updating odds for market ${req.params.id}:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const marketController = new MarketController();