const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-collab-secure-key-2026';
const SALT_ROUNDS = 10;

class AuthService {
  async register(username, password, role = 'user') {
    const existingUser = await db.users.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await db.users.insert({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date()
    });

    // Log registration
    await db.logs.insert({
      type: 'user_register',
      level: 'info',
      event: `用户注册: ${username}`,
      nodeId: '系统',
      timestamp: new Date(),
      hash: 'auth-' + Math.random().toString(36).substr(2, 8)
    });

    return { id: user._id, username: user.username, role: user.role };
  }

  async login(username, password) {
    const user = await db.users.findOne({ username });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      await db.logs.insert({
        type: 'login_failed',
        level: 'warning',
        event: `登录失败: ${username}`,
        nodeId: '系统',
        timestamp: new Date(),
        hash: 'auth-fail-' + Math.random().toString(36).substr(2, 8)
      });
      throw new Error('Invalid credentials');
    }

    // Log successful login
    await db.logs.insert({
      type: 'user_login',
      level: 'success',
      event: `用户登录: ${username}`,
      nodeId: '系统',
      timestamp: new Date(),
      hash: 'auth-success-' + Math.random().toString(36).substr(2, 8)
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: { id: user._id, username: user.username, role: user.role }
    };
  }

  // Helper to initialize admin account
  async seedAdmin() {
    const admin = await db.users.findOne({ username: 'admin' });
    if (!admin) {
      console.log('Seeding admin account...');
      await this.register('admin', '123456', 'admin');
    } else {
        // Reset password for demo purposes if it exists
        // console.log('Admin account exists.');
        // Force update password for testing
        const hashedPassword = await bcrypt.hash('123456', SALT_ROUNDS);
        await db.users.update({ username: 'admin' }, { $set: { password: hashedPassword } });
    }
  }
}

module.exports = new AuthService();
