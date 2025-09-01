require('dotenv').config();
const scanner = require('sonarqube-scanner').default || require('sonarqube-scanner');

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL,
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': process.env.SONAR_PROJECT_KEY,
      'sonar.projectName': 'ConstrSW OAuth Service',
      'sonar.projectVersion': '1.0',
      'sonar.sources': 'src',
      'sonar.tests': 'test',
      'sonar.inclusions': '**',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.exclusions': 'test/**,**/*.spec.ts,**/*.test.ts,**/*.module.ts,**/*.bootstrap.ts',    },
  },
  () => {
    console.log('✔ Análise SonarQube finalizada');
  }
);
