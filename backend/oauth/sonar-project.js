const scanner = require('sonarqube-scanner').scan;
console.log('Iniciando análise do SonarQube...');
console.log(process.env.SONAR_TOKEN);
scanner({
  serverUrl: process.env.SONARQUBE_URL,
  token: process.env.SONAR_TOKEN,
  options: {
    'sonar.projectKey': 'constrsw-oauth',
    'sonar.projectName': 'ConstrSW OAuth Service',
    'sonar.projectVersion': '1.0',
    'sonar.sources': 'src',
    'sonar.tests': 'test',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.testExecutionReportPaths': 'test-report.xml'
  }
});