export class RoleDto {
  id?: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
  attributes?: Record<string, any>;
}
