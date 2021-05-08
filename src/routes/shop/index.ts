import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Product } from '../../scheama/product';
import { IPurchase, Purchase } from '../../scheama/purchase';
import { IRefund, Refund } from '../../scheama/refund';
import { IUser, User } from '../../scheama/user';
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
  fastify.post('/', async (request, reply) => {
    const purchase: IPurchase = await Purchase.create({
      ...(request.body as object),
      purchaseTime: new Date(),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    if (purchase) {
      const user: IUser | null = await User.findById(
        (request.body as any).user,
        { email: 1 }
      );
      const product = await Product.findById((request.body as any).product, {
        name: 1,
      });
      user &&
        (await sendMail(
          user.email,
          'Product Purchase',
          `<h2>Product Purchased</h2><br>
          <p>Purchase Information</p><br>
          <b>Purchase ID</b>: ${purchase._id}<br>
          <b>Amount</b>: ${purchase.price}<br>
          <b>Product</b>: ${product?.name} <br>
          <b>Quantity</b>: ${purchase.quantity} <br>
          <b>Purchased At</b>: ${purchase.purchaseTime} <br>`
        ));
      reply.status(201).send(purchase);
    }
  });
  fastify.delete('/:id', async (request, reply) => {
    const refund: IPurchase | null = await Purchase.findByIdAndDelete(
      (request.params as any).id
    )
      .populate({ path: 'user', field: 'email' })
      .populate({ path: 'product', field: 'name' })
      .catch((err) => reply.status(400).send({ message: err.message }));
    if (refund) {
      await sendMail(
        (refund.user as any).email,
        'Refund Issued',
        `<h2>Refund Issued</h2><br>
        <p>Purchase Information</p><br>
        <b>Purchase ID</b>: ${refund._id}<br>
        <b>Amount</b>: ${refund.price}<br>
        <b>Product</b>: ${(refund.product as any).name} <br>
        <b>Quantity</b>: ${refund.quantity} <br>
        <b>Purchased At</b>: ${refund.purchaseTime} <br>
        <b>Refund At</b>: ${new Date()} <br>`
      );
      reply.status(202).send({ message: 'Refund success' });
    }
  });
  fastify.get('/refunds', async (request, reply) => {
    const refunds: Array<IRefund> = await Refund.find({}).populate('product');
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
