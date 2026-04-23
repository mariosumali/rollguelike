import type { ShopService } from './types';

const services = new Map<string, ShopService>();

export function registerShopService(service: ShopService): void {
  if (services.has(service.id)) {
    throw new Error(`Duplicate shop service id: ${service.id}`);
  }
  services.set(service.id, service);
}

export function getShopServices(): ShopService[] {
  return Array.from(services.values());
}

export function getShopService(id: string): ShopService | undefined {
  return services.get(id);
}

let initialized = false;

const modules = import.meta.glob<{ default: ShopService }>('./services/*.ts', {
  eager: true,
});

export function initShopServiceContent(): void {
  if (initialized) return;
  initialized = true;
  for (const mod of Object.values(modules)) {
    const svc = (mod as { default?: ShopService }).default;
    if (svc) registerShopService(svc);
  }
}
