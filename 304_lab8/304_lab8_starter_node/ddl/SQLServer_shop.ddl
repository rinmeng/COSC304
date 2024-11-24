CREATE DATABASE shop;
go

USE shop;
go


DROP TABLE review;
DROP TABLE shipment;
DROP TABLE productinventory;
DROP TABLE warehouse;
DROP TABLE orderproduct;
DROP TABLE incart;
DROP TABLE product;
DROP TABLE category;
DROP TABLE ordersummary;
DROP TABLE paymentmethod;
DROP TABLE customer;


CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(20),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(20),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerid)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE category (
    categoryId          INT IDENTITY,
    categoryName        VARCHAR(50),    
    PRIMARY KEY (categoryId)
);

CREATE TABLE product (
    productId           INT IDENTITY,
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productImageURL     VARCHAR(100),
    productImage        VARBINARY(MAX),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    PRIMARY KEY (productId),
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouse (
    warehouseId         INT IDENTITY,
    warehouseName       VARCHAR(30),    
    PRIMARY KEY (warehouseId)
);

CREATE TABLE shipment (
    shipmentId          INT IDENTITY,
    shipmentDate        DATETIME,   
    shipmentDesc        VARCHAR(100),   
    warehouseId         INT, 
    PRIMARY KEY (shipmentId),
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE productinventory ( 
    productId           INT,
    warehouseId         INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (productId, warehouseId),   
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,   
    customerId          INT,
    productId           INT,
    reviewComment       VARCHAR(1000),          
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO category(categoryName) VALUES ('CPUs');
INSERT INTO category(categoryName) VALUES ('Motherboards');
INSERT INTO category(categoryName) VALUES ('Ram');
INSERT INTO category(categoryName) VALUES ('GPUs');
INSERT INTO category(categoryName) VALUES ('Power Supplies');
INSERT INTO category(categoryName) VALUES ('Cooling');
INSERT INTO category(categoryName) VALUES ('Storage');
INSERT INTO category(categoryName) VALUES ('Cases');
go


-- Categories 
INSERT INTO category (categoryName) VALUES ('CPUs');
INSERT INTO category (categoryName) VALUES ('Motherboards');
INSERT INTO category (categoryName) VALUES ('Ram');
INSERT INTO category (categoryName) VALUES ('GPUs');
INSERT INTO category (categoryName) VALUES ('Power Supplies');
INSERT INTO category (categoryName) VALUES ('Cooling');
INSERT INTO category (categoryName) VALUES ('Storage');
INSERT INTO category (categoryName) VALUES ('Cases');
go

-- Products
-- CPUs
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Intel Core i9-13900K', 1, '12-core, 24-thread processor', 589.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('AMD Ryzen 9 7950X', 1, '16-core, 32-thread processor', 799.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Intel Core i7-13700K', 1, '16-core, 24-thread processor', 409.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('AMD Ryzen 7 7800X', 1, '8-core, 16-thread processor', 399.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Intel Core i5-13600K', 1, '14-core, 20-thread processor', 319.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('AMD Ryzen 5 7600X', 1, '6-core, 12-thread processor', 299.99);

-- Motherboards
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('ASUS ROG Strix Z690-E', 2, 'Intel Z690 chipset motherboard', 399.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('MSI MPG Z590 Gaming Edge WiFi', 2, 'Intel Z590 chipset motherboard with Wi-Fi', 229.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('MSI MAG B550 TOMAHAWK WIFI', 2, 'AMD B550 chipset motherboard with Wi-Fi', 179.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Gigabyte AORUS Z490 Elite', 2, 'Intel Z490 chipset motherboard with advanced cooling', 219.99);

-- RAM
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200', 3, '32GB RAM kit for high-performance gaming', 149.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('G.Skill Ripjaws V 16GB (2x8GB) DDR4-3600', 3, '16GB RAM kit for high-speed performance', 79.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('HyperX Fury 16GB (2x8GB) DDR4-3200', 3, '16GB RAM kit for general-purpose use', 64.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Corsair Dominator Platinum RGB 32GB (2x16GB) DDR4-3600', 3, 'High-performance 32GB RAM kit with RGB lighting', 189.99);

-- GPUs
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('NVIDIA GeForce RTX 4090', 4, '24GB GDDR6X VRAM, the flagship GPU from NVIDIA', 1599.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('NVIDIA GeForce RTX 5090', 4, '32GB GDDR6X VRAM, the ultimate GPU for gaming and content creation', 1999.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('AMD Radeon RX 7900 XTX', 4, '24GB GDDR6, high-performance GPU from AMD', 999.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('ASUS TUF Gaming GeForce RTX 3070', 4, '8GB GDDR6 VRAM, NVIDIA Ampere architecture', 599.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('NVIDIA GeForce RTX 3060 Ti', 4, '8GB GDDR6 VRAM, great for 1440p gaming', 399.99);

-- Power Supplies
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('EVGA SuperNOVA 850 G5', 5, '850W power supply, 80+ Gold certified', 139.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Corsair RM750x', 5, '750W power supply, fully modular, 80+ Gold certified', 109.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Thermaltake Toughpower GF1 750W', 5, '750W power supply, 80+ Gold certified', 109.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Cooler Master MWE Gold 850W', 5, '850W power supply, fully modular, 80+ Gold certified', 129.99);

-- Cooling
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Noctua NH-D15', 6, 'Dual tower CPU cooler with dual fan setup', 89.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Corsair iCUE H150i Elite Capellix', 6, '360mm AIO liquid cooler with RGB fans', 179.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('be quiet! Dark Rock Pro 4', 6, 'Premium air cooler with two silent fans', 89.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Corsair iCUE H100i RGB Pro XT', 6, '240mm AIO liquid cooler with RGB lighting', 129.99);

-- Storage
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Samsung 970 EVO Plus 1TB', 7, 'M.2 NVMe SSD for fast storage', 109.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Western Digital Black SN850X 2TB', 7, 'M.2 NVMe Gen4 SSD for high-speed gaming', 249.99);

-- Cases
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('NZXT H510', 8, 'Mid-tower ATX case with tempered glass panel', 79.99);
INSERT INTO product (productName, categoryId, productDesc, productPrice) VALUES ('Fractal Design Meshify C', 8, 'Compact mid-tower ATX case with high airflow', 89.99);
go

INSERT INTO warehouse(warehouseName) VALUES ('Main warehouse');
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (1, 1, 5, 18);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (2, 1, 10, 19);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (3, 1, 3, 10);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (4, 1, 2, 22);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (5, 1, 6, 21);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (6, 1, 3, 25);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (7, 1, 1, 30);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (8, 1, 0, 40);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (9, 1, 2, 97);
INSERT INTO productInventory(productId, warehouseId, quantity, price) VALUES (10, 1, 3, 31);
go

INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES 
('Marques', 'Brownlee', 'marc.brown@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada', 'marqbrown' , 'marqbrown');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES 
('Linus', 'Tech Tips', 'linus.tech@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States', 'linustechtips' , 'linustechtips');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES 
('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States', 'candace' , 'password');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES 
('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES 
('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States', 'beth' , 'test');
go


-- Order 1 can be shipped as have enough inventory
DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (1, '2019-10-15 10:25:55', 2389.96)
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 1, 1, 589.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 2, 399.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 10, 1, 999.99);
go

DECLARE @orderId2 int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (2, '2019-10-16 18:00:00', 1599.95)
SELECT @orderId2 = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId2, 19, 5, 319.99);
go

-- Order 3 cannot be shipped as do not have enough inventory for item 7
DECLARE @orderId3 int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (3, '2019-10-15 3:30:22', 459.98)
SELECT @orderId3 = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId3, 6, 2, 229.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId3, 7, 3, 79.99);
go

DECLARE @orderId4 int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (2, '2019-10-17 05:45:11', 2769.84)
SELECT @orderId4 = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId4, 3, 4, 409.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId4, 8, 3, 79.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId4, 13, 3, 89.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId4, 28, 2, 129.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId4, 29, 4, 89.99);
go

DECLARE @orderId5 int
INSERT INTO ordersummary (customerId, orderDate, totalAmount) VALUES (5, '2019-10-15 10:25:55', 3139.91)
SELECT @orderId5 = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId5, 5, 4, 399.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId5, 19, 2, 319.99)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId5, 20, 3, 299.99);
go
