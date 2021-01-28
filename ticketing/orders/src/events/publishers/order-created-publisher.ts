import { Publisher, OrderCreatedEvent, Subjects } from '@hmdtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}