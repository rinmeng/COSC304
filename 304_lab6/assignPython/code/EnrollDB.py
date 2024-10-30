import mysql.connector


class EnrollDB:
    """Application for an enrollment database on MySQL"""

    def connect(self):
        """Makes a connection to the database and returns connection to caller"""
        try:
            print("Connecting to database.")
            self.cnx = mysql.connector.connect(
                user="testuser",
                password="304testpw",
                host="localhost",
                database="testuser",
            )
            return self.cnx
        except mysql.connector.Error as err:
            print(err)

    def init(self):
        """Creates and initializes the database"""
        fileName = "./304_lab6/assignPython/code/university.ddl"
        print("Loading data")

        try:
            cursor = self.cnx.cursor()
            with open(fileName, "r") as infile:
                st = infile.read()
                commands = st.split(";")
                for line in commands:
                    # print(line.strip("\n"))
                    line = line.strip()
                    if line == "":  # Skip blank lines
                        continue

                    cursor.execute(line)

            cursor.close()
            self.cnx.commit()
            print("Database load complete")
        except mysql.connector.Error as err:
            print(err)
            self.cnx.rollback()

    def close(self):
        try:
            print("Closing database connection.")
            self.cnx.close()
        except mysql.connector.Error as err:
            print(err)

    def listAllStudents(self):
        """Returns a String with all the students in the database.
        Format:
            sid, sname, sex, birthdate, gpa
            00005465, Joe Smith, M, 1997-05-01, 3.20

        Return:
            String containing all student information"""

        print("Executing list all students.")

        output = "sid, sname, sex, birthdate, gpa"
        cursor = self.cnx.cursor()

        # 1 DID: Execute query and build output string

        try:
            query = "SELECT * FROM student"
            cursor.execute(query)

            for sid, sname, sex, birthdate, gpa in cursor.fetchall():
                # Format each student's data and append to the output string
                output += f"\n{sid}, {sname}, {sex}, {birthdate}, {gpa}"
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()

        return output

    def listDeptProfessors(self, deptName):
        """Returns a String with all the professors in a given department name.
        Format:
                 Professor Name, Department Name
                 Art Funk, Computer Science
        Returns:
                 String containing professor information"""

        # 2 DID: Execute query and build output string
        output = "Professor Name, Department Name"
        cursor = self.cnx.cursor()
        try:
            query = f"SELECT pname, dname FROM prof WHERE dname = '{deptName}'"
            cursor.execute(query)

            for pname, dname in cursor.fetchall():
                output += f"\n{pname}, {dname}"
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return output

    def listCourseStudents(self, courseNum):
        """Returns a String with all students in a given course number (all sections).
        Format:
            Student Id, Student Name, Course Number, Section Number
            00005465, Joe Smith, COSC 304, 001
        Return:
             String containing students"""

        # 3 DID: Execute query and build output string
        output = "Student Id, Student Name, Course Number, Section Number"
        cursor = self.cnx.cursor()
        try:
            query = f"SELECT s.sid, s.sname, e.cnum, e.secnum FROM student s JOIN enroll e ON s.sid = e.sid WHERE e.cnum = '{courseNum}'"
            cursor.execute(query)

            for sid, sname, cnum, cname in cursor.fetchall():
                output += f"\n{sid}, {sname}, {cnum}, {cname}"
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()

        return output

    def computeGPA(self, studentId):
        """Returns a cursor with a row containing the computed GPA (named as gpa) for a given student id."""

        # 4 DID: Execute query and return cursor
        cursor = self.cnx.cursor()
        try:
            query = f"SELECT AVG(grade) gpa FROM enroll WHERE sid = '{studentId}'"
            cursor.execute(query)
            return cursor
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def addStudent(self, studentId, studentName, sex, birthDate):
        """Inserts a student into the databases."""

        # 5 DID: Execute statement. Make sure to commit
        cursor = self.cnx.cursor()
        try:
            query = "INSERT INTO student (sid, sname, sex, birthdate) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (studentId, studentName, sex, birthDate))
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return None

    def deleteStudent(self, studentId):
        """Deletes a student from the databases."""

        # 6 DID: Execute statement. Make sure to commit
        cusor = self.cnx.cursor()
        try:
            query = "DELETE from student WHERE sid = %s"
            cusor.execute(query, (studentId,))
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cusor.close()
        return

    def updateStudent(self, studentId, studentName, sex, birthDate, gpa):
        """Updates a student in the database."""

        cursor = self.cnx.cursor()
        try:
            query = (
                "UPDATE student SET "
                "sname = %s, "
                "sex = %s, "
                "birthdate = %s, "
                "gpa = %s "
                "WHERE sid = %s"
            )
            # Use parameterized query to avoid SQL injection
            cursor.execute(query, (studentName, sex, birthDate, gpa, studentId))
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return

    def newEnroll(self, studentId, courseNum, sectionNum, grade):
        """Creates a new enrollment in a course section."""

        # 8 DID: Execute statement. Make sure to commit
        cursor = self.cnx.cursor()
        try:
            query = (
                "INSERT INTO enroll (sid, cnum, secnum, grade) VALUES (%s, %s, %s, %s)"
            )
            cursor.execute(query, (studentId, courseNum, sectionNum, grade))
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return

    def updateStudentGPA(self, studentId):
        """Updates a student's GPA based on courses taken."""

        # 9 DID: Execute statement. Make sure to commit
        cursor = self.cnx.cursor()
        try:
            query = (
                "UPDATE student SET "
                f"gpa = (SELECT AVG(grade) FROM enroll WHERE sid = '{studentId}') "
                f"WHERE sid = '{studentId}'"
            )
            cursor.execute(query)
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return

    def removeStudentFromSection(self, studentId, courseNum, sectionNum):
        """Removes a student from a course and updates their GPA."""

        # 10 DID: Execute statement. Make sure to commit
        cursor = self.cnx.cursor()
        try:
            query = f"DELETE FROM enroll WHERE sid = '{studentId}' AND cnum = '{courseNum}' AND secnum = '{sectionNum}'"
            cursor.execute(query)
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return

    def updateStudentMark(self, studentId, courseNum, sectionNum, grade):
        """Updates a student's mark in an enrolled course section and updates their grade."""

        # 11 DID: Execute statement. Make sure to commit
        cursor = self.cnx.cursor()
        try:
            query = "UPDATE enroll SET grade = %s WHERE sid = %s AND cnum = %s AND secnum = %s"
            cursor.execute(query, (grade, studentId, courseNum, sectionNum))
            self.cnx.commit()
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cursor.close()
        return

    def query1(self):
        """Return the list of students (id and name) that have not registered in any course section.
        Hint: Left join can be used instead of a subquery."""

        # 11 DID: Execute the query and return a cursor
        cursor = self.cnx.cursor()
        try:
            query = "SELECT s.sid, s.sname FROM student s LEFT JOIN enroll e ON s.sid = e.sid WHERE e.sid IS NULL"
            cursor.execute(query)
            return cursor
        except Exception as e:
            print(f"An error occurred: {e}")
        return None

    def query2(self):
        """For each student return their id and name, number of course sections registered in (called numcourses), and gpa (average of grades).
        Return only students born after March 15, 1992. A student is also only in the result if their gpa is above 3.1 or registered in 0 courses.
        Order by GPA descending then student name ascending and show only the top 5."""

        # 12 TODO: Execute the query and return a cursor
        cursor = self.cnx.cursor()
        try:
            query = (
                "SELECT s.sid, s.sname, COUNT(e.secnum) numcourses, AVG(e.grade) gpa "
                "FROM student s "
                "LEFT JOIN enroll e ON s.sid = e.sid "
                "WHERE s.birthdate > '1992-03-15' "
                "GROUP BY s.sid, s.sname "
                "HAVING gpa > 3.1 OR numcourses = 0 "
                "ORDER BY gpa DESC, s.sname ASC "
                "LIMIT 5"
            )
            cursor.execute(query)
            return cursor
        except Exception as e:
            print(f"An error occurred: {e}")
        return None

    def query3(self):
        """
        For each course,
        return the number of sections (numsections),
        total number of students enrolled (numstudents),
        average grade (avggrade),
        and number of distinct professors who taught the course (numprofs).

        Only show courses in Chemistry or Computer Science department.
        Make sure to show courses even if they have no students.
        Do not show a course if there are no professors teaching that course.
        Format:
        cnum, numsections, numstudents, avggrade, numprof
        """

        # 13 TODO: Execute the query and return a cursor

        cursor = self.cnx.cursor()
        try:
            query = (
                "SELECT c.cnum, "
                "COUNT(DISTINCT s.secnum) AS numsections, "
                "COUNT(e.sid) AS numstudents, "
                "AVG(e.grade) AS avggrade, "
                "COUNT(DISTINCT p.pname) AS numprofs "
                "FROM course c "
                "LEFT JOIN section s ON c.cnum = s.cnum "
                "LEFT JOIN enroll e ON s.cnum = e.cnum AND s.secnum = e.secnum "
                "LEFT JOIN prof p ON s.pname = p.pname "
                "WHERE p.dname IN ('Chemistry', 'Computer Science') OR p.pname IS NULL "
                "GROUP BY c.cnum "
                "HAVING COUNT(DISTINCT p.pname) > 0"
            )
            cursor.execute(query)
            return cursor
        except Exception as e:
            print(f"An error occurred: {e}")

        return None

    def query4(self):
        """Return the students who received a higher grade than their course section average in at least two courses. Order by number of courses higher than the average and only show top 5.
        Format:
        EmployeeId, EmployeeName, orderCount"""

        # 14 TODO: Execute the query and return a cursor
        return None

    # Do NOT change anything below here
    def resultSetToString(self, cursor, maxrows):
        output = ""
        if cursor is None:
            return "No results"
        cols = cursor.column_names
        output += "Total columns: " + str(len(cols)) + "\n"
        output += str(cols[0])
        for i in range(1, len(cols)):
            output += ", " + str(cols[i])
        for row in cursor:
            output += "\n" + str(row[0])
            for i in range(1, len(cols)):
                output += ", " + str(row[i])
        output += "\nTotal results: " + str(cursor.rowcount)
        return output


# Main execution for testing
enrollDB = EnrollDB()
enrollDB.connect()
enrollDB.init()

print(enrollDB.listAllStudents())

print("Executing list professors in a department: Computer Science")
print(enrollDB.listDeptProfessors("Computer Science"))
print("Executing list professors in a department: none")
print(enrollDB.listDeptProfessors("none"))

print("Executing list students in course: COSC 304")
print(enrollDB.listCourseStudents("COSC 304"))
print("Executing list students in course: DATA 301")
print(enrollDB.listCourseStudents("DATA 301"))


print("Executing compute GPA for student: 45671234")
print(enrollDB.resultSetToString(enrollDB.computeGPA("45671234"), 10))
print("Executing compute GPA for student: 00000000")
print(enrollDB.resultSetToString(enrollDB.computeGPA("00000000"), 10))

print("Adding student 55555555:")
enrollDB.addStudent("55555555", "Stacy Smith", "F", "1998-01-01")
print("Adding student 11223344:")
enrollDB.addStudent("11223344", "Jim Jones", "M", "1997-12-31")
print(enrollDB.listAllStudents())

print("Test delete student:")
print("Deleting student 99999999:")
enrollDB.deleteStudent("99999999")
# Non-existing student
print("Deleting student 00000000:")
enrollDB.deleteStudent("00000000")
print(enrollDB.listAllStudents())

print("Updating student 99999999:")
enrollDB.updateStudent("99999999", "Wang Wong", "F", "1995-11-08", 3.23)
print("Updating student 00567454:")
enrollDB.updateStudent("00567454", "Scott Brown", "M", None, 4.00)
print(enrollDB.listAllStudents())

print("Test new enrollment in COSC 304 for 98123434:")
enrollDB.newEnroll("98123434", "COSC 304", "001", 2.51)

enrollDB.init()
print("Test update student GPA for student:")
enrollDB.newEnroll("98123434", "COSC 304", "001", 3.97)
enrollDB.updateStudentGPA("98123434")

print("Test update student mark for student 98123434 to 3.55:")
enrollDB.updateStudentMark("98123434", "COSC 304", "001", 3.55)

enrollDB.init()

enrollDB.removeStudentFromSection("00546343", "CHEM 113", "002")

# Queries
# Re-initialize all data
enrollDB.init()
print(enrollDB.resultSetToString(enrollDB.query1(), 100))
print(enrollDB.resultSetToString(enrollDB.query2(), 100))
print(enrollDB.resultSetToString(enrollDB.query3(), 100))
print(enrollDB.resultSetToString(enrollDB.query4(), 100))

enrollDB.close()
