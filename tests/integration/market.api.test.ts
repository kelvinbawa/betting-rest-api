import request from 'supertest';
import { createApp } from '../../src/app';
import { db } from '../../src/db/in-memory-db';
import { v4 as uuidv4 } from 'uuid';
import { EventStatus } from '../../src/models/event.model';
import { config } from '../../src/config/env';

jest.mock('../../src/db/in-memory-db', () => {
  const mockDb = {
    seedData: jest.fn(),
    getAllMarkets: jest.fn().mockReturnValue([]),
    getMarketById: jest.fn(),
    createMarket: jest.fn(),
    updateMarket: jest.fn(),
    filterMarkets: jest.fn().mockReturnValue([]),
    getEventById: jest.fn(),
    getAllEvents: jest.fn().mockReturnValue([])
  };
  return { db: mockDb };
});

jest.mock('../../src/events/betting-events', () => ({
  bettingEvents: {
    emitOddsChange: jest.fn()
  }
}));

describe('Market API Endpoints', () => {
  const app = createApp();
  const apiVersionPrefix = `/api/${config.server.apiVersion || 'v1'}`;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /markets', () => {
    it('should return an empty array when no markets exist', async () => {
      (db.getAllMarkets as jest.Mock).mockReturnValue([]);
      
      const response = await request(app)
        .get(`${apiVersionPrefix}/markets`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toEqual([]);
      expect(db.getAllMarkets).toHaveBeenCalled();
    });
    
    it('should filter markets by sport ID when provided', async () => {
      const mockMarkets = [
        { id: 'market1', sportId: 'sport1', name: 'Market 1' },
        { id: 'market2', sportId: 'sport2', name: 'Market 2' }
      ];
      (db.filterMarkets as jest.Mock).mockReturnValue([mockMarkets[0]]);
      
      const response = await request(app)
        .get(`${apiVersionPrefix}/markets?sportId=sport1`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toEqual([mockMarkets[0]]);
      expect(db.filterMarkets).toHaveBeenCalledWith(expect.objectContaining({
        sportId: 'sport1'
      }));
    });
  });
  
  describe('GET /markets/:id', () => {
    it('should return 404 for non-existent market', async () => {
      (db.getMarketById as jest.Mock).mockReturnValue(undefined);
      
      const response = await request(app)
        .get(`${apiVersionPrefix}/markets/nonexistent`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Market not found');
      expect(db.getMarketById).toHaveBeenCalledWith('nonexistent');
    });
    
    it('should return market when it exists', async () => {
      const mockMarket = {
        id: 'market1',
        eventId: 'event1',
        name: 'Win Market',
        status: 'open',
        selections: [
          { id: 'sel1', name: 'Team A', odds: 2.0 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (db.getMarketById as jest.Mock).mockReturnValue(mockMarket);
      
      const response = await request(app)
        .get(`${apiVersionPrefix}/markets/market1`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toEqual(expect.objectContaining({
        id: 'market1',
        name: 'Win Market'
      }));
      expect(db.getMarketById).toHaveBeenCalledWith('market1');
    });
  });
  
  describe('POST /markets', () => {
    it('should reject invalid market data', async () => {
      const response = await request(app)
        .post(`${apiVersionPrefix}/markets`)
        .send({ name: 'Invalid Market' }) 
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid market data');
      expect(db.createMarket).not.toHaveBeenCalled();
    });
    
    it('should create a valid market', async () => {
      const marketData = {
        eventId: 'event1',
        name: 'Win Market',
        selections: [
          { name: 'Team A', odds: 2.0 },
          { name: 'Team B', odds: 3.5 }
        ]
      };
      
      const mockEvent = {
        id: 'event1',
        name: 'Test Match',
        sportId: 'sport1',
        status: EventStatus.UPCOMING,
        startTime: new Date()
      };
      
      const createdMarket = {
        id: uuidv4(),
        ...marketData,
        status: 'open',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        selections: marketData.selections.map(s => ({
          ...s,
          id: expect.any(String)
        }))
      };
      
      (db.getEventById as jest.Mock).mockReturnValue(mockEvent);
      (db.createMarket as jest.Mock).mockReturnValue(createdMarket);
      
      const response = await request(app)
        .post(`${apiVersionPrefix}/markets`)
        .send(marketData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toEqual(expect.objectContaining({
        eventId: 'event1',
        name: 'Win Market'
      }));
      expect(response.body.selections).toHaveLength(2);
      expect(db.getEventById).toHaveBeenCalledWith('event1');
      expect(db.createMarket).toHaveBeenCalled();
    });
    
    it('should return 404 if the event does not exist', async () => {
      const marketData = {
        eventId: 'nonexistent',
        name: 'Win Market',
        selections: [
          { name: 'Team A', odds: 2.0 }
        ]
      };
      
      (db.getEventById as jest.Mock).mockReturnValue(undefined);
      
      const response = await request(app)
        .post(`${apiVersionPrefix}/markets`)
        .send(marketData)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Event not found');
      expect(db.getEventById).toHaveBeenCalledWith('nonexistent');
      expect(db.createMarket).not.toHaveBeenCalled();
    });
  });
  
  describe('PATCH /markets/:id/odds', () => {
    it('should update odds for existing selections', async () => {
      const marketId = 'market1';
      const updates = {
        updates: [
          { selectionId: 'sel1', odds: 2.5 }
        ]
      };
      
      const originalMarket = {
        id: marketId,
        eventId: 'event1',
        name: 'Win Market',
        status: 'open',
        selections: [
          { id: 'sel1', name: 'Team A', odds: 2.0 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedMarket = {
        ...originalMarket,
        selections: [
          { id: 'sel1', name: 'Team A', odds: 2.5 }
        ],
        updatedAt: new Date()
      };
      
      (db.getMarketById as jest.Mock).mockReturnValue(originalMarket);
      (db.updateMarket as jest.Mock).mockReturnValue(updatedMarket);
      
      const response = await request(app)
        .patch(`${apiVersionPrefix}/markets/${marketId}/odds`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toEqual(expect.objectContaining({
        id: marketId,
        selections: expect.arrayContaining([
          expect.objectContaining({
            id: 'sel1',
            odds: 2.5
          })
        ])
      }));
    });
    
    it('should reject invalid odds update data', async () => {
      const response = await request(app)
        .patch(`${apiVersionPrefix}/markets/market1/odds`)
        .send({ invalid: 'data' })
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('message', 'Invalid odds updates');
    });
    
    it('should return 404 for non-existent market', async () => {
      const updates = {
        updates: [
          { selectionId: 'sel1', odds: 2.5 }
        ]
      };
      
      (db.getMarketById as jest.Mock).mockReturnValue(undefined);
      
      const response = await request(app)
        .patch(`${apiVersionPrefix}/markets/nonexistent/odds`)
        .send(updates)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('message', 'Market not found');
    });
  });
  
  describe('Idempotency', () => {
    it('should process identical requests with different idempotency keys as separate operations', async () => {
      const marketData = {
        eventId: 'event1',
        name: 'Win Market',
        selections: [
          { name: 'Team A', odds: 2.0 }
        ]
      };
      
      const mockEvent = {
        id: 'event1',
        name: 'Test Match',
        sportId: 'sport1',
        status: EventStatus.UPCOMING,
        startTime: new Date()
      };
      
      (db.getEventById as jest.Mock).mockReturnValue(mockEvent);
      (db.createMarket as jest.Mock).mockImplementation(() => ({
        id: uuidv4(),
        ...marketData,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        selections: marketData.selections.map(s => ({
          ...s,
          id: uuidv4()
        }))
      }));
      
      await request(app)
        .post(`${apiVersionPrefix}/markets`)
        .set('Idempotency-Key', 'key1')
        .send(marketData)
        .expect(201);
      
      await request(app)
        .post(`${apiVersionPrefix}/markets`)
        .set('Idempotency-Key', 'key2')
        .send(marketData)
        .expect(201);
      
      expect(db.createMarket).toHaveBeenCalledTimes(2);
    });
  });
});