import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Category, ICategory } from '../../scheama/category';
import { IProduct, Product } from '../../scheama/product';
import { ISupplier, Supplier } from '../../scheama/supplier';

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: Function
) {
  fastify.get('/categories', async (request, reply) => {
    const categories: Array<ICategory> = await Category.find({});
    reply.status(200).send(categories);
  });
  fastify.post('/category', async (request, reply) => {
    const category: ICategory = await Category.create({
      ...(request.body as Object),
      dateAdded: new Date(),
      products: 0,
    }).catch((err) => reply.status(400).send({ message: err.message }));
    category && reply.status(201).send(category);
  });
  fastify.delete('/category/:id', async (request, reply) => {
    if (!(request.params as any).id) {
      reply.status(400).send({ message: 'Id missing' });
    }
    const category: ICategory | null = await Category.findByIdAndDelete(
      (request.params as any).id
    );
    if (!category)
      reply.status(403).send({ message: 'Cannot find the Category' });
    else reply.status(200).send(category);
  });
  fastify.get('/suppliers', async (request, reply) => {
    const categories: Array<ISupplier> = await Supplier.find({});
    reply.status(200).send(categories);
  });
  fastify.post('/supplier', async (request, reply) => {
    const supplier: ISupplier = await Supplier.create({
      ...(request.body as Object),
      dateAdded: new Date(),
    }).catch((err) => reply.status(400).send({ message: err.message }));
    supplier && reply.status(201).send(supplier);
  });
  fastify.delete('/supplier/:id', async (request, reply) => {
    const supplier: ISupplier | null = await Supplier.findByIdAndDelete(
      (request.params as any).id
    );
    if (!supplier)
      reply.status(403).send({ message: 'Cannot find the Supplier' });
    else reply.status(200).send(supplier);
  });
  fastify.delete('/remove/:id', async (request, reply) => {
    const product: IProduct | null = await Product.findByIdAndDelete(
      (request.params as any).id
    );
    if (!product)
      reply.status(403).send({ message: 'Cannot find the Product' });
    else reply.status(200).send(product);
  });
  fastify.post('/add', async (request, reply) => {
    const product: IProduct | void = await Product.create({
      ...(request.body as Object),
      dateAdded: new Date(),
    }).catch((err) => {
      reply
        .status(err.code == '11000' ? 400 : 500)
        .send({ message: err.message });
    });
    product && reply.status(201).send(product);
  });
  fastify.get('/:category', async (request, reply) => {
    const products: Array<IProduct> = (request.params as any).category
      ? await Product.find({ category: (request.params as any).category })
      : await Product.find({});
    reply.status(200).send(products);
  });
  done();
}
