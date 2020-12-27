require('../CommonTools.js')();

let subredditModsList = GetUniqueArray(3000);

let var1 = {id: 'oneTwoThree' };
var1.modList = [1,2,3,4,5];

subredditModsList.push(var1);

if (!subredditModsList.includes({id:'oneTwoThree'}))
{
  throw 'failure, includes fail';
}
else if (subredditModsList.get({id:'oneTwoThree'}) == null)
{
  throw 'failure, get fail, value was: ' + subredditModsList.get({id:'oneTwoThree'});
}