# Dlyn AI - Interview Simulator Troubleshooting

**Product:** Dlyn AI  
**Support Level:** Level 1, Level 2  
**Last Updated:** April 3, 2026

---

## Overview

The Interview Simulator uses your microphone to conduct AI-powered mock interviews. This guide covers common browser and device issues.

---

## Browser Fixes

### Chrome: Microphone Freeze or Not Working

**Symptoms:**
- Microphone permission prompt never appears
- "Microphone blocked" error
- Interview coach freezes when trying to record

**Solution:**
1. Click the **lock icon** 🔒 in the address bar (left of the URL)
2. Find **Microphone** in the dropdown
3. Change from "Block" to "Allow"
4. **Refresh the page** (F5 or Ctrl+R)

**Alternative Method:**
1. Go to Chrome Settings (⋮ → Settings)
2. Navigate to: Privacy and security → Site Settings → Microphone
3. Find `Dlyn.ai` in the list
4. Change to **Allow**

---

### Firefox: Microphone Blocked

**Symptoms:**
- Red microphone icon in address bar
- "Permission denied" error
- No audio input detected

**Solution:**
1. Click the **lock icon** 🔒 in the address bar
2. Click **Connection secure** (or site permissions)
3. Find **Permissions**
4. Set **Use the Microphone** to **Allow**
5. Refresh the page

**If Permission Not Listed:**
1. Click the microphone icon in the address bar (if visible)
2. Select "Allow" when prompted
3. Or go to: ☰ → Settings → Privacy & Security → Permissions → Microphone → Settings
4. Add `https://Dlyn.ai` and set to Allow

---

### Safari: Microphone Access

**Symptoms:**
- "Safari would like to use your microphone" prompt doesn't appear
- Audio not recording

**Solution:**
1. Go to Safari menu → **Preferences** (or Settings)
2. Click **Websites** tab
3. Select **Microphone** in the left sidebar
4. Find `Dlyn.ai` in the list
5. Change to **Allow**
6. Close Preferences and refresh the page

**macOS System Permissions:**
1. Open **System Preferences** → **Security & Privacy**
2. Click **Privacy** tab
3. Select **Microphone** in the left sidebar
4. Ensure **Safari** is checked ✓

---

### Edge: Microphone Settings

**Symptoms:**
- Microphone not detected
- Permission blocked

**Solution:**
1. Click the **lock icon** 🔒 in the address bar
2. Click **Site permissions**
3. Find **Microphone**
4. Change to **Allow**
5. Refresh the page

---

## Device-Level Issues

### Windows: Microphone Not Detected by Any Browser

**Check System Settings:**
1. Open **Settings** → **Privacy** → **Microphone**
2. Ensure "Allow apps to access your microphone" is **On**
3. Ensure "Allow desktop apps to access your microphone" is **On**
4. Scroll down and verify your browser is listed and enabled

**Check Sound Settings:**
1. Right-click the speaker icon in taskbar
2. Select **Sound settings** (or Open Sound settings)
3. Under **Input**, verify correct microphone is selected
4. Speak and check if the input level meter moves

---

### macOS: Microphone Not Working

**Check System Permissions:**
1. Open **System Preferences** → **Security & Privacy**
2. Click **Privacy** tab
3. Select **Microphone**
4. Ensure your browser (Chrome, Firefox, Safari) is checked ✓

**If browser not listed:**
1. The browser will be added automatically when it requests permission
2. Try starting an interview again to trigger the permission request

---

### Headset/External Microphone Issues

**Symptoms:**
- Built-in mic works, external doesn't
- Wrong microphone being used

**Solution:**
1. Check that your headset/mic is properly connected
2. In browser, click the lock icon → Site permissions → Microphone
3. Some browsers allow selecting which microphone to use
4. Or set default microphone at OS level:
   - **Windows:** Settings → Sound → Input → Choose your input device
   - **macOS:** System Preferences → Sound → Input → Select device

---

## Common Error Messages

### "Microphone access denied"
**Fix:** Follow browser-specific permission steps above.

### "No audio input devices found"
**Fix:** 
1. Check physical microphone connection
2. Check OS-level sound settings
3. Try a different USB port (if external mic)
4. Restart browser

### "Recording failed"
**Fix:**
1. Close other apps using microphone (Zoom, Teams, Discord)
2. Only one app can use the microphone at a time
3. Restart browser and try again

### "Interview coach is loading..." (stuck)
**Fix:**
1. Check internet connection
2. Disable browser extensions (especially ad blockers)
3. Try incognito/private mode
4. Clear browser cache: Ctrl+Shift+Delete

---

## Best Practices for Interview Simulator

### Before Starting:
1. ✅ Use Chrome or Firefox (best compatibility)
2. ✅ Close other apps using microphone
3. ✅ Test microphone in OS settings first
4. ✅ Use headphones to prevent echo
5. ✅ Find a quiet environment

### During Interview:
1. ✅ Speak clearly and at normal volume
2. ✅ Wait for the AI to finish before responding
3. ✅ If stuck, click the "Skip" button to move to next question

---

## Supported Browsers

| Browser | Microphone Support | Notes |
|---------|-------------------|-------|
| Chrome 80+ | ✅ Full | Recommended |
| Firefox 75+ | ✅ Full | Good alternative |
| Edge 80+ | ✅ Full | Chromium-based |
| Safari 14+ | ⚠️ Partial | May require extra permissions |
| Opera | ✅ Full | Chromium-based |
| Brave | ⚠️ Partial | May block by default |

**Not Supported:**
- Internet Explorer (any version)
- Older browser versions

---

## When to Escalate

**Escalate to Level 2 if:**
- Microphone works in other apps but not Dlyn
- Permissions are correct but still not working
- Error persists after trying all browser fixes

**Escalate to Level 3 if:**
- Interview simulator completely fails to load for multiple users
- Suspected server-side issue with audio processing

---

**Related Articles:**
- `LEVEL2_TROUBLESHOOTING.md` - Section on Interview Coach issues
- `/kb/Dlyn/resume-parsing.md` - If interview questions aren't tailored
