import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IUser, User } from '../../scheama/user';
import bcrypt from 'bcryptjs';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/:email', async (request, reply) => {
    if (!(request.params as any).email) {
      const users: Array<IUser> = await User.find({});
      reply.status(200).send(users);
      return;
    }
    const user: IUser | null = await User.findOne({
      email: (request.params as any).email,
    }).catch((err) => reply.status(404).send({ err: err.message }));
    if (user) reply.status(200).send(user);
  });
  fastify.post('/', async (request, reply) => {
    const newUser = request.body;
    if (!(newUser as IUser).password) {
      reply.status(400).send({ message: 'Password is required' });
      return;
    }
    bcrypt.genSalt(8, function (err, salt) {
      bcrypt.hash((newUser as IUser).password, salt, async (err, hash) => {
        if (err) {
          reply.status(500).send(err);
          return;
        }
        (newUser as IUser).password = hash;
        const user: IUser | void = await User.create({
          ...(request.body as Object),
          registeredAt: new Date(),
        }).catch((err) => reply.status(400).send({ message: err.message }));
        user && reply.status(201).send(user);
      });
    });
  });
  fastify.patch('/reset/:userID', async (request, reply) => {
    if (!(request.params as any).userID) {
      reply.status(400).send({ message: 'User id is required' });
      return;
    }
    bcrypt.genSalt(8, function (err, salt) {
      bcrypt.hash(
        Math.random().toString(36).substring(2, 12),
        salt,
        async (err, hash) => {
          if (err) {
            reply.status(500).send(err);
            return;
          }
          const user: IUser | null = await User.findByIdAndUpdate(
            (request.params as any).userID,
            {
              password: hash,
            }
          ).catch((err) => reply.status(500).send({ message: err.message }));
          if (user) reply.status(200).send({ message: 'User updated' });
        }
      );
    });
  });
  done();
}
