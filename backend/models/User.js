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
    unique: true
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
      // Generate unique user ID if not provided
      if (!user.userId) {
        try {
          // Count existing users and increment
          const userCount = await User.count();
          let nextNumber = userCount + 1;
          
          // Check if this number is already taken (in case of manual assignments)
          let isUnique = false;
          while (!isUnique) {
            const testUserId = `USR${nextNumber.toString().padStart(4, '0')}`;
            const existingUser = await User.findOne({ where: { userId: testUserId } });
            if (!existingUser) {
              user.userId = testUserId;
              isUnique = true;
            } else {
              nextNumber++;
            }
          }
        } catch (error) {
          // Fallback to timestamp-based ID if there's an error
          const timestamp = Date.now().toString().slice(-4);
          user.userId = `USR${timestamp}`;
        }
      }
      
      // Hash password
      if (user.password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Instance method to compare password using bcrypt
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
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
