const { Pool } = require("pg");
const Cursor = require("pg-cursor");
require("dotenv").config({ path: "../.env" });

async function runQueries() {
  let pool=null
  try {
    pool = new Pool({ connectionString: process.env.DB_URL });
    pool.on("error", (error) => {
      console.log(
        `A pool error event occurred: ${error.name} ${error.message} ${error.stack}`,
      );
    });
    let statement = "SELECT * FROM products ORDER BY price DESC LIMIT 10;";
    await doQuery(pool, statement, []);
    statement = "SELECT first_name, last_name FROM employees;";
    await doQuery(pool, statement, []);
    statement = "SELECT first_name, last_name, COUNT(order_id) as order_count FROM employees e LEFT JOIN orders o on e.employee_id = o.employee_id GROUP BY e.employee_id ORDER BY order_count DESC;";
    await doQuery(pool, statement, []);
    statement = "SELECT o.order_id, SUM(quantity * price) AS total_price FROM orders o JOIN line_items li ON o.order_id = li.order_id JOIN products p ON li.product_id = p.product_id GROUP BY o.order_id HAVING SUM(price * quantity) > 20.00;";
    await doQuery(pool, statement, []);
    statement = "SELECT first_name, last_name, SUM(quantity * price) as total_revenue FROM employees e LEFT JOIN orders o ON e.employee_id = o.employee_id JOIN line_items li ON o.order_id = li.order_id JOIN products p ON li.product_id = p.product_id GROUP BY e.employee_id ORDER BY total_revenue DESC;"
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
