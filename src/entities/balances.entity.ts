import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Balances extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.defix_id)
  user!: User;

  @Column({
    nullable: true,
  })
  blockchain!: string;

  @Column({
    nullable: true,
  })
  coin!: string;

  @Column({
    nullable: true,
    type: "float",
    default: 0,
  })
  balance!: number;
}
