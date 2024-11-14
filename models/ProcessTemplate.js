const db = require('../config/db');
const moment = require('moment-timezone'); 

function getdatetimefun()
{
    return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
}

const ProcessTemplate = {
     
    checkTemplate: (id) => {
        return new Promise((resolve, reject) =>{
           
            const sql = `SELECT *
                FROM process_template_rule
                WHERE process_id = ?`;

            db.execute(sql, [id], (err, results) => {

            if (err) {
                return reject(err);
            }
                resolve(results);
            });

        });
    }
   

};

module.exports = ProcessTemplate;
