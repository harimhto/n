const express = require('express');
const { verifyToken, verifyTokenMan } = require('../middleware/authMiddleware');
const router = express.Router(); 

const { ProcessCreate, ProcessList, listProcess, createProcessTeam, ProcessTeamList, createTeamMebers, viewTeamMebers,
 viewTeamMebersview, ProcessTaskDelete } = require('../controllers/Process/ProcessControll');
 
const { ProcessTemplateCheck, storeTask } = require('../controllers/Process/TemplateController');

router.post('/create', verifyToken, ProcessCreate);
router.get('/list', verifyToken, ProcessList);
router.post('/view', verifyToken, listProcess);

router.post('/team/create', verifyToken, createProcessTeam);
router.get('/team/list', verifyToken, ProcessTeamList);

router.post('/team/members/create', verifyToken, createTeamMebers);
router.get('/team/members/list', verifyToken, viewTeamMebers);
router.get('/team/members/list/view', verifyToken, viewTeamMebersview);

router.get('/template/check', verifyToken, ProcessTemplateCheck);
router.post('/store', verifyToken,storeTask);

router.post('/task/delete', verifyToken, ProcessTaskDelete);

module.exports = router;


