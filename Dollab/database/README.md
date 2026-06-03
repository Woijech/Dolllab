# Dollab database

В этой папке лежит архив локальной MySQL-базы:

- `dollab_db.zip`

Внутри архива находятся файлы таблиц MySQL/InnoDB `*.ibd`, например `users.ibd`, `posts.ibd`, `productads.ibd`.

## Важно

Это не SQL-дамп. Такой архив можно хранить в проекте, но он хуже переносится между компьютерами, чем обычный файл `dollab_db.sql`.

Лучший вариант для запуска проекта с этой же базой:

На Fedora/MariaDB пользователь `root` часто подключается через `sudo`, а не через пароль MySQL. Тогда используй:

```bash
sudo mysqldump --databases dollab_db --single-transaction --routines --triggers > Dollab/database/dollab_db.sql
```

Если `root` в MySQL реально настроен на вход по паролю, можно использовать:

```bash
mysqldump -u root -p --databases dollab_db --single-transaction --routines --triggers > Dollab/database/dollab_db.sql
```

После дампа проверь, что файл не пустой:

```bash
ls -lh Dollab/database/dollab_db.sql
```

После этого файл `Dollab/database/dollab_db.sql` можно загрузить на другом компьютере:

```bash
mysql -u root -p < Dollab/database/dollab_db.sql
```

## Текущее подключение проекта

Backend подключается к MySQL-базе `dollab_db` из `Dollab_Backend/appsettings.json`:

```json
"server=localhost;port=3306;database=dollab_db;user=root;password=hellokitty0;"
```

Чтобы проект запустился с заполненной базой, на компьютере должна быть MySQL-база `dollab_db` с этими таблицами и данными.
