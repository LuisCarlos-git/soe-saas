import { GenericContainer, Wait } from "testcontainers";

export async function startTestMailpit() {
  const container = await new GenericContainer("axllent/mailpit:v1.34.0")
    .withExposedPorts(1025, 8025)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();
  return {
    host: container.getHost(),
    smtpPort: container.getMappedPort(1025),
    baseUrl: `http://${container.getHost()}:${container.getMappedPort(8025)}`,
    stop: () => container.stop(),
  };
}
