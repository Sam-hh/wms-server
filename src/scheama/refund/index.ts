import { Document, Model, model, Schema } from 'mongoose';

interface IRefund extends Document {
  category: string;
  product: string;
  purchaseTime: Date;
  price: number;
  tax: number;
  description: string;
  user: string;
  quantity: number;
  refundTime: Date;
}

const PurchaseSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: Number,
  tax: Number,
  quantity: Number,
  description: String,
  purchaseTime: {
    type: Date,
    required: true,
  },
  refundTime: {
    type: Date,
    required: true,
  },
});

const Refund: Model<IRefund> = model('Refund', PurchaseSchema);

export { IRefund, Refund };
