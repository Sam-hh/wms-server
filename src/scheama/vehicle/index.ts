import { Document, Model, model, Schema } from 'mongoose';

type VehicleType = 'l' | 'h';

interface IVehicle extends Document {
  modal: string;
  number: string;
  description: string;
  type: VehicleType;
  entryTime: Date;
  user: string;
  duration: number;
  fine: number;
}

const VehicleSchema = new Schema({
  modal: { type: String, required: true },
  number: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['l', 'h'],
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  duration: {
    type: Number,
    required: true,
  },
  fine: {
    type: Number,
    required: true,
  },
});

const Vehicle: Model<IVehicle> = model('Vehicle', VehicleSchema);

export { IVehicle, Vehicle };
