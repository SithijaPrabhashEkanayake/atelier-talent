// Starts a persistent local MongoDB instance for manual dev/demo use (not
// torn down after one test file the way testUtils/testDb.js's instance is).
// Prints the connection URI and stays running until killed. This exists
// purely because the real MONGO_URI (a live Atlas cluster) isn't reachable
// from this sandboxed environment — see the Round 2 audit notes — so
// there's otherwise no way to run the app locally with real data to look at.
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27117, dbName: 'talent-marketplace' },
  });
  console.log('DEV_MONGO_URI=' + mongod.getUri());
  process.on('SIGINT', async () => {
    await mongod.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await mongod.stop();
    process.exit(0);
  });
})();
