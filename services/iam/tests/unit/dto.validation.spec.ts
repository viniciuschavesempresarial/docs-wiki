import { AuthRegisterDTOSchema, AuthLoginDTOSchema } from '../../src/dtos/auth.dto.js';

describe('Auth DTOs Validation (Unit)', () => {
  describe('AuthRegisterDTOSchema', () => {
    it('deve aceitar dados válidos com senha alfanumérica >= 8 caracteres', () => {
      const validData = {
        email: 'dev@docswiki.local',
        nome: 'Desenvolvedor',
        password: 'Password123'
      };

      const result = AuthRegisterDTOSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar e-mail inválido', () => {
      const invalidData = {
        email: 'email-invalido',
        nome: 'Desenvolvedor',
        password: 'Password123'
      };

      const result = AuthRegisterDTOSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('deve rejeitar nome com menos de 3 caracteres', () => {
      const invalidData = {
        email: 'dev@docswiki.local',
        nome: 'Al',
        password: 'Password123'
      };

      const result = AuthRegisterDTOSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('nome');
      }
    });

    it('deve rejeitar senha com menos de 8 caracteres ou sem números', () => {
      const shortPassword = {
        email: 'dev@docswiki.local',
        nome: 'Desenvolvedor',
        password: 'Pass1'
      };
      const resultShort = AuthRegisterDTOSchema.safeParse(shortPassword);
      expect(resultShort.success).toBe(false);

      const noNumberPassword = {
        email: 'dev@docswiki.local',
        nome: 'Desenvolvedor',
        password: 'PasswordOnly'
      };
      const resultNoNumber = AuthRegisterDTOSchema.safeParse(noNumberPassword);
      expect(resultNoNumber.success).toBe(false);
    });
  });

  describe('AuthLoginDTOSchema', () => {
    it('deve aceitar credenciais válidas', () => {
      const validData = {
        email: 'user@docswiki.local',
        password: 'any_password'
      };

      const result = AuthLoginDTOSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar requisição sem senha', () => {
      const invalidData = {
        email: 'user@docswiki.local',
        password: ''
      };

      const result = AuthLoginDTOSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
