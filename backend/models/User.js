const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    defaultValue: () => {
      // Generate a default userId if not provided
      const timestamp = Date.now().toString().slice(-6);
      return `USR${timestamp}`;
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roles: {
    type: DataTypes.JSONB,
    defaultValue: ['production'],
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  department: {
    type: DataTypes.STRING(100)
  },
  designation: {
    type: DataTypes.STRING(100)
  },
  employeeCode: {
    type: DataTypes.STRING(20)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  profilePicture: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Job tracking preferences
  skillSet: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  workloadCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      console.log('🔨 User beforeCreate hook triggered for:', user.username);
      
      // ALWAYS generate userId if not provided
      if (!user.userId) {
        try {
          // Count existing users and increment
          const userCount = await User.count();
          let nextNumber = userCount + 1;
          
          // Check if this number is already taken (in case of manual assignments)
          let isUnique = false;
          let attempts = 0;
          while (!isUnique && attempts < 10) {
            const testUserId = `USR${nextNumber.toString().padStart(4, '0')}`;
            const existingUser = await User.findOne({ where: { userId: testUserId } });
            if (!existingUser) {
              user.userId = testUserId;
              isUnique = true;
              console.log('🆔 Generated userId:', testUserId);
            } else {
              nextNumber++;
              attempts++;
            }
          }
          
          // If still no unique ID found, use timestamp
          if (!isUnique) {
            const timestamp = Date.now().toString().slice(-6);
            user.userId = `USR${timestamp}`;
            console.log('🆔 Timestamp-based userId:', user.userId);
          }
        } catch (error) {
          // Fallback to timestamp-based ID if there's an error
          const timestamp = Date.now().toString().slice(-6);
          user.userId = `USR${timestamp}`;
          console.log('🆔 Error fallback userId:', user.userId);
          console.error('⚠️ UserId generation error:', error.message);
        }
      }
      
      // Ensure userId is never null
      if (!user.userId) {
        const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
        user.userId = `USR${randomId}`;
        console.log('🆔 Random fallback userId:', user.userId);
      }
      
      // Hash password
      if (user.password) {
        try {
          console.log('🔐 Hashing password for user:', user.username);
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
          console.log('✅ Password hashed successfully');
        } catch (hashError) {
          console.error('💥 Password hashing error:', hashError);
          throw new Error('Failed to hash password: ' + hashError.message);
        }
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        try {
          console.log('🔐 Updating password hash for user:', user.username);
          const saltRounds = 10;
          user.password = await bcrypt.hash(user.password, saltRounds);
          console.log('✅ Password hash updated successfully');
        } catch (hashError) {
          console.error('💥 Password hash update error:', hashError);
          throw new Error('Failed to update password hash: ' + hashError.message);
        }
      }
    }
  }
});

// Instance method to compare password using bcrypt
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔑 Comparing password for user:', this.username);
    
    if (!candidatePassword || !this.password) {
      console.log('❌ Missing password or candidate password');
      return false;
    }

    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔑 Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('💥 Password comparison error:', {
      message: error.message,
      username: this.username,
      hasPassword: !!this.password,
      hasCandidatePassword: !!candidatePassword
    });
    return false;
  }
};

// Remove password from JSON output
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
