# Lesson 101 Assignment: SQL Practice Subqueries and CRUD Operations

**Objective**  
In this lesson, you practice subqueries and INSERT, UPDATE, and DELETE operations from the command line and from within a program.

## **Task 1: Complete the SQLBolt Tutorial

1. Complete all of the exercises in the SQLBolt tutorial [here.](https://sqlbolt.com/) Be sure to do the exercises in the "More Topics" menu.

2. Practice various SQL operations using the `sqlcommand.py` tool.  Include some BEGIN/COMMIT/ROLLBACK practice.

## **Task 2: Insert, Update, Delete, Subquery, and Join Practice**

Create an `assignment101` git branch for `node-homework`.  Within the `node-homework/assignment101` folder, create a file called `sql-statements.txt`.  For each of the following two subtasks, get the SQL statement working in the command line provided by `sqlcommand.py`.  Then add each statement to `sql-statements.txt`.

1. Find the total price of each of the first 5 orders, as ordered by order_id.  There are several steps.  You need to join the orders table with the line_items table and the products table.  You need to GROUP_BY the order_id.  You need to select the order_id and the SUM of the product price times the line_item quantity.  Then, you ORDER BY order_id and LIMIT 5.  You don't need a subquery. Print out the order_id and the total_price for each of the rows returned.  Do a left join of the orders table with the line_items table, in case some of the first 5 orders don't have line items.

2. For each customer, find the average price of their orders.  This can be done with a subquery. You compute the price of each order as in part 1, but you return the customer_id and the total_price.  That's the subquery. You need to return the total price using `AS total_price`, and you need to return the customer_id with `AS customer_id_b`, for reasons that will be clear in a moment.  In your main statement, you left join the customer table with the results of the subquery, using `ON customer_id = customer_id_b`.  You aliased the customer_id column in the subquery so that the column names wouldn't collide.  Then group by customer_id -- this `GROUP BY` comes *after* the subquery -- and get the average of the total price of the customer orders.  Return the customer name and the average_total_price.

## **Task 3: Adding to the Schema

1. Within the `assignment101` folder, create a file `sql-writes.js`.  Add code to this file as needed to connect to the node-homework database and to create a pool of connections.  Create a function called createConnectionPool().  For the following steps, you will need to obtain clients from the pool.  When doing write operations, it is typically not necessary to use a cursor -- you can just do client.query() with the INSERT statement -- but for SELECT operations you should use a cursor.

2. Following the example of `load-db.js`, add code to sql-writes.js to create the following tables:
- students with: 
    - an automatically set primary key called student_id 
    - a TEXT column for student_name, with a not null constraint
    - an INTEGER column for student_age
- courses with:
    - an automatically set primary key called course_id
    - a TEXT column for course_name, non-null
    - a TEXT column for term, also not-null 
- enrollments

You want the enrollments table to record when students enroll in a class.  Think: What kind of association do you have between students and courses?  What columns do you need in the enrollments table to make this work?

## **Task 4 Populate the Tables**

1. Create a function `newStudent()` within sql-writes.js that creates entries in the student table.  The pool is passed as an argument to this and to each subsequent function. The student name and age should also be arguments to this function.  Be sure to have appropriate error and event handling, in this and all following functions.

2. Create a function `newCourse()` within sql-writes.js that creates entries in the courses table, given values for the course name and pool.  Values for `term` would be strings like `Fall 2026`.  However, you must ensure that duplicate entries are not created.  So, this function must do a SELECT to see if an entry with the given course_name and term already exists.  It should return an error if the course does exist, and it should create the entry if it doesn't.  Note that the SELECT and the INSERT statements must be within a single transaction to guarantee no duplicates.

3. Create a function `newEnrollment` within sql-writes.js that creates an enrollment for a student in a course.  The course_name, term, and student_id are to be passed as arguments.  Be sure to prevent double enrollments, and to handle the case where the student_id is invalid.

4. Create a function `findStudentId` within sql-writes.js that returns an array of student IDs for a given student name.  Student names are not necessarily unique.

5. Create a function `listEnrollments` within sql-writes.js.  The student-id should be passed as an argument, and an array of course objects should be returned.

6. Export each of the functions.

7. Create a program `test-sql-writes.js` that does a `require()` for `sql-writes.js`.  It should call each of the functions, testing error conditions as well as successful operations.

## **Task 5: An Express Program for Enrollments**

Create an Express program `enrollments_express.js` that requires `sql-writes.js`.  At the start of the program, it should call createConnectionPool().  Then it should have the following routes, each of which will call one of the functions above:

1. POST `/students/new`: The body should be a JSON document with the student_name.

2. POST  `/courses/new`: The body should be a JSON document with the course_name and term.

3. POST `/enrollments/new`: The body should be a JSON document with the course_name, term, and student_id.

4. GET `/students/find/:student_name`: This should retrieve a JSON document with the student_name and student_id.

5. GET `/enrollments/find/:student_id`: This should retrieve a JSON document with the array of enrollments for the student.

Be sure to have appropriate error handling and to return appropriate HTTP result codes.  Test your program with Postman.


---

## **Submitting Your Assignment**  

**Follow these steps to submit your work:**  

#### **1️⃣ Add, Commit, and Push Your Changes**  
- Within your node-homework folder, do a git add and a git commit for the files you have created, so that they are added to the `assignment101` branch.
- Push that branch to GitHub. 

#### **2️⃣ Create a Pull Request**  
- Log on to your GitHub account.
- Open your `node-homework` repository.
- Select your `assignment101` branch.  It should be one or several commits ahead of your main branch.
- Create a pull request.

#### **3️⃣ Submit Your GitHub Link**  
- Your browser now has the link to your pull request.  Copy that link. 
- Paste the URL into the **assignment submission form**.  
