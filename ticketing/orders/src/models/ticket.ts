import mongoose from 'mongoose';
import { TicketDoc } from './ticket-doc';
import { Order, OrderStatus } from './order';

// Interface for ticket properties
interface TicketAttrs{
    title: string;
    price: number;
}

// Interface for building ticketmodel
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

// Interface for ticket document

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
}
ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        //@ts-ignore
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.Complete,
                OrderStatus.AwaitingPayment
            ]
        }
    });

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };