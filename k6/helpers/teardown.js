import { httpClient } from './http_client.js';
import { authenticate } from './auth.js';

/**
 * Rotina de Teardown do k6:
 * Exclui com CASCADE todo conteúdo (materiais, versões, chunks vetoriais e índices)
 * e usuários temporários gerados durante os testes de carga.
 */
export function teardown(data) {
  console.log('\n[K6:TEARDOWN] Iniciando limpeza automática de recursos criados no teste...');

  let token = (data && (data.adminToken || data.token)) || null;
  if (!token) {
    token = authenticate();
  }

  if (!token) {
    console.warn('[K6:TEARDOWN] Não foi possível autenticar como administrador para executar o teardown.');
    return;
  }

  // =========================================================================
  // 1. Limpeza de Materiais / Conteúdo (Exclusão em CASCADE)
  // =========================================================================
  let offset = 0;
  const limit = 100;
  const k6MaterialIds = [];

  try {
    while (true) {
      const res = httpClient.get(`/api/v1/content/materials?limit=${limit}&offset=${offset}`, token, { type: 'teardown' });
      if (res.status !== 200) {
        break;
      }

      let materials = [];
      try {
        const parsed = JSON.parse(res.body);
        materials = Array.isArray(parsed) ? parsed : (parsed.materials || parsed.data || []);
      } catch (e) {
        break;
      }

      if (materials.length === 0) {
        break;
      }

      materials.forEach((m) => {
        const slug = (m.slug || '').toLowerCase();
        const title = (m.titulo || m.title || '').toLowerCase();
        const tags = Array.isArray(m.tags) ? m.tags.map((t) => String(t).toLowerCase()) : [];

        const isK6Material =
          slug.startsWith('k6-') ||
          slug.includes('k6-doc-') ||
          slug.includes('k6-mat-') ||
          title.includes('[k6-test]') ||
          title.includes('k6-doc') ||
          tags.includes('k6');

        if (isK6Material && m.id && !k6MaterialIds.includes(m.id)) {
          k6MaterialIds.push(m.id);
        }
      });

      if (materials.length < limit) {
        break;
      }
      offset += limit;
    }
  } catch (err) {
    console.warn(`[K6:TEARDOWN] Erro ao listar materiais para exclusão: ${err.message || err}`);
  }

  let deletedMaterialsCount = 0;
  if (k6MaterialIds.length > 0) {
    const bulkRes = httpClient.post(
      '/api/v1/content/materials/bulk-delete',
      { material_ids: k6MaterialIds },
      token,
      { type: 'teardown' }
    );

    if (bulkRes.status === 200) {
      try {
        const bulkData = JSON.parse(bulkRes.body);
        deletedMaterialsCount = bulkData.deleted_count || k6MaterialIds.length;
      } catch (e) {
        deletedMaterialsCount = k6MaterialIds.length;
      }
    } else {
      // Fallback para exclusão individual se bulk-delete falhar
      k6MaterialIds.forEach((id) => {
        const delRes = httpClient.del(`/api/v1/content/materials/${id}`, token, { type: 'teardown' });
        if (delRes.status === 200 || delRes.status === 204) {
          deletedMaterialsCount++;
        }
      });
    }
  }

  // =========================================================================
  // 2. Limpeza de Usuários Temporários do IAM
  // =========================================================================
  let deletedUsersCount = 0;
  try {
    const usersRes = httpClient.get('/api/v1/auth/users', token, { type: 'teardown' });
    if (usersRes.status === 200) {
      const parsed = JSON.parse(usersRes.body);
      const usersList = parsed.users || parsed.data || (Array.isArray(parsed) ? parsed : []);

      const k6Users = usersList.filter((u) => {
        if (u.is_system_protected) return false;
        const email = (u.email || '').toLowerCase();
        const name = (u.nome || u.name || '').toLowerCase();

        return (
          email.startsWith('k6') ||
          email.startsWith('testuser') ||
          email.includes('@k6.') ||
          email.includes('test_vu_') ||
          name.includes('k6') ||
          name.includes('test user')
        );
      });

      k6Users.forEach((u) => {
        const delRes = httpClient.del(`/api/v1/auth/users/${u.id}`, token, { type: 'teardown' });
        if (delRes.status === 200 || delRes.status === 204) {
          deletedUsersCount++;
        }
      });
    }
  } catch (err) {
    console.warn(`[K6:TEARDOWN] Erro ao limpar usuários de teste: ${err.message || err}`);
  }

  console.log(
    `[K6:TEARDOWN] Limpeza concluída: ${deletedMaterialsCount} material(is) excluído(s) em CASCADE e ${deletedUsersCount} usuário(s) temporário(s) removido(s).\n`
  );
}
