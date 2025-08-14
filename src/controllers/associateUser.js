const mongoose = require('mongoose');
const User = require('../models/users/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const AssociateUser = require('../models/users/AssociateUser');
const UpdateBankInfoofAssociateUser = catchAsync(async (req, res, next) => {
    const { accountNumber, bankName, accountHolderName } = req.body;

    if (!accountNumber || !bankName || !accountHolderName) {
        return next(new AppError('Please provide all bank information details', 400));
    }

    const user = await AssociateUser.findByIdAndUpdate(
        req.user._id,
        {
            bankInfo: {
                accountNumber,
                bankName,
                accountHolderName
            }
        },
        {
            new: true,
        }
    );

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    return res.status(200).json({
        status: 'success',
        data: user
    });
});



module.exports = { UpdateBankInfoofAssociateUser };