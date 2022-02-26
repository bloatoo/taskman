use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::{Filter, Rejection, Reply};

use taskman::database::Database;

pub struct State {
    db: Database,
}

#[tokio::main]
async fn main() {
    let mut args = env::args();
    args.next();

    let db_username = args.next().unwrap();
    let db_database = args.next().unwrap();
    let db_host = args.next().unwrap();

    let db = Database::connect(db_username, db_database, db_host)
        .await
        .unwrap();

    let state = Arc::new(Mutex::new(State { db }));

    std::thread::spawn(move || {
        web_server(state);
    });

    loop {}
}

async fn get_task(id: i32, state: Arc<Mutex<State>>) -> anyhow::Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    match state_lock.db.get_task(id).await {
        Some(task) => Ok(warp::reply::json(&task)),
        None => Err(warp::reject::not_found()),
    }
}

#[tokio::main]
async fn web_server(state: Arc<Mutex<State>>) {
    let state = warp::any().map(move || state.clone());

    let tasks = warp::path("task")
        .and(warp::path::param::<i32>())
        .and(state.clone())
        .and_then(get_task);

    let hello = warp::path("hello")
        .and(warp::path::param::<String>())
        .and(state.clone())
        .map(|name, _state| format!("Hello, {}!", name));

    warp::serve(tasks.or(hello))
        .run(([127, 0, 0, 1], 8080))
        .await;
}
