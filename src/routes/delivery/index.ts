import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/', (request, reply) => {
    reply.status(200).send({ status: 'ok' });
  });
  done();
}
