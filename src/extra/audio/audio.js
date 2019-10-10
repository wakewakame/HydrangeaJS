export const Audio = class {
	constructor(array_length = 1024) {
		this.start = false;
		this.audio_context = null;
		this.array_length = array_length;
		this.callback = null;
	}

	setCallback(func) {
		this.callback = func;
	}

	clickEvent() {
		if (this.start) return;
		this.start = true;
		this.audio_context = new AudioContext();
		const scriptProcessor = this.audio_context.createScriptProcessor(this.array_length, 1, 1);
		scriptProcessor.onaudioprocess = this.update.bind(this);
		scriptProcessor.connect(this.audio_context.destination);

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		navigator.getUserMedia(
			{ audio: true }, (stream) => {
				let mediastreamsource = this.audio_context.createMediaStreamSource(stream);
				mediastreamsource.connect(scriptProcessor);
			}, (e) => { console.log(e); }
		);
	}

	update(e) {
		const input = e.inputBuffer.getChannelData(0);
		const output = e.outputBuffer.getChannelData(0);
		const inputSampleRate = e.inputBuffer.sampleRate;
		const outputSampleRate = e.outputBuffer.sampleRate;

		if (typeof(this.callback) === "function") {
			this.callback(input, output, inputSampleRate, outputSampleRate);
		}
	}

	loadSound(url, callback) {
		let req = new XMLHttpRequest();
		req.responseType = 'arraybuffer';
		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				if (req.status === 0 || req.status === 200) {
					this.audio_context.decodeAudioData(req.response, (audioBuffer) => {
						callback(audioBuffer);
					});
				}
			}
		};
		req.open('GET', url, true);
		req.send('');
	};
};