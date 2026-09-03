const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

// Register
const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const customer = await Customer.create({ fullName, email, password, phone });
    const customerObj = customer.toObject();
    delete customerObj.password;

    return res.status(201).json({ success: true, message: 'Customer registered successfully', customer: customerObj });
  } catch (err) {
    next(err);
  }
};

// Login
const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(customer._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('token', token, cookieOptions);

    const customerObj = customer.toObject();
    delete customerObj.password;

    return res.json({ success: true, message: 'Login successful', customer: customerObj });
  } catch (err) {
    next(err);
  }
};

// Get profile
const getMe = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    return res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// Logout
const logoutCustomer = async (req, res, next) => {
  try {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// Change password (bonus)
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: 'Old and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

    const customer = await Customer.findById(req.user._id);
    if (!customer) return res.status(401).json({ success: false, message: 'Not authorized' });

    const isMatch = await customer.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Old password is incorrect' });

    customer.password = newPassword;
    await customer.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerCustomer, loginCustomer, getMe, logoutCustomer, changePassword };
