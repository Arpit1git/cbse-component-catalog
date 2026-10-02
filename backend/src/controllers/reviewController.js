import db from '../config/db.js';

export async function addReview(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment = '' } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const comp = await db.get('SELECT id, name FROM components WHERE id = ?', [id]);
    if (!comp) {
      return res.status(404).json({ error: 'Component not found.' });
    }

    const existing = await db.get('SELECT id FROM reviews WHERE component_id = ? AND user_id = ?', [id, req.user.id]);
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted a review for this component.' });
    }

    const result = await db.run(`
      INSERT INTO reviews (component_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [id, req.user.id, Math.round(Number(rating)), comment.trim()]);

    const avgRow = await db.get('SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE component_id = ?', [id]);

    return res.status(201).json({
      message: 'Review submitted successfully.',
      review_id: result.lastInsertRowid,
      rating: Math.round(Number(rating)),
      comment: comment.trim(),
      user_name: req.user.name,
      avg_rating: Number(Number(avgRow?.avg || 0).toFixed(1)),
      review_count: Number(avgRow?.count || 0),
    });
  } catch (error) {
    console.error('addReview error:', error);
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
}

export async function getReviews(req, res) {
  try {
    const { id } = req.params;

    const reviews = await db.all(`
      SELECT r.id, r.rating, r.comment, r.created_at, r.user_id, u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.component_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    const stats = await db.get(`
      SELECT 
        COALESCE(AVG(rating), 0) AS avg_rating,
        COUNT(*) AS total_reviews
      FROM reviews 
      WHERE component_id = ?
    `, [id]);

    return res.json({
      reviews,
      avg_rating: Number(Number(stats?.avg_rating || 0).toFixed(1)),
      total_reviews: Number(stats?.total_reviews || 0),
    });
  } catch (error) {
    console.error('getReviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
}
