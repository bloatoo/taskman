use crate::{Task, TaskProperty};
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

        tokio::spawn(async move {
            if let Err(e) = conn.await {
                eprintln!("database connection error: {}", e);
            }
        });

        Ok(Self { client })
    }

    pub async fn get_tasks(&self) -> Vec<Task> {
        let rows = self
            .client
            .query("SELECT id, title, completed FROM tasks;", &[])
            .await
            .expect("Failed reading tasks from the database");

        rows.iter()
            .map(|x| Task::from_row(x).expect("Failed creating task from SQL row"))
            .collect()
    }

    pub async fn get_task(&self, prop: TaskProperty) -> Task {
        unimplemented!()
    }
}
