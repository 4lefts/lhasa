const p5 = require('p5')
const Tone = require('tone')

const lhasa = new p5(function(l){

	const padding = 10
	let sz = window.innerHeight < window.innerWidth ? window.innerHeight - padding : window.innerWidth - padding
	let lightGrey, midGrey, darkGray, blue

	const soundPlayer = new Tone.Player('./gtr.mp3', function(){
		soundPlayer.loop = true
		soundPlayer.playbackRate = 0.4
		soundPlayer.loopStart = 2
		soundPlayer.loopEnd = 2.6
		console.log(soundPlayer.buffer)
		console.log(`sample length: ${soundPlayer.buffer.duration} seconds`)
		console.log(`sample length: ${soundPlayer.buffer.length} samples`)
		console.log(soundPlayer.buffer.getChannelData(1))
	}).toMaster()

	l.setup = function(){
		l.createCanvas(window.innerWidth, window.innerHeight)
		lightGrey = l.color(217,225,232)
		midGrey = l.color(155,174,200)
		darkGray = l.color(40, 44, 55,)
		blue = l.color(43,144,217)
	}

	l.draw = function(){
		l.background(darkGray)
		l.noStroke()
		l.fill(lightGrey)
		l.ellipse(l.width/2, l.height/2, sz, sz)
	}

	l.windowResized = function(){
		sz = window.innerHeight < window.innerWidth ? window.innerHeight - padding : window.innerWidth - padding
		l.resizeCanvas(window.innerWidth, window.innerHeight)
	}

	l.mousePressed = function(){
		const d = l.dist(l.mouseX, l.mouseY, l.width/2, l.height/2)
		console.log(d)
		if(d < sz/2){
			console.log(soundPlayer.state)
			if(soundPlayer.state === 'stopped'){
				soundPlayer.start()
			} else {
				soundPlayer.stop()
			}
		}
	}

	function triggerSynth(){
		const synth = new Tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

}, 'lhasa-container')
