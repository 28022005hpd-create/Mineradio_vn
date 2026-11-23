//! Native Rust port of built-in playlist track normalization.
//! Storage, audio, UI, and network services remain on the original JS path.

use serde_json::{Map, Value};
const MAX_TRACK_BYTES: usize = 48 * 1024;
const TRACK_FIELDS: &[&str] = &[
    "provider","source","type","id","providerSongId","provider_song_id",
    "trackId","track_id","mid","songmid","mediaMid","media_mid","qqId",
    "hash","fileHash","audioHash","albumId","album_id","albumMid","albummid",
    "albumAudioId","album_audio_id","mixSongId","mix_song_id","hqHash","hq_hash",
    "sqHash","sq_hash","resHash","res_hash","name","title","artist","album",
    "cover","duration","durationMs","dt","fee","Fee","playable","playbackMode",
    "recommendationSource","localKey","localFileId","localUrl","localPath",
    "localMissing","hasLyric","lyricSource","vipRequired","needVip",
    "onlyVipPlayable","only_vip_playable","privilege","Privilege",
    "mediaPrivilege","media_privilege",
];

fn truthy(v: &Value) -> bool {
    match v {
        Value::Null => false,
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().is_some_and(|x| x != 0.0 && !x.is_nan()),
        Value::String(s) => !s.is_empty(),
        _ => true,
    }
}
fn first<'a>(obj: &'a Map<String, Value>, names: &[&str]) -> Option<&'a Value> {
    names.iter().filter_map(|name| obj.get(*name)).find(|v| truthy(v))
}
fn js_str(v: &Value) -> String {
    match v {
        Value::Null => String::new(),
        Value::String(s) => s.clone(),
        Value::Bool(b) => b.to_string(),
        Value::Number(n) => n.to_string(),
        Value::Array(a) => a.iter().map(js_str).collect::<Vec<_>>().join(","),
        Value::Object(_) => "[object Object]".to_string(),
    }
}
fn clean_text(value: Option<&Value>, fallback: &str, max: usize) -> String {
    let raw = value.map(js_str).unwrap_or_default().replace('\0', "");
    let trimmed = raw.trim();
    let effective = if trimmed.is_empty() { fallback } else { trimmed };
    let utf16: Vec<u16> = effective.encode_utf16().take(max).collect();
    String::from_utf16_lossy(&utf16)
}
pub fn normalize_provider(song: &Value) -> &'static str {
    let Some(obj) = song.as_object() else { return "netease"; };
    let source = clean_text(first(obj, &["provider","source","type"]), "", 32).to_lowercase();
    if source == "spotify" || first(obj, &["spotifyId","spotifyUri"]).is_some() {
        return "unsupported";
    }
    if source == "local" || first(obj, &["localFileId","localKey","localUrl"]).is_some() {
        return "local";
    }
    if source == "qq" { return "qq"; }
    if source == "kugou" || first(obj, &["hash","fileHash","audioHash"]).is_some() {
        return "kugou";
    }
    if source == "qishui" { return "qishui"; }
    "netease"
}
fn clean_value(v: &Value, depth: u8) -> Option<Value> {
    match v {
        Value::Null | Value::Bool(_) | Value::Number(_) => Some(v.clone()),
        Value::String(_) => Some(Value::String(clean_text(Some(v), "", 4096))),
        Value::Array(a) if depth < 2 => Some(Value::Array(
            a.iter().take(20).filter_map(|x| clean_value(x, depth + 1)).collect(),
        )),
        Value::Object(o) if depth < 2 => {
            let mut out = Map::new();
            for (k, v) in o.iter().take(24) {
                if matches!(k.as_str(), "__proto__" | "prototype" | "constructor") { continue; }
                if let Some(value) = clean_value(v, depth + 1) { out.insert(k.clone(), value); }
            }
            Some(Value::Object(out))
        }
        _ => None,
    }
}
pub fn track_identity(track: &Value) -> String {
    let Some(obj) = track.as_object() else { return String::new(); };
    let provider = normalize_provider(track);
    let keys: &[&str] = match provider {
        "local" => &["localFileId","localKey","id"],
        "qq" => &["mid","songmid","id"],
        "kugou" => &["hash","fileHash","audioHash","id"],
        "qishui" => &["id","providerSongId","trackId","track_id"],
        _ => &["id"],
    };
    let mut id = clean_text(first(obj, keys), "", 512);
    if provider == "local" && first(obj, &["localFileId","localKey"]).is_none() {
        id = id.strip_prefix("local:").unwrap_or(&id).to_string();
    }
    if id.is_empty() { return String::new(); }
    if provider == "kugou" { id = id.to_lowercase(); }
    format!("{provider}:{id}")
}
pub fn sanitize_track(source: &Value) -> Option<Value> {
    let obj = source.as_object()?;
    let provider = normalize_provider(source);
    if provider == "unsupported" { return None; }
    let mut out = Map::new();
    for key in TRACK_FIELDS {
        if let Some(v) = obj.get(*key) {
            if v.is_null() || v.as_str() == Some("") { continue; }
            if let Some(cleaned) = clean_value(v, 0) {
                if cleaned.as_str() != Some("") { out.insert((*key).to_string(), cleaned); }
            }
        }
    }
    out.insert("provider".to_string(), Value::String(provider.to_string()));
    out.insert("source".to_string(), Value::String(provider.to_string()));
    if !out.get("type").is_some_and(truthy) {
        let kind = match provider { "local" => "local", "qq" => "qq", _ => "song" };
        out.insert("type".to_string(), Value::String(kind.to_string()));
    }
    let name = clean_text(first(&out, &["name","title"]), "未知歌曲", 1000);
    let title = clean_text(first(&out, &["title","name"]), &name, 1000);
    let default_artist = if provider == "local" { "本地文件" } else { "未知歌手" };
    let artist = clean_text(out.get("artist"), default_artist, 1000);
    out.insert("name".to_string(), Value::String(name));
    out.insert("title".to_string(), Value::String(title));
    out.insert("artist".to_string(), Value::String(artist));
    let identity = track_identity(&Value::Object(out.clone()));
    if identity.is_empty() { return None; }
    out.insert("builtInIdentity".to_string(), Value::String(identity));
    let track = Value::Object(out);
    if serde_json::to_vec(&track).ok()?.len() > MAX_TRACK_BYTES { return None; }
    Some(track)
}
#[cfg(feature = "node")]
#[napi_derive::napi(js_name = "sanitizeTrackJson")]
pub fn sanitize_track_json(input: String) -> napi::Result<Option<String>> {
    let track: Value = serde_json::from_str(&input)
        .map_err(|e| napi::Error::from_reason(e.to_string()))?;
    sanitize_track(&track)
        .map(|v| serde_json::to_string(&v).map_err(|e| napi::Error::from_reason(e.to_string())))
        .transpose()
}
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn providers_are_preserved() {
        for p in ["netease", "qq", "kugou", "qishui", "local"] {
            let t = sanitize_track(&json!({"provider":p,"id":"abc"})).unwrap();
            assert_eq!(t["provider"], p);
            assert_eq!(t["source"], p);
        }
    }
    #[test]
    fn unsupported_provider_rejected() {
        assert!(sanitize_track(&json!({"provider":"spotify","id":"12"})).is_none());
    }
    #[test]
    fn qq_mid_priority() {
        let t = sanitize_track(&json!({"provider":"qq","id":"a","mid":"b"})).unwrap();
        assert_eq!(t["builtInIdentity"], "qq:b");
    }
    #[test]
    fn kugou_identity_lowercase() {
        let t = sanitize_track(&json!({"provider":"kugou","hash":"ABC"})).unwrap();
        assert_eq!(t["hash"], "ABC");
        assert_eq!(t["builtInIdentity"], "kugou:abc");
    }
    #[test]
    fn local_id_prefix_removed() {
        assert_eq!(track_identity(&json!({"provider":"local","id":"local:123"})), "local:123");
    }
    #[test]
    fn empty_id_rejected() {
        assert!(sanitize_track(&json!({"provider":"netease","name":"No ID"})).is_none());
    }
    #[test]
    fn cleanup_and_unknown_fields() {
        let t = sanitize_track(&json!({"provider":"netease","id":7,"name":" Bài\0 hát  ","secret":"drop"})).unwrap();
        assert_eq!(t["name"], "Bài hát");
        assert!(t.get("secret").is_none());
    }
    #[test]
    fn excessive_track_rejected() {
        let value = vec!["x".repeat(4096); 20];
        assert!(sanitize_track(&json!({"provider":"netease","id":"x","privilege":value})).is_none());
    }
}
