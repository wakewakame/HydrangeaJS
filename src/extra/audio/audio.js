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

	loadSound(url, successCallback, errorCallback) {
		fetch(url)
			.then(response => response.arrayBuffer())
			.then(arrayBuffer => this.audio_context.decodeAudioData(arrayBuffer))
			.then(audioBuffer => successCallback(audioBuffer))
			.catch(e => errorCallback(e));
	};
};
