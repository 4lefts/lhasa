const p5 = require('p5')
const Tone = require('tone')

const lhasa = new p5(function(l){

	const padding = 20
	let sz = window.innerHeight < window.innerWidth ? window.innerHeight - padding : window.innerWidth - padding

	l.setup = function(){
		l.createCanvas(window.innerWidth, window.innerHeight)
	}

	l.draw = function(){
		l.background(0)
		l.noStroke()
		l.fill(200)
		l.ellipse(l.width/2, l.height/2, sz -10, sz -10)
	}

	l.windowResized = function(){
		sz = window.innerHeight < window.innerWidth ? window.innerHeight - padding : window.innerWidth - padding
		l.resizeCanvas(window.innerWidth, window.innerHeight)
	}

	l.mousePressed = function(){
		if(l.dist(l.mouseX, l.mouseY, l.width/2, l.height/2) < sz - 10){
			triggerSynth()
		} 
	}	
/*
	drawCircles = function(){
		const r = sz / 4
		
	}
*/
	function triggerSynth(){
		const synth = new Tone.Synth().toMaster()
		synth.triggerAttackRelease('C4', '8n')
	}

}, 'lhasa-container')
