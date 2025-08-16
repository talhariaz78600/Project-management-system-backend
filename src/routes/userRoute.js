const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const { getUser, getUsers, updateUser, deleteUser, updateStatus, getDashboardStats, createUser, getUsersName, getMe, updateMe } = require('../controllers/userController');

const restrictTo = require('../middlewares/restrictTo');
const { roles } = require('../utils/types');
const router = express.Router();
router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);

router.get('/stats', restrictTo([roles.ADMIN, roles.SUBADMIN]), getDashboardStats);

router.patch('/status/:id', restrictTo([roles.ADMIN, roles.SUBADMIN]), updateStatus);

router.route('/')
  .get(restrictTo([roles.ADMIN, roles.SUBADMIN, roles.ASSOCIATE_USER]), getUsers)
  .post(restrictTo([roles.ADMIN]), createUser);

router.get('/names', restrictTo([roles.ADMIN, roles.SUBADMIN]), getUsersName);
router.route('/:id')
  .get(restrictTo([roles.ADMIN, roles.SUBADMIN]), getUser)
  .patch(restrictTo([roles.ADMIN, roles.SUBADMIN]), updateUser)
  .delete(restrictTo([roles.ADMIN, roles.SUBADMIN]), deleteUser);


module.exports = router;

