mod commands;
mod error;
mod state;

use commands::{audio, claude, database, ocr, screen, session, whisper};
use state::AppState;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");

            let db_path = app_dir.join("codewhisper.db");
            let state = tauri::async_runtime::block_on(async {
                AppState::new(db_path.to_str().unwrap())
                    .await
                    .expect("failed to initialize app state")
            });

            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Screen
            screen::capture_screen,
            screen::get_active_window_title,
            // OCR
            ocr::extract_text_from_screenshot,
            // Audio / Whisper
            audio::start_audio_capture,
            audio::stop_audio_capture,
            whisper::transcribe_audio,
            // Claude AI
            claude::send_coach_message,
            claude::analyze_problem,
            // Session / DB
            database::create_session,
            database::get_session,
            database::list_sessions,
            database::update_session,
            database::delete_session,
            database::save_message,
            database::get_session_messages,
            // Freemium
            session::get_session_count,
            session::validate_license_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
