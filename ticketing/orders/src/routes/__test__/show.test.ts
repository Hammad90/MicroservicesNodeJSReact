import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('Fetches the order', async() => {
    // Create a ticket
    const userOne = global.signin();
    const ticket = Ticket.build({
        title: 'Concert',
        price: 100
    });
    await ticket.save();

    // Make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to fetch this order
    const {body: fetchOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userOne)
        .send()
        .expect(200);
    
    expect(fetchOrder.id).toEqual(order.id);
});

it('Fetches the order with a different user ID', async() => {
    // Create a ticket
    const userOne = global.signin();
    const ticket = Ticket.build({
        title: 'Concert',
        price: 100
    });
    await ticket.save();

    // Make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to fetch this order
    const {body: fetchOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
    
})
