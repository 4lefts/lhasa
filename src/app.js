const p5 = require('p5')
const Tone = require('tone')

const lhasa = new p5(function(l){
	//globals for drawing/palette
	const samplers = []
	const padding = 10
	let lightGrey, midGrey, midGreyAlpha, darkGray, blue, blueAlpha

	l.setup = function(){
		const cnv = l.createCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight)
		samplers.push(new Sampler('./gtr.mp3', 0, 0, l.width, l.height/2))
		samplers.push(new Sampler('./gtr.mp3', 0, l.height/2, l.width, l.height/2))
		cnv.mousePressed(function(){
			samplers.forEach(function(sampler){
				sampler.checkPress(l.mouseX, l.mouseY)
			})
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
		samplers.forEach(function(sampler){
			if(sampler.loaded) {
				if(sampler.loopEdit) sampler.checkLoopPointEdit()
				if(sampler.rateEdit) sampler.updateRate(l.mouseX)
				if(sampler.volumeEdit) sampler.updateVolume(l.mouseX)
				sampler.drawWaveform()
				sampler.drawLoopPoints()
				sampler.drawPlayButton() //draw play button if the envelope is running
				sampler.drawControl(sampler.soundPlayer.playbackRate, sampler.x, (sampler.y + sampler.h) - 100, 0.5, 2, 'rate')
				sampler.drawControl(sampler.soundPlayer.volume.value, sampler.x, (sampler.y + sampler.h) - 50, -48, 0, 'volume') //in db
			}	else {
				sampler.drawLoading()
			}
		})
	}

	l.mouseReleased = function(){
		samplers.forEach(function(sampler){
			sampler.loopEdit = true
			sampler.volumeEdit = false
			sampler.rateEdit = false
		})
	}

	l.windowResized = function(){
		l.resizeCanvas(window.innerWidth, window.innerHeight)
		samplers.forEach(function(sampler, index){
			sampler.updatePosition(0, index * (l.height/2), l.width, l.height/2)
			sampler.computeWaveform()
		})
	}

	//---------------------------------
	//THE SAMPLER OBJECT
	//---------------------------------
	function Sampler(_f, _x, _y, _w, _h){
		this.fileName = _f
		//vars for location/size of player on cnvs
		this.x = _x
		this.y = _y
		this.w = _w
		this.h = _h
		//variables for drawing waveform
		this.waveformArray
		this.loaded = false
		//and controlling mouse behaviour for editing loop points
		this.initialPressPoint = 0
		this.tmpLoopEnd = 0
		this.finalPressPoint = 0
		this.pMouseIsPressed = false
		this.loopEdit = false
		//and controlling editing states
		this.rateEdit = false
		this.volumeEdit = false
		this.isPlaying = false

		this.env = new Tone.AmplitudeEnvelope({
			"attack": 0.5,
			"decay": 0,
			"sustain": 1,
			"release": 0.5,
			"attackCurve": "sine",
			"releaseCurve": "sine"
		}).toMaster()

		this.soundPlayer = new Tone.Player(this.fileName, this.initSampler.bind(this)).connect(this.env)
	}

	Sampler.prototype.initSampler = function(){
		this.soundPlayer.loop = true
		this.soundPlayer.playbackRate = 1
		this.soundPlayer.loopStart = 0
		this.soundPlayer.loopEnd = 0
		this.soundPlayer.volume.value = -6
		this.computeWaveform()
		this.loaded = true
		console.log('sample loaded!')
		console.log(`sample length (seconds): ${this.soundPlayer.buffer.duration}`)
		this.soundPlayer.start()
	}

	//-----------
	//sampler interactivity functions
	//-----------
	Sampler.prototype.checkPress = function(x, y){
		if(this.loaded){
			if(x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h){
				if(x > this.x + 10 && x < this.x + 60 && y > this.y + 10 && y < this.y + 60){
					//check if press is on play button
					this.loopEdit = false //stop button updating loop points
					this.startStop()
				} else if(y > this.y + this.h - 100 &&  y < this.y + this.h - 50){
					//check if press is on rate edit control
					this.loopEdit = false
					this.rateEdit = true
					this.volumeEdit = false
				} else if(y > this.y + this.h - 50){
					// check if press is on vol edit control
					this.loopEdit = false
					this.rateEdit = false
					this.volumeEdit = true
				} else {
					// we're editing loop points
					this.loopEdit = true
				}
			} else {
				// the press isn't on this sampler
				this.loopEdit = false;
				this.rateEdit = false;
				this.volumeEdit = false;
			}
		}
	}

	Sampler.prototype.checkLoopPointEdit = function(){
		if(l.mouseIsPressed && !this.pMouseIsPressed){
			this.initialPressPoint = l.mouseX
		}
		if(l.mouseIsPressed && this.pMouseIsPressed){
			this.tmpLoopEnd = l.mouseX
			this.drawEditPoints(this.initialPressPoint, this.tmpLoopEnd)
		}
		if(!l.mouseIsPressed && this.pMouseIsPressed){
			this.updateLoopPoints(this.initialPressPoint, this.tmpLoopEnd)
			this.loopEdit = false
		}
		this.pMouseIsPressed = l.mouseIsPressed
	}

	//-----------
	//sammpler update functions
	//-----------
	Sampler.prototype.updatePosition = function (newX, newY, newW, newH) {
		this.x = newX
		this.y = newY
		this.w = newW
		this.h = newH
	};

	Sampler.prototype.updateLoopPoints = function(p1, p2){
		let t1, t2
		//check for mouse press and release in same place
		//this sound have **some** duration
		if(p1 === p2) {
			t1 = l.map(p1, this.x, this.x + this.w, 0, this.soundPlayer.buffer.duration)
			t2 = l.map(p2 + 1, this.x, this.x + this.w, 0, this.soundPlayer.buffer.duration)
		}	else if(p1 < p2){
			t1 = l.map(p1, this.x, this.x + this.w, 0, this.soundPlayer.buffer.duration)
			t2 = l.map(p2, this.x, this.x + this.w, 0, this.soundPlayer.buffer.duration)
		} else {
			t1 = l.map(p2, this.x, this.x + this.w, 0, this.soundPlayer.buffer.duration)
			t2 = l.map(p1, this.x, this.x + this.w, 0, this.soundPlayer.buffer.duration)
		}
		const loop1 = l.constrain(t1, 0, this.soundPlayer.buffer.duration)
		const loop2 = l.constrain(t2, 0, this.soundPlayer.buffer.duration)
		this.soundPlayer.setLoopPoints(loop1, loop2)
		this.soundPlayer.seek(loop1)
	}

	Sampler.prototype.startStop = function(){
		if(!this.isPlaying){
			this.soundPlayer.seek(this.soundPlayer.loopStart)
			this.env.triggerAttack()
		} else {
			this.env.triggerRelease()
		}
		this.isPlaying = !this.isPlaying
	}

	Sampler.prototype.updateVolume = function(x){
		//N.B sampler GUI positions other than 0 are not well handled here...
		const vol = l.constrain(x > 0 ? l.map(x, 0, this.w, -48, 0) : -Infinity, -Infinity, 0)
		this.soundPlayer.volume.value = vol
	}

	Sampler.prototype.updateRate = function(x){
		//N.B sampler GUI positions other than 0 are not well handled here...
		const rate = l.constrain(l.map(x, 0, this.w, 0.5, 2), 0.5, 2)
		this.soundPlayer.playbackRate = rate
	}

	Sampler.prototype.computeWaveform = function(){
		const inputArr = this.soundPlayer.buffer.getChannelData(0)
		const stepSz = parseInt(inputArr.length / this.w)
		this.waveformArray = inputArr.filter((sample, i, _) => {
			return i % stepSz == 0
		}).map(elem => elem * this.h/2)
	}

	//-----------
	//gui draw functions
	//-----------
	Sampler.prototype.drawLoading = function(){
		l.push()
		l.textSize(32)
		l.textAlign(l.CENTER)
		l.noStroke()
		l.fill(lightGrey)
		l.text('loading sound', this.x + (this.w/2), this.y + (this.h/2))
		l.pop()
	}

	Sampler.prototype.drawWaveform = function(){
		l.push()
		l.translate(this.x, this.y + (this.h / 2))
		l.noFill()
		l.strokeWeight(2)
		l.stroke(midGrey)
		l.beginShape()
		this.waveformArray.forEach(function(elem, i){
			l.vertex(i, elem)
		})
		l.endShape()
		l.pop()
	}

	Sampler.prototype.drawLoopPoints = function(){
		const s = this.soundPlayer.loopStart
	 	const e = this.soundPlayer.loopEnd
	  const tot = this.soundPlayer.buffer.duration
		const low = l.map(s, 0, tot, this.x, this.w)
		const high = e == 0 ? this.w : l.map(e - s, 0, tot, this.x, this.w)
		l.push()
		l.translate(low, this.y)
		l.noStroke()
		l.fill(blueAlpha)
		l.rect(0, 0, high, this.h)
		l.stroke(blue)
		l.strokeWeight(2)
		l.line(0, 0, 0, this.h)
		l.line(high, 0, high, this.h)
		l.pop()
	}

	Sampler.prototype.drawEditPoints = function(p1, p2){
		//get in order low-high
		const low = p1 < p2 ? p1 : p2
		const high = p2 > p1 ? p2 : p1
		l.push()
		l.translate(this.x + low, this.y)
		l.noStroke()
		l.fill(midGreyAlpha)
		l.rect(0, 0, high - low, this.h)
		l.stroke(midGrey)
		l.strokeWeight(2)
		l.line(0, 0, 0, this.h)
		l.line(high - low, 0, high - low, this.h)
		l.pop()
	}

	Sampler.prototype.drawPlayButton = function(){
		const state = this.env.getValueAtTime()
		l.push()
		l.translate(this.x + 10, this.y + 10)
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

	Sampler.prototype.drawControl = function(lvl, x, y, low, high, name){ //in db
		const w = l.map(lvl, low, high, 0, this.w)
		l.push()
		l.translate(x, y)
		l.strokeWeight(1)
		l.stroke(lightGrey)
		l.fill(darkGray)
		l.rect(0, 0, w, 50)
		l.noStroke()
		l.fill(lightGrey)
		l.textSize(12)
		const txt = `${name}: ${lvl.toPrecision(2)}`
		l.text(txt, 10, 40)
		l.pop()
	}
}, 'lhasa-container')
