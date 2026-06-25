const KEYINVOICE_API_URL =
  process.env.KEYINVOICE_API_URL || "https://login.keyinvoice.com/API5.php";

const KEYINVOICE_API_KEY = process.env.KEYINVOICE_API_KEY;

type KeyInvoiceResponse = {
  Status: number;
  Sid?: string;
  Data?: unknown;
  ErrorMessage?: string;
};

async function chamarKeyInvoice({
  headers,
  body,
}: {
  headers: Record<string, string>;
  body: Record<string, unknown>;
}) {
  const resposta = await fetch(KEYINVOICE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const texto = await resposta.text();

  let json: KeyInvoiceResponse;

  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error(`Resposta inválida do KeyInvoice: ${texto}`);
  }

  if (!resposta.ok) {
    throw new Error(
      `Erro HTTP KeyInvoice ${resposta.status}: ${
        json.ErrorMessage || texto || "sem detalhe"
      }`
    );
  }

  if (json.Status !== 1) {
    throw new Error(json.ErrorMessage || "Erro desconhecido no KeyInvoice.");
  }

  return json;
}

export async function autenticarKeyInvoice() {
  if (!KEYINVOICE_API_KEY) {
    throw new Error("KEYINVOICE_API_KEY não está definida no .env.local.");
  }

  const resposta = await chamarKeyInvoice({
    headers: {
      Apikey: KEYINVOICE_API_KEY,
    },
    body: {
      method: "authenticate",
    },
  });

  if (!resposta.Sid) {
    throw new Error("O KeyInvoice não devolveu Sid.");
  }

  return resposta.Sid;
}

export async function chamarMetodoKeyInvoice(
  sid: string,
  body: Record<string, unknown>
) {
  return chamarKeyInvoice({
    headers: {
      Sid: sid,
    },
    body,
  });
}