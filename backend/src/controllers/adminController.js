import db from '../config/db.js';

// 1. GET /api/admin/pending - List Pending Components
export async function getPendingComponents(req, res) {
  try {
    const pending = await db.all(`
      SELECT 
        c.id, c.name, c.summary, c.framework, c.license, c.repo_url, c.status, c.created_at,
        cat.name AS category_name,
        u.name AS owner_name, u.email AS owner_email,
        v.version_number, v.html_code, v.css_code, v.js_code, v.usage_notes
      FROM components c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.owner_id = u.id
      LEFT JOIN versions v ON c.id = v.component_id
      WHERE c.status = 'pending'
      ORDER BY c.created_at ASC
    `);

    return res.json({
      count: pending.length,
      pending,
    });
  } catch (error) {
    console.error('getPendingComponents error:', error);
    return res.status(500).json({ error: 'Failed to retrieve pending components.' });
  }
}

// 2. PATCH /api/admin/components/:id/status - Approve or Reject
export async function setComponentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Choose approved, rejected, or pending.' });
    }

    const result = await db.run('UPDATE components SET status = ? WHERE id = ?', [status, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Component not found.' });
    }

    return res.json({ message: `Component marked as ${status}.` });
  } catch (error) {
    console.error('setComponentStatus error:', error);
    return res.status(500).json({ error: 'Failed to update component status.' });
  }
}

// 3. GET /api/admin/stats - System Health & Usage Analytics
export async function getCatalogStats(req, res) {
  try {
    const totalComponentsRow = await db.get('SELECT COUNT(*) AS count FROM components');
    const approvedComponentsRow = await db.get("SELECT COUNT(*) AS count FROM components WHERE status = 'approved'");
    const pendingComponentsRow = await db.get("SELECT COUNT(*) AS count FROM components WHERE status = 'pending'");
    const rejectedComponentsRow = await db.get("SELECT COUNT(*) AS count FROM components WHERE status = 'rejected'");
    
    const totalVersionsRow = await db.get('SELECT COUNT(*) AS count FROM versions');
    const totalUsersRow = await db.get('SELECT COUNT(*) AS count FROM users');
    const totalReviewsRow = await db.get('SELECT COUNT(*) AS count FROM reviews');
    
    const usageSums = await db.get(`
      SELECT 
        COALESCE(SUM(view_count), 0) AS total_views,
        COALESCE(SUM(download_count), 0) AS total_downloads
      FROM components
    `);

    const categoryBreakdown = await db.all(`
      SELECT cat.name, COUNT(comp.id) AS count
      FROM categories cat
      LEFT JOIN components comp ON cat.id = comp.category_id
      GROUP BY cat.id, cat.name
      ORDER BY count DESC
    `);

    const frameworkBreakdown = await db.all(`
      SELECT framework, COUNT(*) AS count
      FROM components
      GROUP BY framework
      ORDER BY count DESC
    `);

    return res.json({
      stats: {
        totalComponents: Number(totalComponentsRow?.count || 0),
        approvedComponents: Number(approvedComponentsRow?.count || 0),
        pendingComponents: Number(pendingComponentsRow?.count || 0),
        rejectedComponents: Number(rejectedComponentsRow?.count || 0),
        totalVersions: Number(totalVersionsRow?.count || 0),
        totalUsers: Number(totalUsersRow?.count || 0),
        totalReviews: Number(totalReviewsRow?.count || 0),
        totalViews: Number(usageSums?.total_views || 0),
        totalDownloads: Number(usageSums?.total_downloads || 0),
      },
      categoryBreakdown: categoryBreakdown.map(c => ({ ...c, count: Number(c.count) })),
      frameworkBreakdown: frameworkBreakdown.map(f => ({ ...f, count: Number(f.count) })),
    });
  } catch (error) {
    console.error('getCatalogStats error:', error);
    return res.status(500).json({ error: 'Failed to fetch catalog statistics.' });
  }
}

// 4. GET /api/admin/users - User Management
export async function getUsers(req, res) {
  try {
    const users = await db.all(`
      SELECT 
        u.id, u.name, u.email, u.role, u.created_at,
        COUNT(c.id) AS component_count,
        (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS review_count
      FROM users u
      LEFT JOIN components c ON u.id = c.owner_id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);

    return res.json({
      users: users.map(u => ({
        ...u,
        component_count: Number(u.component_count || 0),
        review_count: Number(u.review_count || 0),
      }))
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
}

// 5. PATCH /api/admin/users/:id/role - Update User Role
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['consumer', 'contributor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be consumer, contributor, or admin.' });
    }

    if (Number(id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote your own admin account.' });
    }

    const result = await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: `User role updated to ${role}.` });
  } catch (error) {
    console.error('updateUserRole error:', error);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}
