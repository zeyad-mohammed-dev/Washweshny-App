import mongoose from 'mongoose';
export const genderEnum = { male: 'male', female: 'female' };
export const roleEnum = { admin: 'admin', user: 'user' };
export const providerEnum = { system: 'system', google: 'google' };

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [25, 'First name must be at most 25 characters long'],
    },
    lastName: {
      type: String,
      required: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
      maxlength: [25, 'Last name must be at most 25 characters long'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },

    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.male,
    },

    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },

    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },

    confirmEmail: Date,
    picture: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema
  .virtual('fullName')
  .get(function () {
    return this.firstName + ' ' + this.lastName;
  })
  .set(function (value) {
    const [firstName, lastName] = value?.split(' ') || [];
    this.firstName = firstName;
    this.lastName = lastName;
  });

export const UserModel =
  mongoose.model.User || mongoose.model('User', userSchema);

UserModel.syncIndexes();
