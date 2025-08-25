import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { UpdateRoleDto } from 'src/roles/dto/update-role.dto';
import { RoleDto } from 'src/roles/dto/role.dto';
import { UpdatePasswordDto } from 'src/users/dto/update-password.dto';

export interface IKeycloakAdapter {
  login(loginDto: LoginDto): Promise<LoginResponseDto>;
  createUser(createUserDto: CreateUserDto): Promise<{ id: string }>;
  findAllUsers(): Promise<UserDto[]>;
  findUserById(id: string): Promise<UserDto>;
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<void>;
  deleteUser(id: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
  updatePassword(id: string, updatePassowrdDto: UpdatePasswordDto);

  // Role management methods
  createRole(createRoleDto: CreateRoleDto): Promise<RoleDto>;
  findAllRoles(): Promise<RoleDto[]>;
  findRoleByName(name: string): Promise<RoleDto>;
  updateRole(name: string, updateRoleDto: UpdateRoleDto): Promise<void>;
  deleteRole(name: string): Promise<void>;
  assignRoleToUser(roleName: string, userId: string): Promise<void>;
  removeRoleFromUser(roleName: string, userId: string): Promise<void>;
}
