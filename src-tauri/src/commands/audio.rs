use serde::Serialize;
use tauri::{command, State};

use crate::state::AppState;

#[derive(Debug, Serialize)]
pub struct AudioCaptureStatus {
    pub active: bool,
    pub message: String,
}

/// Begin capturing system audio output (loopback).
/// On macOS this requires a virtual audio device such as BlackHole or
/// Loopback — the user must configure it beforehand.
/// The captured PCM frames are written to a ring buffer in AppState and
/// consumed by the Whisper transcription command.
#[command]
pub async fn start_audio_capture(
    state: State<'_, AppState>,
) -> Result<AudioCaptureStatus, String> {
    let mut active = state
        .audio_capture_active
        .lock()
        .map_err(|e| e.to_string())?;

    if *active {
        return Ok(AudioCaptureStatus {
            active: true,
            message: "Audio capture already running".into(),
        });
    }

    *active = true;

    // NOTE: Full audio loopback capture requires platform-specific native
    // integration (CoreAudio on macOS, WASAPI on Windows, PipeWire/ALSA on
    // Linux) via crates such as `cpal`. The implementation stub here sets
    // the flag so the UI can display the correct state. Wire up the actual
    // cpal capture loop once the platform audio backend is in scope.

    Ok(AudioCaptureStatus {
        active: true,
        message: "Audio capture started (stub — connect cpal loop)".into(),
    })
}

/// Stop the audio capture loop.
#[command]
pub async fn stop_audio_capture(state: State<'_, AppState>) -> Result<AudioCaptureStatus, String> {
    let mut active = state
        .audio_capture_active
        .lock()
        .map_err(|e| e.to_string())?;
    *active = false;

    Ok(AudioCaptureStatus {
        active: false,
        message: "Audio capture stopped".into(),
    })
}
