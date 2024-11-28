const express = require('express');
const router = express.Router();
const sql = require('mssql');
const fs = require('fs');

router.get('/', function (req, res, next) {
    (async function () {
        try {
            let pool = await sql.connect(dbConfig);

            res.setHeader('Content-Type', 'text/html');
            res.write('<title>Data Loader</title>');
            res.write('<h1>Connecting to database.</h1><p>');
            // add a button to goto /listprod
            res.write('<a href="/listprod" class="bg-blue-500 text-white p-2 rounded-lg">Go to Product List</a> <br>');
            // TODO: Here we are loading the DDL file,
            // we need to make sure that we are loading our SQLServer_shop.ddl file
            let data = fs.readFileSync("./ddl/SQLServer_shop.ddl", { encoding: 'utf8' });
            let commands = data.split(";");
            for (let i = 0; i < commands.length; i++) {
                let command = commands[i];
                res.write(command);
                try {
                    let result = await pool.request().query(command);
                    res.write('<p>' + JSON.stringify(result) + '</p>');
                }
                catch (err) {
                    // Ignore any errors                    
                }
            }

            res.write('"<h2>Database loading complete!</h2>');
            res.end();
        } catch (err) {
            console.dir(err);
            res.write(err.toString());
        }

        res.end();
    })();

});

module.exports = router;
