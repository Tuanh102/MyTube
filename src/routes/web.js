// 1. Khai báo Express
const express = require('express');
const router = express.Router();

// 2.Nạp Controller
const homeController = require('../controllers/homeController');

// 3. Định nghĩa Route
router.get('/', homeController.getHomePage);

// 4. Xuất bản (Export)
module.exports = router;