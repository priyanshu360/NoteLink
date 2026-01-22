// MongoDB initialization script
// This script runs when the container starts for the first time

// Switch to the testdb database
db = db.getSiblingDB('testdb');

// Create the users collection with indexes
db.createCollection('users');
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });

// Create the notes collection with indexes
db.createCollection('notes');
db.notes.createIndex({ "user_id": 1 });
db.notes.createIndex({ "created_at": 1 });
db.notes.createIndex({ "updated_at": 1 });
db.notes.createIndex({ "title": "text", "content": "text" });

// Create initial admin user (optional)
db.users.insertOne({
  username: "admin",
  password: "$2a$10$YourHashedPasswordHere", // This would be hashed
  created_at: new Date(),
  updated_at: new Date()
});

print('Database initialization completed successfully!');
print('Created collections: users, notes');
print('Created indexes for optimal performance');