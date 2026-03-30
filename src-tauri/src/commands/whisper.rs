use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
pub struct TranscriptionResult {
    pub text: String,
    pub language: String,
    pub duration_ms: u64,
}

/// Transcribe a WAV/PCM audio buffer using Whisper.cpp running locally.
///
/// # Setup
/// 1. Download a Whisper model: `whisper-rs` wraps whisper.cpp and loads the
///    GGML model file at the path you provide.
/// 2. Build with `--features whisper` once `whisper-rs` is added to Cargo.toml
///    and libwhisper.a is on the link path.
///
/// The implementation below is a typed stub that compiles without the native
/// library so the rest of the app can be developed/tested independently.
/// Replace the body with the real whisper-rs call when the model is available.
#[command]
pub async fn transcribe_audio(
    audio_base64: String,
    model_path: Option<String>,
) -> Result<TranscriptionResult, String> {
    let _model_path = model_path.unwrap_or_else(|| {
        // Default: look for whisper model in the app's data directory
        let home = std::env::var("HOME").unwrap_or_default();
        format!("{home}/.codewhisper/models/ggml-base.en.bin")
    });

    if audio_base64.is_empty() {
        return Ok(TranscriptionResult {
            text: String::new(),
            language: "en".into(),
            duration_ms: 0,
        });
    }

    // ── Real implementation (uncomment when whisper-rs is available) ──────
    //
    // use whisper_rs::{WhisperContext, FullParams, SamplingStrategy};
    // use base64::{engine::general_purpose::STANDARD, Engine as _};
    //
    // let audio_bytes = STANDARD.decode(&audio_base64)
    //     .map_err(|e| format!("decode: {e}"))?;
    // let samples: Vec<f32> = audio_bytes.chunks_exact(4)
    //     .map(|b| f32::from_le_bytes(b.try_into().unwrap()))
    //     .collect();
    //
    // let ctx = WhisperContext::new(&_model_path)
    //     .map_err(|e| format!("model load: {e}"))?;
    // let mut state = ctx.create_state().map_err(|e| format!("{e}"))?;
    // let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    // params.set_language(Some("en"));
    // state.full(params, &samples[..]).map_err(|e| format!("{e}"))?;
    // let n_seg = state.full_n_segments().map_err(|e| format!("{e}"))?;
    // let text = (0..n_seg)
    //     .map(|i| state.full_get_segment_text(i).unwrap_or_default())
    //     .collect::<Vec<_>>().join(" ");
    //
    // return Ok(TranscriptionResult { text, language: "en".into(), duration_ms: 0 });
    // ─────────────────────────────────────────────────────────────────────

    Ok(TranscriptionResult {
        text: "[Whisper transcription — model not yet loaded]".into(),
        language: "en".into(),
        duration_ms: 0,
    })
}
