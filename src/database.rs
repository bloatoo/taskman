use crate::Task;
use anyhow::Context;
use chrono::NaiveDateTime;
use rand::Rng;
use tokio_postgres::{connect, Client as PSQClient, NoTls};

pub struct Database {
    client: PSQClient,
}

pub enum InsertableItem {
    Task(String, Option<String>),
    Habit(String),
}

pub enum QueryableItem<T: Into<i32>> {
    Task(T),
    Habit(T),
}

impl Database {
    pub async fn connect<T: AsRef<str>>(
        db_user: T,
        db_name: T,
        db_host: T,
    ) -> anyhow::Result<Self> {
        let (client, conn) = connect(
            &format!(
                "user={} dbname={} host={}",
                db_user.as_ref(),
                db_name.as_ref(),
                db_host.as_ref()
            ),
            NoTls,
        )
        .await?;

        // Start the postgres connection.
        tokio::spawn(async move {
            if let Err(e) = conn.await {
                eprintln!("database connection error: {}", e);
            }
        });

        // Check if the required tables exist and create them if they don't exist
        let _ = client.execute("CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, title TEXT NOT NULL, completed BOOL NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, deadline TIMESTAMP);", &[]).await?;
        let _ = client.execute("CREATE TABLE IF NOT EXISTS habits(id INTEGER PRIMARY KEY, title TEXT NOT NULL, day INTEGER NOT NULL, last_completed DATE);", &[]).await?;

        Ok(Self { client })
    }

    pub async fn insert_item(&self, item: InsertableItem) -> anyhow::Result<i32> {
        let id = self.generate_id(&item).await;

        match item {
            InsertableItem::Task(ref title, ref deadline) => match deadline {
                Some(s) => {
                    let timestamp = NaiveDateTime::parse_from_str(s, "%Y-%m-%d %H:%M").unwrap();

                    self.client
                    .execute(
                        "INSERT INTO tasks(id, title, completed, deadline) VALUES($1, $2, $3, $4)",
                        &[&id, &title, &false, &timestamp],
                    )
                    .await
                    .expect("Failed inserting task into database");
                }

                None => {
                    self.client
                        .execute(
                            "INSERT INTO tasks(id, title, completed) VALUES($1, $2, $3)",
                            &[&id, &title, &false],
                        )
                        .await
                        .context("Failed inserting task into database")?;
                }
            },

            InsertableItem::Habit(title) => {
                self.client
                    .execute(
                        "INSERT INTO habits(id, title, day) VALUES($1, $2, $3)",
                        &[&id, &title, &1i32],
                    )
                    .await
                    .context("Failed inserting task into database")?;
            }
        }

        Ok(id)
    }

    async fn generate_id(&self, item: &InsertableItem) -> i32 {
        let mut id: i32 = rand::thread_rng().gen_range(0..1000);

        let query_str = match item {
            InsertableItem::Task(_, _) => "SELECT id FROM tasks WHERE id = $1",
            InsertableItem::Habit(_) => "SELECT id FROM habits WHERE id = $1",
        };

        while self
            .client
            .query(query_str, &[&id])
            .await
            .expect("Failed reading from database")
            .len()
            != 0
        {
            id = rand::thread_rng().gen_range(0..1000);
        }

        id
    }

    pub async fn delete_task(&self, id: i32) -> anyhow::Result<()> {
        self.client
            .execute("DELETE FROM tasks WHERE id = $1", &[&id])
            .await?;

        Ok(())
    }

    pub async fn rename_task(&self, id: i32, new_title: String) -> anyhow::Result<()> {
        self.client
            .execute(
                "UPDATE tasks SET title = $1 WHERE id = $2",
                &[&new_title, &id],
            )
            .await?;

        Ok(())
    }

    pub async fn complete_task(&self, id: i32, completion_state: bool) -> anyhow::Result<()> {
        self.client
            .execute(
                "UPDATE tasks SET completed = $1 WHERE id = $2",
                &[&completion_state, &id],
            )
            .await?;

        Ok(())
    }

    pub async fn get_tasks(&self) -> Vec<Task> {
        let rows = self
            .client
            .query(
                "SELECT id, title, completed, created_at, deadline FROM tasks;",
                &[],
            )
            .await
            .expect("Error while reading tasks from database");

        let mut task_vec: Vec<Task> = rows.iter().map(|x| Task::from_row(x).unwrap()).collect();

        task_vec.sort_by_key(|a| a.created_at);
        task_vec.reverse();
        task_vec.sort_by_key(|a| {
            a.deadline.unwrap_or(
                NaiveDateTime::parse_from_str("9999-12-31 12:00:00", "%Y-%m-%d %H:%M:%S").unwrap(),
            )
        });

        task_vec.sort_by_key(|a| a.completed);

        task_vec
    }

    pub async fn get_task(&self, id: i32) -> Option<Task> {
        match self
            .client
            .query("SELECT * FROM tasks WHERE id = $1", &[&id])
            .await
        {
            Ok(rows) => match rows.len() {
                0 => None,
                _ => Some(Task::from_row(&rows[0]).expect("Failed creating task from row")),
            },

            Err(e) => panic!("{}", e),
        }
    }
}
