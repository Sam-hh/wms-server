import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IPurchase, Purchase } from '../../scheama/purchase';
import { IRefund, Refund } from '../../scheama/refund';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.post('/', async (request, reply) => {
    const purchase: IPurchase = await Purchase.create({
      ...(request.body as object),
      purchaseTime: new Date(),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    if (purchase) reply.status(201).send(purchase);
  });
  fastify.delete('/:id', async (request, reply) => {
    const refund: IPurchase | null = await Purchase.findByIdAndDelete(
      (request.params as any).id
    ).catch((err) => reply.status(400).send({ message: err.message }));
    if (refund) reply.status(202).send({ message: 'Refund success' });
  });
  fastify.get('/refunds', async (request, reply) => {
    const refunds: Array<IRefund> = await Refund.find({});
    reply.send(refunds);
  });
  fastify.delete('/refund/:id', async (request, reply) => {
    if (!(request.params as any).id) {
      reply.status(400).send({ message: 'Refund id is required' });
      return;
    }
    const refund: IRefund | null = await Refund.findByIdAndDelete(
      (request.params as any).id
    ).catch((err) => reply.status(400).send({ message: err.message }));
    if (refund) reply.status(202).send({ message: 'Refund deleted' });
  });
  done();
}
