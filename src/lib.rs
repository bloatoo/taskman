pub mod database;

pub struct Task {
    id: u32,
    title: String,
    completed: bool,
}

impl Task {
    pub fn from_row(row: &tokio_postgres::Row) -> anyhow::Result<Self> {
        let id: u32 = row.try_get("id")?;
        let title: String = row.try_get("title")?;
        let completed: bool = row.try_get("completed")?;

        Ok(Self {
            id,
            title,
            completed,
        })
    }
}

pub enum TaskProperty {
    Name(String),
    Id(u32),
}
