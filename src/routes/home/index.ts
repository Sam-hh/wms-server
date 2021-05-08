import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IPurchase, Purchase } from '../../scheama/purchase';
import { IVehicle, Vehicle } from '../../scheama/vehicle';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/', async (request, reply) => {
    const userID: string = request.headers['x-user-id'] as string;
    const userPurchases: Array<IPurchase> = await Purchase.find({
      user: userID,
    }).populate('product');
    const userParkings: Array<IVehicle> = await Vehicle.find({ user: userID });
    reply.status(200).send({ userParkings, userPurchases });
  });
  done();
}
