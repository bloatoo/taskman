use crate::Task;
use tokio_postgres::{connect, Client as PSQClient, NoTls};

pub struct Database {
    client: PSQClient,
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
        let _ = client.execute("CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, title TEXT NOT NULL, completed BOOL NOT NULL);", &[]).await?;

        Ok(Self { client })
    }

    pub async fn get_tasks(&self) -> Vec<Task> {
        let rows = self
            .client
            .query("SELECT id, title, completed FROM tasks;", &[])
            .await
            .expect("Error while reading tasks from database");

        rows.iter().map(|x| Task::from_row(x).unwrap()).collect()
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
