// কোনো known/expected error (যেমন: "email already exists") throw করার জন্য এই class ব্যবহার হয়।
// errorHandler middleware এটা ধরে সঠিক status code সহ response পাঠায়।
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
