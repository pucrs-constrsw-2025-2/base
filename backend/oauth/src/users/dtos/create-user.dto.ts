export class CreateUserDto {
  username!: string;
  password!: string;
  'first-name'?: string;
  'last-name'?: string;
}
