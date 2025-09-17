import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      const user = await db('admin_users')
        .where({ email, is_active: true })
        .first();

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      await db('admin_users')
        .where({ id: user.id })
        .update({ last_login: new Date() });

      const token = signToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await db('admin_users')
      .where({ id: req.user!.id })
      .select('id', 'email', 'name', 'role')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

router.post('/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await db('admin_users')
        .where({ id: req.user!.id })
        .first();

      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await db('admin_users')
        .where({ id: req.user!.id })
        .update({ password: hashedPassword });

      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;