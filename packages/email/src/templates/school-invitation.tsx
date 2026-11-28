import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

export type SchoolInvitationEmailProps = {
  recipientName: string;
  schoolName: string;
  acceptUrl: string;
  expiresAtLabel: string;
  roleLabels: readonly string[];
};

export function SchoolInvitationEmail({
  recipientName,
  schoolName,
  acceptUrl,
  expiresAtLabel,
  roleLabels,
}: SchoolInvitationEmailProps) {
  return (
    <Html lang="pt-BR">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                primary: "#0f766e",
                ink: "#0f172a",
                muted: "#475569",
                rule: "#e2e8f0",
                canvas: "#f8fafc",
              },
            },
          },
        }}
      >
        <Head />
        <Preview>
          Você recebeu um convite para participar de {schoolName} no SOE.
        </Preview>
        <Body
          className="m-0 bg-canvas px-4 py-8"
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <Container className="mx-auto max-w-[560px] rounded-xl border border-solid border-rule bg-white p-6 sm:p-8">
            <Text className="m-0 text-lg font-semibold text-primary">SOE</Text>
            <Heading
              as="h1"
              className="mb-6 mt-6 text-2xl font-semibold leading-8 text-ink"
            >
              Convite para a equipe escolar
            </Heading>
            <Text className="m-0 text-base leading-6 text-ink">
              Olá, {recipientName}.
            </Text>
            <Text className="mb-6 mt-3 text-base leading-6 text-muted">
              Você recebeu um convite para participar de{" "}
              <strong className="text-ink">{schoolName}</strong> no SOE.
            </Text>
            <Section className="mb-6 rounded-lg bg-canvas p-4">
              <Text className="m-0 text-sm leading-5 text-muted">
                Papéis no convite:{" "}
                <strong className="text-ink">{roleLabels.join(", ")}</strong>.
              </Text>
            </Section>
            <Button
              href={acceptUrl}
              className="rounded-lg bg-primary px-6 py-4 text-base font-semibold text-white"
            >
              Aceitar convite
            </Button>
            <Text className="mb-0 mt-6 text-sm leading-5 text-muted">
              O convite é pessoal, de uso único e expira em {expiresAtLabel}.
            </Text>
            <Text className="mb-0 mt-3 text-sm leading-5 text-muted">
              Os papéis não concedem acesso automático a relatos restritos.
              Confira a escola e o convite antes de aceitar.
            </Text>
            <Hr className="my-6 border-0 border-t border-solid border-rule" />
            <Text className="m-0 text-sm leading-5 text-muted">
              Se o botão não abrir, use este link:
            </Text>
            <Link
              href={acceptUrl}
              className="mt-2 block break-all text-sm leading-5 text-primary"
            >
              {acceptUrl}
            </Link>
            <Text className="mb-0 mt-6 text-xs leading-5 text-muted">
              Se você não esperava este convite, ignore esta mensagem. Mensagem
              de desenvolvimento: o convite não autoriza o uso de dados
              escolares reais.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
