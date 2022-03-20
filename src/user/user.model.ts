import { ApiProperty } from '@nestjs/swagger';
import {
  AllowNull,
  AutoIncrement,
  Column,
  Comment,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
@Table({ timestamps: true })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @ApiProperty()
  @Comment('data primary key')
  @Column(DataType.INTEGER)
  public id?: number;

  @Comment('Facebook User Id')
  @ApiProperty()
  @AllowNull(false)
  @Unique('facebookUserId')
  @Column(DataType.STRING)
  public facebookUserId?: string;

  @Comment('LINE User Id')
  @ApiProperty()
  @AllowNull(false)
  @Unique('lineUserId')
  @Column(DataType.STRING)
  public lineUserId?: string;

  @Comment('email')
  @ApiProperty()
  @AllowNull(false)
  @Column(DataType.STRING)
  public email?: string;

  @Comment('username')
  @ApiProperty()
  @AllowNull(false)
  @Column(DataType.STRING)
  public name?: string;

  @Comment('user thumbnail url')
  @ApiProperty()
  @Column(DataType.TEXT)
  public thumbnailUrl?: string;

  @Comment('birthday')
  @ApiProperty()
  @Column(DataType.DATEONLY)
  public birthday?: Date | string;

  @Comment('gender')
  @ApiProperty()
  @Column(DataType.STRING)
  public gender?: string;

  // @ApiProperty()
  // @AllowNull(true)
  // @Comment('指定銀行帳戶')
  // @ForeignKey(() => BankAccount)
  // @Column(DataType.INTEGER)
  // public bankAccountId?: number;

  // @ApiProperty()
  // @HasOne(() => BankAccount, 'bankAccountId')
  // public bankAccount?: BankAccount;

  // @ApiProperty()
  // @HasMany(() => BankAccount, 'creatorUserId')
  // public bankAccounts?: BankAccount[];
}
