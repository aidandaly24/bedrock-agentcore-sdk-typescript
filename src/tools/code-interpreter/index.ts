// Main client
export { CodeInterpreter } from './client.js'

// Types and interfaces
export type {
  CodeInterpreterConfig,
  StartSessionParams,
  SessionInfo,
  CodeLanguage,
  ExecuteCodeParams,
  ExecuteCodeResult,
  ExecuteCommandParams,
  ExecuteCommandResult,
  ReadFilesParams,
  FileContent,
  ReadFilesResult,
  WriteFilesParams,
  WriteFilesResult,
  ListFilesParams,
  FileInfo,
  ListFilesResult,
  RemoveFilesParams,
  RemoveFilesResult,
} from './types.js'

// Zod schemas for validation
export {
  CodeLanguageSchema,
  ExecuteCodeParamsSchema,
  ExecuteCommandParamsSchema,
  ReadFilesParamsSchema,
  WriteFilesParamsSchema,
  ListFilesParamsSchema,
  RemoveFilesParamsSchema,
  DEFAULT_IDENTIFIER,
  DEFAULT_TIMEOUT,
  DEFAULT_SESSION_NAME,
} from './types.js'
