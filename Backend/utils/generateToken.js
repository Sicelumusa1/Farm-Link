// Helper function to generate, send and save JWT in httpOnly cookie for authentication.

const sendToken = (user, statusCode, res) => {
  // Generate JSON WEB TOKEN
  const token = user.getJwtToken();
  // Options for cookie
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRERY_TIME * 24*60*60*1000),
    httpOnly : true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'None'
  }

  res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success : true,
        token : token,
        role: user.role,
      })
}

module.exports = sendToken;
