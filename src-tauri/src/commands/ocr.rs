use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct OcrResult {
    pub text: String,
    pub confidence: f32,
}

/// Extract text from a base64-encoded PNG using the bundled Vision OCR helper.
/// Runs 100% locally — image data is never transmitted anywhere.
#[command]
pub async fn extract_text_from_screenshot(
    base64_png: String,
) -> Result<OcrResult, String> {
    let png_bytes = STANDARD
        .decode(&base64_png)
        .map_err(|e| format!("Base64 decode failed: {e}"))?;

    let tmp_path = std::env::temp_dir().join("cw_ocr_input.png");
    std::fs::write(&tmp_path, &png_bytes)
        .map_err(|e| format!("Temp file write failed: {e}"))?;

    // Tauri places externalBin in Contents/MacOS/ alongside the main executable
    let bin_path = std::env::current_exe()
        .map_err(|e| format!("Could not get executable path: {e}"))?
        .parent()
        .ok_or("Executable has no parent directory")?
        .join("ocr-helper");

    let output = std::process::Command::new(&bin_path)
        .arg(&tmp_path)
        .output()
        .map_err(|e| format!("OCR helper launch failed: {e}"))?;

    let _ = std::fs::remove_file(&tmp_path);

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("OCR failed: {stderr}"));
    }

    let raw = String::from_utf8_lossy(&output.stdout);
    let cleaned = raw
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    Ok(OcrResult {
        text: cleaned,
        confidence: 0.90,
    })
}
