const categoryService = require('../../services/categoryService');

exports.list = async (req, res) => {
  const categories = await categoryService.listAll();
  const subcategories = await categoryService.listAllSubCategory();
  res.json({categories:categories,subcategories:subcategories});
};
