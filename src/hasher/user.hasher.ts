import { HashId } from 'id-hasher';

export const UserHasher = new HashId({
  salt: 'STB_USER_ID',
  minHashLength: 5,
  prefix: 'U',
});
