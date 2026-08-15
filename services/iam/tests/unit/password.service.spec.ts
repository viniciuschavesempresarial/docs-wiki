import { PasswordService } from '../../src/services/PasswordService.js';
import bcrypt from 'bcrypt';

describe('PasswordService (Unit)', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  it('deve gerar hash bcrypt com 12 salt rounds', async () => {
    const password = 'MinhaSenhaSegura123';
    const hash = await passwordService.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).toMatch(/^\$2[aby]?\$12\$/); // Verifica se o salt rounds no header é 12
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  it('deve validar corretamente uma senha com hash correspondente', async () => {
    const password = 'SenhaCorreta123';
    const hash = await passwordService.hashPassword(password);

    const isValid = await passwordService.comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar uma senha que não corresponde ao hash', async () => {
    const password = 'SenhaCorreta123';
    const hash = await passwordService.hashPassword(password);

    const isValid = await passwordService.comparePassword('SenhaErrada999', hash);
    expect(isValid).toBe(false);
  });
});
