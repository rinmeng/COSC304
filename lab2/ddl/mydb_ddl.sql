-- Noah Stewart and Rin Meng Lab02 Revised
-- Question 1
CREATE TABLE
    Author (id INT PRIMARY KEY, name VARCHAR(30));

CREATE TABLE
    Ingredient (id CHAR(5) PRIMARY KEY, name VARCHAR(30));

CREATE TABLE
    Recipe (
        id INT PRIMARY KEY,
        name VARCHAR(40),
        authorid INT,
        directions VARCHAR(255),
        FOREIGN KEY (authorid) REFERENCES Author (id) ON DELETE SET NULL ON UPDATE NO ACTION
    );

CREATE TABLE
    Cook (
        id DATETIME PRIMARY KEY,
        recipeid INT,
        comment VARCHAR(255),
        FOREIGN KEY (recipeid) REFERENCES Recipe (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    Requires (
        recipeid INT,
        ingredientid CHAR(5),
        amount FLOAT,
        PRIMARY KEY (recipeid, ingredientid),
        FOREIGN KEY (recipeid) REFERENCES Recipe (id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (ingredientid) REFERENCES Ingredient (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- Question 2
-- Author
INSERT INTO
    Author (id, name)
VALUES
    (1, 'Joe Smith'),
    (2, 'Fred Funk');

-- Ingredient
INSERT INTO
    Ingredient (id, name)
VALUES
    ('BUTTR', 'Butter'),
    ('FLOUR', 'Flour'),
    ('MILK', 'Milk'),
    ('EGGS', 'Eggs'),
    ('SUGAR', 'Sugar');

-- Recipe
INSERT INTO
    Recipe (id, name, authorid, directions)
VALUES
    (
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
INSERT INTO
    Requires (recipeid, ingredientid, amount)
VALUES
    -- Requires for Cookies
    (100, 'BUTTR', 100),
    (100, 'FLOUR', 200),
    (100, 'MILK', 50),
    (100, 'EGGS', 2),
    (100, 'SUGAR', 100),
    -- Requires for Bread
    (200, 'FLOUR', 500),
    (200, 'MILK', 300),
    (200, 'EGGS', 3);

INSERT INTO
    Cook (id, recipeid, comment)
VALUES
    ('2024-09-15 00:00:00', 200, '(no comment)'),
    ('2024-09-23 13:35:45', 100, 'It actually worked!');

-- Update
-- 1
UPDATE Ingredient
SET
    name = 'Skim Milk'
WHERE
    id = 'MILK';

-- 2
UPDATE Requires
SET
    amount = amount * 2
WHERE
    recipeid = '100';

-- Delete
-- 1
DELETE FROM Recipe
WHERE
    authorid = (
        SELECT
            id
        FROM
            Author
        WHERE
            name = 'Fred Funk'
    );

-- One row was deleted from Recipe when this command is ran.
-- 2
DELETE FROM Requires
WHERE
    recipeid = 200
    AND amount > 2;