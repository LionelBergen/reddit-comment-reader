class ClientHandler {
  constructor() {
    this.clients = [];
  }
  
  addClients(...clients) {
    this.clients.push(...clients);
  }
  
  initializeClients() {
    this.clients.forEach(function(client) {
      client.initialize();
    });
  }
  
  getClientByTagName(clientName) {
    return this.clients.find(client => client.clientTagName == clientName);
  }
}

module.exports = new ClientHandler();