import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('Returns an error if ticket doesnot exist', async () => {
    const ticketId = mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404);
});

it('Returns an error if ticket was already reserved', async () => {
    const ticket = Ticket.build({
        title: 'New Concert',
        price: 200
    });
    await ticket.save();
    const order = Order.build({
        ticket: ticket,
        userId: 'asdasd',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400);
});

it('Reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'New Concert',
        price: 200
    });
    await ticket.save();
    
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
});

it.todo('publish order created event');