import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { INotification, Notification } from '../../scheama/notification';
import { IPurchase, Purchase } from '../../scheama/purchase';
import { Product } from '../../scheama/product';
import { User } from '../../scheama/user';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      const jwt: any = await (request as any).jwtVerify();
      if (jwt.type !== 'e') throw new Error('Unauthorized');
    } catch (err) {
      reply.status(400).send(err);
    }
  });
  fastify.get('/', async (request, reply) => {
    const customers: number = await User.find({ accountType: 'c' }).count();
    const dateToday = new Date();
    dateToday.setHours(0, 0, 0, 0);
    // TODO: Replace this with aggregation framework
    const sales: Array<IPurchase> = await Purchase.find({
      purchaseTime: {
        $gte: dateToday,
      },
    });
    let sum = 0;
    sales.forEach((i) => (sum += i.price));
    const products: number = await Product.find({
      dateAdded: {
        $gte: dateToday,
      },
    }).count();
    const notifications: number = await Notification.find({
      dateAdded: {
        $gte: dateToday,
      },
    }).count();
    reply.status(200).send({ customers, sales: sum, products, notifications });
  });
  fastify.post('/notification', async (request, reply) => {
    const notification: INotification = await Notification.create({
      ...(request.body as Object),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    if (notification)
      reply.status(201).send({ message: 'Created Notification' });
  });
  fastify.get('/notifications', async (request, reply) => {
    const notifications: Array<INotification> = await Notification.find({})
      .sort({ _id: -1 })
      .limit(10);
    reply.status(200).send(notifications);
  });
  done();
}
