const net = require("net");

const server = net.createServer();

const PORT = 4033;
const HOST = "216.24.57.253";

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
