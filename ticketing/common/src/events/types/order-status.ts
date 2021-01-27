export enum OrderStatus {
    // When the order has been created but ticket has not been reserved
    Created = 'created',

    // The ticket is already reserved or the user is cancelling the order
    // or the order expired before payment
    Cancelled = 'cancelled',

    // The order has successfully reserved the ticket 
    AwaitingPayment = 'awaiting:payment',

    // The order has reserved the ticket and the user completed the payment
    Complete = 'complete'
}