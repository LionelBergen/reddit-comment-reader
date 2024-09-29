import Util from '../reddit-comment-reader/tools/common-tools.js';
import assert from 'assert';

describe('GetUniqueArray', () => {
  it('should generate array', () => {
    const uniqueArray = Util.getUniqueArray(3000);

    const var1 = { id: 'oneTwoThree' };
    var1.someProperty = [1, 2, 3, 4, 5];

    uniqueArray.push(var1);

    assert.ok(uniqueArray.includes({ id: 'oneTwoThree' }));
    assert.ok(uniqueArray.includes(var1));
    assert.ok(uniqueArray.get({ id: 'oneTwoThree' }));
    assert.ok(uniqueArray.get({ id: 'oneTwoThree' }).someProperty);

    const result = uniqueArray.get({ id: 'oneTwoThree' }).someProperty;
    assert.equal(result[0], 1);
    assert.equal(result[4], 5);
  });
});
