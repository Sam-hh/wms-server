import { Document, model, Model, Schema } from 'mongoose';
import { Product } from '../product';

interface ISupplier extends Document {
  name: string;
  email: string;
  phone: string;
  supplies: number;
  dateAdded: Date;
}

const SupplierSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  supplies: {
    type: Number,
    default: 0,
  },
  dateAdded: Date,
});

SupplierSchema.post('findOneAndDelete', async (doc: ISupplier, next) => {
  await Product.deleteMany({ supplier: doc.id }).catch(next);
  next(null);
});

const Supplier: Model<ISupplier> = model('Supplier', SupplierSchema);

export { Supplier, ISupplier };
