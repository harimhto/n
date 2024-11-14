const SpaceProjectsModel = require('../models/SpaceProjectsModel');

const createProject = async (req, res) => {
    let success = false;
    let status = '202';
    let data = null;

    const user_id = req.user.id; // Assuming user info is attached to req
    const space_id = req.body.spaceName;
    const project_name = req.body.projectName;

    try {
        const project = await SpaceProjectsModel.create({
            user_id,
            space_id,
            project_name,
        });

        data = {
            user_id: project.user_id,
            spaceId: project.space_id,
            space_name: project.space_name || null,
            space_description: project.space_description || null,
            space_display: project.space_display || null,
            created_at: project.created_at,
            uniquSpaceid: project.space_id || null,
            project_name: project.project_name,
        };

        success = true;
        status = '201'; // Created status code
    } catch (error) {
        console.error(error);
        status = '500'; // Internal server error
    }

    return res.status(status).json({
        success,
        status,
        data,
    });
};