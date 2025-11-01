(() => {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (!message || message.type !== 'GET_SELECTION') return;
		try {
			const selection = window.getSelection ? String(window.getSelection()) : '';
			sendResponse({ ok: true, text: selection });
		} catch (err) {
			sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) });
		}
		return true;
	});
})();

