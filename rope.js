class Robe{

    // Constants
    startPoint = [0.0,0.0]; // Vector form [x, y]
    endPoint = [1.0,0.2];   // same
    hookAccel = -100.0; 
    elasticity = 20.0;
    mass = 0.02;
    timestep = 1.0 / 20; // 20fps
    substeps = 10;
    gravity = 5.0;
    resistance = 0.008;
    
    points = []; // position and velosity [x, y, Vx, Vy]
    hookPosition = 0; // index of point to be draged
    ballonImg;
    canvasSize;
    timeoutID;

       
    constructor({
        numOfPoints = 25, 
        canvas
    }){ 
        if(numOfPoints < 1)
            throw new Error("Threre should be non zero and non negative number of points in between.");

        this.numOfPoints = numOfPoints;
        this.restDistance = 1.0 / numOfPoints;
        this.subMass = this.mass / numOfPoints;
        this.initPoints();

        this.ctx = canvas.getContext('2d');
        this.canvasSize = {
            width: canvas.getAttribute('width'),
            height: canvas.getAttribute('height')
        }

        this.loadImage();
    }

    initPoints(){
        // This one and last one will be keept fixed
        this.points.push([...this.startPoint, 0, 0]);

        for(let i = 0; i < this.numOfPoints; i++){
            // Interpolation
            const step = 1.0 / (this.numOfPoints+1); 
            const b = step * (1 + i);
            const a = 1.0 - b;
            this.points.push([
                this.startPoint[0]*a + this.endPoint[0]*b,   // x
                this.startPoint[1]*a + this.endPoint[1]*b,   // b
                0, 0   // velocity
            ])
        }

        this.points.push([...this.endPoint, 0, 0]);
    }

    loadImage(){
        const img = document.createElement('img');
        img.src = './ballon.png';
        img.style.display = 'none';
        document.body.appendChild(img);
        img.onload = () => {
            this.ballonImg = img;
            setTimeout(this.run.bind(this), 1000 * this.timestep)
        }
    }

    run(){
        this.step();
        this.render();
        this.timeoutID = setTimeout(this.run.bind(this), 1000 * this.timestep);
    }

    stop(){
        if(this.timeoutID){
            clearTimeout(this.timeoutID);
        }
    }

    setProgress(progress){
        if(progress > 1.0) progress = 1.0;
        if(progress < 0) progress = 0.0;

        this.hookPosition = Math.round(progress * (this.points.length-1));
    }

    step(){
        const substeptime = this.timestep / this.substeps;

        for(let i = 0; i < this.substeps; i++){

            // Velosity
            for(let j = 1; j < this.points.length; j++){
                this.updateVelocity(this.points[j-1], this.points[j]);
            }
            // Hook just accels specefied point down (y direction)
            this.points[this.hookPosition][3] -= this.hookAccel*this.timestep/this.substeps;

            // Position update
            for(let j = 1; j < this.points.length -1; j++){
                const p = this.points[j];
                p[0] += substeptime * p[2];
                p[1] += substeptime * p[3];
            }

        }
    }

    updateVelocity(p1, p2){
        const {distance: dis, direction: dir} = this.getDistAndDir(p1,p2);
        const shift = dis - this.restDistance;
        const step = this.timestep / this.substeps;

        // gravity
        p1[3] -= step * this.gravity;

        // Hook law but for stretching
        if(shift <= 0)
            return; // not streched

        const coef = shift * this.elasticity * step / this.subMass;

        p1[2] -= dir[0]*coef;
        p1[3] -= dir[1]*coef;
        p2[2] += dir[0]*coef;
        p2[3] += dir[1]*coef;

        // movement resistance
        p1[2] -= step * this.resistance * p1[2] / this.subMass;
        p1[3] -= step * this.resistance * p1[3] / this.subMass;

    }



  


    getDistAndDir(vec1, vec2){
        const dx = vec1[0] - vec2[0];
        const dy = vec1[1] - vec2[1];
        const distance = Math.sqrt(
            dx*dx + dy*dy
        );
        const direction = [dx/distance, dy/distance];

        return {distance, direction};
    }


    render(){
        const {ctx} = this;
        const robeColor = '#e1e119';
        const robeTochedColor = "#69d742" ;

        ctx.fillStyle = '#ffffff00';
        ctx.clearRect(0,0,this.canvasSize.width,this.canvasSize.height);
        ctx.lineWidth = 4;
        ctx.strokeStyle = robeTochedColor;

        // Draw robe
        ctx.beginPath();
        ctx.moveTo(...this.mapToPixels(this.points[0]));
        for(let i = 1; i < this.points.length; i++){
            ctx.lineTo(...this.mapToPixels(this.points[i]))

            if(i == this.hookPosition){
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = robeColor;
                ctx.lineTo(...this.mapToPixels(this.points[i]))
            }
        }
        ctx.stroke();

        // Start and end fixtures
        this.drawFixture(this.points[0]);
        this.drawFixture(this.points[this.points.length-1]);
        //DrawBall fixture
        this.drawFixture(this.points[this.hookPosition], 2);

        // baloon
        const [ballX, ballY] = this.mapToPixels(this.points[this.hookPosition]);
        ctx.drawImage(this.ballonImg, 0, 0, 282, 597, ballX-14, ballY-80, 42,80);
    }

    drawFixture(point, size = 10){
        const {ctx} = this;
        // Ball fixture
        ctx.strokeStyle = "#aa8888";
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.arc(...this.mapToPixels(point), 3,0, Math.PI*2);
        ctx.stroke();
    }
    
    mapToPixels(p){
        const scale = this.canvasSize.width;
        const x = p[0] * (scale-50) + 25;
        const y = this.canvasSize.height - scale / 5 -p[1]*scale;
        return [x,y]
    }

}