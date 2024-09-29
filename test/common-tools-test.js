const Util = require('../reddit-comment-reader/tools/common-tools.js');
const assert = require('assert');

describe('GetUniqueArray', () => {
  it('should override duplicates', () => {
    const subredditModsList = Util.getUniqueArray(3000);

    const var1 = { id: 'oneTwoThree' };
    var1.modList = [1, 2, 3, 4, 5];

    subredditModsList.push(var1);

    assert.ok(subredditModsList.includes({ id: 'oneTwoThree' }));
    assert.ok(subredditModsList.get({ id: 'oneTwoThree' }));
  });
});
