import { execa } from 'execa';

export async function runCommand(cmd: string, args: string[] = []) {
  try {
    const { stdout } = await execa(cmd, args);
    return stdout.trim();
  } catch (err) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}\n${err}`);
  }
}
