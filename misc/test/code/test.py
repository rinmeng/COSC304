# RUN THIS COMMAND
# docker-compose up -d
# docker exec -it mysql bash
# mysql -u root -p
# ENTER PASSWORD: 304rootpw
# CREATE DATABASE workson;
# USE workson;
# THEN COPY THE WORKSON SQL LINES TO THE MYSQL SHELL, AFTER THAT, PASTE THE CODE
# GRANT ALL PRIVILEGES ON workson.* TO 'testuser'@'localhost' IDENTIFIED BY '304testpw';
# FLUSH PRIVILEGES;

# GRANT ALL PRIVILEGES ON university.* TO 'testuser'@'%';


import mysql.connector

try:
    cnx = mysql.connector.connect(
        user="testuser", password="304testpw", host="localhost", database="workson"
    )
    cursor = cnx.cursor(buffered=True)
    cursor2 = cnx.cursor(buffered=True)

    # Select
    query = """
            SELECT e1.eno, e1.ename, COUNT(e1.eno) empSupervised, SUM(e1.salary) totalSalary 
            FROM emp e1 JOIN emp e2
            WHERE e1.eno = e2.supereno  
            GROUP BY e1.eno, e1.ename 
            ORDER BY empSupervised DESC, totalSalary ASC;
            """
    cursor.execute(query)

    query2 = "SELECT eno, ename, salary, supereno FROM emp WHERE supereno = %s;"

    for eno, ename, empSupervised, salary in cursor:
        print()
        print(eno, ename, empSupervised, salary)
        cursor2.execute(query2, (eno,))
        print("Employee Supervised:")
        for eno, ename, salary, supereno in cursor2:
            print("  ", eno, ename, ename, salary, supereno)

    cursor.close()
except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    cnx.close()
