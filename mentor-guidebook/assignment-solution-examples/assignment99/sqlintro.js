const { Pool } = require("pg");
const Cursor = require("pg-cursor");
require("dotenv").config({ path: "../.env" });

async function runQueries() {
  let pool = null
  try {
    pool = new Pool({ connectionString: process.env.DB_URL });
    pool.on("error", (error) => {
      console.log(
        `A pool error event occurred: ${error.name} ${error.message} ${error.stack}`,
      );
    });
    let statement = "SELECT * FROM employees;";
    await doQuery(pool, statement, []);
    statement = "SELECT * FROM employees WHERE first_name = $1::text;";
    await doQuery(pool, statement, ["David"]);
    statement = "SELECT nonsense FROM employees;";
    await doQuery(pool, statement, []);
  } catch (error) {
    console.log(
      `An error was raised: ${error.name} ${error.message} ${error.stack}`,
    );
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}
function printRows(cursor, rows, firstRow) {
  if (firstRow) {
    const columnNames = cursor._result.fields.map((field) => field.name);
    console.log(columnNames.join("\t"));
    firstRow = false;
  }
  if (rows && rows.length) {
    rows.forEach((row) => {
      const rowStrings = row.map((column) => column.toString());
      console.log(rowStrings.join("\t"));
    });
  }
}

async function doQuery(pool, statement, parameters) {
  let cursor = null;
  let client = null;
  try {
    client = await pool.connect();
    client.on("error", (error) => {
      console.log(
        `A client error event occurred: ${error.name} ${error.message} ${error.stack}`,
      );
    });
    cursor = client.query(
      new Cursor(statement, parameters, { rowMode: "array" }),
    );
    let firstRow = true;
    while (true) {
      // loop until the end of the result list
      let rows = await cursor.read(100); // Getting 100 rows at a time
      if (rows.length == 0) {
        // have we got them all?
        break; //if so, we're done
      }
      printRows(cursor, rows, firstRow); // a little utility routine to print them out
      firstRow = false;
    }
  } catch (error) {
    console.log(
      `A query error was raised: ${error.name} ${error.message} ${error.stack}`,
    );
  } finally {
    if (cursor) cursor.close();
    if (client) client.release();
  }
}

runQueries();
