import { Request, Response, NextFunction } from 'express';
import { requireRole } from './roles';

describe('requireRole Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if no user is on the request', () => {
    const middleware = requireRole('admin');
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not in the required roles (single role)', () => {
    (mockRequest as any).user = { role: 'user' };
    const middleware = requireRole('admin');
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not in the required roles (multiple roles)', () => {
    (mockRequest as any).user = { role: 'guest' };
    const middleware = requireRole('admin', 'editor');
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if user role is in the required roles (single role)', () => {
    (mockRequest as any).user = { role: 'admin' };
    const middleware = requireRole('admin');
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should call next() if user role is in the required roles (multiple roles, first match)', () => {
    (mockRequest as any).user = { role: 'editor' };
    const middleware = requireRole('editor', 'admin');
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should call next() if user role is in the required roles (multiple roles, second match)', () => {
    (mockRequest as any).user = { role: 'admin' };
    const middleware = requireRole('editor', 'admin');
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should be case-sensitive for roles', () => {
    (mockRequest as any).user = { role: 'Admin' }; // Uppercase A
    const middleware = requireRole('admin'); // Lowercase a
    middleware(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });
});
