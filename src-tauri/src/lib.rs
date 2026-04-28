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
        .plugin(tauri_plugin_deep_link::init())
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

            // Exclude window from screen capture on macOS (invisible in Zoom, OBS, screenshots)
            // Also explicitly set the dock icon so dev mode uses the correct icon file.
            #[cfg(target_os = "macos")]
            {
                use objc::{msg_send, sel, sel_impl, class};

                if let Some(win) = app.get_webview_window("main") {
                    let ns_win = win.ns_window().expect("failed to get NSWindow");
                    unsafe {
                        let _: () = msg_send![ns_win as *mut objc::runtime::Object, setSharingType: 0u64];
                    }
                }

                // Set dock icon explicitly from embedded bytes so it matches the bundled icon
                // in both dev and release modes.
                let icon_bytes = include_bytes!("../icons/icon.icns");
                unsafe {
                    let data: *mut objc::runtime::Object = msg_send![
                        class!(NSData),
                        dataWithBytes: icon_bytes.as_ptr()
                        length: icon_bytes.len()
                    ];
                    let image: *mut objc::runtime::Object = msg_send![class!(NSImage), alloc];
                    let image: *mut objc::runtime::Object = msg_send![image, initWithData: data];
                    let ns_app: *mut objc::runtime::Object = msg_send![class!(NSApplication), sharedApplication];
                    let _: () = msg_send![ns_app, setApplicationIconImage: image];
                }
            }

            // Deep link handler — OAuth callback comes in as codewhisper://auth/callback?code=...
            let deep_link_handle = app.handle().clone();
            app.deep_link().on_open_urls(move |event| {
                let urls: Vec<String> = event.urls().iter().map(|u| u.to_string()).collect();
                if let Some(win) = deep_link_handle.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                    let _ = win.emit("oauth-deep-link", urls);
                }
            });

            // Tray icon click → toggle window visibility
            if let Some(tray) = app.tray_by_id("main") {
                // Explicitly set template mode so macOS auto-tints for light/dark menu bars
                #[cfg(target_os = "macos")]
                let _ = tray.set_icon_as_template(true);

                let handle = app.handle().clone();
                tray.on_tray_icon_event(move |_tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event {
                        if let Some(win) = handle.get_webview_window("main") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                });
            }

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
        // Hide instead of close when the window's X button is used
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| match event {
            // Re-show the window when the dock icon is clicked
            tauri::RunEvent::Reopen { has_visible_windows, .. } => {
                if !has_visible_windows {
                    if let Some(win) = app_handle.get_webview_window("main") {
                        let _ = win.show();
                        let _ = win.set_focus();
                    }
                }
            }
            // Keep the app alive in the background when all windows are hidden
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
