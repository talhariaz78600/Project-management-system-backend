const express = require('express');
const {
    UpdateBankInfoofAssociateUser
} = require('../controllers/associateUser');
const requireAuth = require('../middlewares/requireAuth');
const restrictTo = require('../middlewares/restrictTo');
const router = express.Router();
router.route('/update-bank-info').patch(requireAuth, restrictTo(['associateUser']), UpdateBankInfoofAssociateUser);

module.exports = router;