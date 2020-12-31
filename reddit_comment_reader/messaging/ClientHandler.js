class ClientHandler {
  constructor() {
    this.clients = [];
  }
  
  addClients(...clients) {
    this.clients.push(...clients);
  }
  
  getClientByTagName(clientName) {
    return this.clients.find(client => client.clientTagName == clientName);
  }
}

module.exports = new ClientHandler();