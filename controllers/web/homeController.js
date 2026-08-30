const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');

exports.index = async (req, res) => {
  const [{ products }, categories] = await Promise.all([
    productService.searchProducts({ sort: 'newest', page: 1 }),
    categoryService.listTopLevel()
  ]);
  res.render('home', { title: 'Home', products, categories });
};
