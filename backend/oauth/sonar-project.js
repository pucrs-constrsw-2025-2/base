const scanner = require('sonarqube-scanner').scan;

scanner({
  serverUrl: 'http://localhost:9000',
  token: 'squ_eabe062c5c5ee235cdc4eed4cfa377fe7ed2909f',
  options: {
    'sonar.projectKey': 'constrsw-oauth',
    'sonar.projectName': 'ConstrSW OAuth Service',
    'sonar.projectVersion': '1.0',
    'sonar.sources': 'src',
    'sonar.tests': 'test',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.junit.reportPath': 'coverage/test-report.xml',
    'sonar.typescript.tsconfigPath': 'tsconfig.json'
  }
});