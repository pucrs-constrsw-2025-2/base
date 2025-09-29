import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto, AuthorizedUserDto } from './dtos/create-reservation.dto';
import { UpdateReservationDto } from './dtos/update-reservation.dto';
import { PatchReservationDto } from './dtos/patch-reservation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova reserva' })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso.' })
  @ApiBody({ type: CreateReservationDto })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas (com suporte a query string)' })
  @ApiResponse({ status: 200, description: 'Lista de reservas.' })
  @ApiQuery({ name: 'query', required: false, description: 'Filtros de busca (query string simples ou complexa)' })
  findAll(@Query() query: any) {
    return this.reservationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar reserva por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva encontrada.' })
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar totalmente uma reserva' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiBody({ type: UpdateReservationDto })
  @ApiResponse({ status: 200, description: 'Reserva atualizada.' })
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar parcialmente uma reserva' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiBody({ type: PatchReservationDto })
  @ApiResponse({ status: 200, description: 'Reserva parcialmente atualizada.' })
  patch(@Param('id') id: string, @Body() patchReservationDto: PatchReservationDto) {
    return this.reservationService.patch(id, patchReservationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma reserva' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva removida.' })
  remove(@Param('id') id: string) {
    return this.reservationService.remove(id);
  }

  // Collection endpoints for authorizedUsers
  @Post(':id/authorizedUsers')
  @ApiOperation({ summary: 'Adicionar usuário autorizado à reserva' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiBody({ type: AuthorizedUserDto })
  @ApiResponse({ status: 201, description: 'Usuário autorizado adicionado.' })
  addAuthorizedUser(@Param('id') reservationId: string, @Body() body: AuthorizedUserDto) {
    return this.reservationService.addAuthorizedUser(reservationId, body);
  }

  @Get(':id/authorizedUsers')
  @ApiOperation({ summary: 'Listar usuários autorizados de uma reserva' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Lista de usuários autorizados.' })
  getAuthorizedUsers(@Param('id') reservationId: string) {
    return this.reservationService.getAuthorizedUsers(reservationId);
  }

  @Get(':id/authorizedUsers/:userId')
  @ApiOperation({ summary: 'Buscar usuário autorizado por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiParam({ name: 'userId', type: 'string', description: 'ID do usuário autorizado' })
  @ApiResponse({ status: 200, description: 'Usuário autorizado encontrado.' })
  getAuthorizedUser(@Param('id') reservationId: string, @Param('userId') userId: string) {
    return this.reservationService.getAuthorizedUser(reservationId, userId);
  }

  @Put(':id/authorizedUsers/:userId')
  @ApiOperation({ summary: 'Atualizar totalmente usuário autorizado' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiParam({ name: 'userId', type: 'string', description: 'ID do usuário autorizado' })
  @ApiBody({ type: AuthorizedUserDto })
  @ApiResponse({ status: 200, description: 'Usuário autorizado atualizado.' })
  updateAuthorizedUser(@Param('id') reservationId: string, @Param('userId') userId: string, @Body() body: AuthorizedUserDto) {
    return this.reservationService.updateAuthorizedUser(reservationId, userId, body);
  }

  @Patch(':id/authorizedUsers/:userId')
  @ApiOperation({ summary: 'Atualizar parcialmente usuário autorizado' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiParam({ name: 'userId', type: 'string', description: 'ID do usuário autorizado' })
  @ApiBody({ type: AuthorizedUserDto })
  @ApiResponse({ status: 200, description: 'Usuário autorizado parcialmente atualizado.' })
  patchAuthorizedUser(@Param('id') reservationId: string, @Param('userId') userId: string, @Body() body: Partial<AuthorizedUserDto>) {
    return this.reservationService.patchAuthorizedUser(reservationId, userId, body);
  }

  @Delete(':id/authorizedUsers/:userId')
  @ApiOperation({ summary: 'Remover usuário autorizado da reserva' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID da reserva' })
  @ApiParam({ name: 'userId', type: 'string', description: 'ID do usuário autorizado' })
  @ApiResponse({ status: 200, description: 'Usuário autorizado removido.' })
  removeAuthorizedUser(@Param('id') reservationId: string, @Param('userId') userId: string) {
    return this.reservationService.removeAuthorizedUser(reservationId, userId);
  }
}
