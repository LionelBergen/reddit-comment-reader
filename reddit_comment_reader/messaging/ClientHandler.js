class ClientHandler {
  constructor() {
    this.clients = [];
  }
  
  addClients(...clients) {
    this.clients.push(...clients);
  }
}

module.exports = new ClientHandler();