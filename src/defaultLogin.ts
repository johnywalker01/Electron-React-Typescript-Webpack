import {LoginModel} from './LoginScreen'
import messages from './LoginScreen/messages'  // tslint:disable-line:no-unused-variable

// Specify default credentials below to login automatically
// Ignore changes to this file in your local environment with...
// git update-index --assume-unchanged src/defaultCredentials.ts
export default {
  username: process.env.VXWEB_USERNAME || '',
  usernameErrorMessage: null,
  password: process.env.VXWEB_PASSWORD || '',
  passwordErrorMessage: null,
} as LoginModel
