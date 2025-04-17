# **Lesson 100: More on SQL**

## **Lesson Overview**

**Learning Objective:**Students will learn how to use subqueries in SQL statements. Students will also learn the write operations: INSERT, UPDATE, and DELETE.  The resolution of foreign keys for inserts will be explained.  Students will also learn about the importance of transactional boundaries in SQL operations, and how to use transactional operations.

### **Topics:**

1. Using subqueries within SQL statements.
2. Insert operations.
3. Update operations.
4. Delete operations.
5. Transactions.

## **101.1 Subqueries**

Subqueries are a means of getting a result set and using those results within the context of another operation, all in one statement.  Suppose your application handles the reservation of rental rooms.  You have a table of rooms, each with a room_id, city, title and description.  You also have a list of reservations, which has the reservation_id, the room_id (a foreign key), the arrival_date, and the departure_date.  You want to show the user the list of available rooms for a given city, arrival_date, and departure_date.

Let's break this down into steps.  We'll assume that the user wants a room in Omaha from 2025-09-03 to 2025-09-07. First, you find what's not available:

```SQL
SELECT room_id FROM reservations WHERE ('2025-09-03' >= arrival_date AND '2025-09-03' < departure_date) OR ('2025-09-07' > arrival_date AND '2025-09-07' <= departure_date);
```
We're kind of cheating here, in that, in the actual application, we'd have to use a parameterized query.  Anyway, this query finds all the room_ids, where the user's arrival date or departure occurs when the room is occupied.

Now, we can do the search the user wants:

```SQL
SELECT * FROM rooms WHERE city = 'Omaha' AND room_id NOT IN (SELECT room_id FROM reservations WHERE ('2025-09-03' >= arrival_date AND '2025-09-03' < departure_date) OR ('2025-09-07' > arrival_date AND '2025-09-07' <= departure_date));
```
(Again, we are cheating.  In the actual application, "Omaha" would be passed as a query parameter.)  As you develop statements with subqueries, it is often best to get the SELECT statement in the subquery working first, and then plug it into the larger statement.

### Subqueries with Aggregation

You might also need to use a subquery with aggregation.  Suppose you have a table with employee_name and sales.  Suppose you want to find all employees whose sales revenue is above average for their region. You could do it as follows:

```SQL
SELECT * FROM employees WHERE sales > (SELECT AVG(sales) from employees GROUP BY region);
```

## **101.2 Insert Operations**

Database operations fall into the following categories: Create, Read, Update, and Delete, known by the CRUD algorithm.  We've spent a while on R.  We now discuss Create.  To create a database record, the SQL statement used is INSERT.  In the database we have been using, one of the tables is the products table, which has the following columns: product_id, product_name, and price.  The following statement would insert an additional record:

```SQL
INSERT INTO employees (product_name, price) VALUES ('widget', 1.98);
```

The first group in parentheses is the list of columns to insert.  If you leave out a column, a NULL will be inserted in that column for the record, if null values are allowed in the schema for that column, with one exception case.  The schema for the product_id column tells the database to automatically assign a unique value for the primary key, which is product_id.

One can insert several or many records with one insert statement by having multiple groups of values:

```SQL
INSERT INTO products (product_name, price) VALUES ('doohickey', 9.23),('thingamabob', 7.77);
```
Doing it this way, instead of using several INSERT statements, is always faster and more efficient. Write operations such as INSERT, UPDATE, and DELETE may have a RETURNING clause, so that you can see what was written.  You can have all attributes of the changed record returned with `RETURNING *`. Or you can specify which attributes you want, as in `RETURNING product_id, price`. 

There is an interesting way to combine INSERT statements with subqueries.  Suppose there is a corporate merger, so that in addition to the employees table, there is an other_employees table.  You want to combine the two tables, and assign each of the new employees an employee_id that does not conflict with the existing employees.  In the other_employees table, there is some primary key plus columns named "first", "last", and "phone_number".  You could do:

```SQL
INSERT INTO employees (first_name, last_name, phone) VALUES (SELECT "first", "last", phone_number FROM other_employees);
```
Note that in this case, the column names `first` and `last` have to have the double quotes.  FIRST and LAST are reserved words in SQL.

## **101.3 The UPDATE Operation**

Suppose the employee with employee_id 12 changes their name to "Florence Henderson".  You could update the corresponding record as follows:

```SQL
UPDATE employees SET first_name = 'Florence', last_name = 'Henderson' WHERE employee_id = 12;
```

You can also update many records with a single operation.  Suppose that you have decided that each order of product_id 14 is to increased by 1, so that each customer gets a free bonus.  You could do that as follows:

```SQL
UPDATE line_items SET quantity = quantity + 1 WHERE product_id = 14;
```

### **Check For Understanding**

1. What do you think would happen if you left off the WHERE clause in each of the UPDATE statements above?

2. Why might you want to use the RETURNING statement on an INSERT?

3. Suppose you want to create a function that adds products to orders.  The arguments to the function are the order_id, the product_name and the price.  What SQL statements would have to be done by the function?

### Answers:

1. If you leave off the WHERE clause, all records in the table are changed.  In the first example above, every employees record would have "Florence Henderson".

2. One reason to use the RETURNING statement on an INSERT is to get the primary key back.  For example, you could do an INSERT for an orders record.  The database would assign the order_id.  You could then use that order_id as a foreign key in line_items records created for the order.

3. You need to create an additional line_items record for the order.  To create the line_items record, you need to know the product_id, because that is a needed foreign key.  So, you'd need to do:

```SQL
SELECT product_id FROM products WHERE product_name = $1::TEXT;
```
You would pass as a parameter the product_name.  Once you have the product_name, you'd do another parameterized statement for the INSERT:

```SQL
INSERT INTO line_items (order_id, product_id, quantity) VALUES ($1::INTEGER, $2::INTEGER, $3::INTEGER);
```
And in this case you would pass as parameters the order_id, product_id, and quantity.

## **101.4 The DELETE Operation**

The DELETE statement is simple.  For example, you could do:

```SQL
DELETE FROM orders WHERE order_id = 17;
```

### **Check for Understanding**

1. What would happen if you left off the WHERE clause in this case?

2. What could you do then?

3. The above DELETE statement will almost certainly throw an error.  Why?  What would you need to do to make it work?

### Answers:

1. If you leave off the WHERE clause, every record in the table would be deleted.

2. There is no UNDO in SQL.  If the transaction has been committed, the database has been changed and the contents of the table are gone.  We'll get to the ROLLBACK statement, which is what you can do if the transaction has not been committed.  Some databases are archived periodically, so you might be able to recover some of the data from the archive.  By the way, you can reload the node-homework database, if you need to, by re-running the load-db.js program.

3. The statement will probably fail and throw an error because of the foreign key constraint.  You probably have line_items records associated with this order.  You need to delete them first, if you really want to delete the order:

```SQL
DELETE FROM line_items WHERE order_id = 17;
DELETE FROM orders WHERE order_id = 17;
```

## **101.5 Transactions**

Any operation in SQL occurs in the context of a transaction, which is started with a BEGIN and ends either with a BEGIN or a ROLLBACK.  We haven't been doing those.  With Postgres, when you send an SQL statement, if you don't have an active transaction, one is opened for you, the statement is executed, and the transaction is committed, automatically.

Sometimes you need to control transactional boundaries.  For example, suppose a user wants to transfer $42.00 from account 17 to account 23.  We will assume that the accounts table has an account_id and a balance.  You would not want to have the money withdrawn from A and not deposited in B.  Both parts of the transaction must complete, or neither, as follows:

```SQL
BEGIN
UPDATE accounts SET balance = balance - 42.0 WHERE account_id = 17;
UPDATE accounts SET balance = balance + 42.0 WHERE account_id = 23;
COMMIT
```

This ensures that you don't rob the user.  The problem with the SQL above is that the user might not have the $42.00 in account 17 to begin with.  They might be going overdrawn.  So, you actually need:

```SQL
BEGIN
SELECT balance FROM accounts WHERE account_id = 17;
``` 
After this statement you have program logic to check that the user has at least $42.00.  If so:
```SQL
UPDATE accounts SET balance = balance - 42.0 WHERE account_id = 17;
UPDATE accounts SET balance = balance + 42.0 WHERE account_id = 23;
```
Whether or not the user has the money in account 17, you need to complete the transaction.
```SQL
COMMIT
```

When the SELECT is done, the corresponding record or records are locked for the duration of the transaction.  No other process can find out how much money is in the account, or change the balance, because that would lead to erroneous results.  The record to be updated is also locked.  The lock is only released with the COMMIT, or possibly with a ROLLBACK.  (Actually, this locking logic depends on the isolation level in the database, which is beyond the scope of this lesson.)

Now, holding the lock creates certain issues.  The person's partner can't go in and check the balance.  So, if a program leaves an uncommitted transaction open for too long, it will time out, and an error will be thrown.  It is also possible in certain cases that a process that is waiting to get a lock will time out.  In the `pg` package, such timeout events are dispatched as errors for the client connection, which is why an event handler is needed for the error.  The event handler should do a ROLLBACK, and it may be necessary to do ROLLBACK operations for other reasons, for example in try/catch/finally handling.

## **101.6 For Further Study and Reference**

This introduction to SQL is far from complete.  See [https://www.w3schools.com/sql/default.asp](https://www.w3schools.com/sql/default.asp) for a useful reference and a complete tutorial.

## **Summary**

In this lesson, you learned:
1. How to use subqueries within SQL statements.
2. How to do SQL INSERT operations.
3. How to do SQL UPDATE operations.
4. How to do SQL DELETE operations.
5. How to control transaction boundaries, and why you might need to do so.
6. Where to find a complete tutorial and reference.
