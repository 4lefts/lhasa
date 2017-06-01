const p5 = require('p5')
const Tone = require('tone')

const lhasa = new p5(function(l){

	const padding = 10
	let sz = window.innerHeight < window.innerWidth ? window.innerHeight - padding : window.innerWidth - padding
	let lightGrey, midGrey, darkGray, blue

	let waveformArray
	let loaded = false

	const	soundPlayer = new Tone.Player('./gtr.mp3', function(){
			soundPlayer.loop = true
			soundPlayer.playbackRate = 0.4
			soundPlayer.loopStart = 2
			soundPlayer.loopEnd = 2.6
			console.log(soundPlayer.buffer)
			console.log(`sample length: ${soundPlayer.buffer.duration} seconds`)
			console.log(`sample length: ${soundPlayer.buffer.length} samples`)
			waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth)
			console.log(`waveformArray data is: ${waveformArray}\nwaveformArray length is ${waveformArray.length}\n width is ${window.innerWidth}`)
			loaded = true
		}).toMaster()


	l.setup = function(){
		const cnv = l.createCanvas(window.innerWidth, window.innerHeight)
		cnv.mousePressed(function(){
			if(loaded) startStop(soundPlayer.state)
		})
		lightGrey = l.color(217,225,232)
		midGrey = l.color(155,174,200)
		darkGray = l.color(40, 44, 55,)
		blue = l.color(43,144,217)

	}

	l.draw = function(){
		l.background(darkGray)
		drawWaveform(waveformArray, l.height)
	}

	l.windowResized = function(){
		sz = window.innerHeight < window.innerWidth ? window.innerHeight - padding : window.innerWidth - padding
		waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth)
		l.resizeCanvas(window.innerWidth, window.innerHeight)
	}

	const startStop = function(state){
		if(state === 'stopped'){
			soundPlayer.start()
		} else {
			soundPlayer.stop()
		}
	}

	function computeWaveform(inputArr, w){
		const stepSz = parseInt(inputArr.length / w)
		const ret = inputArr.filter((sample, i, _) => {
			return i % stepSz == 0
		}).map(elem => elem * sz/2)
		return ret
	}

	function drawWaveform(arr, h){
		if(loaded){
			l.push()
			l.translate(0, h / 2)
			l.noFill()
			l.strokeWeight(2)
			l.stroke(midGrey)
			l.beginShape()
			arr.forEach(function(elem, i, _){
				l.vertex(i, elem)
			})
			l.endShape()
		} else {
			//loading animation here
			console.log('loading!')
		}
	}

	function triggerSynth(){
		const synth = new Tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

}, 'lhasa-container')
