import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Table,
  OneToOne,
  JoinTable,
  JoinColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
    unique: true,
  })
  defix_id!: string;

  @Column({
    nullable: true,
    unique: true,
  })
  email!: string;

  @Column({
    nullable: true,
    unique: true,
  })
  import_id!: string;

  @Column({
    nullable: true,
  })
  name!: string;

  @Column({
    nullable: true,
  })
  lastname!: string;

  @Column({
    nullable: true,
    default: true,
  })
  close_sessions!: boolean;

  @Column({
    nullable: true,
    default: true,
  })
  dosfa!: boolean;

  @Column({
    nullable: true,
  })
  legal_document!: string;

  @Column({
    nullable: true,
  })
  type_document!: string;

  @Column({
    nullable: true,
  })
  secret!: string;

  @Column({
    nullable: true,
  })
  flag_send!: boolean;

  @Column({
    nullable: true,
  })
  flag_receive!: boolean;

  @Column({
    nullable: true,
  })
  flag_dex!: boolean;

  @Column({
    nullable: true,
  })
  flag_fiat!: boolean;
}
