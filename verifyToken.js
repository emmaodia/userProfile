const jwt = require('jsonwebtoken');

//This Middleware code ensures that ONLY a logged in User can access Customer Profile
module.exports = (req, res, next) => {
  try{
    let queryToken = req.query.token;
    queryToken = queryToken.substring(1);

    console.log(queryToken);
    const decoded = jwt.verify(queryToken, process.env.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed from JWT'
    });
  }
};
