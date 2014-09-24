define(
    [
        'jquery'
    ],
    function ( $ ) {


        var Easing = {
            quad: {
                easeOut : function (t, b, c, d) {
                    return -c *(t/=d)*(t-2) + b;
                },
                easeIn : function (t, b, c, d) {
                    return c*(t/=d)*t + b;
                }
            },
            quart: {
                easeIn: function (t, b, c, d) {
                    return c*(t/=d)*t*t*t + b;
                },
                easeOut: function (t, b, c, d) {
                    return -c * ((t=t/d-1)*t*t*t - 1) + b;
                }
            }
        };

        function ThreePlayer () {

            this.meshWidth = 60;
            this.mesh = new THREE.Mesh( new THREE.BoxGeometry( this.meshWidth,
                    this.meshWidth, this.meshWidth ), new THREE.MeshLambertMaterial( { color: 0x0975b3 } ) );


            this.jumping = false;
            this.falling = false;

            this.direction = new THREE.Vector3(0,0,0);
            this.right = new THREE.Vector3(0,0,0);
            this.left = new THREE.Vector3(0,0,0);

            this.movement = {
                left: new THREE.Vector3(-10,0,0),
                right: new THREE.Vector3(10,0,0),
                none: new THREE.Vector3(0,0,0)
            }
        }

        $.extend( ThreePlayer.prototype, {

            getMesh: function(){

                return this.mesh;
            },

            update: function(){

                if(this.jumping){
                    this.updateJump();
                }

                if(this.falling){
                    this.updateFall();
                }

                this.direction.add.call( this.mesh.position, this.direction );
            },

            updateJump: function(){
                var detail = this.jumpDetail,
                        currentTime = new Date().getTime() - detail.startTime;

                this.mesh.position.setY( Easing.quart.easeOut(currentTime,
                                detail.posY, detail.change, detail.duration) );
                if(currentTime >= detail.duration - 250){
                    this.fall();
                }
            },

            updateFall: function(){
                var detail = this.fallDetail,
                        currentTime = new Date().getTime() - detail.startTime;

                this.mesh.position.setY( Easing.quad.easeIn(currentTime + 20,
                                detail.posY, detail.change, detail.duration) );
            },

            jump: function(){
                if(!this.jumping && !this.falling){
                    this.jumpDetail = {
                        posY: this.mesh.position.y,
                        change: 70,
                        duration:70 * 6,
                        startTime: new Date().getTime()
                    };
                    this.jumping = true;
                    this.falling = false;

                }else if(!this.falling){
                    //we might be able to add to the jump speed
                    var detail = this.jumpDetail;
                    if( detail.change < 170){
                        detail.change += 40;
                        detail.duration += 40;
                    }
                }
            },

            fall: function(){
                if(!this.falling){
                    this.jumping = false;
                    this.fallDetail = {
                        posY: this.mesh.position.y,
                        change: -175,
                        duration: 280,
                        startTime: new Date().getTime()
                    };
                    this.falling = true;
                }
            },

            land: function(posY){
                this.jumping = false;
                this.falling = false;
                if( typeof posY == 'number'){
                    this.mesh.position.setY( posY - this.mesh.geometry.boundingBox.min.y );
                }
            },

            moveLeft: function(){
                if(this.left !== this.movement.left){
                    this.left = this.movement.left;
                    this.direction.add(this.left);
                }
            },

            stopLeft: function(){
                if(this.left == this.movement.left){
                    this.left = this.movement.none;
                    this.direction.add(this.movement.right);
                }
            },

            movingLeft: function(){
                return this.left.x !== 0;
            },

            moveRight: function(){
                if(this.right !== this.movement.right){
                    this.right = this.movement.right;
                    this.direction.add(this.right);
                }
            },

            stopRight: function(){
                if(this.right == this.movement.right){
                    this.right = this.movement.none;
                    this.direction.add(this.movement.left);
                }
            },

            movingRight: function(){
                return this.right.x !== 0;
            },

            getBoundingBox: function(){
                if(!this.mesh.geometry.boundingBox){
                    this.mesh.geometry.computeBoundingBox();
                }
                var position = this.mesh.position,
                    bb = this.mesh.geometry.boundingBox;

                return {
                    max: {
                        x: position.x + bb.max.x,
                        y: position.y + bb.max.y,
                        z: position.z + bb.max.z
                    },
                    min: {
                        x: position.x + bb.min.x,
                        y: position.y + bb.min.y,
                        z: position.z + bb.min.z
                    }
                };
            }
        });

        return ThreePlayer;
    }
);