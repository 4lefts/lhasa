const p5 = require('p5')
const tone = require('tone')

const lhasa = new p5((l) => {

	let sz = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth

	l.setup = () => {
		l.createCanvas(window.innerWidth, window.innerHeight)
	}

	l.draw = () => {
		l.background(0)
		l.noStroke()
		l.fill(200)
		l.ellipse(l.width/2, l.height/2, sz -10, sz -10)
	}

	l.windowResized = () => {
		sz = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth
		l.resizeCanvas(window.innerWidth, window.innerHeight)
	}

	l.mousePressed = () => {
		if(l.dist(l.mouseX, l.mouseY, l.width/2, l.height/2) < sz - 10){
			triggerSynth()
		} 
	}	

	const triggerSynth = () => {
		const synth = new tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

}, 'lhasa-container')
