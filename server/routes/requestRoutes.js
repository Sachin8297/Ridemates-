const express = require('express');
const { body } = require('express-validator');
const {
  getSentRequests, getReceivedRequests, updateRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);

router.patch(
  '/:requestId',
  [
    body('status')
      .isIn(['accepted', 'rejected', 'cancelled'])
      .withMessage('Status must be accepted, rejected, or cancelled.'),
  ],
  validate,
  updateRequest
);

module.exports = router;
