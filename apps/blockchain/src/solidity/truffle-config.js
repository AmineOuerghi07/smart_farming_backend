
module.exports = {
    networks: {
      development: {
        host: "localhost",     // Docker service name if you're running Ganache in Docker
        port: 8545,
        network_id: "*"
      }
    },
    compilers: {
      solc: {
        version: "0.5.1"
      }
    }
  };
  