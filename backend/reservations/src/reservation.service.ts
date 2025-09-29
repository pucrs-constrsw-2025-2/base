import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual, Not } from 'typeorm';
import { CreateReservationDto, AuthorizedUserDto } from './dtos/create-reservation.dto';
import { UpdateReservationDto } from './dtos/update-reservation.dto';
import { PatchReservationDto } from './dtos/patch-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { AuthorizedUser } from './entities/authorized-user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    @InjectRepository(AuthorizedUser)
    private authorizedUserRepo: Repository<AuthorizedUser>,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const reservation = this.reservationRepo.create({
      ...createReservationDto,
      authorizedUsers: createReservationDto.authorizedUsers?.map((au) => this.authorizedUserRepo.create(au)),
    });
    await this.reservationRepo.save(reservation);
    return reservation;
  }

  async findAll(query: Record<string, string>) {
    // Suporte a query simples/complexa
    const where: FindOptionsWhere<Reservation> = {};
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];
        if (typeof value === 'string' && value.startsWith('{')) {
          // Operador complexo
          const match = value.match(/^\{(\w+)\}(.*)$/);
          if (match) {
            const [, op, val] = match;
            switch (op) {
              case 'neq':
                where[key] = Not(val);
                break;
              case 'gt':
                where[key] = MoreThan(val);
                break;
              case 'gteq':
                where[key] = MoreThanOrEqual(val);
                break;
              case 'lt':
                where[key] = LessThan(val);
                break;
              case 'lteq':
                where[key] = LessThanOrEqual(val);
                break;
              case 'like':
                where[key] = ILike(val);
                break;
              default:
                break;
            }
          }
        } else {
          where[key] = value;
        }
      }
    }
    return this.reservationRepo.find({ where });
  }

  async findOne(id: string) {
    const reservation = await this.reservationRepo.findOne({ where: { reservation_id: id } });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.reservationRepo.findOne({ where: { reservation_id: id } });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    Object.assign(reservation, updateReservationDto);
    await this.reservationRepo.save(reservation);
    return reservation;
  }

  async patch(id: string, patchReservationDto: PatchReservationDto) {
    const reservation = await this.reservationRepo.findOne({ where: { reservation_id: id } });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    Object.assign(reservation, patchReservationDto);
    await this.reservationRepo.save(reservation);
    return reservation;
  }

  async remove(id: string) {
    const reservation = await this.reservationRepo.findOne({ where: { reservation_id: id } });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    await this.reservationRepo.remove(reservation);
    return { message: 'Reserva removida' };
  }

  // Métodos para authorizedUsers
  async addAuthorizedUser(reservationId: string, body: AuthorizedUserDto) {
    const reservation = await this.reservationRepo.findOne({ where: { reservation_id: reservationId } });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    const authorizedUser = this.authorizedUserRepo.create({ ...body, reservation });
    await this.authorizedUserRepo.save(authorizedUser);
    return authorizedUser;
  }

  async getAuthorizedUsers(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({ where: { reservation_id: reservationId }, relations: ['authorizedUsers'] });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    return reservation.authorizedUsers;
  }

  async getAuthorizedUser(reservationId: string, userId: string) {
    const authorizedUser = await this.authorizedUserRepo.findOne({ where: { reservation: { reservation_id: reservationId }, authorized_user_id: userId }, relations: ['reservation'] });
    if (!authorizedUser) throw new NotFoundException('Usuário autorizado não encontrado');
    return authorizedUser;
  }

  async updateAuthorizedUser(reservationId: string, userId: string, body: Partial<AuthorizedUserDto>) {
    const authorizedUser = await this.authorizedUserRepo.findOne({ where: { reservation: { reservation_id: reservationId }, authorized_user_id: userId }, relations: ['reservation'] });
    if (!authorizedUser) throw new NotFoundException('Usuário autorizado não encontrado');
    Object.assign(authorizedUser, body);
    await this.authorizedUserRepo.save(authorizedUser);
    return authorizedUser;
  }

  async patchAuthorizedUser(reservationId: string, userId: string, body: Partial<AuthorizedUserDto>) {
    return this.updateAuthorizedUser(reservationId, userId, body);
  }

  async removeAuthorizedUser(reservationId: string, userId: string) {
    const authorizedUser = await this.authorizedUserRepo.findOne({ where: { reservation: { reservation_id: reservationId }, authorized_user_id: userId }, relations: ['reservation'] });
    if (!authorizedUser) throw new NotFoundException('Usuário autorizado não encontrado');
    await this.authorizedUserRepo.remove(authorizedUser);
    return { message: 'Usuário autorizado removido' };
  }
}
