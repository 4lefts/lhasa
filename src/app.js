import 'p5'
let w
const container = document.getElementById('lhasa-container')

window.setup = () => {
	w = container.offsetWidth
	const cnv = createCanvas(w, w)
	cnv.parent('lhasa-container')
}

window.draw = () => {
	background(255)
	noStroke()
	fill(200)
	ellipse(width/2, height/2, width, height)
}

window.windowResized = () => {
	w = container.offsetWidth
	resizeCanvas(w, w)
}
