import { Document, model, Model, Schema } from 'mongoose';
import { Product } from '../product';

interface ICategory extends Document {
  name: string;
  dateAdded: Date;
  products: number;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  dateAdded: Date,
  products: Number,
});

CategorySchema.post('findOneAndDelete', async (doc: ICategory, next) => {
  await Product.deleteMany({ category: doc.id }).catch(next);
  next(null);
});

const Category: Model<ICategory> = model('Category', CategorySchema);

export { Category, ICategory };
