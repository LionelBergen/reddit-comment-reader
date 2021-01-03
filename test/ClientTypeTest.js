const ClientType = require('../reddit_comment_reader/messaging/ClientType.js');
const assert = require('assert');

describe('Client Type enum', () => {
  it('basic enum test', () => {
    assert.equal("discord", ClientType.DISCORD.value);
    assert.equal("faye_client", ClientType.FAYE_CLIENT.value);
  });
});