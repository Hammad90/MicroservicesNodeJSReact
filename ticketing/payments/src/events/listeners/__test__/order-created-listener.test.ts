import { OrderCreatedEvent, OrderStatus } from '@hmdtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper"
import { Order } from '../../../models/order';
import { OrderCreatedListener } from "../order-created-listener"

const setup = async() => {
    // create instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
    
    // create a ticket
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'ascax',
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
            price: 100
        }
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
}

it('replicates order info', async() => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id).populate('ticket');
    expect(order.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

