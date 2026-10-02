import db from '../config/db.js';

export async function getCategories(req, res) {
  try {
    const categories = await db.all(`
      SELECT 
        c.id, c.name, c.description,
        COUNT(comp.id) AS component_count
      FROM categories c
      LEFT JOIN components comp ON c.id = comp.category_id AND comp.status = 'approved'
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
    `);

    return res.json({ categories });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}

export async function getTags(req, res) {
  try {
    const tags = await db.all(`
      SELECT 
        t.id, t.name,
        COUNT(ct.component_id) AS component_count
      FROM tags t
      LEFT JOIN component_tags ct ON t.id = ct.tag_id
      GROUP BY t.id, t.name
      ORDER BY component_count DESC, t.name ASC
    `);

    return res.json({ tags });
  } catch (error) {
    console.error('getTags error:', error);
    return res.status(500).json({ error: 'Failed to fetch tags.' });
  }
}

export async function getFrameworks(req, res) {
  try {
    const frameworks = [
      { id: 'HTML/CSS', name: 'HTML/CSS', icon: '🌐' },
      { id: 'Tailwind CSS', name: 'Tailwind CSS', icon: '🎨' },
      { id: 'Bootstrap', name: 'Bootstrap', icon: '🅱️' },
      { id: 'React', name: 'React', icon: '⚛️' },
    ];
    return res.json({ frameworks });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch frameworks.' });
  }
}
