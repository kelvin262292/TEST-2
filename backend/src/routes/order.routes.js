const express = require('express');
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware'); // Protect all order routes

const router = express.Router();

// All routes in this file are protected and require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for authenticated users
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order from the user's current cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreationPayload'
 *     responses:
 *       201:
 *         description: Order placed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input (e.g., empty cart, bad shippingAddress, insufficient stock).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', orderController.placeOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get a list of all orders for the current user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', orderController.listOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get details of a specific order for the current user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to retrieve.
 *     responses:
 *       200:
 *         description: Details of the specified order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Order not found or does not belong to the user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:orderId', orderController.getUserOrder);

module.exports = router;
