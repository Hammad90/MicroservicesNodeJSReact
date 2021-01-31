import { Subjects, Listener, OrderCreatedEvent } from '@hmdtickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-update-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // fetch the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if not ticket, throw an error
        if(!ticket){
            throw new Error('Ticket could not be found');
        }

        // Mark the ticket as being reserved by setting orderId attr
        ticket.set({ orderId: data.id });

        // Save the ticket
        await ticket.save();

        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        // Send ack
        msg.ack();
    }
}