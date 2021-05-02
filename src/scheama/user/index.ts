import { Document, Model, model, Schema } from 'mongoose';

type UserType = 'e' | 'c';

interface IUser extends Document {
  registeredAt: Date;
  name: string;
  email: string;
  phone: string;
  accountType: UserType;
  password: string;
  changePasswordOnLogin: boolean;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ['e', 'c'],
    required: true,
  },
  changePasswordOnLogin: Boolean,
  registeredAt: Date,
});

const User: Model<IUser> = model('User', UserSchema);

export { IUser, User };
