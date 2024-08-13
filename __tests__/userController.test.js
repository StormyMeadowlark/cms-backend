const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from this file
const User = require('../models/User');
const mongoose = require('mongoose');

// Clear the database before each test
beforeEach(async () => {
  await User.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Registration', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'TestPassword123'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');

    const user = await User.findOne({ email: 'testuser@example.com' });
    expect(user).toBeTruthy();
    expect(user.username).toBe('testuser');
  });

  it('should not register a user with an existing email', async () => {
    // Register the first user
    await new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'TestPassword123'
    }).save();

    const response = await request(app)
      .post('/api/users/register')
      .send({
        username: 'anotheruser',
        email: 'testuser@example.com',
        password: 'AnotherPassword123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'User already exists');
  });
});
