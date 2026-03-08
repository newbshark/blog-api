# Migrations

Проект использует [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) для управления миграциями базы данных PostgreSQL.

## Команды

```bash
# Применить все новые миграции
npm run migrate:up

# Откатить последнюю миграцию
npm run migrate:down

# Создать новый файл миграции
npm run migrate:create -- <название>
```

Пример создания:
```bash
npm run migrate:create -- add-slug-to-posts
```

Создаст файл вида: `migrations/1234567890_add-slug-to-posts.js`

## Структура файла

Проект использует ES модули (`"type": "module"`), поэтому новые миграции пишутся через `export`:

```js
export const shorthands = undefined;

export const up = (pgm) => {
    // изменения вперёд
};

export const down = (pgm) => {
    // откат изменений
};
```


## Правила

- Всегда реализуй `down` — миграция должна быть обратимой.
- Называй миграцию по смыслу изменения: `create-users-table`, `add-archived-field-to-posts`.
- Не редактируй уже применённые миграции — создавай новую.
- Проверяй, что `up` и `down` симметричны: если `up` добавляет колонку, `down` её удаляет.
