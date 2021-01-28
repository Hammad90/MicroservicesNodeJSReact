import { Publisher, TicketUpdatedEvent, Subjects } from '@hmdtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
};