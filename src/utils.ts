import { ResponseError } from "superagent";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function logSendError(body: unknown, e: ResponseError) {
  console.log(
    "failed to send account, retrying after 500ms",
    JSON.stringify(body),
    {
      message: e.message,
      status: e.status,
      response: e.response?.body,
      clientError: e.response?.clientError,
      serverError: e.response?.serverError,
      name: e.name,
    }
  );
}
