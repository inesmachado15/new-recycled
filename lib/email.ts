import nodemailer from "nodemailer";

const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailSecure = process.env.EMAIL_SECURE === "true";
const emailUser = process.env.EMAIL_USER;
const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

const emailFrom =
  process.env.EMAIL_GMAIL_FROM ||
  `New & Recycled <${emailUser || "machado.newrecycle@gmail.com"}>`;

const emailReplyTo =
  process.env.EMAIL_REPLY_TO || emailUser || "machado.newrecycle@gmail.com";

type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
};

export function getEmailFrom() {
  return emailFrom;
}

export function getAdminOrderEmail() {
  return process.env.ADMIN_ORDER_EMAIL || "machado.newrecycle@gmail.com";
}

export function formatarPrecoEmail(valor: number | null | undefined) {
  return `${Number(valor || 0).toFixed(2).replace(".", ",")}€`;
}

export function formatarDataEmail(data: string | null | undefined) {
  if (!data) return "Não definido";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

export async function enviarEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}) {
  if (!emailUser || !emailAppPassword) {
    throw new Error(
      "Configuração de email incompleta. Verifica EMAIL_USER e EMAIL_APP_PASSWORD no .env.local."
    );
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailAppPassword,
    },
  });

  const resultado = await transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    html,
    text,
    replyTo: emailReplyTo,
    attachments,
  });

  return resultado;
}