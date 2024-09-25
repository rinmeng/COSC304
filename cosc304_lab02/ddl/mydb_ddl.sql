-- Noah Stewart and Rin Meng Lab02 Revised
-- Question 1
CREATE TABLE AUTHOR (
    ID INT PRIMARY KEY,
    NAME VARCHAR(30)
);

CREATE TABLE INGREDIENT (
    ID CHAR(5) PRIMARY KEY,
    NAME VARCHAR(30)
);

CREATE TABLE RECIPE (
    ID INT PRIMARY KEY,
    NAME VARCHAR(40),
    AUTHORID INT,
    DIRECTIONS VARCHAR(255),
    FOREIGN KEY (AUTHORID) REFERENCES AUTHOR (ID) ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE COOK (
    ID DATETIME PRIMARY KEY,
    RECIPEID INT,
    COMMENT VARCHAR(255),
    FOREIGN KEY (RECIPEID) REFERENCES RECIPE (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE REQUIRES (
    RECIPEID INT,
    INGREDIENTID CHAR(5),
    AMOUNT FLOAT,
    PRIMARY KEY (RECIPEID, INGREDIENTID),
    FOREIGN KEY (RECIPEID) REFERENCES RECIPE (ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (INGREDIENTID) REFERENCES INGREDIENT (ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Question 2
-- Author
INSERT INTO AUTHOR (
    ID,
    NAME
) VALUES (
    1,
    'Joe Smith'
),
(
    2,
    'Fred Funk'
);

-- Ingredient
INSERT INTO INGREDIENT (
    ID,
    NAME
) VALUES (
    'BUTTR',
    'Butter'
),
(
    'FLOUR',
    'Flour'
),
(
    'MILK',
    'Milk'
),
(
    'EGGS',
    'Eggs'
),
(
    'SUGAR',
    'Sugar'
);

-- Recipe
INSERT INTO RECIPE (
    ID,
    NAME,
    AUTHORID,
    DIRECTIONS
) VALUES (
    100,
    'Cookies',
    1,
    'Mix butter, flour, milk, eggs, and sugar. Then hope for the best.'
),
(
    200,
    'Bread',
    2,
    'Knead flour with milk and eggs. Bake at 450F or until brown.'
);

-- Requires
INSERT INTO REQUIRES (
    RECIPEID,
    INGREDIENTID,
    AMOUNT
) VALUES
 -- Requires for Cookies
(
    100,
    'BUTTR',
    100
),
(
    100,
    'FLOUR',
    200
),
(
    100,
    'MILK',
    50
),
(
    100,
    'EGGS',
    2
),
(
    100,
    'SUGAR',
    100
),
 
-- Requires for Bread
(
    200,
    'FLOUR',
    500
),
(
    200,
    'MILK',
    300
),
(
    200,
    'EGGS',
    3
);

INSERT INTO COOK (
    ID,
    RECIPEID,
    COMMENT
) VALUES (
    '2024-09-15 00:00:00',
    200,
    '(no comment)'
),
(
    '2024-09-23 13:35:45',
    100,
    'It actually worked!'
);

-- Update
-- 1
UPDATE INGREDIENT
SET
    NAME = 'Skim Milk'
WHERE
    ID = 'MILK';

-- 2
UPDATE REQUIRES
SET
    AMOUNT = AMOUNT * 2
WHERE
    RECIPEID = '100';

-- Delete
-- 1
DELETE FROM RECIPE
WHERE
    AUTHORID = (
        SELECT
            ID
        FROM
            AUTHOR
        WHERE
            NAME = 'Fred Funk'
    );

-- One row was deleted from Recipe when this command is ran.
-- 2
DELETE FROM REQUIRES
WHERE
    RECIPEID = 200
    AND AMOUNT > 2;