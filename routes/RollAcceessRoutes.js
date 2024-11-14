const express = require('express');
const { verifyToken, verifyTokenMan } = require('../middleware/authMiddleware');
const { Inviteusers, GetInvitedUsers, GetInvitedUsersInbox, GetInvitedUsersInboxAccepted, GetInvitedUsersSugg, GetUserList,
 messageCommonds, GetUserListCommon, ChangeRoleUser } = require('../controllers/TaskAccessControll');
const router = express.Router(); 

router.post('/commond', verifyToken, messageCommonds);
router.post('/list/message', verifyToken, GetUserListCommon);
router.post('/invite-users', verifyToken, Inviteusers);
router.get('/list_account_invite', verifyToken, GetInvitedUsers);
router.get('/list_account_inviteSug', verifyToken, GetInvitedUsersSugg);
router.get('/list_account_invite_inbox', verifyToken, GetInvitedUsersInbox);
router.post('/acceptedInvite', verifyToken, GetInvitedUsersInboxAccepted);
router.post('/verify-token/gwtOp', verifyTokenMan);

router.post('/category/users/list', verifyToken, GetUserList);
router.post('/change/roll', verifyToken, ChangeRoleUser);

module.exports = router;


