const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema.
 * Passwords are stored as bcrypt hashes and excluded from
 * query results by default (select: false).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: hash the password with bcrypt whenever it has been modified.
 * This ensures we never store plain-text passwords.
 */
userSchema.pre('save', async function (next) {
  // Only re-hash if the password field was changed
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: compare a candidate plain-text password against
 * the stored bcrypt hash.
 *
 * @param {string} candidatePassword - The plain-text password to test
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
