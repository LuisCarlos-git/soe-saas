export function pageHeading(pathname: string) {
  if (pathname.startsWith("/settings"))
    return {
      title: "Configurações",
      section: pathname.endsWith("security") ? "Segurança" : "Perfil",
    };
  if (pathname.startsWith("/administration/"))
    return { title: "Escolas piloto" };
  if (pathname === "/schools") return { title: "Minhas escolas" };
  if (pathname.endsWith("/professionals"))
    return {
      title: "Convites da equipe",
      back: "/schools" as const,
      backLabel: "Voltar às escolas",
    };
  if (pathname.startsWith("/schools/"))
    return {
      title: "Configurações da escola",
      back: "/schools" as const,
      backLabel: "Voltar às escolas",
    };
  return { title: "Seu espaço no SOE" };
}
