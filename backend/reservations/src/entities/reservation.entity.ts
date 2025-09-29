import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuthorizedUser } from './authorized-user.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  reservation_id: string;

  @Column({ type: 'date' })
  initial_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  details?: string;

  @OneToMany(() => AuthorizedUser, (au) => au.reservation, { cascade: true, eager: true })
  authorizedUsers?: AuthorizedUser[];

  @Column({ type: 'uuid', nullable: true })
  resource_id?: string;

  @Column({ type: 'uuid', nullable: true })
  lesson_id?: string;
}
