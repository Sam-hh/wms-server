import fastify, { FastifyInstance } from 'fastify';
import { connect, Mongoose } from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dashboard from './routes/dashboard';
import pms from './routes/pms';
import products from './routes/products';
import sales from './routes/sales';
import shop from './routes/shop';
import tickets from './routes/home';
import users from './routes/users';
import { SocketStream } from 'fastify-websocket';
import WSConnections from './ws';
import { User } from './scheama/user';

dotenv.config();

const app: FastifyInstance = fastify({ logger: true });
app.register(require('fastify-websocket'));
app.register(require('fastify-jwt'), {
  secret: 'verySecretString',
});

app.register(dashboard, { prefix: 'dashboard' });
app.register(pms, { prefix: 'pms' });
app.register(products, { prefix: 'products' });
app.register(sales, { prefix: 'sales' });
app.register(shop, { prefix: 'shop' });
app.register(tickets, { prefix: 'home' });
app.register(users, { prefix: 'users' });

app.get('/ws', { websocket: true }, (connection: SocketStream) => {
  connection.on('close', console.log);
  connection.on('data', console.log);
  WSConnections.push(connection);
});

app.post('/login', async (request, reply) => {
  const user: any = request.body;
  if (!user || !user.email || !user.password) {
    reply.status(400).send({ message: 'email and password required' });
  }
  const userInDB = await User.findOne({ email: user.email }).catch((err) =>
    reply.status(403).send({ message: err.message })
  );
  if (!userInDB) return;
  const matched = await bcrypt
    .compare(user.password, userInDB?.password!)
    .catch((err) => reply.status(500).send({ message: err.message }));
  console.log(matched);
  if (!matched) {
    reply.status(500).send({ message: 'Incorrect passord' });
    return;
  }
  const token = (app as any).jwt.sign({ type: userInDB?.accountType });
  reply.send({ token, userType: userInDB?.accountType, _id: userInDB?._id });
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
\\
