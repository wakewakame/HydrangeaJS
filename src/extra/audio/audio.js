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

		const getAudioBuffer = (url, fn) => {
			let req = new XMLHttpRequest();
			req.responseType = 'arraybuffer';
			req.onreadystatechange = () => {
				if (req.readyState === 4) {
					if (req.status === 0 || req.status === 200) {
						this.audio_context.decodeAudioData(req.response, (buffer) => {
							fn(buffer);
						});
					}
				}
			};
			req.open('GET', url, true);
			req.send('');
		};

		const playSound = (buffer) => {
			const source = this.audio_context.createBufferSource();
			source.buffer = buffer;
			source.connect(scriptProcessor);
			source.start(0);
		};

		getAudioBuffer('music.mp3', (buffer) => {
			playSound(buffer);
		});
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
};