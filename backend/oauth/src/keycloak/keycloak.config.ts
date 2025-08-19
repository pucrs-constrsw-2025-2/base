import { registerAs } from '@nestjs/config';

export default registerAs('keycloak', () => ({
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  grantType: process.env.KEYCLOAK_GRANT_TYPE,
  internal: {
    protocol: process.env.KEYCLOAK_INTERNAL_PROTOCOL,
    host: process.env.KEYCLOAK_INTERNAL_HOST,
    apiPort: process.env.KEYCLOAK_INTERNAL_API_PORT,
    consolePort: process.env.KEYCLOAK_INTERNAL_CONSOLE_PORT,
  },
  external: {
    protocol: process.env.KEYCLOAK_EXTERNAL_PROTOCOL,
    host: process.env.KEYCLOAK_EXTERNAL_HOST,
    apiPort: process.env.KEYCLOAK_EXTERNAL_API_PORT,
    consolePort: process.env.KEYCLOAK_EXTERNAL_CONSOLE_PORT,
  },
}));
