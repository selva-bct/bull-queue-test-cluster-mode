const BullQueue = require("bull");
const Redis = require("ioredis");
const redisClient = require('redis')

const RedisOpts = {
     host:  "clustercfg.bull-q-23-1-cluster-auth.orbyno.aps1.cache.amazonaws.com", // cluster with auth
  //  host: "bull-q-23-1-cluster-without-auth.orbyno.clustercfg.aps1.cache.amazonaws.com", // cluster with out auth
      host: "master.no-cluster.orbyno.aps1.cache.amazonaws.com", // no cluster with auth
//	host: "no-cluster-no-pass.orbyno.ng.0001.aps1.cache.amazonaws.com", //   no cluster with no auth
    port: 6379,
  password: "hudsonalphabct123456789",
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
//	  bullOpts.creatClient = (type, config) => new redisClient.createClient(config.port, config.host, { auth_pass: config.password, tls: { servername: config.host } })
		  
    bullOpts.createClient = (type, config) => new Redis.Cluster(
	    [
		    {
			    host: config.host,
			    port: config.port
		    },
            ],
	    {
		    // slotsRefreshTimeout: 2000,
		    dnsLookup: (address, callback) => callback(null, address),
		    redisOptions: {
		          tls: {},
		          password: config.password,
                    }
	    }
    )
    const queue = new BullQueue(queueName, bullOpts);
    queue.resume().then(() => {
      resolve(queue);
    }).catch(error => {
      reject(error)
    })
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
