const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Tests run against a disposable in-memory MongoDB instance, never the real
// MONGO_URI from .env. Previously they pointed at a `-test`-suffixed database
// on the same live Atlas cluster as dev/production — that meant `npm test`
// only worked on a machine whose IP happened to be on that cluster's
// allowlist (confirmed broken in a sandboxed/CI-like environment: every test
// file's beforeAll timed out after 30s trying to reach Atlas). An in-memory
// server starts in-process, needs no network/allowlist, and is torn down
// after each test file — genuinely reproducible on any machine or in CI.
let mongod;

const connectTestDb = async () => {
  if (mongoose.connection.readyState === 1) return;
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

const disconnectTestDb = async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
};

module.exports = { connectTestDb, disconnectTestDb };
