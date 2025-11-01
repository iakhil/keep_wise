async function getActiveTab() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
}

async function getSelectionFromPage() {
	const tab = await getActiveTab();
	if (!tab || !tab.id) return '';
	return new Promise((resolve) => {
		chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, (res) => {
			if (chrome.runtime.lastError) {
				resolve('');
				return;
			}
			resolve(res && res.ok ? String(res.text || '') : '');
		});
	});
}

function setEnvStatus(text, isError = false) {
	const el = document.getElementById('envStatus');
	el.textContent = text || '';
	if (isError) {
		el.style.color = '#b00020';
		el.style.background = '#fee';
		el.style.borderLeftColor = '#dc3545';
	} else {
		el.style.color = '#333';
		el.style.background = '#f8f9fa';
		el.style.borderLeftColor = '#667eea';
	}
}

function setProgress(text) {
	document.getElementById('progress').textContent = text || '';
}

function setSaveStatus(text, isSuccess = true) {
	const status = document.getElementById('saveStatus');
	status.textContent = text || '';
	status.className = 'save-status' + (text ? (isSuccess ? ' success' : ' error') : '');
}

async function getCurrentTabUrl() {
	try {
		const tab = await getActiveTab();
		return tab?.url || '';
	} catch {
		return '';
	}
}

async function saveNote() {
	const input = /** @type {HTMLTextAreaElement} */(document.getElementById('input'));
	const highlightedText = input.value.trim();
	const summary = currentSummary.trim();
	
	if (!highlightedText || !summary) {
		setSaveStatus('Please summarize text first', false);
		return;
	}

	try {
		const url = await getCurrentTabUrl();
		if (!url) {
			setSaveStatus('Unable to get page URL', false);
			return;
		}

		setSaveStatus('Saving...', true);
		
		// Get auth token from storage if available
		let authToken = null;
		try {
			const stored = await chrome.storage.local.get(['firebaseAuthToken']);
			authToken = stored.firebaseAuthToken;
		} catch (e) {
			// Ignore errors
		}
		
		const headers = {
			'Content-Type': 'application/json',
		};
		
		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`;
		}
		
		const response = await fetch('http://localhost:3000/api/notes', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				url,
				highlighted_text: highlightedText,
				summary: summary
			})
		});

		const data = await response.json();
		
		if (response.status === 401 || response.status === 403) {
			setSaveStatus('❌ Please sign in at http://localhost:3000 to save notes', false);
		} else if (data.success) {
			setSaveStatus('✅ Note saved successfully! You can view it at http://localhost:3000', true);
			setTimeout(() => setSaveStatus(''), 5000);
		} else {
			setSaveStatus('❌ Failed to save note', false);
		}
	} catch (error) {
		console.error('Error saving note:', error);
		setSaveStatus('Unable to connect to server. Make sure it\'s running on http://localhost:3000', false);
	}
}

function renderMarkdownOrText(text, isMarkdown) {
	const out = document.getElementById('output');
	if (!isMarkdown) {
		out.textContent = text;
		return;
	}
	// Minimal safe rendering: convert basic markdown bullets and line breaks
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	const html = escaped
		.replace(/^\s*[-*]\s+/gm, '• ')
		.replace(/\n/g, '<br>');
	out.innerHTML = html;
}

async function ensureSummarizerAvailable() {
	if (!('Summarizer' in self)) {
		setEnvStatus('Summarizer API not available in this browser.', true);
		return false;
	}
	try {
		const availability = await Summarizer.availability();
		if (availability === 'unavailable') {
			setEnvStatus('Summarizer unavailable on this device.', true);
			return false;
		}
		if (availability === 'downloadable') {
			setEnvStatus('⏳ Model download will start when you click Summarize', false);
			return true;
		}
		setEnvStatus('✅ Summarizer ready', false);
		return true;
	} catch (e) {
		setEnvStatus('Error checking availability.', true);
		return false;
	}
}

async function createSummarizer(options) {
	return await Summarizer.create({
		...options,
		monitor(m) {
			m.addEventListener('downloadprogress', (e) => {
				const pct = Math.round((e.loaded || 0) * 100);
				setProgress(`Generating summary…`);
			});
		}
	});
}

async function summarize(text) {
	const type = /** @type {HTMLSelectElement} */(document.getElementById('type')).value;
	const length = /** @type {HTMLSelectElement} */(document.getElementById('length')).value;
	const format = /** @type {HTMLSelectElement} */(document.getElementById('format')).value;

	const summarizer = await createSummarizer({ type, length, format });
	try {
		const result = await summarizer.summarize(text, { context: 'User selected text on a webpage.' });
		return result;
	} finally {
		try { summarizer.destroy?.(); } catch {}
	}
}

// Store the current summary text for saving
let currentSummary = '';

document.addEventListener('DOMContentLoaded', async () => {
	const input = document.getElementById('input');
	const selected = await getSelectionFromPage();
	if (selected) input.value = selected;

	document.getElementById('summarizeBtn').addEventListener('click', async () => {
		setProgress('');
		document.getElementById('output').textContent = '';
		currentSummary = '';
		const text = /** @type {HTMLTextAreaElement} */(input).value.trim();
		if (!text) {
			setProgress('No text to summarize.');
			return;
		}
		if (!navigator.userActivation?.isActive) {
			// The button click counts as activation; this is a sanity check.
		}
		try {
			setProgress('Summarizing…');
			const type = /** @type {HTMLSelectElement} */(document.getElementById('type')).value;
			const format = /** @type {HTMLSelectElement} */(document.getElementById('format')).value;
			const result = await summarize(text);
			currentSummary = result; // Store the original summary text
			renderMarkdownOrText(result, format === 'markdown');
			setProgress('');
			// Enable save button when summary is ready
			document.getElementById('saveBtn').disabled = false;
		} catch (e) {
			setProgress('Failed to summarize.');
			document.getElementById('saveBtn').disabled = true;
		}
	});

	// Save note button
	document.getElementById('saveBtn').addEventListener('click', async () => {
		await saveNote();
	});
});

