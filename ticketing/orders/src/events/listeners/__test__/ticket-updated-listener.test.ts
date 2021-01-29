import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from 'mongoose'
import { TicketUpdatedEvent } from "@hmdtickets/common";
import { Ticket } from "../../../models/ticket";
import { Message } from 'node-nats-streaming';

const setup = async() => {
    // create instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'Concert',
        price: 100,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();
    
    // create a ticket
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'New Concert',
        price: 200,
        userId: mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg };
}

it('finds, updates and saves a ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket.title).toEqual(data.title);
    expect(updatedTicket.price).toEqual(data.price);
    expect(updatedTicket.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, ticket, data,  msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event is has a skipped version number', async () => {
    const { listener, ticket, data,  msg } = await setup();
    data.version = 10;
    
    try{
        await listener.onMessage(data, msg);
    }catch(err){
        
    }
    expect(msg.ack).not.toHaveBeenCalled();
});