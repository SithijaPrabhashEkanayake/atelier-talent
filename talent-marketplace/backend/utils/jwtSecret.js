const DEV_ONLY_SECRET = 'super_secret_jwt_key_change_me_in_production';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
  }
  return DEV_ONLY_SECRET;
};

module.exports = { getJwtSecret };
