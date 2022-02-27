use serde::{Deserialize, Serialize};
use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::hyper::header;
use warp::hyper::Method;
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

    println!("Connected to database.");

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

async fn get_tasks(state: Arc<Mutex<State>>) -> anyhow::Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    let tasks = state_lock.db.get_tasks().await;

    Ok(warp::reply::json(&tasks))
}

#[derive(Serialize, Deserialize)]
pub struct NewTaskRequest {
    pub title: String,
}

async fn new_task(
    body: NewTaskRequest,
    state: Arc<Mutex<State>>,
) -> anyhow::Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    match state_lock.db.insert_task(body.title).await {
        Ok(id) => {
            let json = serde_json::json!({
                "id": id,
            });

            Ok(warp::reply::json(&json))
        }

        Err(why) => {
            let json = serde_json::json!({ "error": "Internal server error" });
            eprintln!("Error: {}", why);

            Ok(warp::reply::json(&json))
        }
    }
}

#[tokio::main]
async fn web_server(state: Arc<Mutex<State>>) {
    let state = warp::any().map(move || state.clone());

    let task = warp::path("task")
        .and(warp::path::param::<i32>())
        .and(state.clone())
        .and_then(get_task);

    let tasks = warp::path("tasks").and(state.clone()).and_then(get_tasks);

    let new_task = warp::path("new_task")
        .and(warp::post())
        .and(warp::body::json())
        .and(state.clone())
        .and_then(new_task);

    let cors = warp::cors()
        .allow_methods(&[warp::hyper::Method::GET, Method::POST, Method::DELETE])
        .allow_headers(vec![header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_any_origin();

    let api_routes = warp::path("api")
        .and(task.or(tasks).or(new_task))
        .with(cors);

    println!("Starting warp.");
    warp::serve(api_routes).run(([127, 0, 0, 1], 8080)).await;
}
