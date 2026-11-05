import { sql } from 'drizzle-orm';
import {
  char,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// 4.1 枚举
export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'DISABLED']);
export const articleCategoryEnum = pgEnum('article_category', ['AI_FULLSTACK', 'PERSPECTIVE']);
export const articleStatusEnum = pgEnum('article_status', ['DRAFT', 'PUBLISHED']);
export const contentStatusEnum = pgEnum('content_status', ['DRAFT', 'PUBLISHED']);
export const productStatusEnum = pgEnum('product_status', ['ACTIVE', 'OFF_SHELF']);
export const featuredEntityTypeEnum = pgEnum('featured_entity_type', ['ARTICLE', 'TOOL', 'PRODUCT']);

// 4.2 users
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 32 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('USER'),
    status: userStatusEnum('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('users_username_unique').on(t.username),
    index('users_role_status_idx').on(t.role, t.status),
  ],
);

// 4.3 sessions
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: char('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('sessions_token_hash_unique').on(t.tokenHash),
    index('sessions_user_id_idx').on(t.userId),
    index('sessions_expires_at_idx').on(t.expiresAt),
  ],
);

// 4.4 auth_attempts
export const authAttempts = pgTable('auth_attempts', {
  key: varchar('key', { length: 255 }).primaryKey(),
  failedCount: smallint('failed_count').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 4.5 articles
export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 160 }).notNull(),
    contentMd: text('content_md').notNull(),
    excerpt: varchar('excerpt', { length: 300 }),
    coverUrl: text('cover_url'),
    category: articleCategoryEnum('category').notNull(),
    status: articleStatusEnum('status').notNull().default('DRAFT'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('articles_slug_unique').on(t.slug),
    index('articles_category_status_published_idx').on(
      t.category,
      t.status,
      sql`${t.publishedAt} DESC`,
    ),
  ],
);

// 4.6 tools
export const tools = pgTable(
  'tools',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 80 }).notNull(),
    slug: varchar('slug', { length: 160 }).notNull(),
    summary: varchar('summary', { length: 160 }).notNull(),
    description: text('description').notNull(),
    imageUrl: text('image_url').notNull(),
    websiteUrl: text('website_url').notNull(),
    status: contentStatusEnum('status').notNull().default('DRAFT'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('tools_slug_unique').on(t.slug),
    index('tools_status_created_idx').on(t.status, sql`${t.createdAt} DESC`),
  ],
);

// 4.7 products
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 160 }).notNull(),
    description: text('description').notNull(),
    status: productStatusEnum('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('products_slug_unique').on(t.slug),
    index('products_status_created_idx').on(t.status, sql`${t.createdAt} DESC`),
  ],
);

// 4.8 product_images
export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: varchar('alt', { length: 160 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('product_images_product_sort_idx').on(t.productId, t.sortOrder)],
);

// 4.9 featured_items
export const featuredItems = pgTable(
  'featured_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: featuredEntityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('featured_items_entity_unique').on(t.entityType, t.entityId),
    index('featured_items_type_sort_idx').on(t.entityType, t.sortOrder),
  ],
);
