import { Publisher, OrderCancelledEvent, Subjects } from '@hmdtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}