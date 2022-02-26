use serde::{Deserialize, Serialize};
pub mod database;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
    id: i32,
    title: String,
    completed: bool,
}

impl Task {
    pub fn from_row(row: &tokio_postgres::Row) -> anyhow::Result<Self> {
        let id: i32 = row.try_get("id")?;
        let title: String = row.try_get("title")?;
        let completed: bool = row.try_get("completed")?;

        Ok(Self {
            id,
            title,
            completed,
        })
    }

    pub fn id(&self) -> &i32 {
        &self.id
    }

    pub fn title(&self) -> &String {
        &self.title
    }

    pub fn completed(&self) -> &bool {
        &self.completed
    }
}
