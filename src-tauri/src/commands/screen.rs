use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::ImageEncoder;
use screenshots::Screen;
use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct ScreenshotResult {
    pub base64_png: String,
    pub width: u32,
    pub height: u32,
    pub screen_index: usize,
}

/// Capture the primary (or specified) screen and return a base64-encoded PNG.
/// All processing is local — raw pixels never leave the device.
/// Only the OCR-extracted text is ever sent to external APIs.
#[command]
pub async fn capture_screen(screen_index: Option<usize>) -> Result<ScreenshotResult, String> {
    let screens = Screen::all().map_err(|e| format!("Failed to enumerate screens: {e}"))?;

    if screens.is_empty() {
        return Err("No screens found".into());
    }

    let idx = screen_index.unwrap_or(0).min(screens.len() - 1);
    let screen = &screens[idx];

    let rgba_image = screen
        .capture()
        .map_err(|e| format!("Screen capture failed: {e}"))?;

    let width = rgba_image.width();
    let height = rgba_image.height();

    // Encode to PNG in memory
    let mut png_bytes: Vec<u8> = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new(&mut png_bytes);
    encoder
        .write_image(
            rgba_image.as_raw(),
            width,
            height,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| format!("PNG encoding failed: {e}"))?;

    let base64_png = STANDARD.encode(&png_bytes);

    Ok(ScreenshotResult {
        base64_png,
        width,
        height,
        screen_index: idx,
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
