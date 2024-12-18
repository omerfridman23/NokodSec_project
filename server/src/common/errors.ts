export class GetAutomationsException extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}