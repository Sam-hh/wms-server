import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IPurchase, Purchase } from '../../scheama/purchase';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/', async (request, reply) => {
    const purchases: Array<IPurchase> = await Purchase.find({});
    reply.status(200).send(purchases);
  });
  done();
}
