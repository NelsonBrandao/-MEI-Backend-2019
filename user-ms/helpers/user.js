const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//
// bcrypt.compareSync(password, hash)

// jwt.sign({ userId: user._id }, 'SECRET');
// jwt.verify(token, 'SECRET');

const handleErrors = (ctx) => {
  ctx.status = 401;
  ctx.body = { error: 'Unauthorized' };
};

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);

  return bcrypt.hashSync(password, salt);
};

const verifyHash = (hash, password) => {
  return bcrypt.compareSync(password, hash);
};

const createToken = (user) => {
  return jwt.sign({ email: user.email, userId: user._id }, 'SECRET');
};

const verifyToken = (header) => {
  if (!header) {
    return false;
  }

  const parts = header.split(' ');

  if (parts.length !== 2) {
    return false;
  }

  return jwt.verify(parts[1], 'SECRET');
}

module.exports = {
  verifyHash,
  createToken,
  verifyToken,
  handleErrors,
  hashPassword,
};
