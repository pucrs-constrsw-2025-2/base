import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class AuthorizedUser {
  @PrimaryGeneratedColumn('uuid')
  authorized_user_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.authorizedUsers, { onDelete: 'CASCADE' })
  reservation: Reservation;
}
