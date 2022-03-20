import { ApiProperty } from '@nestjs/swagger';
import {
  AllowNull,
  AutoIncrement,
  Column,
  Comment,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';

export type LogType = 'info' | 'error' | 'log' | 'system';
export const LogTypes: LogType[] = ['info', 'error', 'log', 'system'];

@Table({})
export class Log extends Model<Log> {
  @PrimaryKey
  @AutoIncrement
  @ApiProperty()
  @Comment('data primary key')
  @Column(DataType.INTEGER)
  public id?: number;

  @AllowNull(false)
  @Comment('Pod Name')
  @ApiProperty()
  @Column(DataType.STRING)
  public podName?: string;

  @AllowNull(false)
  @Comment('server version')
  @ApiProperty()
  @Column(DataType.STRING)
  public version?: string;

  @AllowNull(true)
  @Comment('Affected user ID')
  @ForeignKey(() => User)
  @ApiProperty()
  @Column(DataType.INTEGER)
  public targetUserId?: number;

  @AllowNull(true)
  @Comment('User ID that initiated the action')
  @ForeignKey(() => User)
  @ApiProperty()
  @Column(DataType.INTEGER)
  public operatorUserId?: number;

  // @AllowNull(true)
  // @Comment('關聯的機構編號')
  // @ForeignKey(() => Agency)
  // @ApiProperty()
  // @Column(DataType.INTEGER)
  // public agencyId?: number;

  // @AllowNull(true)
  // @Comment('關聯的銀行帳戶編號')
  // @ForeignKey(() => BankAccount)
  // @ApiProperty()
  // @Column(DataType.INTEGER)
  // public bankAccountId?: number;

  @Default('log')
  @Comment('type')
  @ApiProperty()
  @Column(DataType.ENUM(...LogTypes))
  public type?: LogType;

  @Comment('log message')
  @ApiProperty()
  @Column(DataType.TEXT)
  public message?: string;

  @CreatedAt
  @ApiProperty()
  @AllowNull(false)
  @Comment('data creation time')
  @Column(DataType.DATE)
  public createdAt?: Date;
}
