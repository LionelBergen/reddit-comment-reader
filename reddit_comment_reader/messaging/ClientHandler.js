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
  
  /**
   * Used for testing. I don't see another reason to have more than 1 instance
  */
  createNewClient() {
    return new ClientHandler();
  }
}

module.exports = new ClientHandler();