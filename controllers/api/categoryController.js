const categoryService = require('../../services/categoryService');

exports.list = async (req, res) => {
  const categories = await categoryService.listAll();
  res.json({ categories });
};
