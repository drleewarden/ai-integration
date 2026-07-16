const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  // Don't pick up duplicate suites from Claude Code worktrees
  testPathIgnorePatterns: ['/node_modules/', '/.claude/', '/.next/'],
}

module.exports = createJestConfig(customJestConfig)