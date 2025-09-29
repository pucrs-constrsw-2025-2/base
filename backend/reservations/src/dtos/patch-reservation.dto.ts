import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';

export class PatchReservationDto extends PartialType(CreateReservationDto) {}
