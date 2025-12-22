import { KillSwitchConfig } from '../../types';

const CONFIG_URL = '/config.json'; // In public folder

export async function checkKillSwitch(): Promise<KillSwitchConfig> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const response = await fetch(CONFIG_URL, { 
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fail-open for missing config, but warn
      console.warn("Could not fetch security config. Proceeding with caution.");
      return { kill_switch_active: false, min_client_version: '0.0.0' };
    }

    const config: KillSwitchConfig = await response.json();
    return config;

  } catch (error) {
    console.error("Security config check failed:", error);
    // Decision: Fail-open to ensure availability if CDN is down, 
    // unless strictly required to be fail-closed.
    return { kill_switch_active: false, min_client_version: '0.0.0' };
  }
}
