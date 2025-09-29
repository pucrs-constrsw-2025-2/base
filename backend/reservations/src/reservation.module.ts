import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { AuthorizedUser } from './entities/authorized-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, AuthorizedUser])],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
