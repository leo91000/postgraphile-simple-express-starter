const packageJson = require(`${__dirname}/package.json`)
const dotenv = require('dotenv')
dotenv.config({ path: `${__dirname}/.env` })

process.NODE_ENV = 'test'

module.exports = {
  testEnvironment: "node",
  testMatch: [`${__dirname}/__tests__/**/*.test.[jt]s?(x)`],
  moduleFileExtensions: ["js", "json", "ts", "node"],
  roots: [`${__dirname}`],
  rootDir: __dirname,
  name: packageJson.name,
  displayName: packageJson.name,
};
