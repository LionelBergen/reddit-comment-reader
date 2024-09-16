import pg from 'pg'
const { Client } = pg

export async function CreatePgClient(databaseConnectionString, useSSL) {
  const client = new Client({
    connectionString: databaseConnectionString,
    ssl: (useSSL ? { rejectUnauthorized: false } : false)
  });
  await client.connect();

  return client;
}

export async function Query(client, queryText, tableValues) {
  return new Promise((resolve, reject) => {
    client.query(queryText, tableValues, ((err, res) => {
      if (err) {
        reject(err);
        // Logger.error(err.stack);
      } else {
        resolve(res);
        // Logger.error(res.rows[0]);
      }
    
      client.end();
    }));
  });
};