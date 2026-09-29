const slugify = require('slugify');
const { Category, Product } = require('../models');

async function createCategory({ name, id, categoryId }) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  while (await Category.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return Category.create({ name, slug, id: id || null, categoryId:categoryId || null });
}

async function listAll() {
  //console.log("Find all",Category.findAll({ order: [['name', 'ASC']] }));
  //debugger;
  //return Category.findAll({ order: [['name', 'ASC']] });

//   return await Category.findAll({
//   include: [
//     {
//       model: Products,
//       required: true // Enforces an INNER JOIN
//     }
//   ]
// });

// async function listNotifications() {
//   return NotificationLog.findAll({
//     include: [{ model: User, attributes: ['id', 'name', 'email'] }],
//     order: [['createdAt', 'DESC']],
//     limit: 100
//   });
// }
return await Category.findAll({
  attributes: ['name', 'slug','id'],
  include: [
    {
      model: Product,
      attributes:['id', 'categoryId']     
    }
  ]
});
}

async function listAllSubCategory() {
return await Product.findAll({
  attributes: ['title','slug','categoryId'],
  include: [
    {
      model: Category,
      attributes:['id']     
    }
  ]
});
}

async function listTopLevel() {
  return Category.findAll({order: [['name', 'ASC']] });
}

async function getBySlug(slug) {
  return Category.findOne({ where: { slug } });
}

async function deleteCategory(id) {
  const category = await Category.findByPk(id);
  if (!category) return null;
  await category.destroy();
  return category;
}

module.exports = { createCategory, listAll, listAllSubCategory, listTopLevel, getBySlug, deleteCategory };
