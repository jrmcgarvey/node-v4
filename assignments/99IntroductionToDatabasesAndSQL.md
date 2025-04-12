# Lesson 99 Assignment: SQL Practice from the Command Line and Node

**Objective**  
In this assignment, you practice use of SQL SELECT operations, first via a provided command line tool, and then from within a Node application that uses the `pg` Postgres package.  Finally, you create a small Express application that implements a REST API to retrieve product information from the database.

## **Task 1: Practice SQL Statements using sqlcommand.py**

In the `node-homework` folder is a program called `sqlcommand.py`.  This accesses your Postgres database, sending it the SQL you specify.  The database contains the following tables: customers, employees, orders, line_items, and products.  A customer may have many orders.  An order may have many line_items.  Each line_item has one product.  Each employee (apparently they are all sales people) gets customers to submit orders, and I imagine all those sales folks are have a sales quota they must meet, so each employee has many orders.  Start sqlcommand.py to see how this works.

You type SQL on the command line. As an SQL statement may have several lines, no SQL is sent to the database until you put a `;`.  There is a command stack, so you can get to the commands you entered before with the up arrow key.  Ctrl-C exits.  Try this statement:

```SQL
SELECT * FROM employees;
```

You get the idea.  You can enter any SQL you like, but invalid SQL will return an error.  One point however: The SQL standard requires that string values be surrounded with single quotes.  Not all SQL implementations require this -- some allow double quotes -- but Postgres does require single quotes.  For example try the following:

```SQL
SELECT * FROM products WHERE product_name LIKE '%Fish';
```

This would fail if you didn't include the single quotes, or if you replaced them with double quotes.  You don't need quotes around the table names or the column names.

1. Enter SQL to get the first 10 products, ordered descending by price.

2. Enter SQL to get only the employee first and last names.

3. A Join: Enter SQL to get the employee first and last names and the number of orders associated with each.  Sort this list by the count in descending order.  Perhaps some employees have no orders, so you want a left join to list those as well.

4. Enter SQL to get the number of orders for each product.  Some products may have no orders, but you want to list those as well.  Return the order_id and the count for the first 20 orders ordered by product_name.

5. Enter SQL to get the total price of each order, but only include those orders above 20.00.  Get only the order_id and total price, and get only 20 orders.  (You need to get a sum of the quantity times the price.)

6. Enter SQL to get the total revenue that each employee has brought in.  Include all employees, even if some have not obtained orders. Return this in descending order of total revenue.  Include the first_name, last_name, and total_revenue in the result.

---

## **Task 2: Implement these queries in a Node Program**

Create an `assignment99` git branch. Within your `python-homework/assignment99` folder, create a program called `select-practice.js`.  This is to be created in the assignment99 folder, and it should be run from there as well.  Add code for each SQL statement above into this program.  Add the statements one at a time, so that you know that each works.  Suggestion: You can start with a copy of sqlintro.js, so you have the boilerplate.

---

## **Task 3: SQL Calls From Within an Express Program**

1. Also in the `assignment99 folder` Create an Express program called sql-express.js.  You only need one route, which is for a GET to `/`.  This is to handle REST requests.  At the outset, just have it return a JSON document that has a hello message.  Make sure this much works by sending a request using your browser or Postman.  (Because you are only doing a GET, you can use the browser to test.)  Return a JSON document with an error message and a 404 for any other routes.

2. Add code to look for a query parameter for `product_name`.  If that is not present, return a document with an error message and a 400 return code.

3. Add code to do a SELECT for the given `product_name`.  If such a product is found (conceivably there may be several), return a JSON documment with a list of the product objects in the JSON document.  So -- in your code mainline, you'll have to set up your pool.  You'll need a parameterized query for the product_name.  You don't want the 'array' rowMode, because you want to return the list of objects.  You might have to build up the list of objects with several cursor reads. (This is unlikely, as probably you'll only get one match for the product name, but put code in to handle it anyway.)  After sending the response, you have to close the cursor and release the client.  If the search returns no rows, return a 404 with a JSON document and an error message.

4. Test this with your browser or Postman. **Hint:** You can't put spaces in an HTTP query parameter. You need to substitute `%20` for each space.

---

## **Submitting Your Assignment**  

**Follow these steps to submit your work:**  

#### **1️⃣ Add, Commit, and Push Your Changes**  
- Within your node-homework folder, do a git add and a git commit for the files you have created, so that they are added to the `assignment99` branch.
- Push that branch to GitHub. 

#### **2️⃣ Create a Pull Request**  
- Log on to your GitHub account.
- Open your `node-homework` repository.
- Select your `assignment99` branch.  It should be one or several commits ahead of your main branch.
- Create a pull request.

#### **3️⃣ Submit Your GitHub Link**  
- Your browser now has the link to your pull request.  Copy that link. 
- Paste the URL into the **assignment submission form**.  
