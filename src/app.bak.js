const p5 = require('p5')
const Tone = require('tone')

const lhasa = new p5(function(l){

	const padding = 10
	let lightGrey, midGrey, midGreyAlpha, darkGray, blue, blueAlpha

	//variables for drawing waveform
	let waveformArray
	let loaded = false
	//and controlling mouse behaviour for editing loop points
	let initialPressPoint = 0
	let tmpLoopEnd = 0
	let finalPressPoint = 0
	let pMouseIsPressed = false
	let loopEdit = true

	let rateEdit = false
	let volumeEdit = false
	let isPlaying = false

	const env = new Tone.AmplitudeEnvelope({
		"attack": 0.5,
		"decay": 0,
		"sustain": 1,
		"release": 0.5,
		"attackCurve": "sine",
		"releaseCurve": "sine"
	}).toMaster()

	const	soundPlayer = new Tone.Player('./gtr.mp3', function(){
			soundPlayer.loop = true
			soundPlayer.playbackRate = 1
			soundPlayer.loopStart = 0
			soundPlayer.loopEnd = 0
			soundPlayer.volume.value = -6
			waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth, window.innerHeight)
			loaded = true
			console.log('sample loaded!')
			console.log(`sample length (seconds): ${soundPlayer.buffer.duration}`)
			soundPlayer.start()
		}).connect(env)


	l.setup = function(){
		const cnv = l.createCanvas(window.innerWidth, window.innerHeight)
		cnv.mousePressed(function(){
			if(loaded) checkPress(l.mouseX, l.mouseY)
		})
		cnv.mouseReleased(function(){
			loopEdit = true
			volumeEdit = false
			rateEdit = false
		})
		lightGrey = l.color(217, 225, 232)
		midGrey = l.color(155, 174, 200)
		midGreyAlpha = l.color(155, 174, 200, 100)
		darkGray = l.color(40, 44, 55)
		blue = l.color(43, 144, 217)
		blueAlpha = l.color(43, 144, 217, 100)
	}

	l.draw = function(){
		l.background(darkGray)
		if(loaded) {
			if(loopEdit) checkLoopPointEdit()
			if(rateEdit) updateRate(l.mouseX)
			if(volumeEdit) updateVolume(l.mouseX)
			drawWaveform(waveformArray, l.height)
			drawLoopPoints(soundPlayer.loopStart, soundPlayer.loopEnd, soundPlayer.buffer.duration)
			drawPlayButton(env.getValueAtTime()) //draw play button if the envelope is running
			drawControl(soundPlayer.playbackRate, 0, l.height - 100, 0.5, 2, 'rate')
			drawControl(soundPlayer.volume.value, 0, l.height - 50, -48, 0, 'volume') //in db
		}	else {
			drawLoading()
		}
	}

	l.windowResized = function(){
		waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth, window.innerHeight)
		l.resizeCanvas(window.innerWidth, window.innerHeight)
	}

	//mouse interaction control functions
	function checkPress(x, y){
		if(x > 10 && x < 60 && y > 10 && y < 60){
			loopEdit = false //stop button updating loop points
			startStop()
		}
		if(y > l.height - 100 &&  y < l.height - 50){
			loopEdit = false
			volumeEdit = false
			rateEdit = true
		}
		if(y > l.height - 50){
			loopEdit = false
			rateEdit = false
			volumeEdit = true
		}
	}

	function checkLoopPointEdit(){
		if(l.mouseIsPressed && !pMouseIsPressed){
			initialPressPoint = l.mouseX
		}
		if(l.mouseIsPressed && pMouseIsPressed){
			tmpLoopEnd = l.mouseX
			drawEditPoints(initialPressPoint, tmpLoopEnd)
		}
		if(!l.mouseIsPressed && pMouseIsPressed){
			updateLoopPoints(initialPressPoint, tmpLoopEnd)
		}
		pMouseIsPressed = l.mouseIsPressed
	}

	function startStop(){
		if(!isPlaying){
			soundPlayer.seek(soundPlayer.loopStart)
			env.triggerAttack()
		} else {
			env.triggerRelease()
		}
		isPlaying = !isPlaying
	}

	function computeWaveform(inputArr, w, h){
		const stepSz = parseInt(inputArr.length / w)
		const ret = inputArr.filter((sample, i, _) => {
			return i % stepSz == 0
		}).map(elem => elem * h/2)
		return ret
	}

	//gui draw functions
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
	}

	function drawLoopPoints(s, e, tot){
		const x1 = l.map(s, 0, tot, 0, l.width)
		const x2 = e == 0 ? l.width : l.map(e - s, 0, tot, 0, l.width)
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

	function drawEditPoints(p1, p2){
		const x1 = p1 < p2 ? p1 : p2
		const x2 = p2 > p1 ? p2 - x1 : p1 - x1
		l.push()
		l.translate(x1, 0)
		l.noStroke()
		l.fill(midGreyAlpha)
		l.rect(0, 0, x2, l.height)
		l.stroke(midGrey)
		l.strokeWeight(2)
		l.line(0, 0, 0, l.height)
		l.line(x2, 0, x2, l.height)
		l.pop()
	}

	function drawPlayButton(state){
		l.push()
		l.translate(10, 10)
		l.noFill()
		l.stroke(lightGrey)
		l.noFill()
		l.rect(0, 0, 50, 50)
		l.noStroke()
		l.fill(blue)
		if(!state){
			l.triangle(5, 5, 45, 25, 5, 45)
		} else{
			l.rect(5, 5, 40, 40)
		}
		l.pop()
	}

	function drawControl(lvl, x, y, low, high, name){ //in db
		const w = l.map(lvl, low, high, 0, l.width)
		console.log(w)
		l.push()
		l.translate(x, y)
		l.stroke(lightGrey)
		l.fill(darkGray)
		l.rect(0, 0, w, 50)
		l.noStroke()
		l.fill(lightGrey)
		// l.textSize(16)
		const txt = `${name}: ${lvl.toPrecision(2)}`
		l.text(txt, 10, 40)
		l.pop()
	}

	//synth functions
	function triggerSynth(){
		const synth = new Tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

	function updateLoopPoints(p1, p2){
		let t1, t2
		if(p1 === p2) {
			t1 = l.map(p1, 0, l.width, 0, soundPlayer.buffer.duration)
			t2 = l.map(p2 + 1, 0, l.width, 0, soundPlayer.buffer.duration)
		}	else if(p1 < p2){
			t1 = l.map(p1, 0, l.width, 0, soundPlayer.buffer.duration)
			t2 = l.map(p2, 0, l.width, 0, soundPlayer.buffer.duration)
		} else {
			t1 = l.map(p2, 0, l.width, 0, soundPlayer.buffer.duration)
			t2 = l.map(p1, 0, l.width, 0, soundPlayer.buffer.duration)
		}

		soundPlayer.setLoopPoints(t1, t2)
		soundPlayer.seek(t1)
	}

	function updateVolume(x){
		const vol = x > 0 ? l.map(x, 0, l.width, -48, 0) : -Infinity
		soundPlayer.volume.value = vol
	}

	function updateRate(x){
		const rate = l.map(x, 0, l.width, 0.5, 2)
		soundPlayer.playbackRate = rate
	}

}, 'lhasa-container')
