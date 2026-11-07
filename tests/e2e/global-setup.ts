/**
 * E2E 全局准备：在独立测试库中创建/更新管理员与固定夹具数据。
 * 用例只依赖本文件写入的数据与自身产生的数据，保证可重复执行。
 */
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

async function globalSetup() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error('global-setup 需要 TEST_DATABASE_URL');

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) {
    throw new Error('global-setup 需要 ADMIN_USERNAME / ADMIN_PASSWORD');
  }

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // 管理员：每次覆盖密码哈希，保证后台登录用例可用
    const adminHash = await bcrypt.hash(adminPassword, 12);
    const adminRows = await sql<{ id: string }[]>`
      INSERT INTO users (username, password_hash, role, status)
      VALUES (${adminUsername.toLowerCase()}, ${adminHash}, 'ADMIN', 'ACTIVE')
      ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash, role = 'ADMIN', status = 'ACTIVE'
      RETURNING id`;
    const adminId = adminRows[0].id;

    // 清理上一轮遗留：注册测试用户、运行期发布文章、限流记录与精选
    await sql`DELETE FROM articles WHERE title LIKE 'E2E 发布测试 %'`;
    await sql`DELETE FROM users WHERE username LIKE 'e2e\_%' ESCAPE '\'`;
    await sql`DELETE FROM auth_attempts`;
    await sql`DELETE FROM featured_items`;

    // 禁用用户（AUTH-007）
    const disabledHash = await bcrypt.hash('password8', 12);
    await sql`
      INSERT INTO users (username, password_hash, role, status)
      VALUES ('e2e_disabled', ${disabledHash}, 'USER', 'DISABLED')`;

    // 文章夹具：发布时间固定在 2020，保证运行期新发布内容始终是“最新”
    await sql`
      INSERT INTO articles (author_id, title, slug, content_md, excerpt, category, status, published_at)
      VALUES
        (${adminId}, 'E2E 夹具文章', 'e2e-fixture-article', '## 第一节\n\n夹具正文。', '夹具摘要', 'AI_FULLSTACK', 'PUBLISHED', '2020-01-01T00:00:00Z'),
        (${adminId}, 'E2E 夹具草稿', 'e2e-fixture-draft', '草稿内容', '草稿摘要', 'AI_FULLSTACK', 'DRAFT', NULL)
      ON CONFLICT (slug) DO NOTHING`;

    // 工具夹具
    await sql`
      INSERT INTO tools (author_id, name, slug, summary, description, image_url, website_url, status)
      VALUES
        (${adminId}, 'E2E 夹具工具', 'e2e-fixture-tool', '夹具工具的一句话摘要。', '## 工具介绍\n\n夹具工具详细介绍。', '/images/default-article-cover.svg', 'https://example.com', 'PUBLISHED'),
        (${adminId}, 'E2E 夹具工具草稿', 'e2e-fixture-tool-draft', '草稿摘要。', '草稿介绍。', '/images/default-article-cover.svg', 'https://example.org', 'DRAFT')
      ON CONFLICT (slug) DO NOTHING`;

    // 商品夹具（上架 + 下架）
    await sql`
      INSERT INTO products (author_id, name, slug, description, status)
      VALUES
        (${adminId}, 'E2E 夹具商品', 'e2e-fixture-product', '夹具商品描述，展示用。', 'ACTIVE'),
        (${adminId}, 'E2E 下架商品', 'e2e-fixture-product-off', '下架商品描述。', 'OFF_SHELF')
      ON CONFLICT (slug) DO NOTHING`;

    // 商品主图（幂等：先清空再写入）
    await sql`
      DELETE FROM product_images
      WHERE product_id IN (
        SELECT id FROM products WHERE slug IN ('e2e-fixture-product', 'e2e-fixture-product-off')
      )`;
    await sql`
      INSERT INTO product_images (product_id, url, alt, sort_order)
      SELECT id, '/images/product-notes.svg', 'E2E 夹具商品图', 0 FROM products WHERE slug = 'e2e-fixture-product'
      UNION ALL
      SELECT id, '/images/product-notes.svg', 'E2E 下架商品图', 0 FROM products WHERE slug = 'e2e-fixture-product-off'`;
  } finally {
    await sql.end();
  }
}

export default globalSetup;
