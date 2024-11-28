# Lab 9 Noah Stew & Rin Meng

## Question 1 - XPath (3 marks)

1. Write an XPath expression that returns all departments with a budget less than $400,000.

    ```xml
    //Dept[budget < 400000]
    ```


2. Write an XPath expression that returns all employees in the Management department that have a name greater than 'K'.

    ```xml
    //Dept[name="Management"]/Emp[name > "K"]
    ```

3. Write an XPath expression that returns the employee number of the 2nd employee in the Consulting department. Note: To return an attribute use `data()` such as `data(//Dept/@dno)`.

    ```xml
    data(//Dept[name="Consulting"]/Emp[2]/@eno)
    ```

## Question 2 - Views (4 marks)

1. Write a CREATE VIEW statement for the workson database called `deptSummary` that has the department number, name, count of employees in the department, and total employee salaries.

    ```sql
    CREATE VIEW deptSummary AS
    SELECT d.dno, d.dname, COUNT(eno) AS totalEmp, SUM(e.salary) AS totalSalary
    FROM dept d JOIN emp e ON d.dno = e.dno
    GROUP BY d.dno, d.dname;
    ```

2. Write a CREATE VIEW statement for workson database called `empSummary` that has the employee number, name, salary, birthdate, department, count of projects worked on for the employee and the total hours worked. Only show employees in `'D1', 'D2', or 'D3'` and with birthdate after `'1966-06-08'`.

    ```sql
    CREATE VIEW empSummary AS
    SELECT e.eno, e.ename, e.salary, e.bdate, e.dno, COUNT(pno) AS totalProj, SUM(hours) AS totalHours
    FROM emp e LEFT JOIN workson w ON e.eno = w.eno
    WHERE e.dno IN ('D1', 'D2', 'D3') AND e.bdate > '1966-06-08'
    GROUP BY e.eno, e.ename, e.salary, e.bdate, e.dno;
    ```

## Question 3 - Triggers (6 marks)

1. Write a trigger on MySQL with the workson data set (testing in your own database) that increases the budget of a project whenever a record is inserted in `workson` table. Increase the budget by `$1,000`.

    ```sql
    DELIMITER //
    CREATE TRIGGER increaseBudget
    AFTER INSERT ON workson
    FOR EACH ROW
    BEGIN
        UPDATE proj
        SET budget = budget + 1000
        WHERE pno = NEW.pno;
    END;
    //
    DELIMITER ;
    ```

2. Write a trigger on MySQL with the workson data set (testing in your own database) that sets the salary of a new employee to be `$5,000` more than the average salary of employees with that title whenever an employee is inserted with a salary less than `$50,000`. For example, if employee `'E10'` called `'P. Person'` with title `'ME'` is inserted with a salary of `$35,000`, then the salary should be changed to `$45,000` (average salary of `'ME'` employees is `$40,000`).

```sql
    DELIMITER //

    CREATE TRIGGER adjustSalaryBeforeInsert
    BEFORE INSERT ON emp
    FOR EACH ROW
    BEGIN
        -- Declare variable to hold the average salary for the same title
        DECLARE avg_salary_in_title DECIMAL(10,2);
        
        -- Check if the new employee's salary is less than 50000
        IF NEW.salary < 50000 THEN
            -- Get the average salary for the same title
            SELECT AVG(salary) INTO avg_salary_in_title
            FROM emp
            WHERE title = NEW.title;
            
            -- Adjust salary if the average is not NULL
            IF avg_salary_in_title IS NOT NULL THEN
                -- This line sets salary to average + 5000
                SET NEW.salary = avg_salary_in_title + 5000; 
            END IF;
        END IF;
    END//

    DELIMITER ;
```

## Question 4 - JSON (2 marks)

1. Create a single, valid JSON document that stores the information of the `dept` and `proj` tables in the workson database.

```json
{
    "dept": [
        {
            "dno": "D1",
            "dname": "Management",
            "mgreno": "E8"
        },
        {
            "dno": "D2",
            "dname": "Consulting",
            "mgreno": "E8"
        },
        {
            "dno": "D3",
            "dname": "Accounting",
            "mgreno": "E8"
        },
        {
            "dno": "D4",
            "dname": "Development",
            "mgreno": null
        }
    ],
    "proj": [
        {
            "pno": "P1",
            "pname": "Instruments",
            "budget": "150000.00",
            "dno": "D1"
        },
        {
            "pno": "P2",
            "pname": "DB Develop",
            "budget": "135000.00",
            "dno": "D2"
        },
        {
            "pno": "P3",
            "pname": "Budget",
            "budget": "251000.00",
            "dno": "D3"
        },
        {
            "pno": "P4",
            "pname": "Maintenance",
            "budget": "310000.00",
            "dno": "D2"
        },
        {
            "pno": "P5",
            "pname": "CAD/CAM",
            "budget": "500000.00",
            "dno": "D2"
        }
    ]
}
```
