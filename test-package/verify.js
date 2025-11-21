/**
 * Verification script to ensure the built package can be imported without a bundler.
 * This script runs in a pure Node.js ES module environment.
 */

import { CodeInterpreter } from '@bedrock-agentcore/sdk/code-interpreter'

console.log('✓ Import from code-interpreter entry point successful')

// Verify CodeInterpreter can be instantiated
const interpreter = new CodeInterpreter({ region: 'us-east-1' })
console.log('✓ CodeInterpreter instantiation successful')

// Verify basic properties
if (interpreter.region !== 'us-east-1') {
  throw new Error('Region not set correctly')
}
console.log('✓ CodeInterpreter region property accessible')

if (interpreter.identifier !== 'aws.codeinterpreter.v1') {
  throw new Error('Identifier not set correctly')
}
console.log('✓ CodeInterpreter identifier property accessible')

if (interpreter.defaultSessionName !== 'default') {
  throw new Error('Default session name not set correctly')
}
console.log('✓ CodeInterpreter defaultSessionName property accessible')

// Verify methods exist
if (typeof interpreter.startSession !== 'function') {
  throw new Error('startSession method not found')
}
console.log('✓ startSession method exists')

if (typeof interpreter.stopSession !== 'function') {
  throw new Error('stopSession method not found')
}
console.log('✓ stopSession method exists')

if (typeof interpreter.listSessions !== 'function') {
  throw new Error('listSessions method not found')
}
console.log('✓ listSessions method exists')

if (typeof interpreter.executeCode !== 'function') {
  throw new Error('executeCode method not found')
}
console.log('✓ executeCode method exists')

if (typeof interpreter.executeCommand !== 'function') {
  throw new Error('executeCommand method not found')
}
console.log('✓ executeCommand method exists')

if (typeof interpreter.withSession !== 'function') {
  throw new Error('withSession method not found')
}
console.log('✓ withSession method exists')

console.log('\n✅ All verification checks passed!')
