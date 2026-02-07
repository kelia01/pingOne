// backend/src/controllers/userController.js
import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username avatar status lastSeen')
      .sort({ status: -1, username: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.status = status;
      user.lastSeen = new Date();
      await user.save();
      res.json({ message: 'Status updated' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};