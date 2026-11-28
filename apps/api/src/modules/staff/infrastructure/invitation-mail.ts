import { PgBoss, fromPrisma } from "pg-boss";
import nodemailer from "nodemailer";
import { renderSchoolInvitationEmail } from "@soe/email";
import type { Database } from "../../../infrastructure/database/database.factory";
import type { Prisma } from "../../../infrastructure/database/generated/client";
import type { parseConfiguration } from "../../../shared/config";
import { InvitationMailUnavailable } from "../domain/staff";
import { InvitationSecret } from "./invitation-secret";

const QUEUE = "staff-invitation-email";
type DeliveryJob = {
  invitationId: string;
  organizationId: string;
  revision: number;
};
export class InvitationMail {
  readonly secrets: InvitationSecret;
  private readonly boss: PgBoss;
  private readonly transport: ReturnType<typeof nodemailer.createTransport>;
  constructor(
    private readonly db: Database,
    private readonly config: ReturnType<typeof parseConfiguration>,
    onError: () => void,
  ) {
    this.secrets = new InvitationSecret(config.AUTH_SECRET);
    this.boss = new PgBoss({
      connectionString: config.DATABASE_URL,
      migrate: false,
      max: 2,
    });
    this.boss.on("error", onError);
    this.transport = nodemailer.createTransport({
      host: config.INVITATION_SMTP_HOST,
      port: config.INVITATION_SMTP_PORT,
      secure: false,
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 5000,
      logger: false,
      debug: false,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }
  async onModuleInit() {
    if (this.config.INVITATION_MAIL_MODE === "disabled") return;
    await this.boss.start();
    await this.boss.createQueue(QUEUE, {
      retryLimit: 4,
      retryDelay: 5,
      retryBackoff: true,
      expireInSeconds: 30,
    });
  }
  async onApplicationBootstrap() {
    if (this.config.INVITATION_MAIL_MODE === "disabled") return;
    await this.boss.work<DeliveryJob>(
      QUEUE,
      { pollingIntervalSeconds: 0.5 },
      async (jobs) => {
        for (const job of jobs) await this.deliver(job.data);
      },
    );
  }
  async onModuleDestroy() {
    if (this.config.INVITATION_MAIL_MODE !== "disabled") await this.boss.stop();
    this.transport.close();
  }
  async enqueue(tx: Prisma.TransactionClient, job: DeliveryJob) {
    if (this.config.INVITATION_MAIL_MODE === "disabled")
      throw new InvitationMailUnavailable();
    await this.boss.send(QUEUE, job, {
      db: fromPrisma(tx),
      singletonKey: `${job.invitationId}:${job.revision}`,
    });
  }
  private async deliver(job: DeliveryJob) {
    const row = await this.db.schoolInvitation.findFirst({
      where: {
        id: job.invitationId,
        organizationId: job.organizationId,
        revision: job.revision,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        sentAt: null,
      },
      include: { organization: { select: { name: true, timeZone: true } } },
    });
    if (!row?.tokenCiphertext) return;
    try {
      const token = this.secrets.decrypt(
        row.id,
        row.revision,
        row.tokenCiphertext,
      );
      const link = `${this.config.AUTH_ORIGIN}/invitations/accept#${token}`;
      const roleLabels: Record<string, string> = {
        SCHOOL_ADMIN: "Administração escolar",
        DIRECTION: "Direção",
        COORDINATION: "Coordenação",
        EDUCATIONAL_GUIDANCE: "Orientação educacional",
        TUTOR: "Tutoria",
        TEACHER: "Professor",
        MONITOR: "Monitor",
      };
      const content = await renderSchoolInvitationEmail({
        recipientName: row.name,
        schoolName: row.organization.name,
        acceptUrl: link,
        roleLabels: row.roles.map((role) => roleLabels[role] ?? role),
        expiresAtLabel: `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: row.organization.timeZone }).format(row.expiresAt)} (horário da escola)`,
      });
      await this.transport.sendMail({
        from: { name: "SOE — convites", address: "convites@soe.example" },
        to: { name: row.name, address: row.email },
        ...content,
        messageId: `<invitation-${row.id}-${row.revision}@soe.example>`,
      });
      await this.db.schoolInvitation.updateMany({
        where: {
          id: row.id,
          organizationId: row.organizationId,
          revision: row.revision,
        },
        data: {
          deliveryStatus: "SENT",
          sentAt: new Date(),
          tokenCiphertext: null,
          deliveryAttempts: { increment: 1 },
        },
      });
    } catch {
      await this.db.schoolInvitation.updateMany({
        where: {
          id: row.id,
          organizationId: row.organizationId,
          revision: row.revision,
        },
        data: {
          deliveryStatus: row.deliveryAttempts + 1 >= 5 ? "FAILED" : "QUEUED",
          deliveryAttempts: { increment: 1 },
        },
      });
      throw new Error("Invitation email unavailable");
    }
  }
}
