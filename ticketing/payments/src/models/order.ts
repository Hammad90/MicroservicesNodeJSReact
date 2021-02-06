import mongoose from 'mongoose';
import { OrderStatus } from '@hmdtickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };
// Interface for order properties
interface OrderAttrs{
    id: string;
    userId: string;
    status: OrderStatus;
    price: number;
    version: number;
}

// Interface for building ordermodel
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

// Interface for order document
export interface OrderDoc extends mongoose.Document {
    id: string;
    userId: string;
    status: OrderStatus;
    price: number;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: OrderStatus,
        required: true,
        enum: Object.values(OrderStatus)
    },    
    price: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        userId: attrs.userId,
        status: attrs.status,
        price: attrs.price
    });
}
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };