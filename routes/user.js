const express = require('express'),
      router = express.Router(),
      AuthMiddleware = require('../config/passport'),
      userController = require('../api/controllers/users')

/* Create User */
router.post('/', userController.create);

/* Log user */
router.post('/auth', userController.authenticate);

/* List all users */
router.get('/', userController.getAll);

router.get('/profile', AuthMiddleware, userController.getProfile);
router.put('/', AuthMiddleware, userController.update);
router.delete('/', AuthMiddleware, userController.delete);


module.exports = router;
