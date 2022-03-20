import { ModelCtor } from 'sequelize-typescript';
import { Log } from '../log/log.model';
import { User } from '../user/user.model';

export const Models: ModelCtor[] = [User, Log];
