require("dotenv").config({ path: "../.env" });
const express = require("express");
const { Pool } = require("pg");
const Cursor = require("pg-cursor");
const app = express();
let pool = null;
app.get("/", async (req, res) => {
  if (!req.query.product_name) {
    return res.status(400).json({ message: "No product was specified." });
  }
  const statement = "SELECT * FROM products WHERE product_name = $1::text";
  try {
    const products = await doQuery(pool, statement, [req.query.product_name]);
    if (!products.length) {
      return res.status(404).json({ message: "That product was not found." });
    }
    return res.json(products);
  } catch {
    return res.status(404).json({ message: "A server error occurred." });
  }
});

app.all(/.*/, (req, res) =>
  res.status(404).json({ message: "Route does not exist" }),
);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    pool = new Pool({ connectionString: process.env.DB_URL });
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};
start();

async function doQuery(pool, statement, parameters) {
  let cursor = null;
  let client = null;
  let returnArray = [];
  try {
    client = await pool.connect();
    client.on("error", (error) => {
      console.log(
        `A client error event occurred: ${error.name} ${error.message} ${error.stack}`,
      );
    });
    cursor = client.query(new Cursor(statement, parameters));
    while (true) {
      // loop until the end of the result list
      let rows = await cursor.read(100); // Getting 100 rows at a time
      if (rows.length == 0) {
        // have we got them all?
        break; //if so, we're done
      }
      returnArray = returnArray.concat(rows);
    }
    return returnArray
  } catch (error) {
    console.log(
      `A query error was thrown: ${error.name} ${error.message} ${error.stack}`,
    );
    throw error;
  } finally {
    if (cursor) cursor.close();
    if (client) client.release();
  }
}
