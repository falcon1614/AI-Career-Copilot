import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);
const TIMEOUT_MS = 5000;

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  timedOut: boolean;
}

export async function executeCode(
  code: string,
  language: string,
  input: string
): Promise<ExecutionResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-'));
  const startTime = Date.now();

  try {
    let filename: string;
    let runCmd: string;
    let compileCmd: string | null = null;

    if (language === 'python') {
      filename = path.join(tmpDir, 'solution.py');
      fs.writeFileSync(filename, code);
      runCmd = `python3 "${filename}"`;

    } else if (language === 'javascript') {
      filename = path.join(tmpDir, 'solution.js');
      fs.writeFileSync(filename, code);
      runCmd = `node "${filename}"`;

    } else if (language === 'cpp') {
      filename = path.join(tmpDir, 'solution.cpp');
      const binary = path.join(tmpDir, 'solution');
      fs.writeFileSync(filename, code);
      compileCmd = `g++ -O2 -o "${binary}" "${filename}"`;
      runCmd = `"${binary}"`;

    } else {
      return { stdout: '', stderr: `Unsupported language: ${language}`, exitCode: 1, executionTime: 0, timedOut: false };
    }

    // Compile first if needed
    if (compileCmd) {
      try {
        await execAsync(compileCmd, { timeout: 10000 });
      } catch (err: any) {
        return {
          stdout: '',
          stderr: `Compilation error:\n${err.stderr || err.message}`,
          exitCode: 1,
          executionTime: Date.now() - startTime,
          timedOut: false,
        };
      }
    }

    // Write input
    const inputFile = path.join(tmpDir, 'input.txt');
    fs.writeFileSync(inputFile, input);

    try {
      const { stdout, stderr } = await execAsync(
        `${runCmd} < "${inputFile}"`,
        { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 }
      );
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        executionTime: Date.now() - startTime,
        timedOut: false,
      };
    } catch (err: any) {
      const timedOut = err.killed || err.signal === 'SIGTERM';
      return {
        stdout: err.stdout?.trim() || '',
        stderr: timedOut ? 'Time limit exceeded (5s)' : (err.stderr?.trim() || err.message),
        exitCode: err.code || 1,
        executionTime: Date.now() - startTime,
        timedOut,
      };
    }
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true }); } catch {}
  }
}

export function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, '\n').replace(/\s+$/gm, '');
}

export function compareOutputs(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
