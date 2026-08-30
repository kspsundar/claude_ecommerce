const slugify = require('slugify');
const { Category } = require('../models');

async function createCategory({ name, parentId }) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  while (await Category.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return Category.create({ name, slug, parentId: parentId || null });
}

async function listAll() {
  return Category.findAll({ order: [['name', 'ASC']] });
}

async function listTopLevel() {
  return Category.findAll({ where: { parentId: null }, order: [['name', 'ASC']] });
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

module.exports = { createCategory, listAll, listTopLevel, getBySlug, deleteCategory };
