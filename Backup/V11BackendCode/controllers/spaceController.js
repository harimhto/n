const connection = require('../config/db.js'); // Adjust the path

exports.menuSpaceProject = (req, res) => {
    const userId = req.userId; // Assuming userId is set by middleware
    let status = '202';

    const query = `
        SELECT 
            ts.user_id,
            ts.space_name,
            ts.space_description,
            ts.space_display,
            ts.space_privacy,
            ts.created_at,
            ts.id AS uniquSpaceid,
            tsp.project_name,
            tsp.id AS project_id,
            ts.assignee AS space_assignee,
            tsp.assignee AS project_assignee
        FROM 
            task_space ts
        LEFT JOIN 
            task_space_projects tsp ON CAST(ts.id AS CHAR(255)) COLLATE utf8mb4_unicode_ci = tsp.space_id COLLATE utf8mb4_unicode_ci
        WHERE 
            ts.user_id = ? OR JSON_CONTAINS(ts.assignee, ?) OR JSON_CONTAINS(tsp.assignee, ?)
    `;

    connection.query(query, [userId, JSON.stringify(userId), JSON.stringify(userId)], (err, results) => {
        if (err) {
            console.error('Error fetching space project data:', err);
            status = '1023';
            return res.status(500).json({ status, error: 'Internal server error' });
        }

        const groupedResult = results.reduce((acc, item) => {
            const spaceId = item.uniquSpaceid;
            if (!acc[spaceId]) {
                acc[spaceId] = {
                    name: item.space_name,
                    id: spaceId,
                    spaceDescription: item.space_description,
                    spaceDisplay: item.space_display,
                    spacePrivacy: item.space_privacy,
                    createdAt: item.created_at,
                    tasks: [],
                };
            }
            if (item.project_name) {
                acc[spaceId].tasks.push({
                    project_id: item.project_id,
                    user_id: item.user_id,
                    space_name: item.space_name,
                    space_description: item.space_description,
                    space_display: item.space_display,
                    created_at: item.created_at,
                    uniquSpaceid: spaceId,
                    project_name: item.project_name,
                });
            }
            return acc;
        }, {});

        const resultArray = Object.values(groupedResult);
        res.status(200).json({ status, data: resultArray });
    });
};



exports.storeProject = (req, res) => {
    let success = false;
    let status = null;
    let result = null;

    const user_id = req.userId; // Assuming user info is populated through authentication middleware
    const space_name = req.body.space_name;

    if (user_id) {

        const checkExistingQuery = 'SELECT * FROM task_space WHERE space_name = ? AND user_id = ?';

        // connection.query(checkExistingQuery, [space_name, user_id], (err, existingSpaces) => {
        //     if (err) {
        //         console.error('Error checking existing space:', err);
        //         return res.status(500).json({ success, status: '500', user_data: null });
        //     }

            // if (existingSpaces.length === 0) {
                const savespaceQuery = 'INSERT INTO task_space (user_id, space_name, space_description, space_privacy, space_display) VALUES (?, ?, ?, ?, ?)';
                const space_description = req.body.description_name;
                const space_privacy = req.body.privacy;
                const space_display = '1';

                connection.query(savespaceQuery, [user_id, space_name, space_description, space_privacy, space_display], (err, results) => {
                    if (err) {
                        console.error('Error saving space:', err);
                        status = '405';
                    } else {
                        status = '200';
                        success = true;
                        const newSpaceId = results.insertId;

                        // const fetchSpaceQuery = `
                        //         SELECT s.user_id, s.space_name, s.space_description, s.space_display, s.created_at, s.id as uniquSpaceid, p.project_name 
                        //         FROM task_space s 
                        //         LEFT JOIN task_space_projects p ON CAST(s.id AS CHAR) = p.space_id 
                        //         WHERE s.user_id = ? AND s.id = ?
                        // `;
                            const fetchSpaceQuery = `
                            SELECT s.user_id, s.space_name, s.space_description, s.space_display, s.created_at, s.id AS uniquSpaceid, p.project_name 
                            FROM task_space s 
                            LEFT JOIN task_space_projects p ON CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci = p.space_id COLLATE utf8mb4_unicode_ci 
                            WHERE s.user_id = ? AND s.id = ?
                            `;
                        
                        connection.query(fetchSpaceQuery, [user_id, newSpaceId], (err, spaceData) => {
                            if (err) {
                                console.error('Error fetching space data:', err);
                                return res.status(500).json({ success, status: '500', user_data: null });
                            }

                            result = spaceData.reduce((acc, item) => {
                                const spaceEntry = {
                                    user_id: item.user_id,
                                    space_name: item.space_name,
                                    space_description: item.space_description,
                                    space_display: item.space_display,
                                    created_at: item.created_at,
                                    uniquSpaceid: item.uniquSpaceid,
                                    project_name: item.project_name
                                };
                                if (!acc[item.uniquSpaceid]) {
                                    acc[item.uniquSpaceid] = { name: item.space_name, id: item.uniquSpaceid, tasks: [] };
                                }
                                if (item.project_name) {
                                    acc[item.uniquSpaceid].tasks.push(spaceEntry);
                                }
                                return acc;
                            }, {});

                            result = Object.values(result).shift(); // Get the first grouped entry
                            return res.json({ success, status, user_data: result });
                        });
                    }
                });
            // } else {
            //     status = '1023'; // Space already exists
            //     return res.json({ success, status, user_data: null });
            // }
        // });
    } else {
        return res.status(401).json({ success, status: '401', user_data: null });
    }
};


exports.storeSpaceProject = (req, res) => {

 let success = false;
    let status = '202';
    let data = null;

    const user_id = req.userId; // Assuming user info is populated through authentication middleware
    const space_id = req.body.spaceName;
    const project_name = req.body.projectName;

    const query = 'INSERT INTO task_space_projects (user_id, space_id, project_name) VALUES (?, ?, ?)';
    const values = [user_id, space_id, project_name];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error saving project:', err);
            return res.status(500).json({
                success,
                status: '500',
                data: null,
            });
        }

       const projectId = results.insertId;

        // Assuming you need to return additional fields from the SpaceProjects table
        data = {
            user_id,
            spaceId: space_id,
            space_name: null, // Populate if necessary
            space_description: null, // Populate if necessary
            space_display: null, // Populate if necessary
            created_at: new Date(), // Set current date if not stored in DB
            uniquSpaceid: space_id,
            project_name,
            project_id:projectId,
        };

      

        success = true;
        status = '201'; // Change to Created status code

        return res.status(status).json({
            success,
            status,
            data,
        });
    });
};



exports.updateSpace = (req, res) => {
    let success = false;
    let status = null;

    const user_id = req.userId; // Assuming user info is populated through authentication middleware
    const space_id = req.body.id; // Assuming you need the space ID to identify which record to update
    const space_name = req.body.name;
    const space_description = req.body.description;
    const space_privacy = req.body.privacy;

    if (user_id && space_id) {
        const updateSpaceQuery = `
            UPDATE task_space 
            SET space_name = ?, 
                space_description = ?, 
                space_privacy = ? 
            WHERE id = ?`;
        
        connection.query(updateSpaceQuery, [space_name, space_description, space_privacy, space_id], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ success, message: 'Database error', error });
            }

            if (results.affectedRows > 0) {
                success = true;
                status = 'Space project updated successfully';
                res.status(200).json({ success, status });
            } else {
                res.status(404).json({ success, message: 'Space project not found or not authorized' });
            }
        });
    } else {
        res.status(400).json({ success, message: 'User ID and Space ID are required' });
    }
};
