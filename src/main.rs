use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::Filter;

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

#[tokio::main]
async fn web_server(state: Arc<Mutex<State>>) {
    let state = warp::any().map(move || state.clone());

    let hello = warp::path("hello")
        .and(warp::path::param::<String>())
        .and(state.clone())
        .map(|name, _state| format!("Hello, {}!", name));

    warp::serve(hello).run(([127, 0, 0, 1], 8080)).await;
}
