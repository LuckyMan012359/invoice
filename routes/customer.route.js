const express = require('express');
const {
  createCustomer,
  updateCustomer,
  readCustomer,
  deleteCustomer,
} = require('../controllers/customer.controller');
const verifyToken = require('../middlewares/authJWT');
const router = express.Router();

router.post('/add_customer', verifyToken, createCustomer);
router.get('/get_customers', verifyToken, readCustomer);
router.put('/update_customer', verifyToken, updateCustomer);
router.delete('/delete_customer', verifyToken, deleteCustomer);

module.exports = router;
