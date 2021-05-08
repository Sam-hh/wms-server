import { Document, Model, model, Schema } from 'mongoose';
import { Refund } from '../refund';

interface IPurchase extends Document {
  category: string;
  product: string;
  purchaseTime: Date;
  price: number;
  tax: number;
  description: string;
  user: string;
  quantity: number;
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
});

PurchaseSchema.post('findOneAndDelete', async (doc: IPurchase, next) => {
  await Refund.create({
    purchaseTime: doc.purchaseTime,
    category: doc.category,
    product: doc.product,
    user: doc.user,
    price: doc.price,
    tax: doc.tax,
    quantity: doc.quantity,
    description: doc.description,
    refundTime: new Date(),
  }).catch(next);
  next(null);
});

const Purchase: Model<IPurchase> = model('Purchase', PurchaseSchema);

export { IPurchase, Purchase };
