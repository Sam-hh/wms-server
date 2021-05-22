import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { IUser, User } from '../../scheama/user';
import bcrypt from 'bcryptjs';
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
    if (!request.body || !(newUser as IUser).password) {
      reply.status(400).send({ message: 'Password is required' });
      return;
    }
    const { password } = request.body as any;
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
        console.log(password);
        user &&
          (await sendMail(
            user.email,
            'Account Created',
            `<h2>Account Created</h2><br><p>Account Information</p><br><b>Email</b>: ${user.email}<br><b>Password</b>: ${password}`
          ));
        user && reply.status(201).send(user);
      });
    });
  });
  fastify.patch('/reset/:userID', async (request, reply) => {
    if (!(request.params as any).userID) {
      reply.status(400).send({ message: 'User id is required' });
      return;
    }
    const password = Math.random().toString(36);
    bcrypt.genSalt(8, function (err, salt) {
      bcrypt.hash(password, salt, async (err, hash) => {
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

        if (user) {
          await sendMail(
            user.email,
            'Account Updated',
            `<h2>Account Upxated</h2><br><p>Account Information</p><br><b>Email</b>: ${user.email}<br><b>Password</b>: ${password}`
          );
          reply.status(200).send({ message: 'User updated' });
        }
      });
    });
  });
  fastify.patch('/update/:userID', async (request, reply) => {
    if (!(request.params as any).userID) {
      reply.status(400).send({ message: 'User id is required' });
      return;
    }
    const user: IUser | null = await User.findByIdAndUpdate(
      (request.params as any).userID,
      {
        ...(request.body as any),
      }
    ).catch((err) => reply.status(500).send({ message: err.message }));
    if (user) reply.status(200).send({ ack: true });
  });
  fastify.delete('/:userID', async (request, reply) => {
    if (!(request.params as any).userID) {
      reply.status(400).send({ message: 'User id is required' });
      return;
    }
    const user: IUser | null = await User.findByIdAndDelete(
      (request.params as any).userID
    ).catch((err) => reply.status(500).send({ message: err.message }));
    if (user) reply.status(200).send({ message: 'User deleted' });
    else reply.status(400).send();
  });
  done();
}
