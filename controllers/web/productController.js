const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');

exports.index = async (req, res) => {
  const { q, category, minPrice, maxPrice, sort, page } = req.query;
  let categoryId = null;
  if (category) {
    const cat = await categoryService.getBySlug(category);
    categoryId = cat ? cat.id : null;
  }

  const result = await productService.searchProducts({ q, categoryId, minPrice, maxPrice, sort, page });
  const categories = await categoryService.listTopLevel();

  res.render('products/index', {
    title: 'Shop products',
    ...result,
    categories,
    query: req.query
  });
};

exports.show = async (req, res) => {
  const product = await productService.getBySlugPublic(req.params.slug);
  if (!product) {
    return res.status(404).render('errors/404', { title: 'Product not found' });
  }
  res.render('products/show', { title: product.title, product });
};

exports.byCategory = async (req, res) => {
  const category = await categoryService.getBySlug(req.params.slug);
  if (!category) {
    return res.status(404).render('errors/404', { title: 'Category not found' });
  }
  const result = await productService.searchProducts({ categoryId: category.id, page: req.query.page });
  const categories = await categoryService.listTopLevel();
  res.render('products/index', {
    title: category.name,
    ...result,
    categories,
    query: req.query,
    activeCategory: category
  });
};
