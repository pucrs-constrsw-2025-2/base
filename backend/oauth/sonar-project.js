const scanner = require('sonarqube-scanner').default || require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://localhost:9000',
    token: 'squ_10fb17eded43d6696849aecfcbe8669d59ade916',
    options: {
      'sonar.projectKey': 'constrsw-oauth',
      'sonar.projectName': 'ConstrSW OAuth Service',
      'sonar.projectVersion': '1.0',
      'sonar.sources': 'src',
      'sonar.tests': 'test',
      'sonar.inclusions': '**',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  () => {
    console.log('✔ Análise SonarQube finalizada com sucesso');
  }
);
