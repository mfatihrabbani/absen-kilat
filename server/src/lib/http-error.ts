/** Error dengan status HTTP; dikirim ke klien sebagai `{ error: { message } }`. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
