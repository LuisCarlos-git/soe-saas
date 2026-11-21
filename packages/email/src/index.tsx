import { render, toPlainText } from "react-email";
import {
  SchoolInvitationEmail,
  type SchoolInvitationEmailProps,
} from "./templates/school-invitation";
export {
  SchoolInvitationEmail,
  type SchoolInvitationEmailProps,
} from "./templates/school-invitation";

export async function renderSchoolInvitationEmail(
  props: SchoolInvitationEmailProps,
) {
  const url = new URL(props.acceptUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid invitation URL");
  const html = await render(<SchoolInvitationEmail {...props} />);
  return {
    subject: `Convite para ${props.schoolName.replace(/[\r\n]+/g, " ")}`,
    html,
    text: toPlainText(html),
  };
}
