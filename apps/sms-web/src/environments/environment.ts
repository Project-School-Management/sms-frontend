export const environment = {
  production:     false,
  apiUrl:         'http://localhost:8080/api/v1',
  keycloakUrl:    'http://localhost:8180',
  keycloakRealm:  'sms',
  keycloakClient: 'sms-frontend',
  wsUrl:          'http://localhost:8080/ws',
  minioUrl:       'http://localhost:9000',
  // Dev mode: bypass Keycloak if not running
  skipKeycloak:   true,
};
