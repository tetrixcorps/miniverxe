import { Request, Response, NextFunction } from 'express';
import { authGuard } from './auth';
import { auth as firebaseAuth } from '../firebase';

// Mock the firebase auth module
jest.mock('../firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

describe('authGuard Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no Authorization header is present', async () => {
    await authGuard(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header does not start with "Bearer "', async () => {
    mockRequest.headers = { authorization: 'InvalidScheme token' };
    await authGuard(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Missing or invalid token' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if verifyIdToken throws an error', async () => {
    mockRequest.headers = { authorization: 'Bearer testtoken' };
    (firebaseAuth.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));
    await authGuard(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNextFunction).not.toHaveBeenCalled();
  });

  it('should call next() and attach user to request if token is valid', async () => {
    const decodedUser = { uid: '123', email: 'test@example.com' };
    mockRequest.headers = { authorization: 'Bearer validtoken' };
    (firebaseAuth.verifyIdToken as jest.Mock).mockResolvedValueOnce(decodedUser);

    await authGuard(mockRequest as Request, mockResponse as Response, mockNextFunction);

    expect(firebaseAuth.verifyIdToken).toHaveBeenCalledWith('validtoken', true);
    expect((mockRequest as any).user).toEqual(decodedUser);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
