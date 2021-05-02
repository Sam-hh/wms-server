import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { INotification, Notification } from '../../scheama/notification';
import { User } from '../../scheama/user';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/', async (request, reply) => {
    const customers: number = await User.find({ accountType: 'c' }).count();
    reply.status(200).send({ customers });
  });
  fastify.post('/notification', async (request, reply) => {
    const notification: INotification = await Notification.create({
      ...(request.body as Object),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    if (notification)
      reply.status(201).send({ message: 'Created Notification' });
  });
  done();
}
