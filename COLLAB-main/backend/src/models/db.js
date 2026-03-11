const Datastore = require('nedb-promises');
const path = require('path');

// Initialize database stores
// In a real production app, this would be SQLite, PostgreSQL or MongoDB
// NeDB is used here as a persistent, zero-conf embedded database
const dbFactory = (fileName) => Datastore.create({
  filename: path.join(__dirname, '../../data', fileName),
  autoload: true,
  timestampData: true
});

const db = {
  users: dbFactory('users.db'),
  nodes: dbFactory('nodes.db'),
  logs: dbFactory('audit_logs.db'),
  tasks: dbFactory('fl_tasks.db'),
  meetings: dbFactory('meetings.db'),
  travelPlans: dbFactory('travel_plans.db'),
  recommendations: dbFactory('recommendations.db')
};

// Seed admin user if not exists
const seedDatabase = async () => {
  const admin = await db.users.findOne({ username: 'admin' });
  if (!admin) {
    // Password is 'password123' hashed (simulated for now, will use bcrypt in service)
    // We will let the AuthService handle the actual seeding properly with encryption
    console.log('Database initialized.');
  }
};

seedDatabase();

module.exports = db;
