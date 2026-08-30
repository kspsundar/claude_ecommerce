const productService = require('../../services/productService');
const sellerService = require('../../services/sellerService');

exports.list = async (req, res) => {
  const result = await productService.searchProducts(req.query);
  res.json(result);
};

exports.show = async (req, res) => {
  const product = await productService.getBySlugPublic(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product });
};

exports.create = async (req, res) => {
  try {
    const profile = await sellerService.requireApprovedSellerProfile(req.user.id);
    const { title, description, price, stock, categoryId } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ error: 'title and price are required.' });
    }
    const product = await productService.createProduct(profile.id, { title, description, price, stock, categoryId });
    res.status(201).json({ product });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const profile = await sellerService.requireApprovedSellerProfile(req.user.id);
    const product = await productService.getById(req.params.id);
    if (!product || product.sellerId !== profile.id) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const updated = await productService.updateProduct(product, req.body);
    res.json({ product: updated });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const profile = await sellerService.requireApprovedSellerProfile(req.user.id);
    const product = await productService.getById(req.params.id);
    if (!product || product.sellerId !== profile.id) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    await productService.deleteProduct(product);
    res.status(204).send();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
