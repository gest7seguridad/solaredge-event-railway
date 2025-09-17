import jwt from 'jsonwebtoken';

export const signToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign(payload, secret, { expiresIn } as any);
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return jwt.verify(token, secret);
};