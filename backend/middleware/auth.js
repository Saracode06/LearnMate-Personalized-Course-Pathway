const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'learnmate-secret-key-change-in-production';

/**
 * Middleware: verify Bearer JWT, attach req.user = { id, email, name }
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
  }
}

/**
 * Sign a JWT for a user.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { requireAuth, signToken };
