import { TicketCreatedEvent } from '@hmdtickets/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import  mongoose  from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async() => {
    // create instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create a fake event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Concert',
        price: 100,
        userId: mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
}

it('creates and saves a ticket', async () => {
    // call onMessage function with data object + message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    
    // write assertion to make sure ticket was created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket.title).toEqual(data.title);
    expect(ticket.price).toEqual(data.price);
});

it('acks the message', async () => {
    // call onMessage function with data object + message object
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    // write assertion to make sure ack was called
    expect(msg.ack).toHaveBeenCalled();
});