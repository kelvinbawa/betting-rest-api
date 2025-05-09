import { EventEmitter } from 'events';

export interface OddsChangeEvent {
  marketId: string;
  selectionId: string;
  oldOdds: number;
  newOdds: number;
  timestamp: Date;
}

class BettingEventEmitter extends EventEmitter {
  emitOddsChange(
    marketId: string, 
    selectionId: string, 
    oldOdds: number, 
    newOdds: number
  ): void {
    const event: OddsChangeEvent = {
      marketId,
      selectionId,
      oldOdds,
      newOdds,
      timestamp: new Date()
    };
    
    this.emit('oddsChange', event);
    console.log(`Odds changed for selection ${selectionId} in market ${marketId}: ${oldOdds} -> ${newOdds}`);
  }
}

export const bettingEvents = new BettingEventEmitter();

bettingEvents.on('oddsChange', (event: OddsChangeEvent) => {
  console.log(
    `[EVENT] Market ${event.marketId}, Selection ${event.selectionId}: ` +
    `Odds changed from ${event.oldOdds} to ${event.newOdds} at ${event.timestamp.toISOString()}`
  );
});