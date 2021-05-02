import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IVehicle, Vehicle } from '../../scheama/vehicle';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/', (request, reply) => {
    reply
      .status(200)
      .send({ allowParking: eval(process.env.ALLOW_PARKING as string) });
  });
  fastify.patch('/', (request, reply) => {
    const { allowParking } = request.body as any;
    if (allowParking != undefined)
      process.env.ALLOW_PARKING = allowParking.toString();
    reply.status(202).send({ message: 'Updated' });
  });
  fastify.post('/parking', async (request, reply) => {
    const parkedVehicle: IVehicle = await Vehicle.create({
      ...(request.body as Object),
      entryTime: new Date(),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    if (parkedVehicle) reply.status(201).send(parkedVehicle);
  });
  fastify.get('/parking', async (request, reply) => {
    const parkedVehicles: Array<IVehicle> = await Vehicle.find({});
    reply.status(200).send(parkedVehicles);
  });
  fastify.delete('/parking/:id', async (request, reply) => {
    if (!(request.params as any).id) {
      reply.status(400).send({ message: 'Id is required' });
      return;
    }
    const vehicle: IVehicle | null = await Vehicle.findByIdAndDelete(
      (request.params as any).id
    ).catch((err) => reply.status(400).send({ message: err.message }));
    if (vehicle) {
      const fineToPay =
        (Math.abs(+new Date() - +vehicle) / 36e5) * vehicle.fine;
      reply.status(202).send({ fineToPay });
    }
  });
  done();
}
