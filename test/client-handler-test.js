import { ClientHandler } from '../reddit-comment-reader/messaging/client-handler.js';
import { FayeMessagingClient } from '../reddit-comment-reader/messaging/messaging-client.js';
import assert from 'assert';

describe('Client Handler addClients', () => {
  it('should add to a list of clients', () => {
    const ClientHandlerImpl = new ClientHandler();
    ClientHandlerImpl.addClients(new FayeMessagingClient());
    ClientHandlerImpl.addClients(new FayeMessagingClient());
    ClientHandlerImpl.addClients(new FayeMessagingClient(), new FayeMessagingClient());

    assert.equal(4, ClientHandlerImpl.clients.length);
  });
});

describe('Client Handler getClientByTagName', () => {
  it('should find client by name', () => {
    const ClientHandlerImpl = new ClientHandler();
    ClientHandlerImpl.addClients(new FayeMessagingClient({ clientTagName: 'test1' }));
    ClientHandlerImpl.addClients(new FayeMessagingClient({ clientTagName: 'test2' }));
    ClientHandlerImpl.addClients(new FayeMessagingClient({ clientTagName: 'test3' }), new FayeMessagingClient({ clientTagName: 'test4' }));

    assert.equal('test3', ClientHandlerImpl.getClientByTagName('test3').clientTagName);
    assert.equal('test2', ClientHandlerImpl.getClientByTagName('test2').clientTagName);
    assert.equal('test1', ClientHandlerImpl.getClientByTagName('test1').clientTagName);
    assert.equal('test4', ClientHandlerImpl.getClientByTagName('test4').clientTagName);
  });
});
