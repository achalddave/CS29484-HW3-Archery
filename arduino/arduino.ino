
#include <Bounce.h>

//Analog read for accel pins
const int xPin = 3;
const int yPin = 2;
const int zPin = 1;

//The minimum and maximum values that came from
//the accelerometer while standing still
int minVal = 265;
int maxVal = 402;

//to hold the caculated values
double x;
double y;
double z;

//buttons
const int lbutton = 3; // digital pins for l and r button 
const int rbutton = 2; 
Bounce bouncerl = Bounce(lbutton, 5); 
Bounce bouncerr = Bounce(rbutton, 5); 

// was button clicked? 
int buttonClicked =0; 

// was cable drawn?
int cableDrawn = 0; 

int tilt = 0; 
int force = 0; 

void setup() {
  Serial.begin(9600); 

  pinMode(lbutton, INPUT_PULLUP); // l and r button 
  pinMode(rbutton, INPUT_PULLUP); 

}

void loop() {

  if (bouncerl.update()) { 
    if (bouncerl.read() == LOW) { 
      // left button clicked 
      Serial.println("Left"); 
      buttonClicked = 1; 
    }
  } 

  if (bouncerr.update()) { 
    if (bouncerr.read() == LOW) { 
      Serial.println("Right"); 
      buttonClicked = 1; 
    } 
  }

  if (buttonClicked && (analogRead(0) > 100)) { 

    cableDrawn = 1; 
    // cable is drawn 


    // accelerometer code 

    //read the input pins 
    int xRead = analogRead(xPin);
    int yRead = analogRead(yPin);
    int zRead = analogRead(zPin);

    //convert values to degrees
    int xAng = map(xRead, minVal, maxVal, -90, 90);
    int yAng = map(yRead, minVal, maxVal, -90, 90);
    int zAng = map(zRead, minVal, maxVal, -90, 90);

    //geometry
    x = RAD_TO_DEG * (atan2(-yAng, -zAng) + PI);
    y = RAD_TO_DEG * (atan2(-xAng, -zAng) + PI);
    z = RAD_TO_DEG * (atan2(-yAng, -xAng) + PI);

    //calibrate 
    z = 360 - z;

    if (z > 180) { 
      z = z - 360;  // to make angle negative when pointing down
    } 

    // accelerometer is turned on its side

    tilt = z; 
    force = analogRead(0); 
    Serial.print("Tilt: "); 
    Serial.println(z); 
    Serial.print("Force: "); 
    Serial.println(force); // read force sensor 

  }

  if (analogRead(0)== 0 && cableDrawn)  { 
    buttonClicked = 0; 
    cableDrawn = 0; 
    //reset values 


    Serial.println("FINAL"); 
    Serial.print("Tilt: "); 
    Serial.print(tilt); 
    Serial.print("Force: "); 
    Serial.println(force); 
    // display final values 

  }

} 


