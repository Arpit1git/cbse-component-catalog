import db from '../config/db.js';

function buildStandaloneHtml(htmlCode, cssCode, jsCode, framework) {
  let frameworkCdn = '';
  if (framework === 'Tailwind CSS') {
    frameworkCdn = '<script src="https://cdn.tailwindcss.com"></script>';
  } else if (framework === 'Bootstrap') {
    frameworkCdn = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Export</title>
  ${frameworkCdn}
  <style>
    body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; }
    ${cssCode || ''}
  </style>
</head>
<body>
  ${htmlCode || ''}
  <script>
    ${jsCode || ''}
  </script>
</body>
</html>`;
}

// 1. GET /api/components - Search & Faceted Filter
export async function getComponents(req, res) {
  try {
    const {
      search = '',
      category,
      framework,
      tag,
      minRating,
      sort = 'newest',
      status = 'approved',
    } = req.query;

    let query = `
      SELECT 
        c.id, c.name, c.summary, c.framework, c.license, c.repo_url, c.status,
        c.view_count, c.download_count, c.created_at,
        cat.name AS category_name, cat.id AS category_id,
        u.name AS owner_name, u.email AS owner_email,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        (SELECT version_number FROM versions WHERE component_id = c.id ORDER BY id DESC LIMIT 1) AS latest_version,
        (SELECT status FROM versions WHERE component_id = c.id ORDER BY id DESC LIMIT 1) AS latest_version_status
      FROM components c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.owner_id = u.id
      LEFT JOIN reviews r ON c.id = r.component_id
    `;

    const params = [];
    const whereConditions = [];

    if (status !== 'all') {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    if (category) {
      if (!isNaN(category)) {
        whereConditions.push('(cat.name = ? OR cat.id = ?)');
        params.push(category, Number(category));
      } else {
        whereConditions.push('cat.name = ?');
        params.push(category);
      }
    }

    if (framework) {
      whereConditions.push('c.framework = ?');
      params.push(framework);
    }

    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const likeOp = db.isPostgres ? 'ILIKE' : 'LIKE';
      whereConditions.push(`(c.name ${likeOp} ? OR c.summary ${likeOp} ? OR u.name ${likeOp} ?)`);
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (tag) {
      whereConditions.push(`
        c.id IN (
          SELECT ct.component_id 
          FROM component_tags ct 
          JOIN tags t ON ct.tag_id = t.id 
          WHERE t.name = ?
        )
      `);
      params.push(tag);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` GROUP BY c.id, cat.name, cat.id, u.name, u.email`;

    if (minRating && Number(minRating) > 0) {
      query += ` HAVING AVG(r.rating) >= ?`;
      params.push(Number(minRating));
    }

    switch (sort) {
      case 'rating':
        query += ` ORDER BY avg_rating DESC, c.id DESC`;
        break;
      case 'downloads':
        query += ` ORDER BY c.download_count DESC, c.id DESC`;
        break;
      case 'views':
        query += ` ORDER BY c.view_count DESC, c.id DESC`;
        break;
      case 'name':
        query += ` ORDER BY c.name ASC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY c.created_at DESC`;
        break;
    }

    const components = await db.all(query, params);

    // Fetch tags and latest code snippets in parallel
    const enriched = await Promise.all(
      components.map(async (comp) => {
        const tags = await db.all(`
          SELECT t.id, t.name 
          FROM tags t
          JOIN component_tags ct ON t.id = ct.tag_id
          WHERE ct.component_id = ?
        `, [comp.id]);

        const latestVer = await db.get(`
          SELECT id, version_number, html_code, css_code, js_code, status
          FROM versions 
          WHERE component_id = ? 
          ORDER BY id DESC LIMIT 1
        `, [comp.id]);

        return {
          ...comp,
          avg_rating: Number(Number(comp.avg_rating).toFixed(1)),
          tags,
          preview_code: latestVer ? {
            html_code: latestVer.html_code,
            css_code: latestVer.css_code,
            js_code: latestVer.js_code,
            version_number: latestVer.version_number,
          } : null,
        };
      })
    );

    return res.json({
      count: enriched.length,
      components: enriched,
    });
  } catch (error) {
    console.error('getComponents error:', error);
    return res.status(500).json({ error: 'Failed to retrieve components.' });
  }
}

// 2. GET /api/components/:id - Full Component Details
export async function getComponentById(req, res) {
  try {
    const { id } = req.params;

    // Increment view count
    await db.run('UPDATE components SET view_count = view_count + 1 WHERE id = ?', [id]);

    const comp = await db.get(`
      SELECT 
        c.id, c.name, c.summary, c.framework, c.license, c.repo_url, c.status,
        c.view_count, c.download_count, c.created_at, c.owner_id,
        cat.name AS category_name, cat.id AS category_id,
        u.name AS owner_name, u.email AS owner_email
      FROM components c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (!comp) {
      return res.status(404).json({ error: 'Component not found.' });
    }

    const versions = await db.all(`
      SELECT id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status, created_at
      FROM versions
      WHERE component_id = ?
      ORDER BY id DESC
    `, [id]);

    const tags = await db.all(`
      SELECT t.id, t.name
      FROM tags t
      JOIN component_tags ct ON t.id = ct.tag_id
      WHERE ct.component_id = ?
    `, [id]);

    const versionsWithDeps = await Promise.all(
      versions.map(async (v) => {
        const deps = await db.all('SELECT id, version_id, library_name, library_version FROM dependencies WHERE version_id = ?', [v.id]);
        return { ...v, dependencies: deps };
      })
    );

    const reviews = await db.all(`
      SELECT r.id, r.rating, r.comment, r.created_at, r.user_id, u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.component_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    return res.json({
      ...comp,
      avg_rating: avgRating,
      review_count: reviews.length,
      tags,
      versions: versionsWithDeps,
      reviews,
    });
  } catch (error) {
    console.error('getComponentById error:', error);
    return res.status(500).json({ error: 'Failed to retrieve component details.' });
  }
}

// 3. POST /api/components - Register New Component
export async function createComponent(req, res) {
  try {
    const {
      name,
      summary,
      category_id,
      framework,
      license = 'MIT',
      repo_url = '',
      tags = [],
      version_number = '1.0.0',
      release_notes = 'Initial release',
      html_code,
      css_code = '',
      js_code = '',
      usage_notes = '',
      dependencies = [],
    } = req.body;

    if (!name || !summary || !category_id || !framework || !html_code) {
      return res.status(400).json({
        error: 'Required fields missing: name, summary, category_id, framework, and html_code are mandatory.'
      });
    }

    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const result = await db.run(`
      INSERT INTO components (name, summary, category_id, owner_id, framework, license, repo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim().toLowerCase().replace(/\s+/g, '-'),
      summary.trim(),
      category_id,
      req.user.id,
      framework,
      license,
      repo_url.trim() || null,
      initialStatus
    ]);

    const componentId = result.lastInsertRowid;

    const verResult = await db.run(`
      INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      componentId,
      version_number.trim(),
      release_notes.trim(),
      html_code,
      css_code,
      js_code,
      usage_notes.trim(),
    ]);

    const versionId = verResult.lastInsertRowid;

    if (Array.isArray(dependencies) && dependencies.length > 0) {
      for (const d of dependencies) {
        if (d.library_name && d.library_version) {
          await db.run('INSERT INTO dependencies (version_id, library_name, library_version) VALUES (?, ?, ?)', [
            versionId, d.library_name.trim(), d.library_version.trim()
          ]);
        }
      }
    }

    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const cleanTag = tagName.trim().toLowerCase();
        if (cleanTag) {
          if (db.isPostgres) {
            await db.run('INSERT INTO tags (name) VALUES (?) ON CONFLICT (name) DO NOTHING', [cleanTag]);
          } else {
            await db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [cleanTag]);
          }
          const tagRow = await db.get('SELECT id FROM tags WHERE name = ?', [cleanTag]);
          if (tagRow) {
            if (db.isPostgres) {
              await db.run('INSERT INTO component_tags (component_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [componentId, tagRow.id]);
            } else {
              await db.run('INSERT OR IGNORE INTO component_tags (component_id, tag_id) VALUES (?, ?)', [componentId, tagRow.id]);
            }
          }
        }
      }
    }

    return res.status(201).json({
      message: initialStatus === 'approved' 
        ? 'Component created and published successfully.' 
        : 'Component submitted for admin review.',
      component_id: componentId,
      status: initialStatus,
    });
  } catch (error) {
    console.error('createComponent error:', error);
    return res.status(500).json({ error: 'Failed to create component.' });
  }
}

// 4. POST /api/components/:id/versions - Add New Version
export async function addVersion(req, res) {
  try {
    const { id } = req.params;
    const {
      version_number,
      release_notes,
      html_code,
      css_code = '',
      js_code = '',
      usage_notes = '',
      dependencies = [],
    } = req.body;

    if (!version_number || !html_code) {
      return res.status(400).json({ error: 'version_number and html_code are required.' });
    }

    const comp = await db.get('SELECT owner_id FROM components WHERE id = ?', [id]);
    if (!comp) {
      return res.status(404).json({ error: 'Component not found.' });
    }

    if (req.user.role !== 'admin' && comp.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const existingVer = await db.get('SELECT id FROM versions WHERE component_id = ? AND version_number = ?', [id, version_number.trim()]);
    if (existingVer) {
      return res.status(409).json({ error: `Version ${version_number} already exists for this component.` });
    }

    const verResult = await db.run(`
      INSERT INTO versions (component_id, version_number, release_notes, html_code, css_code, js_code, usage_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      id,
      version_number.trim(),
      release_notes ? release_notes.trim() : `Release ${version_number}`,
      html_code,
      css_code,
      js_code,
      usage_notes ? usage_notes.trim() : '',
    ]);

    const versionId = verResult.lastInsertRowid;

    if (Array.isArray(dependencies) && dependencies.length > 0) {
      for (const d of dependencies) {
        if (d.library_name && d.library_version) {
          await db.run('INSERT INTO dependencies (version_id, library_name, library_version) VALUES (?, ?, ?)', [
            versionId, d.library_name.trim(), d.library_version.trim()
          ]);
        }
      }
    }

    return res.status(201).json({
      message: `Version ${version_number} added successfully.`,
      version_id: versionId,
    });
  } catch (error) {
    console.error('addVersion error:', error);
    return res.status(500).json({ error: 'Failed to add component version.' });
  }
}

// 5. PATCH /api/components/:id/versions/:versionId/status - Toggle Version Status
export async function updateVersionStatus(req, res) {
  try {
    const { id, versionId } = req.params;
    const { status } = req.body;

    if (!['active', 'deprecated'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or deprecated.' });
    }

    const comp = await db.get('SELECT owner_id FROM components WHERE id = ?', [id]);
    if (!comp) {
      return res.status(404).json({ error: 'Component not found.' });
    }

    if (req.user.role !== 'admin' && comp.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    const result = await db.run('UPDATE versions SET status = ? WHERE id = ? AND component_id = ?', [status, versionId, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Version not found.' });
    }

    return res.json({ message: `Version status updated to ${status}.` });
  } catch (error) {
    console.error('updateVersionStatus error:', error);
    return res.status(500).json({ error: 'Failed to update version status.' });
  }
}

// 6. POST /api/components/:id/download - Increment Download
export async function downloadComponent(req, res) {
  try {
    const { id } = req.params;
    const { versionId } = req.body;

    let compQuery = `
      SELECT c.name, c.framework, v.version_number, v.html_code, v.css_code, v.js_code
      FROM components c
      JOIN versions v ON c.id = v.component_id
      WHERE c.id = ?
    `;
    const params = [id];
    if (versionId) {
      compQuery += ' AND v.id = ?';
      params.push(versionId);
    } else {
      compQuery += ' ORDER BY v.id DESC LIMIT 1';
    }

    const comp = await db.get(compQuery, params);

    if (!comp) {
      return res.status(404).json({ error: 'Component or version not found.' });
    }

    await db.run('UPDATE components SET download_count = download_count + 1 WHERE id = ?', [id]);

    const standaloneHtml = buildStandaloneHtml(comp.html_code, comp.css_code, comp.js_code, comp.framework);

    return res.json({
      message: 'Download initiated.',
      filename: `${comp.name}-v${comp.version_number}.html`,
      content: standaloneHtml,
    });
  } catch (error) {
    console.error('downloadComponent error:', error);
    return res.status(500).json({ error: 'Failed to prepare download.' });
  }
}

// 7. GET /api/components/my - Contributor's Own Components
export async function getMyComponents(req, res) {
  try {
    const components = await db.all(`
      SELECT 
        c.id, c.name, c.summary, c.framework, c.license, c.status,
        c.view_count, c.download_count, c.created_at,
        cat.name AS category_name,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        (SELECT COUNT(*) FROM versions WHERE component_id = c.id) AS total_versions
      FROM components c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN reviews r ON c.id = r.component_id
      WHERE c.owner_id = ?
      GROUP BY c.id, cat.name
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    return res.json({
      count: components.length,
      components: components.map(c => ({
        ...c,
        avg_rating: Number(Number(c.avg_rating).toFixed(1)),
      })),
    });
  } catch (error) {
    console.error('getMyComponents error:', error);
    return res.status(500).json({ error: 'Failed to retrieve your components.' });
  }
}

// 8. DELETE /api/components/:id - Delete Component
export async function deleteComponent(req, res) {
  try {
    const { id } = req.params;

    const comp = await db.get('SELECT owner_id, name FROM components WHERE id = ?', [id]);
    if (!comp) {
      return res.status(404).json({ error: 'Component not found.' });
    }

    if (req.user.role !== 'admin' && comp.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    await db.run('DELETE FROM components WHERE id = ?', [id]);

    return res.json({ message: `Component '${comp.name}' deleted successfully.` });
  } catch (error) {
    console.error('deleteComponent error:', error);
    return res.status(500).json({ error: 'Failed to delete component.' });
  }
}
