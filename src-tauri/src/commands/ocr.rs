use base64::{engine::general_purpose::STANDARD, Engine as _};
use rusty_tesseract::{Args, Image};
use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct OcrResult {
    pub text: String,
    pub confidence: f32,
}

/// Extract text from a base64-encoded PNG image using Tesseract OCR.
/// Runs 100% locally — image data is never transmitted anywhere.
///
/// # Requirements
/// Tesseract must be installed on the host system:
///   macOS:   brew install tesseract
///   Ubuntu:  apt install tesseract-ocr
///   Windows: installer from UB Mannheim
#[command]
pub async fn extract_text_from_screenshot(base64_png: String) -> Result<OcrResult, String> {
    let png_bytes = STANDARD
        .decode(&base64_png)
        .map_err(|e| format!("Base64 decode failed: {e}"))?;

    // Write to a temp file (rusty-tesseract takes a path)
    let tmp_path = std::env::temp_dir().join("cw_ocr_input.png");
    std::fs::write(&tmp_path, &png_bytes).map_err(|e| format!("Temp file write failed: {e}"))?;

    let image = Image::from_path(&tmp_path).map_err(|e| format!("Tesseract image load failed: {e}"))?;

    let args = Args {
        lang: "eng".to_string(),
        config_variables: std::collections::HashMap::new(),
        dpi: Some(150),
        psm: Some(3), // Fully automatic page segmentation
        oem: Some(3), // Default LSTM OCR Engine
    };

    let output =
        rusty_tesseract::image_to_string(&image, &args).map_err(|e| format!("OCR failed: {e}"))?;

    // Clean up temp file
    let _ = std::fs::remove_file(&tmp_path);

    // Post-process: collapse runs of whitespace, trim blank lines
    let cleaned = output
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    Ok(OcrResult {
        text: cleaned,
        confidence: 0.85, // rusty-tesseract doesn't expose per-document confidence easily
    })
}
