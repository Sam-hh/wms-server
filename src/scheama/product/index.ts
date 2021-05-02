import { Document, model, Model, Schema } from 'mongoose';
import { Category } from '../category';
import { Supplier } from '../supplier';

interface IProduct extends Document {
  name: string;
  price: number;
  dateAdded: Date;
  inStock: boolean;
  category: string;
  supplier: string;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  dateAdded: Date,
  inStock: Boolean,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
});

ProductSchema.index({ name: 1, category: 1, supplier: 1 }, { unique: true });
ProductSchema.post('save', async (doc: IProduct, next) => {
  await Category.findByIdAndUpdate(doc.category, {
    $inc: {
      products: 1,
    },
  }).catch(next);
  await Supplier.findByIdAndUpdate(doc.supplier, {
    $inc: {
      supplies: 1,
    },
  }).catch(next);
  next();
});
ProductSchema.post('findOneAndDelete', async (doc: IProduct, next) => {
  await Category.findByIdAndUpdate(doc.category, {
    $inc: {
      products: -1,
    },
  }).catch(next);
  await Supplier.findByIdAndUpdate(doc.supplier, {
    $inc: {
      supplies: -1,
    },
  }).catch(next);
  next(null);
});

const Product: Model<IProduct> = model('Product', ProductSchema);

export { Product, IProduct };
