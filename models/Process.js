const db = require('../config/db');

const moment = require('moment-timezone');

function getdatetimefun()
{
    return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
}

const Process = {
    
    create: (astprocess, callback) => {
    	const createdAt = getdatetimefun(); // Get the current datetime
        const sql = 'INSERT INTO ast_process (process_name, description, user_id, created_at) VALUES (?, ?, ?, ?)';
        db.execute(sql, [astprocess.space_name, astprocess.description_name, astprocess.userId, createdAt], callback);
    },

    view: (astprocess, callback) => {
        // const sql = 'SELECT * FROM ast_process WHERE user_id = ?';
        const sql = `SELECT u.name, p.*
            FROM ast_process p
            LEFT JOIN users u ON CAST(p.user_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
            WHERE p.user_id = ?`;

        db.execute(sql, [astprocess.userId], callback);
    },

   getrecord: (astprocess, callback) => {
        
          const sql = `SELECT u.name, p.*
            FROM ast_process p
            LEFT JOIN users u ON CAST(p.user_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
            WHERE p.id = ?`;

        db.execute(sql, [astprocess], callback);
    },


    createTeam: (astprocess) => {
    return new Promise((resolve, reject) => {
        const createdAt = getdatetimefun(); // Get the current datetime
        const sql = 'INSERT INTO ast_process_team (team_name, description, user_id, created_at) VALUES (?, ?, ?, ?)';
        
        db.execute(sql, [astprocess.space_name, astprocess.description_name, astprocess.userId, createdAt], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
    },

    createTeamMember: (astprocessMbs) => {
        return new Promise((resolve, reject) => {
            const createdAt = getdatetimefun(); // Get the current datetime
            const sql = 'INSERT INTO ast_process_team_members (process_team_id, process_team_roll, user_id, invite_email, created_at) VALUES (?, ?, ?, ?, ?)';
            
            db.execute(sql, [astprocessMbs.teamMembname, astprocessMbs.teamrollName, astprocessMbs.userId, astprocessMbs.email, createdAt], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    getrecordTeams: (astprocess, callback) => {

        return new Promise((resolve, reject) => {

          const sql = `SELECT u.name, p.*
            FROM ast_process_team p
            LEFT JOIN users u ON CAST(p.user_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
            WHERE p.id = ?`;

         db.execute(sql, [astprocess], (err, results) => {

            if (err) {
                return reject(err);
            }
            resolve(results);
        });

        });
    },


    viewTeams: (astprocess, callback) => {

        return new Promise((resolve, reject) => {

          const sql = `SELECT u.name, p.*
            FROM ast_process_team p
            LEFT JOIN users u ON CAST(p.user_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
            WHERE p.user_id = ?`;

         db.execute(sql, [astprocess], (err, results) => {

            if (err) {
                return reject(err);
            }
            resolve(results);
        });

        });
    },

    createLogSendMail: (memberDataLog, callback) => {
        const createdAt = getdatetimefun(); // Get the current datetime
        const sql = 'INSERT INTO ast_team_members_mail_log (member_email, status, msg_error, created_at) VALUES (?, ?, ?, ?)';
        db.execute(sql, [memberDataLog.member_email, memberDataLog.status, memberDataLog.msg_error, createdAt], callback);
    },

   viewTeamsMembers: (astprocess, callback) => {
                return new Promise((resolve, reject) => {
                    const sql = `
                        SELECT 
                            u.team_name, 
                            us.name, 
                            p.process_team_id,
                            COUNT(p.user_id) AS member_count -- Example aggregate function
                        FROM 
                            ast_process_team_members p
                        LEFT JOIN 
                            ast_process_team u ON CAST(p.process_team_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
                        LEFT JOIN 
                            users us ON CAST(p.user_id AS CHAR(255)) = CAST(us.id AS CHAR(255))
                        WHERE 
                            p.user_id = ?
                        GROUP BY 
                            p.process_team_id, u.team_name, us.name
                    `;

                    db.execute(sql, [astprocess], (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(results);
                    });
                });
        },


    viewTeamsMembersview: (astprocess, callback) => {
            return new Promise((resolve, reject) => {
                const sql = `
                    SELECT 
                        u.team_name, 
                        us.name, 
                        us.color, 
                        p.process_team_id,
                        p.invite_email,
                        p.process_team_roll
                    FROM 
                        ast_process_team_members p
                    LEFT JOIN 
                        ast_process_team u ON CAST(p.process_team_id AS CHAR(255)) = CAST(u.id AS CHAR(255))
                    LEFT JOIN 
                        users us ON CAST(p.invite_email AS CHAR(255)) = CAST(us.email AS CHAR(255))
                    WHERE 
                        p.process_team_id = ?
                `;

                db.execute(sql, [astprocess], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        },


    };



module.exports = Process;
