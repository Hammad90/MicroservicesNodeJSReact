import { Publisher, Subjects, ExpirationCompleteEvent } from '@hmdtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    
}