const express = require('express');

const { verifyToken } = require('../middleware/authMiddleware');
const { menuSpaceProject, storeProject, storeSpaceProject } = require('../controllers/spaceController');
const { spaceList } = require('../controllers/CommonController');
const router = express.Router();

router.get('/', verifyToken, menuSpaceProject);
router.get('/list', verifyToken, spaceList);

router.put('/create', verifyToken, storeProject);
router.put('/create/project', verifyToken, storeSpaceProject);

module.exports = router;
