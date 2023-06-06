import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "transactions" })
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: true,
  })
  from_defix!: string;

  @Column({
    nullable: true,
  })
  from_address!: string;

  @Column({
    nullable: true,
  })
  to_defix!: string;

  @Column({
    nullable: true,
  })
  to_address!: string;

  @Column({
    nullable: true,
  })
  coin!: string;

  @Column({
    nullable: true,
  })
  blockchain!: string;

  @Column({
    nullable: true,
    type: "float",
  })
  value!: number;

  @Column({
    nullable: true,
  })
  hash!: string;

  @Column({
    nullable: true,
  })
  tipo!: string;

  @Column({
    nullable: true,
  })
  date_year!: string;

  @Column({
    nullable: true,
  })
  date_month!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
