use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct ScreenshotResult {
    pub base64_png: String,
    pub width: u32,
    pub height: u32,
    pub screen_index: usize,
}

/// Capture the primary (or specified) screen using macOS screencapture,
/// which correctly captures GPU-rendered browser content.
#[command]
pub async fn capture_screen(screen_index: Option<usize>) -> Result<ScreenshotResult, String> {
    let tmp_path = std::env::temp_dir()
        .join("cw_screen_cap.png")
        .to_string_lossy()
        .into_owned();

    // -x = no shutter sound, -D <n> = display index (1-based)
    let display = (screen_index.unwrap_or(0) + 1).to_string();
    let status = std::process::Command::new("screencapture")
        .args(["-x", "-D", &display, &tmp_path])
        .status()
        .map_err(|e| format!("screencapture failed to launch: {e}"))?;

    if !status.success() {
        return Err("screencapture exited with error".into());
    }

    let png_bytes = std::fs::read(&tmp_path)
        .map_err(|e| format!("Failed to read screenshot: {e}"))?;
    let _ = std::fs::remove_file(&tmp_path);

    // Get dimensions from the PNG header
    let img = image::load_from_memory(&png_bytes)
        .map_err(|e| format!("Failed to decode PNG: {e}"))?;
    let width = img.width();
    let height = img.height();

    let base64_png = STANDARD.encode(&png_bytes);

    Ok(ScreenshotResult {
        base64_png,
        width,
        height,
        screen_index: screen_index.unwrap_or(0),
    })
}

/// Returns the title of the currently focused window.
#[command]
pub async fn get_active_window_title() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("osascript")
            .arg("-e")
            .arg(
                r#"tell application "System Events"
                    set frontApp to name of first application process whose frontmost is true
                    set windowTitle to ""
                    try
                        set windowTitle to name of first window of application process frontApp
                    end try
                    return frontApp & " — " & windowTitle
                end tell"#,
            )
            .output()
            .map_err(|e| format!("osascript failed: {e}"))?;
        return Ok(String::from_utf8_lossy(&output.stdout).trim().to_string());
    }

    #[cfg(not(target_os = "macos"))]
    Ok("Active Window".to_string())
}
