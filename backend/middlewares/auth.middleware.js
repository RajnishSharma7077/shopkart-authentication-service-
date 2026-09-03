const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const user = await Customer.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
