const express = require('express');
const {
    createTask,
    getAllTasks,
    updateTask,
    deleteTask,
    listTask,
    listTaskModal,
    getAllTasksdemo,
    taskActivityList,
    storeTask,
    updatetaskinfo,
    listTaskDelete
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verifyToken, createTask);
router.get('/', verifyToken, getAllTasks);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

router.post('/view', verifyToken, listTask);
router.post('/delete', verifyToken, listTaskDelete);
router.get('/infoview', verifyToken,listTaskModal);
router.get('/info-activity', verifyToken,taskActivityList);
router.post('/store', verifyToken,storeTask);

router.put('/update/info', verifyToken,updatetaskinfo);

module.exports = router;
