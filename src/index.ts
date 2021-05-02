import fastify, { FastifyInstance } from 'fastify';
import { connect, Mongoose } from 'mongoose';
import dotenv from 'dotenv';
import dashboard from './routes/dashboard';
import pms from './routes/pms';
import products from './routes/products';
import sales from './routes/sales';
import shop from './routes/shop';
import tickets from './routes/delivery';
import users from './routes/users';
import { SocketStream } from 'fastify-websocket';
import WSConnections from './ws';

dotenv.config();

const app: FastifyInstance = fastify({ logger: true });
app.register(require('fastify-websocket'));

app.register(dashboard, { prefix: 'dashboard' });
app.register(pms, { prefix: 'pms' });
app.register(products, { prefix: 'products' });
app.register(sales, { prefix: 'sales' });
app.register(shop, { prefix: 'shop' });
app.register(tickets, { prefix: 'delivery' });
app.register(users, { prefix: 'users' });

app.get('/ws', { websocket: true }, (connection: SocketStream) => {
  WSConnections.push(connection);
});

app.listen(2002, async (err, address) => {
  const mongooseInstance: Mongoose = await connect(
    'mongodb+srv://snipextt:nicepassword@sandbox.ugdjb.mongodb.net/wms?retryWrites=true&w=majority',
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  );
  if (!mongooseInstance) {
    app.log.error('Cannot connect to database');
    process.exit(1);
  }
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(address);
});
