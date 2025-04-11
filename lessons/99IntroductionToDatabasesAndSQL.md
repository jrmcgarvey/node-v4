# **Lesson 99 — Introduction to Databases and SQL**

## **Lesson Overview**

**Learning objective:** Students will gain foundational knowledge of databases, specifically relational database characteristics and use.  They will learn basic SQL syntax.  They will then use this syntax to create tables, populate them, and query them, using the `node-postgres` package within Node.

### **Topics:**

1. What SQL Is, and Why it is Used
2. Tutorial: Querying with SELECT, filtering and sorting results, JOIN operations
3. Connecting to a Postgres Database From Node
4. Writing SQL Queries in Node

---

## **99.1 What SQL Is, and Why it is Used**

SQL is the language used to access relational databases.  In a relational database, the data is stored in tables, each of which looks like a spreadsheat.  The database has a schema, and for each table in the database, the schema describes the columns in each table, giving each a name and a datatype. Datatypes in SQL include text, integer, and (depending on the specific SQL implementation) various others.  One can compare this to no-SQL databases like MongoDB, when you can store any JSON document you like, without being limited to columns, with the ability to have lists nested inside of the document, and so on.  By contrast, the schema of a relational database can seem like a straitjacket, but it is really more a set of rails, organizing data into a structured form.

Read the following introduction: <https://www.theodinproject.com/lessons/databases-databases-and-sql>.  Or, if you know this stuff, jump to the bottom of that page and do the Knowledge Check.  Be sure that you understand the concepts of Primary Key and Foreign Key.

There are two important words left out of that introduction: Association and Transaction.

### **Associations**

An association exists between tables if one table has a foreign key that points to the other.  Consider the following cases:

1. An application has a `users` table and a `user_profiles` table.  Each record in the `user_profiles` table has a foreign key, which is the primary key of a record in the `users` table.  This is a one-to-one association.
2. An application has blogs.  Each blog has a series of posts.  The application might have a `blogs` table and a `posts` table.  Each record in the `posts` table would have a foreign key for a `blogs` table record, indicating the blog to which it belongs.  This is a one-to-many association, as one blog has many posts.
3. A magazine publisher has magazines and subscribers.  Each subscriber may subscribe to several magazines, and each magazine may have many subscribers.  Now we have a problem.  We can't put a list of subscribers into a magazine record. Relational database records can't contain lists.  For a given magazine, we could create one record for each subscriber, but we'd be duplicating all the information that describes the magazine many times over.  Similarly, there is no way for the `subscribers` table to contain records for each magazine for each subscriber.  So, you need a table in the middle, sometimes called a **join table**.  In this case, the join table might be `subscriptions`.  Each subscription record has two foreign keys, one for the magazine and one for the subscriber.  This is a many-to many association.

### **Transactions**

A transaction is a write operation on an SQL database that guarantees consistency.  Consider a banking operation.  A user wants to transfer money from one account to another.  The sequence of SQL operations is as follows (this is pseudocode of course):

- Begin the transaction.
- Read the amount in account A to make sure there's enough.
- Update that record to decrease the balance by the desired amount.
- Update that record to increase the balance by the desired amount.
- Commit the transaction

The transaction maintains consistency.  When the read occurs, that entry is locked. (This depends on the isolation level and other stuff we won't get into now.)  That lock is important, as otherwise there could be another withdrawal from the account that happens after the read but before the update, and the user's account would go overdrawn.  Neither do you want the update that decreases the balance to complete while the update that increases the balance in the other account fails.  That would anger the user, and justifiably so.  With transactions, either both write operations succeed or neither succeeds.

Relational databases' strength, by comparision with no-SQL databases, is the efficient handing of structured and interrelated data and transactional operations on that data.

### **Constraints**

When a table is defined in the schema, one or several **constraints** on the columns may also be specified.

- Datatype constraints: One constraint comes from the datatype of the column: you can't put a TEXT value in an INTEGER column, etc.  
- NOT NULL constraint:  When present, it means that whenever a record is created or updated, that column in the record must have a value.  
- UNIQUE constraint: You wouldn't want several users to have the same ID for example.  
- FOREIGN KEY constraint.  In the blog example above, each post must belong to a blog, meaning that the post record has the blog's primary key as a foreign key.  Otherwise you'd have a post that belonged to no blog, a worthless situation.

If you try to create a record that doesn't comply with constraints, or update one in violation of constraints, you get an exception.

Postgres, by default, turns on the foreign key constraint.

---

## **99.2 A Tutorial on SQL**

You should next do the following tutorial: [https://sqlbolt.com/](https://sqlbolt.com/).  For this lesson, read the introduction and parts 1 through 9 of the tutorial.

---

## **99.3 Managing the Schema**

Have a look at `node-homework/load-db.js`.  This is the code that populates the database.  At the moment, we are focusing on the "CREATE TABLE" statements.  Each table has a name and some columns.  For the customers table, the columns are customer_id, customer_name, contact, street, city, postal_code, country, and phone.  The datatype for customer_id is INTEGER, and for each of the others it is TEXT, which is what is used to store ordinary strings.  `customer_id` is the primary key, which must be unique.  This is "generated by default as identity", which means that if you insert an entry into the table, you don't have to specify the customer_id, although sometimes you will.  If you don't specify the customer_id, a unique one is chosen for you.  For the orders table, you have the following:

```
            FOREIGN KEY(customer_id) REFERENCES customers(customer_id),
            FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
```

For every order, there is a customer and an employee.  The foreign keys are used for associations.  There is an association between customers and orders, and between employees and orders.  Similarly, for the line_items table, you have:

```
            FOREIGN KEY(order_id) REFERENCES orders(order_id),
            FOREIGN KEY(product_id) REFERENCES products(product_id)
```

### **Check for Understanding**

1. What kind of association is there between customers and orders?

2. What kind of association is there between orders and products?

3. Suppose you want to do a query to retrieve the names of all the products that a particular customer has ordered, say for the customer with customer_id=1.  Which tables do you need to combine to figure this out?  How do you combine them? What is the filter?

### **Answers**

1. There is a one-to-many association between customers and orders.  A customer may have many orders, but an order belongs to only one customer.

2. There is a many-to-many association between orders and products.  An order may include many products.  A product may be included in many orders.  The join table in the middle is the line_items table.

3. You need the orders table, specifically those orders with customer_id=1.  customer_id is a foreign key in the orders table.  You need the products table, because that's the one with the product names.  You need the line_items table, because that's the join table between orders and products.  So your SQL statement would be:

```SQL
SELECT product_name FROM orders JOIN line_items ON orders.order_id = line_items.order_id JOIN products ON line_items.product_id = products.product_id WHERE customer_id = 1;
```
We didn't have to say products.product_name, because that column name is only in one of the tables, but we did have to fully qualify order_id, because that's in two tables.  Here's a tip to save typing.  You can use AS to alias the table names.

```SQL
SELECT product_name FROM orders AS o JOIN line_items AS li ON o.order_id = li.order_id JOIN products AS p ON li.product_id = p.product_id WHERE customer_id = 1;
```

And, we can even leave out the AS:

```SQL
SELECT product_name FROM orders o JOIN line_items li ON o.order_id = li.order_id JOIN products p ON li.product_id = p.product_id WHERE customer_id = 1;
```

## **99.4 SQL Operations from a Node Program**

The operations you performed in the tutorial can all be done from within a Node program.  You will now create such a program.  Switch to the `assignment99` folder of your node-homework folder, and within it create a program called `sqlintro.js`.  This should start as follows:

```js
const { Pool } =  require("pg");
const Cursor = require("pg-cursor");
require("dotenv").config(path="../.env");
```

The `pg`, `pg-cursor`, and `dotenv` packages were already added to your `node-homework/node_modules` folder by the `npm install` you did in setting up this folder.  The `pg` package handles all SQL communication with the Postgres database.  The `pg-cursor` package enables you to stream the results of a query, so that you don't have to load all the data into memory at one time.  

The `dotenv` package reads the content of your `.env` file into your process environment.  The `.env` file is where you store your programs secrets, in this case the URL of the database, which includes the database password.  Because your .gitignore includes this filename, your `.env` file is not stored in GitHub.  You don't want your secrets in GitHub.

Continue with the following code:

```js
async function runQueries() { // Database access calls are asynchronous
  try { // And they can throw errors!
    const pool = new Pool({ connectionString: process.env.DB_URL });
    pool.on("error", (error) => {
      console.log(
        `A pool error event occurred: ${error.name} ${error.message} ${error.stack}`,
      );
    });
```
Why a pool?  In an Express application, you may have many requests coming in.  To do a database connection each time a request comes in would be quite slow.  You want to create a connection and reuse it, and the pool provides for that.  Also, the pool can have multiple connections ready, in case one is busy handling a request when another is needed.  **Note the event handler for the pool error event.**  Some errors can happen that aren't raised.  Instead an event is emitted, and it's important to handle that event.

Continuing:

```js
    let client = await pool.connect(); // check out a client from the pool.  It may be necessary to open a connection at this time
    client.on("error", (error) => { // we need an error event handler for the client as well
      console.log(
        `A client error event occurred: ${error.name} ${error.message} ${error.stack}`,
      );
    });
    let statement = "SELECT * FROM employees;"; // this is the SQL we want to execute
    let cursor = client.query(new Cursor(statement, [], { rowMode: "array" }));
```
The client can do the query without using a cursor -- but in that case, all the results are be sent before the async operation completes.  If the results are large, this is not good.  The cursor can read results a chunk at a time.  The `[]` can be used for parameters to the query, although there aren't any in this case.  The rowMode is set to "array", because we want each row to come back as an array.  If this is not used, each row comes back as an object, where the attribute names are the column names.  When a cursor is used, the `client.query()` is a synchronous call that justs sets things up.  Nothing is sent to the database until the first cursor read.

Continuing:

```js
    let firstRow = true
    while (true) { // loop until the end of the result list
        let rows = await cursor.read(100); // Getting 100 rows at a time
        if (rows.length == 0) { // have we got them all?
            break //if so, we're done
        }
        printRows(cursor, rows, firstRow); // a little utility routine to print them out
        firstRow=false
    }
    cursor.close() // done reading, we have to close the cursor
    client.release() // return the client to the pool.  It stays connected though.
    await pool.end()
  } catch (error) {
    console.log(
      `An error was raised: ${error.name} ${error.message} ${error.stack}`,
    );
  }
}
```
At the end of the query, some cleanup is necessary: close the cursor and return the client to the pool.  We could do another query after the client release, and we'll add that code soon, but when all the queries are done, we end the pool, which closes all the connections associated with the pool.  If you find your program doesn't end, that means that you haven't cleaned up as you should, so watch for that. Of course, we have to catch any errors.  Ok, about that printRows() function:

```js
function printRows(cursor, rows, firstRow) {
  if (firstRow) {
    const columnNames = cursor._result.fields.map((field) => field.name);
    console.log(columnNames.join("\t"));
  }
  if (rows && rows.length) {
    rows.forEach((row) => {
      const rowStrings = row.map((column) => column.toString());
      console.log(rowStrings.join("\t"));
    });
  }
}

runQueries(); // kick off the async function that does the queries
```
Before printing out the first row, we want to print a header row with the column names.  That metadata is in `cursor._result.fields`.  This is an array of FieldInfo objects, each of which contains the column name and the data type.  The code above extracts the names with a map(), joins the resulting array with tab characters in between, and then prints out that header line.  As for the rows, we have an array of values.  We'd like to join them up -- but we have to use map() again, to convert them all to strings, or the join would give an error.  Then we join the array of values and print that out too.

Ok, try this code out.  One tip: On the free plan, Neon doesn't keep the data long term.  The tables stay, but not the data.  You can run the `load-db.js` again to reload the data as needed.

The interaction with the database happens when a query() statement occurs -- or perhaps, with a cursor, when the subsequent cursor.read() occurs.  The SQL statement used above is a SELECT, but in the next lesson, we'll get to a bunch of others: INSERT, UPDATE, DELETE, BEGIN, END, ROLLBACK, and in each case, client.query() is the method used to execute them.

### **Parameterized Queries**

Sometimes you want to use a given statement and pass one or several parameters to it.  For example, suppose you want all products where the price < 2.00, but the 2.00 is a number you might want to change.  You'd write the following statement:

```js
statement = "SELECT * FROM products WHERE price < $1::real;"
```
And, the client.query() looks like this:

```js
cursor = client.query(new Cursor(statement, [2.00], { rowMode: "array" }));
```
This plugs the value in the `[]` where the `$1::real` is.  You include information for the data type you want to pass.  You can have several parameters for a given statement.  OK, this seems like the long way around.  Couldn't we do this?

```js
let price = 2.00
statement = `SELECT * FROM products WHERE price < ${price};`
// or maybe
statement = "SELECT * FROM products WHERE price < " + price.toString() + ";"
```
**Never Never Never!** This is a bad way to do things.  The typical time that you might do this is when you get input from the user of your Express application, and you plug that input into your statement.  But users can be evil.  An evil user could plug SQL into your statement and cause data to be changed or deleted, or cause the retrieval of data you don't want to share.  This is called an SQL injection attack.  If you use a parameterized statement with a `$`, values that are plugged in are first sanitized, giving protection from the attack.

Now add a parameterized query to the code above.  The SQL statement should find the employees with first_name being "David".  Let's summarize the steps.

1. Check out a client from the pool.
2. Set up an event handler for client errors.
3. Create the SQL statement.  It will have a `$1::text` where the parameter should go.  The name is the parameter, and it is of type "text".
4. Do the query, using a cursor.
    ```js
    cursor = client.query(new Cursor(statement, ["David"], { rowMode: "array" }));
    ```
5. Use the cursor to read and print the results.
6. Clean up the cursor and the client.

Try the program out when you have made the required changes

### **Error Handling**

Add another query, but use bad SQL, such as:

```SQL
SELECT nonsense from employees;
```

See what happens. You get a report of the error -- but the program does not end.  The problem is that we need to clean up via `cursor.close()` and `client.release()` and `pool.end()`.  We'd have to make the cursor and client and pool globals or something to do the cleanup.  That's clumsy -- and in any case we are repeating way too much code.  So, time to refactor. You can put all the query operations in a function, and refactor as follows:

```js
const { Pool } = require("pg");
const Cursor = require("pg-cursor");
require("dotenv").config({ path: "../.env" });

async function runQueries() {
  try {
    const pool = new Pool({ connectionString: process.env.DB_URL });
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
    await pool.end();
  } catch (error) {
    console.log(
      `An error was raised: ${error.name} ${error.message} ${error.stack}`,
    );
  }
}
function printRows(cursor, rows, firstRow) {
  if (firstRow) {
    const columnNames = cursor._result.fields.map((field) => field.name);
    console.log(columnNames.join("\t"));
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
```

Much better.  And, if we get an error in one query, this is handled in the function, so that subsequent queries can still be done.


### **Summary**
In this lesson, you learned:

1. How to create and connect to an SQLite database.
2. How to define tables using SQL queries.
3. How to populate tables with sample data.
4. How to write SQL queries to retrieve and analyze data.
5. How to commit changes and close the database connection.
6. How to modify and delete data.
7. How to access data from Pandas.
8. By mastering these techniques, you can efficiently interact with databases using Python. For further exploration, refer to the SQLite Documentation and Python’s sqlite3 library documentation.
