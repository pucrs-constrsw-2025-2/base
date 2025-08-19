import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UserDto } from 'src/users/dto/user.dto';

export interface IKeycloakAdapter {
  login(loginDto: LoginDto): Promise<LoginResponseDto>;
  createUser(createUserDto: CreateUserDto): Promise<{ id: string }>;
  findAllUsers(): Promise<UserDto[]>;
  findUserById(id: string): Promise<UserDto>;
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<void>;
  deleteUser(id: string): Promise<void>;
  validateToken(token: string): Promise<boolean>;
}
