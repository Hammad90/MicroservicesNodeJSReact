import { Publisher, Subjects, TicketCreatedEvent } from '@hmdtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    
}