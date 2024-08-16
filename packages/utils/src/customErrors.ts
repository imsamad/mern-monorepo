export abstract class TCustomResponseError extends Error {
  abstract statusCode: number;
  abstract errors: any;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // Ensure the error name is the class name
    Object.setPrototypeOf(this, new.target.prototype); // Set the prototype chain
  }
}

export class CustomResponseError extends TCustomResponseError {
  statusCode: number;
  errors: any;

  constructor(statusCode: number, errors: any) {
    super("CustomResponseError"); // You can set a default or custom message here
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

export abstract class TCustomError extends Error {
  abstract errors: any;

  constructor(message: string) {
    super("An error occurred");
    this.name = this.constructor.name; // Ensure the error name is the class name
    Object.setPrototypeOf(this, new.target.prototype); // Set the prototype chain
  }
}

export class CustomError extends TCustomError {
  errors: any;

  constructor(errors: any) {
    super("CustomError"); // You can set a default or custom message here
    this.errors = errors;
  }
}
