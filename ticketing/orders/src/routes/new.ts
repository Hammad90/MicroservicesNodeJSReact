import mongoose, { mongo } from 'mongoose';
import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@hmdtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60; 
router.post('/api/orders', requireAuth, 
[
    body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket Id must be provided')
], 
validateRequest,   
async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    
    // Find the ticket in the database
    const ticket = await Ticket.findById(ticketId);
    if(!ticket) {
        throw new NotFoundError();
    }

    // Make sure the ticket is not reserved
    // Check all orders to check if this ticket id is not cancelled
    // if an order was found means the ticket is reserved
    const isReserved = await ticket.isReserved();
    if(isReserved){
        throw new BadRequestError('Ticket already reserved');
    }

    // Calculate expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
    // Create the order and save it to db
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    });
    await order.save();

    // Publish order created event
    res.status(201).send(order);
});

export { router as createOrderRouter };