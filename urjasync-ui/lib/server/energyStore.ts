import { promises as fs } from 'fs';
import path from 'path';
import { EnergyCommandCenter } from '@/lib/types';
import { getFreshEnergyCommandCenter, initialEnergyCommandCenter } from '@/lib/data/energyCommandCenter';

const STORE_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(STORE_DIR, 'energy-state.json');

async function ensureStoreFile() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify(initialEnergyCommandCenter, null, 2), 'utf-8');
  }
}

export async function loadEnergyState(): Promise<EnergyCommandCenter> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_FILE, 'utf-8');
  return JSON.parse(raw) as EnergyCommandCenter;
}

export async function saveEnergyState(state: EnergyCommandCenter) {
  await ensureStoreFile();
  await fs.writeFile(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function updateEnergyState(
  updater: (state: EnergyCommandCenter) => EnergyCommandCenter,
): Promise<EnergyCommandCenter> {
  const current = await loadEnergyState();
  const next = updater({ ...current });
  await saveEnergyState(next);
  return next;
}

export async function resetEnergyState() {
  const baseline = getFreshEnergyCommandCenter();
  await saveEnergyState(baseline);
  return baseline;
}
