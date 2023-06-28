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