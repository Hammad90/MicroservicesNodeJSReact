import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderStatus, ExpirationCompleteEvent } from '@hmdtickets/common';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async() => {
    // create instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 100
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket
    });

    await order.save();
    // create a fake event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, order, data, msg };
}

it('updates order status to cancelled', async() => {
    const { listener, ticket, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const cancelledOrder = await Order.findById(data.orderId);
    expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);    
});

it('emit OrderCancelledEvent', async() => {
    const { listener, ticket, order, data, msg } = await setup();
    await listener.onMessage(data, msg);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    
    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async() => {
    const { listener, ticket, order, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})