import 'p5'
let sz = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth

window.setup = () => {
	createCanvas(window.innerWidth, window.innerHeight)
}

window.draw = () => {
	background(0)
	noStroke()
	fill(200)
	ellipse(width/2, height/2, sz -10, sz -10)
}

window.windowResized = () => {
	sz = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth
	resizeCanvas(window.innerWidth, window.innerHeight)
}
