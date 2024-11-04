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

import mysql.connector

try:
    cnx = mysql.connector.connect(
        user="testuser", password="304testpw", host="localhost", database="workson"
    )
    cursor = cnx.cursor(buffered=True)
    cursor2 = cnx.cursor(buffered=True)

    query = """
            SELECT D.dno, dname, COUNT(eno), SUM(salary) FROM emp E JOIN dept D ON E.dno=D.dno
            WHERE bdate > '1950-12-01' GROUP BY D.dno, dname ORDER BY D.dno ASC
            """
    cursor.execute(query)

    query2 = "SELECT eno, ename, salary FROM emp WHERE dno = %s AND bdate > 1950-12-01 ORDER BY salary DESC"

    for dno, dname, totalEmp, totalSalary in cursor:
        print("Department:", dno, "Name:", dname)
        cursor2.execute(query2, (dno,))
        for eno, ename, salary in cursor2:
            print("  ", eno, ename, salary)
        print("Total employees:", totalEmp, "\tTotal salary:", totalSalary, "\n")
    cursor.close()
except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    cnx.close()
