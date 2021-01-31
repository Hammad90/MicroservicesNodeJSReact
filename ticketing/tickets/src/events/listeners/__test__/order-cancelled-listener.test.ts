import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from "@hmdtickets/common";

const setup = async() => {
    // create instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Concert',
        price: 100,
        userId: mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({orderId: orderId});
    await ticket.save();
    
    // create a ticket
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, orderId, data, msg };
}

it('Updates the ticket, publishes an event, acks the message', async() => {
    const { listener, ticket, orderId, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket.orderId).not.toBeDefined();

    expect(msg.ack).toHaveBeenCalled();

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})