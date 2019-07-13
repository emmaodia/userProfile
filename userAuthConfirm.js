const jwt = require('jsonwebtoken');

//This Middleware code ensures that ONLY a logged in User can access Customer Profile
module.exports = (req, res, next) => {
  try{
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed from JWT'
    });
  }
};
