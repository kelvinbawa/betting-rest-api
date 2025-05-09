import { Router } from 'express';
import { marketController } from '../controllers/market.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/markets:
 *   get:
 *     summary: Get all markets with optional filtering
 *     parameters:
 *       - in: query
 *         name: sportId
 *         schema:
 *           type: string
 *         description: Filter by sport ID
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, suspended, closed, settled]
 *         description: Filter by market status
 *     responses:
 *       200:
 *         description: A list of markets
 */
router.get('/', marketController.getAllMarkets.bind(marketController));

/**
 * @swagger
 * /api/v1/markets/{id}:
 *   get:
 *     summary: Get a market by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Market ID
 *     responses:
 *       200:
 *         description: Market details
 *       404:
 *         description: Market not found
 */
router.get('/:id', marketController.getMarketById.bind(marketController));

/**
 * @swagger
 * /api/v1/markets:
 *   post:
 *     summary: Create a new market
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - name
 *               - selections
 *             properties:
 *               eventId:
 *                 type: string
 *               name:
 *                 type: string
 *               selections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - odds
 *                   properties:
 *                     name:
 *                       type: string
 *                     odds:
 *                       type: number
 *     responses:
 *       201:
 *         description: Created market
 *       400:
 *         description: Invalid market data
 *       404:
 *         description: Event not found
 */
router.post('/', marketController.createMarket.bind(marketController));

/**
 * @swagger
 * /api/v1/markets/{id}/odds:
 *   patch:
 *     summary: Update odds for selections in a market
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Market ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - selectionId
 *                     - odds
 *                   properties:
 *                     selectionId:
 *                       type: string
 *                     odds:
 *                       type: number
 *     responses:
 *       200:
 *         description: Updated market
 *       400:
 *         description: Invalid odds updates
 *       404:
 *         description: Market not found
 */
router.patch('/:id/odds', marketController.updateOdds.bind(marketController));

export default router;