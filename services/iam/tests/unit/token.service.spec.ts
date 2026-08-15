import { TokenService } from '../../src/services/TokenService.js';
import { UserPayload } from '@shared/contracts';

describe('TokenService (Unit)', () => {
  const secret = 'chave_de_teste_muito_segura_com_mais_de_32_caracteres';
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService(secret, '1h');
  });

  it('deve gerar e verificar token JWT contendo payload correto', () => {
    const payload: UserPayload = {
      sub: '00000000-0000-0000-0000-000000000001',
      email: 'usuario@docswiki.local',
      roles: ['LEITOR'],
      permissions: ['search:query']
    };

    const token = tokenService.generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = tokenService.verifyToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.roles).toEqual(payload.roles);
    expect(decoded.permissions).toEqual(payload.permissions);
  });

  it('deve lançar erro ao verificar token inválido ou corrompido', () => {
    expect(() => {
      tokenService.verifyToken('token.invalido.aqui');
    }).toThrow();
  });
});
