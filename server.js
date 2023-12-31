const net = require("net");

const os = require('os');

const interfaces = os.networkInterfaces();
const privateIPs = [];

// Iterate over each network interface
for (const interfaceName in interfaces) {
  const networkInterface = interfaces[interfaceName];
  
  // Iterate over each IP address in the network interface
  for (const network of networkInterface) {
    // Check for private IPv4 addresses
    if (network.family === 'IPv4' && !network.internal) {
      privateIPs.push(network.address);
    }
  }
}

console.log('Private IP addresses:');
console.log(privateIPs);

const http = require('http');

function fetchPublicIP() {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'api.ipify.org',
      path: '/?format=json',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.ip);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

fetchPublicIP()
.then((publicIP) => {
  console.log('Public IP:', publicIP);
})
.catch((error) => {
  console.error('Failed to fetch public IP:', error);
});

const server = net.createServer();

const PORT = 4033;
const HOST = privateIPs[0];

// An Array of client/socket objects 
const clients = [];

server.on("connection", (socket) => {
    console.log("A new connection to the server!");
    const clientId = clients.length + 1;

    // broadcasting a message when a user joins
    clients.map((client) => {
        client.socket.write(`User ${clientId} joined!`)
    });
    socket.write(`Id-${clientId}`);

    socket.on("data", (data) => {
        const dataString = data.toString("utf-8");
        const Id = dataString.substring(0, dataString.indexOf("-"));
        const message = dataString.substring(dataString.indexOf("-message-") + 9);

        clients.map((client) => {
            client.socket.write(`User ${Id} : ${message}`);
        });
    });

    // broadcasting a message when a user leaves
    socket.on("end", (data) => {
        clients.map((client) => {
            client.socket.write(`User ${clientId} left!`)
        });
    });

    clients.push({id: clientId.toString(), socket: socket});
});

server.listen(PORT, HOST, () => {
    console.log("Opened server on ", server.address());
});
