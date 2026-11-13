export interface EnvironmentProbe {
  read(): Promise<string>;
  ready(): Promise<boolean>;
}

export class EnvironmentUnavailable extends Error {}

export class ReadEnvironment {
  constructor(private readonly probe: EnvironmentProbe) {}

  async execute() {
    try {
      return { status: "ok" as const, sample: await this.probe.read() };
    } catch {
      throw new EnvironmentUnavailable("Synthetic environment unavailable");
    }
  }
}
