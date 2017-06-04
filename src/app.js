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
	let editable = true

	const	soundPlayer = new Tone.Player('./gtr.mp3', function(){
			soundPlayer.loop = true
			soundPlayer.playbackRate = 0.55
			soundPlayer.loopStart = 3.26
			soundPlayer.loopEnd = 6.35
			waveformArray = computeWaveform(soundPlayer.buffer.getChannelData(0), window.innerWidth, window.innerHeight)
			loaded = true
			console.log(`sample length (seconds): ${soundPlayer.buffer.duration}`)
		}).toMaster()


	l.setup = function(){
		const cnv = l.createCanvas(window.innerWidth, window.innerHeight)
		cnv.mousePressed(function(){
			if(loaded) checkPress(l.mouseX, l.mouseY)
		})
		cnv.mouseReleased(function(){
			editable = true
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
			if(editable) checkLoopPointEdit()
			drawWaveform(waveformArray, l.height)
			drawLoopPoints(soundPlayer.loopStart, soundPlayer.loopEnd, soundPlayer.buffer.duration)
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
			editable = false //stop button updating loop points
			startStop(soundPlayer.state)
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

	//synth functions
	function triggerSynth(){
		const synth = new Tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

	function updateLoopPoints(p1, p2){
		console.log(p1, p2)
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

}, 'lhasa-container')
