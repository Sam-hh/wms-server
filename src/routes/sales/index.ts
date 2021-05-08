import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IPurchase, Purchase } from '../../scheama/purchase';

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
    const purchases: Array<IPurchase> = await Purchase.find({})
      .populate('product')
      .populate('user');
    reply.status(200).send(purchases);
  });
  fastify;
  done();
}
