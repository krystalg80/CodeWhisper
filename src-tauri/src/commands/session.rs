use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::state::AppState;

const FREE_SESSION_LIMIT: i64 = 3;

#[derive(Debug, Serialize)]
pub struct SessionCountResult {
    pub total: i64,
    pub free_remaining: i64,
    pub is_pro: bool,
}

#[derive(Debug, Serialize)]
pub struct LicenseValidationResult {
    pub valid: bool,
    pub plan: String,
    pub message: String,
}

/// Return total session count, remaining free sessions, and pro status.
#[command]
pub async fn get_session_count(state: State<'_, AppState>) -> Result<SessionCountResult, String> {
    let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM sessions")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let license_row: (i64, Option<String>) =
        sqlx::query_as("SELECT is_active, plan FROM license WHERE id = 1")
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?
            .unwrap_or((1, Some("free".into())));

    let is_pro = license_row
        .1
        .as_deref()
        .map(|p| p != "free")
        .unwrap_or(false)
        && license_row.0 == 1;

    let total = row.0;
    let free_remaining = if is_pro {
        i64::MAX
    } else {
        (FREE_SESSION_LIMIT - total).max(0)
    };

    Ok(SessionCountResult {
        total,
        free_remaining,
        is_pro,
    })
}

/// Validate a license key against the Supabase license endpoint.
/// On success the key is persisted locally so future launches work offline.
#[command]
pub async fn validate_license_key(
    state: State<'_, AppState>,
    license_key: String,
    supabase_url: String,
    supabase_anon_key: String,
) -> Result<LicenseValidationResult, String> {
    if license_key.is_empty() {
        return Ok(LicenseValidationResult {
            valid: false,
            plan: "free".into(),
            message: "No license key provided".into(),
        });
    }

    // Validated via the validate-license Edge Function (service-role lookup)
    // rather than a direct table read — the licenses table's RLS no longer
    // allows anon reads, so this can't be used to enumerate other users' keys.
    #[derive(Deserialize)]
    struct ValidateResponse {
        valid: bool,
        plan: Option<String>,
        email: Option<String>,
        expires_at: Option<String>,
    }

    let url = format!("{supabase_url}/functions/v1/validate-license");

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(
        "apikey",
        HeaderValue::from_str(&supabase_anon_key).map_err(|e| e.to_string())?,
    );
    headers.insert(
        "Authorization",
        HeaderValue::from_str(&format!("Bearer {supabase_anon_key}"))
            .map_err(|e| e.to_string())?,
    );

    let client = reqwest::Client::new();
    let resp = client
        .post(&url)
        .headers(headers)
        .json(&serde_json::json!({ "license_key": license_key }))
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("License server error: {}", resp.status()));
    }

    let result: ValidateResponse = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    if result.valid {
        let plan = result.plan.clone().unwrap_or_else(|| "pro".into());
        let now = chrono::Utc::now().to_rfc3339();
        // Persist locally
        sqlx::query(
            "UPDATE license SET license_key = ?, email = ?, is_active = 1, plan = ?, expires_at = ?, validated_at = ? WHERE id = 1",
        )
        .bind(&license_key)
        .bind(&result.email)
        .bind(&plan)
        .bind(&result.expires_at)
        .bind(&now)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

        return Ok(LicenseValidationResult {
            valid: true,
            plan: plan.clone(),
            message: format!("License activated ({plan})"),
        });
    }

    Ok(LicenseValidationResult {
        valid: false,
        plan: "free".into(),
        message: "License key not found or inactive".into(),
    })
}
