use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct AppError {
    pub message: String,
    pub kind: ErrorKind,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorKind {
    Database,
    ScreenCapture,
    Ocr,
    AudioCapture,
    Whisper,
    ClaudeApi,
    Auth,
    Io,
    Unknown,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError {
            message: e.to_string(),
            kind: ErrorKind::Database,
        }
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError {
            message: e.to_string(),
            kind: ErrorKind::ClaudeApi,
        }
    }
}

impl From<anyhow::Error> for AppError {
    fn from(e: anyhow::Error) -> Self {
        AppError {
            message: e.to_string(),
            kind: ErrorKind::Unknown,
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError {
            message: e.to_string(),
            kind: ErrorKind::Io,
        }
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
