const p5 = require('p5')
const Tone = require('tone')

const lhasa = new p5(function(l){

	const padding = 10
		let lightGrey, midGrey, darkGray, blue, blueAlpha

	let waveformArray
	let loaded = false

	const	soundPlayer = new Tone.Player('./gtr.mp3', function(){
			soundPlayer.loop = true
			soundPlayer.playbackRate = 0.55
			soundPlayer.loopStart = 3.26
			soundPlayer.loopEnd = 6.35
			waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth, window.innerHeight)
			loaded = true
			console.log(`sample length (seconds): ${soundPlayer.buffer.duration}`)
			console.log(`sample length (samples): ${soundPlayer.buffer.length}`)
			console.log(`waveformArray length: ${waveformArray.length}`)
			console.log(`window width: ${window.innerWidth}`)
			console.log(`waveformArray data: ${waveformArray}`)
		}).toMaster()


	l.setup = function(){
		const cnv = l.createCanvas(window.innerWidth, window.innerHeight)
		cnv.mousePressed(function(){
			if(loaded) checkPress(l.mouseX, l.mouseY)
		})
		lightGrey = l.color(217, 225, 232)
		midGrey = l.color(155, 174, 200)
		darkGray = l.color(40,  44,  55)
		blue = l.color(43, 144, 217)
		blueAlpha = l.color(43, 144, 217, 100)
	}

	l.draw = function(){
		l.background(darkGray)
		if(loaded) {
			drawWaveform(waveformArray, l.height)
			drawLoopPoints(soundPlayer.loopStart, soundPlayer.loopEnd, soundPlayer.buffer.duration)
			console.log(soundPlayer.loopStart)
			drawPlayButton(soundPlayer.state)
		}	else {
			drawLoading()
		}
	}

	l.windowResized = function(){
		waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth, window.innerHeight)
		l.resizeCanvas(window.innerWidth, window.innerHeight)
	}

	function checkPress(x, y){
		if(x > 10 && x < 60 && y > 10 && y < 60){
			startStop(soundPlayer.state)
		}
	}

	function startStop(state){
		if(state === 'stopped'){
			soundPlayer.start()
		} else {
			soundPlayer.stop()
		}
	}

	function computeWaveform(inputArr, w, h){
		const stepSz = parseInt(inputArr.length / w)
		const ret = inputArr.filter((sample, i, _) => {
			return i % stepSz == 0
		}).map(elem => elem * h/2)
		return ret
	}

	function drawWaveform(arr, h){
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
		l.pop()
	}

	function drawLoading(){
		l.push()
		l.textSize(32)
		l.textAlign(l.CENTER)
		l.noStroke()
		l.fill(lightGrey)
		l.text('loading sound', l.width/2, l.height/2)
		l.pop()
		console.log('loading!')
	}

	function drawLoopPoints(s, e, tot){
		const x1 = l.map(s, 0, tot, 0, l.width)
		const x2 = l.map(e - s, 0, tot, 0, l.width)
		l.push()
		l.translate(x1, 0)
		l.noStroke()
		l.fill(blueAlpha)
		l.rect(0, 0, x2, l.height)
		l.stroke(blue)
		l.strokeWeight(2)
		l.line(0, 0, 0, l.height)
		l.line(x2, 0, x2, l.height)
		l.pop()
	}

	function drawPlayButton(state){
		l.push()
		l.translate(10, 10)
		l.noStroke()
		if(state === 'stopped'){
			l.fill(lightGrey)
			l.rect(0, 0, 50, 50)
			l.fill(blue)
			l.triangle(10, 10, 40, 25, 10, 40)
		} else{
			l.fill(lightGrey)
			l.rect(0, 0, 50, 50)
			l.fill(blue)
			l.rect(10, 10, 30, 30)
		}
		l.pop()
	}

	function triggerSynth(){
		const synth = new Tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

}, 'lhasa-container')
