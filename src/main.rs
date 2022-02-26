use std::sync::Arc;
use tokio::sync::Mutex;
use warp::Filter;

use taskman::database::Database;

pub struct State {
    db: Database,
}

#[tokio::main]
async fn main() {
    let db = Database::connect("bloatoo", "taskman", "localhost")
        .await
        .unwrap();

    let state = Arc::new(Mutex::new(State { db }));

    std::thread::spawn(move || {
        web_server(state);
    });

    loop {}
}

#[tokio::main]
async fn web_server(state: Arc<Mutex<State>>) {
    let state = warp::any().map(move || state.clone());

    let hello = warp::path("hello")
        .and(warp::path::param::<String>())
        .and(state.clone())
        .map(|name, _state| format!("Hello, {}!", name));

    warp::serve(hello).run(([127, 0, 0, 1], 8080)).await;
}
