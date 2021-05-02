import { SocketStream } from 'fastify-websocket';
import { Document, model, Model, Schema } from 'mongoose';
import WSConnections from '../../ws';

interface INotification extends Document {
  title: string;
  description: string;
}

const NotificationSchema = new Schema({
  title: { type: String, required: true },
  description: String,
});

NotificationSchema.post('save', (doc: INotification) => {
  WSConnections.forEach((connection: SocketStream) => {
    connection.socket.send(JSON.stringify(doc.toJSON()));
  });
});

const Notification: Model<INotification> = model(
  'Notifications',
  NotificationSchema
);
export { INotification, Notification };
