const BullQueue = require("bull");

const RedisOpts = {
  host: "clustercfg.testing-bull-queue.orbyno.aps1.cache.amazonaws.com",
  port: 6379,
  password: "1234567890abcdef",
};

const getBullOpts = (queueName) => {
  return {
    prefix: `{${queueName}Cluster}`,
    redis: RedisOpts,
  };
};

const createQueue = (queueName) => {
  return new Promise((resolve, reject) => {
    const bullOpts = getBullOpts(queueName);
    const queue = new BullQueue(queueName, bullOpts);
    queue.resume().then(() => {
      resolve(queue);
    });
  });
};

createQueue("testBull").then((queue) => {
  queue.process((data) => {
    console.log(" -= Processing queue =- :: ", data);
  });
  queue.add({});
}).catch(error => {
    console.log("error :: ", error)
})
