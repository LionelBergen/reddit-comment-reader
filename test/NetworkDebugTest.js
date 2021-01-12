const NetworkDebugger = require('../reddit_comment_reader/tools/NetworkDebug.js');
const assert = require('assert');

describe('Network Debug test', () => {
  it('basic ping test', async () => {
    const results = await NetworkDebugger.getHostPingStatus();
    
    console.log(results);
    assert.equal(2, results.length);
    assert.ok(results.find(e => e.host == 'google.com'));
    assert.ok(results.find(e => e.host == 'reddit.com'));
  });
});