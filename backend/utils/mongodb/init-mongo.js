// Script de inicialização do MongoDB
// Cria databases para cada serviço e usuários correspondentes

// Cria usuário admin para o banco constrsw
// Necessário para healthcheck e autenticação root

db = db.getSiblingDB('constrsw');
db.createUser({
  user: 'admin',
  pwd: 'a12345678',
  roles: [
    { role: 'root', db: 'admin' }
  ]
});

// Para o serviço classes
db = db.getSiblingDB('classes');
// Cria uma coleção para garantir que o database seja criado
db.createCollection('classes');
// Cria usuário para o serviço classes
db.createUser({
  user: 'classes',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'classes' }
  ]
});

// Para o serviço courses
db = db.getSiblingDB('courses');
db.createCollection('courses');
// Cria usuário para o serviço courses
db.createUser({
  user: 'courses',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'courses' }
  ]
});

// Para o serviço lessons
db = db.getSiblingDB('lessons');
db.createCollection('lessons');
// Cria usuário para o serviço lessons
db.createUser({
  user: 'lessons',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'lessons' }
  ]
});

// Para o serviço professors
db = db.getSiblingDB('professors');
db.createCollection('professors');
// Cria usuário para o serviço professors
db.createUser({
  user: 'professors',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'professors' }
  ]
});

// Para o serviço reservations
db = db.getSiblingDB('reservations');
db.createCollection('reservations');
// Cria usuário para o serviço reservations
db.createUser({
  user: 'reservations',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'reservations' }
  ]
});

// Para o serviço resources
db = db.getSiblingDB('resources');
db.createCollection('resources');
// Cria usuário para o serviço resources
db.createUser({
  user: 'resources',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'resources' }
  ]
});

// Para o serviço rooms
db = db.getSiblingDB('rooms');
db.createCollection('rooms');
// Cria usuário para o serviço rooms
db.createUser({
  user: 'rooms',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'rooms' }
  ]
});

// Para o serviço students
db = db.getSiblingDB('students');
db.createCollection('students');
// Cria usuário para o serviço students
db.createUser({
  user: 'students',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'students' }
  ]
});

// Para o serviço employees
db = db.getSiblingDB('Employees');
db.createCollection('Employees');
db.createCollection('Tasks');
// Cria usuário para o serviço employees
db.createUser({
  user: 'employees',
  pwd: 'a12345678',
  roles: [
    { role: 'readWrite', db: 'Employees' }
  ]
});

print('Todos os databases e usuários foram criados com sucesso!');
print('Databases criados: classes, courses, lessons, professors, reservations, resources, rooms, students, Employees');
print('Usuários criados: classes, courses, lessons, professors, reservations, resources, rooms, students, employees');
print('Senha padrão para todos os usuários: a12345678');
