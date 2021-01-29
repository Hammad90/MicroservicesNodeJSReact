import mongoose from 'mongoose';
import { TicketDoc } from './ticket-doc';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

// Interface for ticket properties
interface TicketAttrs{
    id: string;    
    title: string;
    price: number;
}

// Interface for building ticketmodel
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: {id: string, version: number}): Promise<TicketDoc | null>;
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

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}
ticketSchema.statics.findByEvent = (event: {id: string, version: number} ) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};
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