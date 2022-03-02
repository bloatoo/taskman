use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::process::Command;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use taskman::database::{Database, InsertableItem};
use tokio::sync::Mutex;
use warp::hyper::{header, Method};
use warp::{Filter, Rejection, Reply};

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
    let state_clone = state.clone();

    std::thread::spawn(move || {
        web_server(state_clone);
    });

    let mut notification_state: HashMap<i32, u32> = HashMap::new();

    loop {
        check_tasks_and_notify_deadlines(&state, &mut notification_state).await;
        tokio::time::sleep(Duration::from_millis(60000)).await;
    }
}

async fn check_tasks_and_notify_deadlines(
    state: &Arc<Mutex<State>>,
    notification_state: &mut HashMap<i32, u32>,
) {
    let state_lock = state.lock().await;

    let tasks = state_lock.db.get_tasks().await;

    for task in tasks {
        if let Some(ref deadline) = task.deadline() {
            println!("{:#?}", task);
            let notif_count = notification_state.get(task.id()).unwrap_or(&0);
            let minutes = minutes_till_deadline(deadline);

            match minutes {
                DeadlineTime::Remaining(minutes) => {
                    println!("{}", minutes);
                    if minutes <= 60 && notif_count == &0 {
                        notification_state.insert(*task.id(), 1);

                        let body_str = format!(
                            "Deadline for task \"{}\" will expire in {} minutes!",
                            task.title(),
                            minutes
                        );

                        Command::new("dunstify")
                            .arg("Task Deadline")
                            .arg(body_str)
                            .spawn()
                            .unwrap();
                    }
                }

                _ => (),
            }
        }
    }
}

pub enum DeadlineTime {
    Remaining(u64),
    Expired,
}

fn minutes_till_deadline(deadline: &NaiveDateTime) -> DeadlineTime {
    let current_time = chrono::offset::Local::now().naive_local();
    let ts = deadline.timestamp();

    let minutes = deadline.signed_duration_since(current_time).num_minutes();

    DeadlineTime::Remaining(minutes as u64)
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
struct DeleteTaskRequest {
    pub id: i32,
}

async fn delete_task(
    body: DeleteTaskRequest,
    state: Arc<Mutex<State>>,
) -> anyhow::Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    state_lock.db.delete_task(body.id).await.unwrap();

    Ok(warp::reply::json(&""))
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompleteTaskRequest {
    pub completion_state: bool,
    pub id: i32,
}

async fn complete_task(
    body: CompleteTaskRequest,
    state: Arc<Mutex<State>>,
) -> anyhow::Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    let _ = state_lock
        .db
        .complete_task(body.id, body.completion_state)
        .await;

    Ok(warp::reply::json(&""))
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameTaskRequest {
    id: i32,
    new_title: String,
}

async fn rename_task(
    body: RenameTaskRequest,
    state: Arc<Mutex<State>>,
) -> Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    match state_lock.db.rename_task(body.id, body.new_title).await {
        Ok(_) => Ok(warp::reply::json(&"")),
        Err(why) => {
            let json = serde_json::json!({
                "error": why.to_string(),
            });

            Ok(warp::reply::json(&json))
        }
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewTaskRequest {
    pub title: String,
    pub deadline: Option<String>,
}

async fn new_task(
    body: NewTaskRequest,
    state: Arc<Mutex<State>>,
) -> anyhow::Result<impl Reply, Rejection> {
    let state_lock = state.lock().await;

    let item = InsertableItem::Task(body.title, body.deadline);

    match state_lock.db.insert_item(item).await {
        Ok(id) => {
            let task = state_lock.db.get_task(id).await.unwrap();

            Ok(warp::reply::json(&task))
        }

        Err(why) => {
            let json = serde_json::json!({ "error": why.to_string() });
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

    let complete_task = warp::path("complete_task")
        .and(warp::post())
        .and(warp::body::json())
        .and(state.clone())
        .and_then(complete_task);

    let rename_task = warp::path("rename_task")
        .and(warp::post())
        .and(warp::body::json())
        .and(state.clone())
        .and_then(rename_task);

    let delete_task = warp::path("delete_task")
        .and(warp::post())
        .and(warp::body::json())
        .and(state.clone())
        .and_then(delete_task);

    let cors = warp::cors()
        .allow_methods(&[warp::hyper::Method::GET, Method::POST, Method::DELETE])
        .allow_headers(vec![header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_any_origin();

    let api_routes = warp::path("api")
        .and(
            task.or(tasks)
                .or(new_task)
                .or(complete_task)
                .or(rename_task)
                .or(delete_task),
        )
        .with(cors);

    println!("Starting warp.");
    warp::serve(api_routes).run(([127, 0, 0, 1], 8080)).await;
}
