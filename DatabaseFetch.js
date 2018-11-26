module.exports = function() {
	this.GetCommentSearchObjectsFromDatabase = getCommentSearchObjectsFromDatabase;//function(a, b) { getCommentSearchObjectsFromDatabase(a, b); };
};

function getCommentSearchObjectsFromDatabase(pg, url)
{
	var commentSearchPredicates = [];
	pg.connect(url, function(err, client, done) {
		if(err) {
			return console.error('Client error.', err);
		}

		client.query('SELECT * FROM "RegexpComment"', function(err, result) {
			var results = result.rows;

			for (var i=0; i<results.length; i++)
			{
				var commentSearchObject = createCommentSearchObjectFromDatabaseObject(results[i]);
				commentSearchPredicates.push(commentSearchObject);
				console.log(commentSearchObject);
			}

			if(err) {
				return console.error('Query error.', err);
			}
		});
	});
	
	return commentSearchPredicates;
}