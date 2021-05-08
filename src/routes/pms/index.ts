import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IUser, User } from '../../scheama/user';
import { IVehicle, Vehicle } from '../../scheama/vehicle';
import { sendMail } from '../../utils/mailer';

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
    if (!eval(process.env.ALLOW_PARKING as string)) {
      reply.status(403).send({ message: 'Parking Disabled' });
    }
    const parkedVehicle: IVehicle = await Vehicle.create({
      ...(request.body as Object),
      entryTime: new Date(),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    if (parkedVehicle) {
      const user: IUser | null = await User.findById(
        (request.body as any).user,
        { email: 1 }
      );
      user &&
        (await sendMail(
          user.email,
          'Parking Added',
          `<h2>Parking Added</h2><br>
          <p>Description</p><br>
          <b>Request ID</b>: ${parkedVehicle._id}<br>
          <b>Vehicle Number</b>: ${parkedVehicle.number}<br>
          <b>Name</b>: ${parkedVehicle?.modal} <br>
          <b>Expected Duration</b>: ${parkedVehicle.duration} <br>
          <b>Fine/hour</b>: ${parkedVehicle.fine} <br>`
        ));
      reply.status(201).send(parkedVehicle);
    }
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
    )
      .populate('user')
      .catch((err) => reply.status(400).send({ message: err.message }));
    if (vehicle) {
      const fineToPay =
        (Math.abs(+new Date() - +vehicle) / 36e5) * vehicle.fine;
      await sendMail(
        (vehicle.user as any).email,
        'Parking released',
        `<h2>Parking Released</h2><br>
      <p>Description</p><br>
      <b>Request ID</b>: ${vehicle._id}<br>
      <b>Vehicle Number</b>: ${vehicle.number}<br>
      <b>Name</b>: ${vehicle?.modal} <br>
      <b>Fine(if any) </b>: ${fineToPay} <br>`
      );
      reply.status(202).send({ fineToPay });
    }
  });
  done();
}
