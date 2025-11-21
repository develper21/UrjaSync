import { promises as fs } from 'fs';
import path from 'path';
import { MicrogridSnapshot } from '@/lib/types';
import { getFreshMicrogridSnapshot, initialMicrogridSnapshot } from '@/lib/data/microgrid';

const STORE_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'microgrid-state.json');

async function ensureStoreFile() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify(initialMicrogridSnapshot, null, 2), 'utf-8');
  }
}

export async function loadMicrogridState(): Promise<MicrogridSnapshot> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_FILE, 'utf-8');
  return JSON.parse(raw) as MicrogridSnapshot;
}

export async function saveMicrogridState(state: MicrogridSnapshot) {
  await ensureStoreFile();
  await fs.writeFile(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function resetMicrogridState() {
  const baseline = getFreshMicrogridSnapshot();
  await saveMicrogridState(baseline);
  return baseline;
}
