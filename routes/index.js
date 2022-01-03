const router = require('express').Router();

router.get('/', (req, res) => res.json({
  status: 'success',
  message: 'Connection established',
}));

module.exports = router;
