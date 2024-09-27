import NetworkDebugger from '../reddit-comment-reader/tools/network-debug.js';

import assert from 'assert';
import sinon from 'sinon';
import ping from 'ping';
const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.resetBehavior();
  sandbox.restore();
});

describe('Network Debug Live test', () => {
  it('basic live ping test', async () => {
    const results = await NetworkDebugger.getHostPingStatus();

    assert.equal(2, results.length);
    assert.ok(results.find(e => e.host == 'google.com'));
    assert.ok(results.find(e => e.host == 'reddit.com'));
  });
});

describe('Network Debug Mock Test', () => {
  it('failure "reddit.com" ping test', async () => {
    let numberOfClientStubCalls = 0;
    const pingMockStub = sandbox.stub(ping.promise, 'probe');
    pingMockStub.onCall(0).callsFake(function(host) {
      assert.equal('google.com', host);
      numberOfClientStubCalls++;
      return Promise.resolve();
    });

    pingMockStub.onCall(1).callsFake(function(host) {
      numberOfClientStubCalls++;
      assert.equal('reddit.com', host);
      return Promise.reject('test message');
    });

    try {
      await NetworkDebugger.getHostPingStatus();
      assert.fail('expected reject');
    } catch(e) {
      assert.equal(2, numberOfClientStubCalls);
      assert.equal('test message', e);
    }
  });
});
