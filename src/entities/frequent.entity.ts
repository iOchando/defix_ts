import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Frequent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.defix_id)
  user!: User;

  @Column({
    nullable: true,
  })
  frequent_user!: string;
}
